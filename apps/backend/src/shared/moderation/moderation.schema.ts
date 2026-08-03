import { Schema } from "mongoose";

import {
    MODERATION_STATUS,
    MODERATION_REJECTION_REASON,
} from "../constants/moderation";

export const ModerationSchema = new Schema(
    {
        status: {
            type: String,
            enum: Object.values(MODERATION_STATUS),
            default: MODERATION_STATUS.PENDING,
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        reviewedAt: Date,

        rejectionReason: {
            type: String,
            enum: Object.values(MODERATION_REJECTION_REASON),
        },

        rejectionComment: String,
    },
    {
        _id: false,
    }
);