import { OwnerBusinessSchema, type OwnerBusiness } from "@ndrs92/contracts";
import type { BusinessDocument } from "./business.model";

/** Serialize an owner Business response without leaking persistence internals. */
export const toOwnerBusiness = (business: BusinessDocument): OwnerBusiness => {
    const source = business.toObject({ depopulate: true, flattenMaps: true });
    const verifiedAt = source.verification?.verifiedAt;

    return OwnerBusinessSchema.parse({
        _id: source._id.toString(),
        slug: source.slug,
        name: source.name,
        description: source.description,
        providerType: source.providerType,
        category: source.category,
        subCategory: source.subCategory,
        profile: {
            headline: source.profile?.headline,
            services: source.profile?.services ?? [],
            specialties: source.profile?.specialties ?? [],
            languages: source.profile?.languages ?? [],
            serviceArea: source.profile?.serviceArea ?? [],
            availability: source.profile?.availability,
            openingHours: source.profile?.openingHours,
            pricing: source.profile?.pricing,
        },
        images: {
            profile: source.images?.profile,
            cover: source.images?.cover,
            gallery: source.images?.gallery ?? [],
        },
        documents: source.documents ?? [],
        location: {
            address: source.location?.address,
            cityId: source.location?.cityId,
            country: source.location?.country,
            coordinates: source.location?.coordinates,
        },
        contact: source.contact ?? {},
        community: source.community ?? { isLatinoOwned: true },
        tags: source.tags ?? [],
        menu: source.menu,
        priceRange: source.priceRange,
        languages: source.languages ?? [],
        isLatinoOwned: source.community?.isLatinoOwned ?? source.isLatinoOwned ?? true,
        countryOfOrigin: source.community?.countryOfOrigin ?? source.countryOfOrigin,
        rating: source.rating ?? { average: 0, count: 0 },
        likesCount: source.likesCount ?? 0,
        followersCount: source.followersCount ?? 0,
        eventsCount: source.eventsCount ?? 0,
        verification: {
            status: source.verification?.status ?? "unverified",
            checks: {
                identity: source.verification?.checks?.identity ?? false,
                contact: source.verification?.checks?.contact ?? false,
                activity: source.verification?.checks?.activity ?? false,
            },
            verifiedAt: verifiedAt?.toISOString(),
        },
        isFeatured: source.isFeatured ?? false,
        status: source.status ?? "active",
        createdAt: source.createdAt.toISOString(),
        updatedAt: source.updatedAt.toISOString(),
    });
};
