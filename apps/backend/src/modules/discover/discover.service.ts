
import {
  discover,
} from "../../shared/discovery/discovery.service";

import {
  DiscoveryRequest,
  DiscoveryContentType,
} from "../../shared/discovery/discovery.types";

import {
  toPublicBusiness,
} from "../../shared/public-content/mappers/business.mapper";
import { PUBLIC_CONTENT_TYPES } from "../../shared/public-content/constants/public-content.types";
import { PUBLICATION_STATUS } from "../../shared/public-content/publication/publication-status";
import { Publication } from "../../shared/public-content/publication/publication.model";

import {
  User,
} from "../users/user.model";


interface DiscoverParams {
  lat?: number;
  lng?: number;
  city?: string;
  category?: string;
  excludeCategory?: string;
  type?: "all" | "events" | "business";
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
  date?: string | null;
}


/**
 * Legacy Mobile Discovery adapter.
 *
 * This service preserves the existing Mobile API contract
 * while delegating discovery logic to the shared Discovery Engine.
 */
export const getDiscoverFeed = async ({
  lat,
  lng,
  city,
  category,
  type = "all",
  search = "",
  userId,
  page = 1,
  limit = 10,
  date,
}: DiscoverParams) => {

  const contentTypes:
    DiscoveryContentType[] =
      type === "all"
        ? [
            "event",
            "business",
          ]
        : type === "events"
          ? [
              "event",
            ]
          : [
              "business",
            ];


  /*
   * Resolve user-specific Discovery context.
   */
  let favoriteCategories:
    string[] = [];


  if (userId) {

    const user =
      await User.findById(
        userId
      ).populate(
        "favorites"
      );


    if (
      user &&
      user.favorites &&
      user.favorites.length > 0
    ) {

      favoriteCategories =
        user.favorites
          .map(
            (favorite: any) =>
              favorite?.category
          )
          .filter(
            (
              category
            ): category is string =>
              typeof category === "string"
          );

    }

  }


  /*
   * Build the shared Discovery request.
   */
  const request:
    DiscoveryRequest = {

      query: {

        city,

        category,

        search,

        contentTypes,

        date: date
          ? date === "today"
            ? { type: "today" }
            : { type: "custom", date }
          : { type: "upcoming" },

      },

      context: {

        userId,

        favoriteCategories,

        location:
          lat !== undefined &&
          lng !== undefined
            ? {
                lat,
                lng,
              }
            : undefined,

      },

      options: {

        visibility:
          "public",

        ranking:
          userId
            ? "personalized"
            : "contextual",

        page,

        limit,

      },

    };


  /*
   * Execute the shared Discovery Engine.
   */
  const result =
    await discover(
      request
    );


  const businessIds = result.items
    .filter(item => item.type === "business")
    .map(item => item.entity._id.toString());
  const publications = businessIds.length > 0
    ? await Publication.find({
        entityType: PUBLIC_CONTENT_TYPES.BUSINESS,
        entityId: { $in: businessIds },
        status: PUBLICATION_STATUS.PUBLISHED,
      }).select({ entityId: 1, slug: 1, _id: 0 }).lean()
    : [];
  const slugsByBusinessId = new Map(
    publications.map(({ entityId, slug }) => [entityId, slug])
  );

  const recommended = [];
  for (const item of result.items) {
    if (item.type === "business") {
      const slug = slugsByBusinessId.get(item.entity._id.toString());
      // A publication removed since selection can shorten this page.
      if (!slug) continue;

      recommended.push({ ...toPublicBusiness(item.entity, slug), type: item.type });
    } else {
      recommended.push({ ...item.entity.toObject(), type: item.type });
    }
  }


  /*
   * Keep pagination from the ranked results, even if serialization omits a business.
   */
  return {

    recommended,

    page:
      result.page,

    hasMore:
      result.hasMore,

  };

};
