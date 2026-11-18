
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
import type {
    PublicEvent,
    PublicBusiness,
} from "@ndrs92/contracts";
import type {
    EventDocument,
} from "../../../modules/events/event.model";
import type {
    BusinessDocument,
} from "../../../modules/business/business.model";
import {
    toPublicBusiness,
} from "../mappers/business.mapper";

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
): PublicEvent => {
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
 * Get related public Events.
 *
 * Discovery is delegated to the shared Discovery Engine.
 */
export const getRelatedEvents = async (
    options: RelatedEventsOptions = {}
): Promise<PublicEvent[]> => {
    const {
        cityId,
        category,
        excludeEntityId,
        limit = 6,
    } = options;

    const safeLimit = Math.min(
        Math.max(limit, 1),
        20
    );

    const request: DiscoveryRequest = {
        query: {
            city: cityId,
            category,
            contentTypes: ["event"],
            date: {
                type: "upcoming",
            },
        },
        context: {},
        options: {
            visibility: "public",
            ranking: "public",
            limit: safeLimit,
            excludeEntityIds: excludeEntityId
                ? [excludeEntityId]
                : undefined,
        },
    };

    const result = await discover(request);

    const events = result.items
        .filter(item => item.type === "event")
        .map(item => item.entity as EventDocument);

    if (events.length === 0) {
        return [];
    }

    const eventIds = events.map(
        event => event._id.toString()
    );

    const publications = await Publication.find({
        entityType: PUBLIC_CONTENT_TYPES.EVENT,
        entityId: {
            $in: eventIds,
        },
        status: PUBLICATION_STATUS.PUBLISHED,
    })
        .select("entityId slug")
        .lean();

    const publicationMap = new Map(
        publications.map(publication => [
            publication.entityId,
            publication.slug,
        ])
    );

    return events
        .map(event => {
            const slug = publicationMap.get(
                event._id.toString()
            );

            if (!slug) {
                return null;
            }

            return toPublicEventDTO(event, slug);
        })
        .filter(
            (event): event is PublicEvent =>
                event !== null
        );
};

/**
 * Get related public Businesses.
 *
 * Discovery is delegated to the shared Discovery Engine.
 */
export const getRelatedBusinesses = async (
    options: RelatedBusinessesOptions = {}
): Promise<PublicBusiness[]> => {
    const {
        cityId,
        category,
        excludeEntityId,
        limit = 6,
    } = options;

    const safeLimit = Math.min(
        Math.max(limit, 1),
        20
    );

    const request: DiscoveryRequest = {
        query: {
            city: cityId,
            category,
            contentTypes: ["business"],
        },
        context: {},
        options: {
            visibility: "public",
            ranking: "public",
            limit: safeLimit,
            excludeEntityIds: excludeEntityId
                ? [excludeEntityId]
                : undefined,
        },
    };

    const result = await discover(request);

    const businesses = result.items
        .filter(item => item.type === "business")
        .map(item => item.entity as BusinessDocument);

    if (businesses.length === 0) {
        return [];
    }

    const businessIds = businesses.map(
        business => business._id.toString()
    );

    const publications = await Publication.find({
        entityType: PUBLIC_CONTENT_TYPES.BUSINESS,
        entityId: {
            $in: businessIds,
        },
        status: PUBLICATION_STATUS.PUBLISHED,
    })
        .select("entityId slug")
        .lean();

    const publicationMap = new Map(
        publications.map(publication => [
            publication.entityId,
            publication.slug,
        ])
    );

    return businesses
        .map(business => {
            const slug = publicationMap.get(
                business._id.toString()
            );

            if (!slug) {
                return null;
            }

            return toPublicBusiness(business, slug);
        })
        .filter(
            (business): business is PublicBusiness =>
                business !== null
        );
};
