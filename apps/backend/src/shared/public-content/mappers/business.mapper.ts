
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
    const isLatinoOwned =
        business.community?.isLatinoOwned ??
        business.isLatinoOwned ??
        true;

    const countryOfOrigin =
        business.community?.countryOfOrigin ??
        business.countryOfOrigin;

    const verificationStatus =
        business.verification?.status ??
        "unverified";

    const publicBusiness = {
        // IDENTITY
        id: business._id.toString(),
        slug,
        name: business.name,
        description: business.description,

        // CLASSIFICATION
        providerType: business.providerType,
        category: business.category,
        subCategory: business.subCategory,

        // LOCATION
        cityId: business.location.cityId,
        country: business.location.country,
        address: business.location.address,
        coordinates: business.location.coordinates,

        // IMAGES
        image: business.images?.profile,
        coverImage: business.images?.cover,
        gallery: business.images?.gallery ?? [],

        // CONTACT
        contact: {
            email: business.contact?.email,
            phone: business.contact?.phone,
            website: business.contact?.website,
            instagram: business.contact?.instagram,
            whatsapp: business.contact?.whatsapp,
        },

        // LEGACY CONTACT FIELDS
        website: business.contact?.website,
        instagram: business.contact?.instagram,
        whatsapp: business.contact?.whatsapp,

        // PROFILE
        profile: {
            headline: business.profile?.headline,
            services: business.profile?.services ?? [],
            specialties: business.profile?.specialties ?? [],
            languages: business.profile?.languages ?? [],
            serviceArea: business.profile?.serviceArea ?? [],
            availability: business.profile?.availability,
            openingHours: business.profile?.openingHours,
            pricing: business.profile?.pricing,
        },

        // DOCUMENTS & MENU
        documents: business.documents ?? [],
        menu: business.menu,
        priceRange: business.priceRange,

        // DISCOVERY
        tags: business.tags ?? [],
        languages: business.languages ?? [],

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
            average: business.rating?.average ?? 0,
            count: business.rating?.count ?? 0,
        },

        // SOCIAL
        likesCount: business.likesCount ?? 0,
        followersCount: business.followersCount ?? 0,
        eventsCount: business.eventsCount ?? 0,

        // VERIFICATION
        verification: {
            status: verificationStatus,
            checks: {
                identity:
                    business.verification?.checks?.identity ?? false,
                contact:
                    business.verification?.checks?.contact ?? false,
                activity:
                    business.verification?.checks?.activity ?? false,
            },
        },

        // LEGACY VERIFICATION FIELD
        verificationStatus,

        // STATUS & METADATA
        isFeatured: business.isFeatured ?? false,
        status: business.status ?? "active",
        createdAt: business.createdAt.toISOString(),
        updatedAt: business.updatedAt.toISOString(),
    };

    // Validate the public API boundary.
    return PublicBusinessSchema.parse(publicBusiness);
};
