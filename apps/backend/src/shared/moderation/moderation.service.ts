import mongoose from "mongoose";
import { Moderatable } from "./moderation.types";

import {
    MODERATION_STATUS,
    ModerationRejectionReason,
} from "../constants/moderation";

export const approveModeration = (
    document: Moderatable,
    reviewedBy: string
) => {

    document.moderation.status =
        MODERATION_STATUS.APPROVED;

    document.moderation.reviewedBy =
        new mongoose.Types.ObjectId(reviewedBy);

    document.moderation.reviewedAt =
        new Date();

    document.moderation.rejectionReason =
        undefined;

    document.moderation.rejectionComment =
        undefined;
};

export const rejectModeration = (
    document: Moderatable,
    reviewedBy: string,
    reason: ModerationRejectionReason,
    comment?: string
) => {

    document.moderation.status =
        MODERATION_STATUS.REJECTED;

    document.moderation.reviewedBy =
        new mongoose.Types.ObjectId(reviewedBy);

    document.moderation.reviewedAt =
        new Date();

    document.moderation.rejectionReason =
        reason;

    document.moderation.rejectionComment =
        comment;
};