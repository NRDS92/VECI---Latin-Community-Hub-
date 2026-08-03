
import mongoose from "mongoose";
import {
    ModerationStatus,
    ModerationRejectionReason,
} from "../constants/moderation";

export interface Moderatable {
    moderation: {
        status: ModerationStatus;
        reviewedBy?: mongoose.Types.ObjectId;
        reviewedAt?: Date;
        rejectionReason?: ModerationRejectionReason;
        rejectionComment?: string;
    };
}