import {
    Publication,
} from "../publication/publication.model";

import {
    PUBLICATION_STATUS,
} from "../publication/publication-status";

import {
    PUBLIC_CONTENT_TYPES,
} from "../constants/public-content.types";

import {
    Event,
} from "../../../modules/events/event.model";

import {
    PublicEventDTO,
} from "../types/public-content.dto";


export interface RelatedEventsOptions {

    cityId?: string;

    category?: string;

    excludeEntityId?: string;

    limit?: number;
}


/**
 * Convert an Event + Publication into
 * the public representation consumed
 * by frontend applications.
 */
const toPublicEventDTO = (
    event: any,
    publication: any
): PublicEventDTO => {

    return {

        id:
            event._id.toString(),

        slug:
            publication.slug,

        title:
            event.title,

        description:
            event.description,

        category:
            event.category,

        eventType:
            event.eventType,

        cityId:
            event.cityId,

        address:
            event.address,

        dateStart:
            event.dateStart,

        dateEnd:
            event.dateEnd,

        image:
            event.images?.[0],

    };
};


/**
 * Get related public events.
 *
 * Only PUBLISHED publications are considered
 * public content.
 */
export const getRelatedEvents = async (
    options: RelatedEventsOptions = {}
): Promise<PublicEventDTO[]> => {

    const {
        cityId,

        category,

        excludeEntityId,

        limit = 6,

    } = options;


    const safeLimit =
        Math.min(
            Math.max(
                limit,
                1
            ),
            20
        );


    /*
     * Find published Event publications.
     */
    const publications =
        await Publication.find({

            entityType:
                PUBLIC_CONTENT_TYPES.EVENT,

            status:
                PUBLICATION_STATUS.PUBLISHED,

        })
            .sort({
                publishedAt: -1,
            })
            .limit(
                safeLimit * 5
            );


    if (
        publications.length === 0
    ) {

        return [];

    }


    /*
     * Create a map so we can recover
     * the public slug for each Event.
     */
    const publicationMap =
        new Map(
            publications.map(
                publication => [

                    publication.entityId,

                    publication,

                ]
            )
        );


    const entityIds =
        publications.map(
            publication =>
                publication.entityId
        );


    /*
     * Event filters.
     */
    const filters: Record<
        string,
        unknown
    > = {

        _id: {
            $in: entityIds,
        },

        status:
            "active",

    };


    if (cityId) {

        filters.cityId =
            cityId;

    }


    if (category) {

        filters.category =
            category;

    }


    if (excludeEntityId) {

        filters._id = {

            $in:
                entityIds,

            $ne:
                excludeEntityId,

        };

    }


    const events =
        await Event.find(
            filters
        )
            .sort({
                dateStart: 1,
            })
            .limit(
                safeLimit
            );


    return events.map(
        event => {

            const publication =
                publicationMap.get(
                    event._id.toString()
                );


            /*
             * This should never happen because
             * entityIds originate from publications,
             * but we protect the boundary anyway.
             */
            if (!publication) {

                return null;

            }


            return toPublicEventDTO(
                event,
                publication
            );

        }
    )
        .filter(
            (
                event
            ): event is PublicEventDTO =>
                event !== null
        );

};