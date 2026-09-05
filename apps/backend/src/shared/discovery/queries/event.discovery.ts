import {
    Event,
} from "../../../modules/events/event.model";

import {
    MODERATION_STATUS,
} from "../../constants/moderation";

import {
    PUBLIC_CONTENT_TYPES,
} from "../../public-content/constants/public-content.types";

import {
    getPublishedEntityIds,
} from "../eligibility/discoverability.service";

import {
    DiscoveryDateFilter,
} from "../discovery.types";


export interface EventDiscoveryQuery {

    city?: string;

    category?: string;

    search?: string;

    date?: DiscoveryDateFilter;

    excludeEntityIds?: string[];

    limit?: number;

}


/**
 * Escape user input before creating
 * a MongoDB regular expression.
 *
 * This keeps search predictable and
 * prevents regex metacharacters from
 * changing the intended query.
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
 * Build Event-specific discovery filters.
 *
 * This function answers only:
 *
 * "Is this Event eligible for Discovery?"
 *
 * It does NOT answer:
 *
 * "Where should this Event appear?"
 *
 * Ranking belongs to the shared
 * Discovery Engine.
 */
const buildEventFilters = (
    query: EventDiscoveryQuery,
    publishedEntityIds: string[]
): Record<string, unknown> => {

    const filters:
        Record<string, unknown> = {

        /*
         * The Event must have a
         * published public representation.
         */
        _id: {
            $in:
                publishedEntityIds,
        },

        /*
         * The Event itself must remain active.
         */
        status:
            "active",

        /*
         * The Event must have passed moderation.
         */
        "moderation.status":
            MODERATION_STATUS.APPROVED,

    };


    /*
     * City filter.
     */
    if (
        query.city
    ) {

        filters.cityId = {

            $regex:
                escapeRegex(
                    query.city.trim()
                ),

            $options:
                "i",

        };

    }


    /*
     * Category filter.
     */
    if (
        query.category &&
        query.category !== "All"
    ) {

        filters.category =
            query.category.toLowerCase();

    }


    /*
     * Search filter.
     */
    if (
        query.search
    ) {

        const search =
            query.search.trim();


        if (
            search.length > 0
        ) {

            const regex =
                new RegExp(
                    escapeRegex(
                        search
                    ),
                    "i"
                );


            filters.$or = [

                {
                    title:
                        regex,
                },

                {
                    category:
                        regex,
                },

                {
                    cityId:
                        regex,
                },

            ];

        }

    }


    /*
     * Date filters.
     */
    if (
        query.date
    ) {

        /*
         * Upcoming Events.
         *
         * Includes today and future Events.
         */
        if (
            query.date.type ===
            "upcoming"
        ) {

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            filters.dateStart = {

                $gte:
                    today,

            };

        }


        /*
         * Events happening today.
         */
        if (
            query.date.type ===
            "today"
        ) {

            const startOfDay =
                new Date();

            startOfDay.setHours(
                0,
                0,
                0,
                0
            );


            const endOfDay =
                new Date();

            endOfDay.setHours(
                23,
                59,
                59,
                999
            );


            filters.dateStart = {

                $gte:
                    startOfDay,

                $lte:
                    endOfDay,

            };

        }


        /*
         * Events happening on
         * a specific calendar date.
         */
        if (
            query.date.type ===
            "custom"
        ) {

            const startOfDay =
                new Date(
                    query.date.date
                );

            startOfDay.setHours(
                0,
                0,
                0,
                0
            );


            const endOfDay =
                new Date(
                    query.date.date
                );

            endOfDay.setHours(
                23,
                59,
                59,
                999
            );


            filters.dateStart = {

                $gte:
                    startOfDay,

                $lte:
                    endOfDay,

            };

        }

    }


    /*
     * Exclude entities already shown
     * to the consumer.
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
 * Find Events that are discoverable.
 *
 * Discoverability requires:
 *
 * 1. Publication is PUBLISHED
 * 2. Event is ACTIVE
 * 3. Moderation is APPROVED
 * 4. Optional query filters match
 */
export const findDiscoverableEvents =
    async (
        query: EventDiscoveryQuery = {}
    ) => {

        /*
         * Get entities that currently have
         * a PUBLISHED public representation.
         */
        const publishedEntityIds =
            await getPublishedEntityIds(
                PUBLIC_CONTENT_TYPES.EVENT
            );


        /*
         * Nothing can be discovered if
         * there are no published Events.
         */
        if (
            publishedEntityIds.length === 0
        ) {

            return [];

        }


        /*
         * Build Event-specific filters.
         */
        const filters =
            buildEventFilters(
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
         * Fetch discoverable Events.
         *
         * IMPORTANT:
         *
         * No ranking happens here.
         *
         * The shared Discovery Engine
         * owns ranking and ordering.
         */
        return Event.find(
            filters
        )
            .limit(
                safeLimit
            );

    };