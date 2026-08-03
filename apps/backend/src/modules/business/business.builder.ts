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

    const normalizedCategory = data.category.toLowerCase();

    const normalizedSubCategory = data.subCategory
        ? data.subCategory.toLowerCase()
        : undefined;

    return new Business({
        ...data,
        slug,
        owner: ownerId,
        category: normalizedCategory,
        subCategory: normalizedSubCategory,
        location: {
            address: data.location.address,
            cityId: data.location.cityId.trim(),
            country: data.location.country,
            coordinates: {
                lat: data.location.latitude,
                lng: data.location.longitude,
            },
        },
    });
};