
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
} from "../../../modules/business/business.model";
import { Community } from "../../../modules/community/community.models";
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
    toPublicBusiness,
} from "../mappers/business.mapper";
import type {
    PublicEventWithCreator,
    PublicBusiness,
    PublicCommunity,
} from "@ndrs92/contracts";
import mongoose from "mongoose";
import { toPublicCommunity } from "../../../modules/community/community.mapper";

export type PublicEntity =
    | PublicEventWithCreator
    | PublicBusiness
    | PublicCommunity;

export interface ResolvedPublicContent {
    publication: PublicationDocument;
    entity: PublicEntity;
}

/**
 * User fields that are safe to expose
 * in the public Event representation.
 */
interface PublicEventCreator {
    _id: mongoose.Types.ObjectId;
    name: string;
    profileImage?: string | null;
}

/**
 * Event data required by the
 * public Event mapper.
 *
 * This is intentionally different
 * from the internal Event document.
 */
interface PublicEventSource {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    eventType: "official" | "community";
    category:
        | "party"
        | "food"
        | "culture"
        | "sports"
        | "meetup"
        | "concert";
    cityId: string;
    images: string[];
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    address: string;
    dateStart: Date;
    dateEnd?: Date;
    price?: {
        type: "free" | "paid";
        amount?: number;
        currency: "EUR";
    };
    links: {
        label: string;
        url: string;
    }[];
    createdBy: PublicEventCreator;
    goodToKnow: string[];
    attachment?: {
        url: string;
        publicId: string;
        name: string;
        size: number;
    };
    businessId?: mongoose.Types.ObjectId;
    organizer?: { type: "business" | "community"; id: mongoose.Types.ObjectId };
}

/**
 * Convert an Event domain entity
 * into its public representation.
 *
 * Internal fields such as moderation,
 * stats and attachment.publicId
 * remain outside the public boundary.
 *
 * createdBy is exposed only as a
 * limited public profile representation.
 */
const toPublicEventDTO = async (
    event: PublicEventSource,
    slug: string
): Promise<PublicEventWithCreator> => {
    const createdBy = {
        id: event.createdBy._id.toString(),
        name: event.createdBy.name,
        profileImage:
            event.createdBy.profileImage ?? undefined,
    };

    const organizerSource = event.organizer ?? (event.businessId ? { type: "business" as const, id: event.businessId } : undefined);
    let publicOrganizer: PublicEventWithCreator["organizer"];
    if (organizerSource) {
        const entity = organizerSource.type === "community"
            ? await Community.findOne({ _id: organizerSource.id, status: "active", "moderation.status": MODERATION_STATUS.APPROVED }).select("slug name images.profile").lean()
            : await Business.findOne({ _id: organizerSource.id, status: "active", "moderation.status": MODERATION_STATUS.APPROVED }).select("slug name images.profile").lean();
        if (!entity) throw new AppError("Published Event organizer is unavailable", 404, "PUBLIC_CONTENT_ENTITY_NOT_FOUND");
        publicOrganizer = {
            type: organizerSource.type,
            id: String(organizerSource.id),
            slug: entity.slug,
            name: entity.name,
            ...(entity.images?.profile ? { image: entity.images.profile } : {}),
        };
    }

    return {
        id: event._id.toString(),
        slug,
        title: event.title,
        description: event.description,
        category: event.category,
        eventType: event.eventType,
        cityId: event.cityId,
        address: event.address,
        dateStart: event.dateStart.toISOString(),
        dateEnd: event.dateEnd?.toISOString(),
        images: event.images ?? [],
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
        createdBy,
        goodToKnow: event.goodToKnow ?? [],
        attachment: event.attachment
            ? {
                url: event.attachment.url,
                name: event.attachment.name,
                size: event.attachment.size,
            }
            : undefined,
        organizer: publicOrganizer,
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
    const publication = await Publication.findOne({
        slug,
        status: PUBLICATION_STATUS.PUBLISHED,
    });

    if (!publication) {
        throw new AppError(
            "Public content not found.",
            404,
            "PUBLIC_CONTENT_NOT_FOUND"
        );
    }

    let entity: PublicEntity;

    /*
     * Resolve the original domain entity.
     */
    switch (publication.entityType) {
        case PUBLIC_CONTENT_TYPES.EVENT: {
            const event = await Event.findOne({
                _id: publication.entityId,
                status: "active",
                "moderation.status": MODERATION_STATUS.APPROVED,
            })
                .populate<{
                    createdBy: PublicEventCreator;
                }>(
                    "createdBy",
                    "name profileImage"
                )
                .lean();

            if (!event) {
                throw new AppError(
                    "Published content entity not found.",
                    404,
                    "PUBLIC_CONTENT_ENTITY_NOT_FOUND"
                );
            }

            entity = await toPublicEventDTO(
                event as PublicEventSource,
                publication.slug
            );

            break;
        }

        case PUBLIC_CONTENT_TYPES.BUSINESS: {
            const business = await Business.findOne({
                _id: publication.entityId,
                status: "active",
                "moderation.status": MODERATION_STATUS.APPROVED,
            });

            if (!business) {
                throw new AppError(
                    "Published content entity not found.",
                    404,
                    "PUBLIC_CONTENT_ENTITY_NOT_FOUND"
                );
            }

            entity = toPublicBusiness(
                business,
                publication.slug
            );

            break;
        }

        case PUBLIC_CONTENT_TYPES.COMMUNITY: {
            const community = await Community.findOne({
                _id: publication.entityId,
                status: "active",
                "moderation.status": MODERATION_STATUS.APPROVED,
            });
            if (!community) {
                throw new AppError("Published content entity not found.", 404, "PUBLIC_CONTENT_ENTITY_NOT_FOUND");
            }
            entity = toPublicCommunity(community);
            entity.slug = publication.slug;
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
