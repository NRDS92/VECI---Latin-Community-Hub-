import mongoose from "mongoose";

import { Business } from "../../business/business.model";
import { AppError } from "../../../shared/errors/AppError";

import {
    MODERATION_STATUS,
    ModerationRejectionReason,
} from "../../../shared/constants/moderation";

import {
    approveModeration,
    rejectModeration,
} from "../../../shared/moderation/moderation.service";

export const getBusinesses = async (
    status?: string
) => {

    const filters: any = {};

    if (status) {
        filters["moderation.status"] = status;
    }

    return Business.find(filters)
        .populate("owner", "name profileImage")
        .sort({
            createdAt: -1,
        });

};

export const getPendingBusinesses = async () => {

    return Business.find({
        "moderation.status": MODERATION_STATUS.PENDING,
    })
        .populate("owner", "name profileImage")
        .sort({
            createdAt: -1,
        });

};

export const approveBusiness = async (
    businessId: string,
    adminId: string
) => {

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
        throw new AppError(
            "Invalid business id",
            400,
            "INVALID_ID"
        );
    }

    const business = await Business.findById(
        businessId
    );

    if (!business) {
        throw new AppError(
            "Business not found",
            404,
            "NOT_FOUND"
        );
    }

    if (
        business.moderation.status ===
        MODERATION_STATUS.APPROVED
    ) {
        throw new AppError(
            "Business already approved",
            409,
            "BUSINESS_ALREADY_APPROVED"
        );
    }

    approveModeration(
        business,
        adminId
    );

    await business.save();

    return business;

};

export const rejectBusiness = async (
    businessId: string,
    adminId: string,
    reason: ModerationRejectionReason,
    comment?: string
) => {

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
        throw new AppError(
            "Invalid business id",
            400,
            "INVALID_ID"
        );
    }

    const business = await Business.findById(
        businessId
    );

    if (!business) {
        throw new AppError(
            "Business not found",
            404,
            "NOT_FOUND"
        );
    }

    if (
        business.moderation.status ===
        MODERATION_STATUS.REJECTED
    ) {
        throw new AppError(
            "Business already rejected",
            409,
            "BUSINESS_ALREADY_REJECTED"
        );
    }

    rejectModeration(
        business,
        adminId,
        reason,
        comment
    );

    await business.save();

    return business;

};