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
import {
    publishContent,
} from "../../../shared/public-content/publisher/publisher.service";
import {
    PUBLIC_CONTENT_TYPES,
} from "../../../shared/public-content/constants/public-content.types";


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
        "moderation.status":
            MODERATION_STATUS.PENDING,
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
    const business =
        await Business.findById(
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

    await publishContent({
        entityType: PUBLIC_CONTENT_TYPES.BUSINESS,
        entityId: business._id.toString(),
        title: business.name,
        seoTitle: `${business.name} | VECI`,
        seoDescription: business.description,
    });

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

    const business =
        await Business.findById(
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


import { z } from "zod";

import {
    MODERATION_REJECTION_REASONS,
} from "../../../shared/constants/moderation";


export const rejectBusinessSchema =
    z.object({

        reason:
            z.enum(
                MODERATION_REJECTION_REASONS
            ),

        comment:
            z.string().optional(),

    });


export type RejectBusinessInput =
    z.infer<typeof rejectBusinessSchema>;