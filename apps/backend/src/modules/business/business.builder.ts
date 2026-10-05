import { Business } from "./business.model";
import { CreateBusinessInput } from "./business.validation";

interface BuildBusinessParams {
    data: CreateBusinessInput;
    ownerId: string;
    slug: string;
}

export const buildBusiness = ({
    data,
    ownerId,
    slug,
}: BuildBusinessParams) => {

    const normalizedCategory =
        data.category.toLowerCase();

    const normalizedSubCategory =
        data.subCategory
            ? data.subCategory.toLowerCase()
            : undefined;

    return new Business({

        // ==================================================
        // IDENTITY
        // ==================================================

        name: data.name.trim(),

        description: data.description?.trim(),

        slug,


        // ==================================================
        // CLASSIFICATION
        // ==================================================

        providerType: data.providerType,

        category: normalizedCategory,

        subCategory: normalizedSubCategory,


        // ==================================================
        // OWNER
        // ==================================================

        owner: ownerId,


        // ==================================================
        // PROFILE
        // ==================================================

        profile: {
            headline: data.profile.headline?.trim(),

            services: data.profile.services,

            specialties: data.profile.specialties,

            languages: data.profile.languages,

            serviceArea: data.profile.serviceArea,

            availability: data.profile.availability,

            openingHours: data.profile.openingHours,

            pricing: data.profile.pricing,
        },


        // ==================================================
        // IMAGES
        // ==================================================

        images: {
            profile: data.images.profile,

            cover: data.images.cover,

            gallery: data.images.gallery,
        },


        // ==================================================
        // DOCUMENTS
        // ==================================================

        documents: data.documents,


        // ==================================================
        // LOCATION
        // ==================================================

        location: {
            address: data.location.address.trim(),

            cityId: data.location.cityId.trim(),

            country: data.location.country.trim(),

            coordinates: {
                lat: data.location.latitude,

                lng: data.location.longitude,
            },
        },


        // ==================================================
        // CONTACT
        // ==================================================

        contact: {
            email: data.contact.email,

            phone: data.contact.phone,

            website: data.contact.website,

            instagram: data.contact.instagram,

            whatsapp: data.contact.whatsapp,
        },


        // ==================================================
        // COMMUNITY
        // ==================================================

        community: {
            isLatinoOwned:
                data.community.isLatinoOwned,

            countryOfOrigin:
                data.community.countryOfOrigin,
        },


        // ==================================================
        // DISCOVERY
        // ==================================================

        tags: data.tags,
    });
};