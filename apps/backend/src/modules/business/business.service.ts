import mongoose from "mongoose";
import { Business } from "./business.model";
import { CreateBusinessInput } from "./business.validation";
import { AppError } from "../../shared/errors/AppError";
import { User } from "../users/user.model";
import { SUBSCRIPTION_CONFIG } from "../../shared/config/subscription.config";
import { generateUniqueBusinessSlug } from "./business.slug";

export const createBusiness = async (
    data: CreateBusinessInput,
    ownerId: string
) => {
    const user = await User.findById(ownerId);
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const planConfig = SUBSCRIPTION_CONFIG[user.subscription.plan];
    if (!planConfig) {
        throw new AppError(
            "Invalid subscription plan.",
            500,
            "INVALID_SUBSCRIPTION_PLAN"
        );
    }

    const totalBusinesses = await Business.countDocuments({
        owner: ownerId,
    });
    if (totalBusinesses >= planConfig.maxBusinesses) {
        throw new AppError(
            "You have reached the maximum number of businesses allowed for your plan.",
            409,
            "BUSINESS_LIMIT_REACHED"
        );
    }
    const slug = await generateUniqueBusinessSlug(data.name);
    // ✅ NORMALIZACIÓN PRO
    const normalizedCategory = data.category.toLowerCase();
    const normalizedSubCategory = data.subCategory
        ? data.subCategory.toLowerCase()
        : undefined;

    const business = new Business({
        ...data,
        slug,
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