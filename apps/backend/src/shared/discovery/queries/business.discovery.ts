import { Business } from "../../../modules/business/business.model";

import {
    MODERATION_STATUS,
} from "../../constants/moderation";

import {
    PUBLIC_CONTENT_TYPES,
} from "../../public-content/constants/public-content.types";

import {
    getPublishedEntityIds,
} from "../eligibility/discoverability.service";


export interface BusinessDiscoveryQuery {

    city?: string;

    category?: string;

    search?: string;

    excludeEntityIds?: string[];

    limit?: number;

}


/**
 * Escape special RegExp characters.
 *
 * User-provided search values should not be
 * interpreted as arbitrary regular expressions.
 */
const escapeRegex = (
    value: string
): string => {

    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

};


/**
 * Build MongoDB filters for discoverable Businesses.
 *
 * A Business is discoverable only when:
 *
 * 1. It has a PUBLISHED public representation.
 * 2. The original Business is active.
 * 3. The Business has been approved by moderation.
 *
 * Discovery-specific filters such as city,
 * category and search are applied afterwards.
 */
const buildBusinessFilters = (
    query: BusinessDiscoveryQuery,
    publishedEntityIds: string[]
): Record<string, unknown> => {

    const filters: Record<string, unknown> = {

        /*
         * Public publication is the source
         * of discoverability.
         */
        _id: {
            $in:
                publishedEntityIds,
        },

        /*
         * Domain visibility.
         */
        status:
            "active",

        /*
         * Moderation visibility.
         */
        "moderation.status":
            MODERATION_STATUS.APPROVED,

    };


    /*
     * CITY
     */
    if (query.city) {

        const city =
            escapeRegex(
                query.city.trim()
            );

        if (city) {

            filters["location.cityId"] = {

                $regex:
                    city,

                $options:
                    "i",

            };

        }

    }


    /*
     * CATEGORY
     */
    if (
        query.category &&
        query.category !== "All"
    ) {

        filters.category =
            query.category.toLowerCase();

    }


    /*
     * SEARCH
     *
     * Search is intentionally limited to
     * fields that are useful for discovery.
     */
    if (query.search) {

        const search =
            escapeRegex(
                query.search.trim()
            );

        if (search) {

            const regex =
                new RegExp(
                    search,
                    "i"
                );


            filters.$or = [

                {
                    name:
                        regex,
                },

                {
                    category:
                        regex,
                },

                {
                    "location.cityId":
                        regex,
                },

            ];

        }

    }


    /*
     * EXCLUSIONS
     *
     * Used by the shared Discovery Engine
     * when it needs to avoid already returned
     * entities.
     */
    if (
        query.excludeEntityIds &&
        query.excludeEntityIds.length > 0
    ) {

        filters._id = {

            $in:
                publishedEntityIds,

            $nin:
                query.excludeEntityIds,

        };

    }


    return filters;

};


/**
 * Find discoverable Businesses.
 *
 * This function is responsible only for:
 *
 * - discoverability
 * - filtering
 * - retrieval
 *
 * Ranking and mixing are intentionally
 * handled by the shared Discovery Engine.
 */
export const findDiscoverableBusinesses =
    async (
        query: BusinessDiscoveryQuery = {}
    ) => {

        /*
         * Resolve Businesses that have
         * a public PUBLISHED representation.
         */
        const publishedEntityIds =
            await getPublishedEntityIds(
                PUBLIC_CONTENT_TYPES.BUSINESS
            );


        /*
         * Nothing public means nothing
         * is discoverable.
         */
        if (
            publishedEntityIds.length === 0
        ) {

            return [];

        }


        /*
         * Build Business-specific filters.
         */
        const filters =
            buildBusinessFilters(
                query,
                publishedEntityIds
            );


        /*
         * Protect the query from
         * unreasonable limits.
         */
        const safeLimit =
            Math.min(
                Math.max(
                    query.limit ?? 20,
                    1
                ),
                100
            );


        /*
         * Fetch discoverable Businesses.
         *
         * IMPORTANT:
         *
         * There is intentionally NO final
         * ranking or sorting here.
         *
         * Ranking belongs to the shared
         * Discovery Engine.
         */
        return Business.find(
            filters
        )
            .limit(
                safeLimit
            );

    };