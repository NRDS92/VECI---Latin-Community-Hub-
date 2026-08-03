import { Business } from "./business.model";
import { User } from "../users/user.model";

import { AppError } from "../../shared/errors/AppError";
import { SUBSCRIPTION_CONFIG } from "../../shared/config/subscription.config";

export const validateBusinessCreation = async (
    ownerId: string
): Promise<void> => {

    const user = await User.findById(ownerId);

    if (!user) {
        throw new AppError(
            "User not found",
            404,
            "USER_NOT_FOUND"
        );
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
};