import mongoose from "mongoose";
import { Business } from "./business.model";
import { CreateBusinessInput } from "./business.validation";
import { AppError } from "../../shared/errors/AppError";

export const createBusiness = async (
    data: CreateBusinessInput,
    ownerId: string
) => {
    // ✅ NORMALIZACIÓN PRO
    const normalizedCategory = data.category.toLowerCase();

    const normalizedSubCategory = data.subCategory
        ? data.subCategory.toLowerCase()
        : undefined;

    const business = new Business({
        ...data,

        category: normalizedCategory,
        subCategory: normalizedSubCategory,

        owner: ownerId,

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

    await business.save();
    return business;
};

// 🔍 GET MY BUSINESSES
export const getMyBusinesses = async (ownerId: string) => {
    return Business.find({ owner: ownerId }).sort({ createdAt: -1 });
};

// 🔍 GET BY ID
export const getBusinessById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid business ID", 400, "INVALID_ID");
    }

    const business = await Business.findById(id);

    if (!business) {
        throw new AppError("Business not found", 404, "NOT_FOUND");
    }

    return business;
};

// ✏️ UPDATE
export const updateBusiness = async (
    id: string,
    ownerId: string,
    data: any
) => {
    const business = await getBusinessById(id);

    if (business.owner.toString() !== ownerId) {
        throw new AppError("Unauthorized", 403, "FORBIDDEN");
    }

    Object.assign(business, data);

    await business.save();

    return business;
};

// 🗑️ DELETE
export const deleteBusiness = async (
    id: string,
    ownerId: string
) => {
    const business = await getBusinessById(id);

    if (business.owner.toString() !== ownerId) {
        throw new AppError("Unauthorized", 403, "FORBIDDEN");
    }

    await business.deleteOne();
};