import {
    DiscoveryRequest,
    DiscoveryContentType,
} from "./discovery.types";

import {
    findDiscoverableEvents,
} from "./queries/event.discovery";

import {
    findDiscoverableBusinesses,
} from "./queries/business.discovery";

import type {
    EventDocument,
} from "../../modules/events/event.model";

import type {
    IBusiness,
} from "../../modules/business/business.model";


export type DiscoveryEntity =
    | EventDocument
    | IBusiness;


export interface DiscoveryResultItem {

    type:
        | "event"
        | "business";

    entity:
        DiscoveryEntity;

}


export interface DiscoveryResult {

    items:
        DiscoveryResultItem[];

    page: number;

    limit: number;

    hasMore: boolean;

}


/**
 * Calculate the distance between two
 * geographic coordinates.
 *
 * This is intentionally a simple
 * approximation for ranking purposes.
 *
 * It is NOT used as a geographic filter.
 */
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {

    return Math.sqrt(

        Math.pow(
            lat2 - lat1,
            2
        )

        +

        Math.pow(
            lng2 - lng1,
            2
        )

    );

};


/**
 * Calculate Event ranking.
 *
 * Ranking belongs to the shared Discovery
 * layer, not to the Event query itself.
 *
 * This preserves the behavior that the
 * previous Mobile Discovery already had:
 *
 * - verified events
 * - official events
 * - temporal proximity
 * - geographic proximity
 * - favorite category affinity
 */
const calculateEventScore = (
    event: EventDocument,
    request: DiscoveryRequest
): number => {

    let score = 0;


    /*
     * 1. Verification / Event type
     *
     * Event verification is currently not
     * represented by a verificationStatus
     * field in the Event model.
     *
     * Therefore this condition is intentionally
     * omitted until that domain concept exists.
     */

    if (
        event.eventType === "official"
    ) {

        score += 20;

    }


    /*
     * 2. Temporal proximity.
     *
     * Events happening soon receive
     * a ranking boost.
     */
    const now =
        new Date().getTime();

    const eventTime =
        new Date(
            event.dateStart
        ).getTime();

    const diffDays =
        (
            eventTime -
            now
        ) /
        (
            1000 *
            60 *
            60 *
            24
        );


    if (
        diffDays >= 0 &&
        diffDays <= 7
    ) {

        score += 30;

    } else if (
        diffDays <= 30
    ) {

        score += 10;

    }


    /*
     * 3. Geographic proximity.
     *
     * Only apply the geographic score
     * when the consumer provided a location.
     */
    const location =
        request.context.location;


    if (
        location &&
        event.location?.coordinates
    ) {

        const [
            eventLng,
            eventLat,
        ] =
            event.location.coordinates;


        const distance =
            calculateDistance(
                location.lat,
                location.lng,
                eventLat,
                eventLng
            );


        score += Math.max(
            0,
            20 -
            distance * 100
        );

    }


    /*
     * 4. Category affinity.
     *
     * Mobile can provide favoriteCategories
     * through DiscoveryContext.
     */
    const favoriteCategories =
        request.context.favoriteCategories ??
        [];


    if (
        favoriteCategories.includes(
            event.category
        )
    ) {

        score += 40;

    }


    return score;

};


/**
 * Calculate Business ranking.
 *
 * Businesses already contain two useful
 * discovery signals:
 *
 * - isFeatured
 * - visibilityScore
 *
 * These signals previously lived inside
 * the Business query ordering.
 *
 * We keep the same behavior in the
 * shared ranking layer.
 */
const calculateBusinessScore = (
    business: IBusiness
): number => {

    let score = 0;


    if (
        business.isFeatured
    ) {

        score += 100;

    }


    score +=
        business.visibilityScore ?? 0;


    return score;

};


/**
 * Rank discovered Events.
 */
const rankEvents = (
    events: EventDocument[],
    request: DiscoveryRequest
): EventDocument[] => {

    /*
     * Public Discovery should remain
     * deterministic.
     *
     * Personalized Discovery receives
     * the same ranking algorithm but with
     * user context.
     */
    return events
        .map(
            event => ({

                event,

                score:
                    calculateEventScore(
                        event,
                        request
                    ),

            })
        )
        .sort(
            (
                a,
                b
            ) =>
                b.score -
                a.score
        )
        .map(
            item =>
                item.event
        );

};


/**
 * Rank discovered Businesses.
 */
const rankBusinesses = (
    businesses: IBusiness[]
): IBusiness[] => {

    return businesses
        .map(
            business => ({

                business,

                score:
                    calculateBusinessScore(
                        business
                    ),

            })
        )
        .sort(
            (
                a,
                b
            ) =>
                b.score -
                a.score
        )
        .map(
            item =>
                item.business
        );

};


/**
 * Normalize a Discovery limit.
 */
const normalizeLimit = (
    limit?: number
): number => {

    return Math.min(
        Math.max(
            limit ?? 20,
            1
        ),
        100
    );

};


/**
 * Normalize a Discovery page.
 */
const normalizePage = (
    page?: number
): number => {

    return Math.max(
        page ?? 1,
        1
    );

};


/**
 * Shared Discovery Engine.
 *
 * This is the single Discovery entry point
 * used by:
 *
 * - Mobile Discovery
 * - Web Discovery
 * - Public Discovery
 *
 * The engine is responsible for:
 *
 * 1. Selecting content types
 * 2. Executing discoverability queries
 * 3. Ranking results
 * 4. Mixing Events and Businesses
 * 5. Applying pagination
 *
 * Entity-specific discoverability rules
 * remain inside the query modules.
 */
export const discover =
    async (
        request: DiscoveryRequest
    ): Promise<DiscoveryResult> => {

        const {
            query,
            options,
        } = request;


        /*
         * Resolve requested content types.
         */
        const contentTypes:
            DiscoveryContentType[] =
                query.contentTypes?.length
                    ? query.contentTypes
                    : [
                        "event",
                        "business",
                    ];


        /*
         * Normalize pagination.
         */
        const page =
            normalizePage(
                options.page
            );

        const limit =
            normalizeLimit(
                options.limit
            );


        /*
         * We fetch enough records to construct
         * the requested page after ranking/mixing.
         *
         * Example:
         *
         * page = 2
         * limit = 10
         *
         * We need the first 20 candidates
         * before slicing page 2.
         */
        const requiredItems =
            page * limit;


        /*
         * The query modules themselves protect
         * their maximum limit.
         */
        const queryLimit =
            Math.min(
                requiredItems,
                100
            );


        /*
         * Build Event query.
         */
        const eventQuery = {

            city:
                query.city,

            category:
                query.category,

            search:
                query.search,

            date:
                query.date,

            excludeEntityIds:
                options.excludeEntityIds,

            limit:
                queryLimit,

        };


        /*
         * Build Business query.
         */
        const businessQuery = {

            city:
                query.city,

            category:
                query.category,

            search:
                query.search,

            excludeEntityIds:
                options.excludeEntityIds,

            limit:
                queryLimit,

        };


        /*
         * Events and Businesses are independent
         * sources and can therefore be queried
         * in parallel.
         */
        const [
            events,
            businesses,
        ] = await Promise.all([

            contentTypes.includes(
                "event"
            )

                ? findDiscoverableEvents(
                    eventQuery
                )

                : Promise.resolve([]),

            contentTypes.includes(
                "business"
            )

                ? findDiscoverableBusinesses(
                    businessQuery
                )

                : Promise.resolve([]),

        ]);


        /*
         * Ranking happens AFTER discoverability.
         *
         * This distinction is important:
         *
         * Query:
         *     Can this entity be discovered?
         *
         * Ranking:
         *     In what order should it appear?
         */
        const rankedEvents =
            rankEvents(
                events,
                request
            );


        const rankedBusinesses =
            rankBusinesses(
                businesses
            );


        /*
         * Normalize Events.
         */
        const eventItems:
            DiscoveryResultItem[] =
                rankedEvents.map(
                    event => ({

                        type:
                            "event",

                        entity:
                            event,

                    })
                );


        /*
         * Normalize Businesses.
         */
        const businessItems:
            DiscoveryResultItem[] =
                rankedBusinesses.map(
                    business => ({

                        type:
                            "business",

                        entity:
                            business,

                    })
                );


        /*
         * Combine content.
         *
         * When only one content type is requested,
         * preserve its ranking directly.
         */
        let combinedItems:
            DiscoveryResultItem[];


        if (
            contentTypes.length === 1 &&
            contentTypes.includes(
                "event"
            )
        ) {

            combinedItems =
                eventItems;

        } else if (
            contentTypes.length === 1 &&
            contentTypes.includes(
                "business"
            )
        ) {

            combinedItems =
                businessItems;

        } else {

            /*
             * Both content types requested.
             *
             * We intentionally interleave them
             * instead of randomly shuffling them.
             *
             * This gives us deterministic Discovery
             * and avoids the old:
             *
             * sort(() => 0.5 - Math.random())
             *
             * behavior.
             */
            combinedItems = [];


            const maxLength =
                Math.max(
                    eventItems.length,
                    businessItems.length
                );


            for (
                let index = 0;
                index < maxLength;
                index++
            ) {

                if (
                    eventItems[index]
                ) {

                    combinedItems.push(
                        eventItems[index]
                    );

                }


                if (
                    businessItems[index]
                ) {

                    combinedItems.push(
                        businessItems[index]
                    );

                }

            }

        }


        /*
         * Global pagination.
         */
        const start =
            (page - 1) *
            limit;

        const end =
            start +
            limit;


        const paginatedItems =
            combinedItems.slice(
                start,
                end
            );


        /*
         * Determine whether another page
         * may exist.
         */
        const hasMore =
            combinedItems.length >
            end;


        return {

            items:
                paginatedItems,

            page,

            limit,

            hasMore,

        };

    };