import {
  discover,
} from "../../shared/discovery/discovery.service";

import {
  DiscoveryRequest,
  DiscoveryContentType,
} from "../../shared/discovery/discovery.types";

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
 *
 * The shared Discovery Engine is responsible for:
 *
 * - discoverability
 * - Event queries
 * - Business queries
 * - public visibility rules
 * - ranking
 * - pagination
 *
 * This adapter is responsible only for:
 *
 * - translating the legacy Mobile request
 * - loading Mobile-specific user context
 * - translating the shared response back
 *   into the legacy Mobile response shape
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
}: DiscoverParams) => {

  /*
   * Translate the legacy "type" parameter
   * into the shared Discovery content types.
   */
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
   *
   * The User model remains a Mobile/domain concern.
   *
   * The shared Discovery Engine should NOT query
   * the User model directly.
   *
   * Instead, Mobile resolves the information it
   * already owns and passes it through DiscoveryContext.
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
   *
   * The legacy Mobile endpoint can continue
   * receiving the same parameters while the
   * actual Discovery logic lives in shared/discovery.
   */
  const request:
    DiscoveryRequest = {

      query: {

        city,

        category,

        search,

        contentTypes,

        /*
         * The previous Mobile Discovery always
         * considered upcoming Events.
         *
         * We preserve that behavior here.
         */
        date: {
          type:
            "upcoming",
        },

      },


      /*
       * User and location information belong
       * to Discovery context, not filtering.
       *
       * Ranking consumes this context.
       */
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


      /*
       * Options control how Discovery should
       * behave for this consumer.
       */
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
   * Preserve the existing Mobile response shape.
   *
   * The shared Discovery Engine returns:
   *
   * {
   *   type,
   *   entity
   * }
   *
   * The legacy Mobile endpoint expects:
   *
   * {
   *   ...entity,
   *   type
   * }
   *
   * Therefore this adapter converts the
   * normalized shared representation back
   * into the Mobile representation.
   */
  const recommended =
    result.items.map(
      item => ({

        ...item.entity.toObject(),

        type:
          item.type,

      })
    );


  /*
   * Return the legacy response contract.
   *
   * Pagination is now provided by the
   * shared Discovery Engine.
   */
  return {

    recommended,

    page:
      result.page,

    hasMore:
      result.hasMore,

  };

};