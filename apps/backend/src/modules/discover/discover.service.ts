
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


  /*
   * Serialize each entity according to its type.
   *
   * Businesses use the canonical PublicBusiness
   * contract shared with Public Content.
   *
   * Events preserve their existing serialization.
   */
  const recommended =
    result.items.map(
      item => {

        if (
          item.type === "business"
        ) {

          return {

            ...toPublicBusiness(
              item.entity,
              item.entity.slug
            ),

            type:
              item.type,

          };

        }


        return {

          ...item.entity.toObject(),

          type:
            item.type,

        };

      }
    );


  /*
   * Preserve the existing Mobile response contract.
   */
  return {

    recommended,

    page:
      result.page,

    hasMore:
      result.hasMore,

  };

};
