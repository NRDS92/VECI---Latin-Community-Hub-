
import {
    PublicBusinessSchema,
    type PublicBusiness,
} from "@veci/contracts";

import type {
    BusinessDocument,
} from "../../../modules/business/business.model";

/**
 * Maps an internal Business document into the
 * canonical public Business contract.
 *
 * This is the single source of truth for public
 * Business serialization across the backend.
 */
export const toPublicBusiness = (
    business: BusinessDocument,
    slug: string
): PublicBusiness => {
    const source = business.toObject({
        depopulate: true,
        flattenMaps: true,
    });

    const isLatinoOwned =
        source.community?.isLatinoOwned ??
        source.isLatinoOwned ??
        true;

    const countryOfOrigin =
        source.community?.countryOfOrigin ??
        source.countryOfOrigin;

    const verificationStatus =
        source.verification?.status ??
        "unverified";

    // Normalize opening hours into plain objects.
    const openingHours = source.profile?.openingHours
        ? {
            monday: {
                isOpen: source.profile.openingHours.monday.isOpen,
                intervals: source.profile.openingHours.monday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
            tuesday: {
                isOpen: source.profile.openingHours.tuesday.isOpen,
                intervals: source.profile.openingHours.tuesday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
            wednesday: {
                isOpen: source.profile.openingHours.wednesday.isOpen,
                intervals: source.profile.openingHours.wednesday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
            thursday: {
                isOpen: source.profile.openingHours.thursday.isOpen,
                intervals: source.profile.openingHours.thursday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
            friday: {
                isOpen: source.profile.openingHours.friday.isOpen,
                intervals: source.profile.openingHours.friday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
            saturday: {
                isOpen: source.profile.openingHours.saturday.isOpen,
                intervals: source.profile.openingHours.saturday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
            sunday: {
                isOpen: source.profile.openingHours.sunday.isOpen,
                intervals: source.profile.openingHours.sunday.intervals.map(
                    ({ open, close }) => ({ open, close })
                ),
            },
        }
        : undefined;

    const publicBusiness = {
        // IDENTITY
        id: source._id.toString(),
        slug,
        name: source.name,
        description: source.description,

        // CLASSIFICATION
        providerType: source.providerType,
        category: source.category,
        subCategory: source.subCategory,

        // LOCATION
        cityId: source.location.cityId,
        country: source.location.country,
        address: source.location.address,
        coordinates: source.location.coordinates,

        // IMAGES
        image: source.images?.profile,
        coverImage: source.images?.cover,
        gallery: source.images?.gallery ?? [],

        // CONTACT
        contact: {
            email: source.contact?.email,
            phone: source.contact?.phone,
            website: source.contact?.website,
            instagram: source.contact?.instagram,
            whatsapp: source.contact?.whatsapp,
        },

        // LEGACY CONTACT FIELDS
        website: source.contact?.website,
        instagram: source.contact?.instagram,
        whatsapp: source.contact?.whatsapp,

        // PROFILE
        profile: {
            headline: source.profile?.headline,
            services: source.profile?.services ?? [],
            specialties: source.profile?.specialties ?? [],
            languages: source.profile?.languages ?? [],
            serviceArea: source.profile?.serviceArea ?? [],
            availability: source.profile?.availability,
            openingHours,
            pricing: source.profile?.pricing,
        },

        // DOCUMENTS & MENU
        documents: source.documents ?? [],
        menu: source.menu,
        priceRange: source.priceRange,

        // DISCOVERY
        tags: source.tags ?? [],
        languages: source.languages ?? [],

        // COMMUNITY
        community: {
            isLatinoOwned,
            countryOfOrigin,
        },

        // LEGACY COMMUNITY FIELDS
        isLatinoOwned,
        countryOfOrigin,

        // RATING
        rating: {
            average: source.rating?.average ?? 0,
            count: source.rating?.count ?? 0,
        },

        // SOCIAL
        likesCount: source.likesCount ?? 0,
        followersCount: source.followersCount ?? 0,
        eventsCount: source.eventsCount ?? 0,

        // VERIFICATION
        verification: {
            status: verificationStatus,
            checks: {
                identity:
                    source.verification?.checks?.identity ?? false,
                contact:
                    source.verification?.checks?.contact ?? false,
                activity:
                    source.verification?.checks?.activity ?? false,
            },
        },

        // LEGACY VERIFICATION FIELD
        verificationStatus,

        // STATUS & METADATA
        isFeatured: source.isFeatured ?? false,
        status: source.status ?? "active",
        createdAt: source.createdAt.toISOString(),
        updatedAt: source.updatedAt.toISOString(),
    };

    // Validate the public API boundary.
    return PublicBusinessSchema.parse(publicBusiness);
};
