import {
    discover,
} from "../../discovery/discovery.service";

import {
    DiscoveryRequest,
} from "../../discovery/discovery.types";

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
    PublicEventDTO,
    PublicBusinessDTO,
} from "../types/public-content.dto";

import type {
    EventDocument,
} from "../../../modules/events/event.model";

import type {
    BusinessDocument,
} from "../../../modules/business/business.model";


export interface RelatedEventsOptions {

    cityId?: string;

    category?: string;

    excludeEntityId?: string;

    limit?: number;

}


export interface RelatedBusinessesOptions {

    cityId?: string;

    category?: string;

    excludeEntityId?: string;

    limit?: number;

}


/**
 * Convert a discovered Event into
 * its public representation.
 *
 * The Event itself does not own the
 * public slug. The Publication does.
 */
const toPublicEventDTO = (
    event: EventDocument,
    slug: string
): PublicEventDTO => {
    return {
        id: event._id.toString(),
        slug,
        title: event.title,
        description: event.description,
        category: event.category,
        eventType: event.eventType,
        cityId: event.cityId,
        address: event.address,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
        image: event.images?.[0],
        location: event.location
            ? {
                type: event.location.type,
                coordinates: event.location.coordinates,
            }
            : undefined,
        price: event.price
            ? {
                type: event.price.type,
                amount: event.price.amount,
                currency: event.price.currency,
            }
            : undefined,
        links: event.links ?? [],
        goodToKnow: event.goodToKnow ?? [],
        attachment: event.attachment
            ? {
                url: event.attachment.url,
                name: event.attachment.name,
                size: event.attachment.size,
            }
            : undefined,
    };
};


/**
 * Convert a discovered Business into
 * its public representation.
 *
 * Internal ownership and moderation
 * data remain outside the public boundary.
 */
const toPublicBusinessDTO = (
    business: BusinessDocument,
    slug: string
): PublicBusinessDTO => {

    return {

        id:
            business._id.toString(),

        slug,

        name:
            business.name,

        description:
            business.description,

        category:
            business.category,

        subCategory:
            business.subCategory,

        cityId:
            business.location.cityId,

        country:
            business.location.country,

        address:
            business.location.address,

        image:
            business.images.profile,

        coverImage:
            business.images.cover,

        website:
            business.contact.website,

        instagram:
            business.contact.instagram,

        whatsapp:
            business.contact.whatsapp,

        priceRange:
            business.priceRange,

        tags:
            business.tags || [],

        languages:
            business.languages || [],

        isLatinoOwned:
            business.isLatinoOwned,

        countryOfOrigin:
            business.countryOfOrigin,

        rating: {

            average:
                business.rating?.average || 0,

            count:
                business.rating?.count || 0,

        },

        verificationStatus:
            business.verification.status,

    };

};


/**
 * Get related public Events.
 *
 * IMPORTANT:
 *
 * This function does NOT implement
 * its own discoverability rules.
 *
 * Discovery is delegated to the
 * shared Discovery Engine.
 *
 * The public-content layer is only
 * responsible for:
 *
 * - requesting public Events
 * - resolving their public slugs
 * - converting them into Public DTOs
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


    /*
     * Protect the endpoint from
     * unreasonable limits.
     */
    const safeLimit =
        Math.min(
            Math.max(
                limit,
                1
            ),
            20
        );


    /*
     * Build the shared Discovery request.
     *
     * Public Discovery uses the same
     * discoverability rules as every
     * other consumer of Discovery.
     */
    const request: DiscoveryRequest = {

        query: {

            city:
                cityId,

            category,

            contentTypes: [
                "event",
            ],

            /*
             * Related events should be
             * upcoming by default.
             */
            date: {
                type:
                    "upcoming",
            },

        },


        /*
         * Public Discovery has no user
         * personalization.
         */
        context: {},


        options: {

            visibility:
                "public",

            ranking:
                "public",

            limit:
                safeLimit,

            excludeEntityIds:
                excludeEntityId
                    ? [
                        excludeEntityId,
                    ]
                    : undefined,

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
     * Discovery returns normalized
     * domain entities.
     *
     * We only requested Events above,
     * therefore every item here is an Event.
     */
    const events =
        result.items
            .filter(
                item =>
                    item.type === "event"
            )
            .map(
                item =>
                    item.entity as EventDocument
            );


    if (
        events.length === 0
    ) {

        return [];

    }


    /*
     * Resolve the public Publication
     * for the discovered Events.
     */
    const eventIds =
        events.map(
            event =>
                event._id.toString()
        );


    const publications =
        await Publication.find({

            entityType:
                PUBLIC_CONTENT_TYPES.EVENT,

            entityId: {
                $in:
                    eventIds,
            },

            status:
                PUBLICATION_STATUS.PUBLISHED,

        })
            .select(
                "entityId slug"
            )
            .lean();


    /*
     * Create a fast lookup map:
     *
     * Event ID → public slug
     */
    const publicationMap =
        new Map(
            publications.map(
                publication => [

                    publication.entityId,

                    publication.slug,

                ]
            )
        );


    /*
     * Convert Events into their
     * public representation.
     */
    return events
        .map(
            event => {

                const slug =
                    publicationMap.get(
                        event._id.toString()
                    );


                if (!slug) {

                    return null;

                }


                return toPublicEventDTO(
                    event,
                    slug
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


/**
 * Get related public Businesses.
 *
 * IMPORTANT:
 *
 * This function does NOT implement
 * its own discoverability rules.
 *
 * Discovery is delegated to the
 * shared Discovery Engine.
 *
 * The public-content layer is only
 * responsible for:
 *
 * - requesting public Businesses
 * - resolving their public slugs
 * - converting them into Public DTOs
 */
export const getRelatedBusinesses = async (
    options: RelatedBusinessesOptions = {}
): Promise<PublicBusinessDTO[]> => {

    const {
        cityId,

        category,

        excludeEntityId,

        limit = 6,

    } = options;


    /*
     * Protect the endpoint from
     * unreasonable limits.
     */
    const safeLimit =
        Math.min(
            Math.max(
                limit,
                1
            ),
            20
        );


    /*
     * Build the shared Discovery request.
     */
    const request: DiscoveryRequest = {

        query: {

            city:
                cityId,

            category,

            contentTypes: [
                "business",
            ],

        },


        /*
         * Public Discovery has no user
         * personalization.
         */
        context: {},


        options: {

            visibility:
                "public",

            ranking:
                "public",

            limit:
                safeLimit,

            excludeEntityIds:
                excludeEntityId
                    ? [
                        excludeEntityId,
                    ]
                    : undefined,

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
     * Discovery returns normalized
     * domain entities.
     *
     * We only requested Businesses above,
     * therefore every item here is a Business.
     */
    const businesses =
        result.items
            .filter(
                item =>
                    item.type === "business"
            )
            .map(
                item =>
                    item.entity as BusinessDocument
            );


    if (
        businesses.length === 0
    ) {

        return [];

    }


    /*
     * Resolve the public Publication
     * for the discovered Businesses.
     */
    const businessIds =
        businesses.map(
            business =>
                business._id.toString()
        );


    const publications =
        await Publication.find({

            entityType:
                PUBLIC_CONTENT_TYPES.BUSINESS,

            entityId: {
                $in:
                    businessIds,
            },

            status:
                PUBLICATION_STATUS.PUBLISHED,

        })
            .select(
                "entityId slug"
            )
            .lean();


    /*
     * Create a fast lookup map:
     *
     * Business ID → public slug
     */
    const publicationMap =
        new Map(
            publications.map(
                publication => [

                    publication.entityId,

                    publication.slug,

                ]
            )
        );


    /*
     * Convert Businesses into their
     * public representation.
     */
    return businesses
        .map(
            business => {

                const slug =
                    publicationMap.get(
                        business._id.toString()
                    );


                /*
                 * This should never happen because
                 * shared Discovery only returns
                 * published entities.
                 *
                 * We still protect the public
                 * boundary.
                 */
                if (!slug) {

                    return null;

                }


                return toPublicBusinessDTO(
                    business,
                    slug
                );

            }
        )
        .filter(
            (
                business
            ): business is PublicBusinessDTO =>
                business !== null
        );

};