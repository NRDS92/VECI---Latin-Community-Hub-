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
    EventDocument,
} from "../../../modules/events/event.model";
import {
    Business,
    BusinessDocument,
} from "../../../modules/business/business.model";
import {
    AppError,
} from "../../errors/AppError";
import {
    PublicationDocument,
} from "../publication/publication.model";
import {
    MODERATION_STATUS,
} from "../../constants/moderation";
import {
    PublicEventDTO,
    PublicBusinessDTO,
} from "../types/public-content.dto";

export type PublicEntity =
    | PublicEventDTO
    | PublicBusinessDTO;


export interface ResolvedPublicContent {

    publication:
        PublicationDocument;

    entity:
        PublicEntity;

}


/**
 * Convert an Event domain entity
 * into its public representation.
 *
 * Internal fields such as:
 *
 * - moderation
 * - createdBy
 * - stats
 *
 * are intentionally not exposed.
 */
const toPublicEventDTO = (
    event: EventDocument,
    slug: string
): PublicEventDTO => {

    return {

        id:
            event._id.toString(),

        /*
         * The slug belongs to Publication,
         * therefore it is added by the resolver.
         */
        slug:
            slug,

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
 * Convert a Business domain entity
 * into its public representation.
 *
 * Internal fields such as:
 *
 * - owner
 * - moderation
 * - visibilityScore
 *
 * are intentionally not exposed.
 */
/**
 * Convert a Business domain entity
 * into its public representation.
 *
 * Internal fields such as:
 *
 * - owner
 * - moderation
 * - visibilityScore
 * - internal counters
 *
 * are intentionally not exposed.
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
            business.images?.profile,

        coverImage:
            business.images?.cover,

        website:
            business.contact?.website,

        instagram:
            business.contact?.instagram,

        whatsapp:
            business.contact?.whatsapp,

        priceRange:
            business.priceRange,

        tags:
            business.tags ?? [],

        languages:
            business.languages ?? [],

        isLatinoOwned:
            business.isLatinoOwned,

        countryOfOrigin:
            business.countryOfOrigin,

        rating: {

            average:
                business.rating?.average ?? 0,

            count:
                business.rating?.count ?? 0,

        },

        verificationStatus:
            business.verification?.status ??
            "unverified",

    };

};


/**
 * Resolve public content by its public slug.
 *
 * Publication is the public entry point.
 *
 * slug
 *   ↓
 * Publication
 *   ↓
 * entityType + entityId
 *   ↓
 * Domain entity
 *   ↓
 * Public DTO
 *
 * The domain entity must also satisfy
 * its own public visibility requirements.
 */
export const resolveBySlug = async (
    slug: string
): Promise<ResolvedPublicContent> => {
    /*
     * Basic validation.
     */
    if (!slug) {
        throw new AppError(
            "Public content slug is required.",
            400,
            "PUBLIC_CONTENT_SLUG_REQUIRED"
        );
    }
    /*
     * Publication is the entry point
     * for public content.
     */
    const publication =
        await Publication.findOne({
            slug,
            status:
                PUBLICATION_STATUS.PUBLISHED,
        });
    if (!publication) {
        throw new AppError(
            "Public content not found.",
            404,
            "PUBLIC_CONTENT_NOT_FOUND"
        );
    }
    let entity:
        PublicEntity;
    /*
     * Resolve the original domain entity.
     */
    switch (
        publication.entityType
    ) {
        case PUBLIC_CONTENT_TYPES.EVENT: {
            const event =
                await Event.findOne({
                    _id:
                        publication.entityId,
                    status:
                        "active",
                    "moderation.status":
                        MODERATION_STATUS.APPROVED,
                });

            if (!event) {
                throw new AppError(
                    "Published content entity not found.",
                    404,
                    "PUBLIC_CONTENT_ENTITY_NOT_FOUND"
                );
            }
            entity =
                toPublicEventDTO(
                    event,
                    publication.slug
                );
            break;
        }


        case PUBLIC_CONTENT_TYPES.BUSINESS: {
            const business =
                await Business.findOne({
                    _id:
                        publication.entityId,
                    status:
                        "active",
                    "moderation.status":
                        MODERATION_STATUS.APPROVED,
                });

            if (!business) {
                throw new AppError(
                    "Published content entity not found.",
                    404,
                    "PUBLIC_CONTENT_ENTITY_NOT_FOUND"
                );
            }
            entity =
                toPublicBusinessDTO(
                    business,
                    publication.slug
                );
            break;
        }

        default:
            throw new AppError(
                `Public content type "${publication.entityType}" is not supported yet.`,
                501,
                "PUBLIC_CONTENT_TYPE_NOT_IMPLEMENTED"
            );
    }


    return {
        publication,
        entity,
    };
};