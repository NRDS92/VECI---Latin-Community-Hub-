import mongoose from "mongoose";
import { AppError } from "../../shared/errors/AppError";
import { Event } from "../events/event.model";
import { MODERATION_STATUS,ModerationRejectionReason } from "../../shared/constants/moderation";

// TODO:
// Verify that the authenticated user has ADMIN role
// before approving events.

export const getEvents = async (
    status?: string
) => {

    const filters: any = {};

    if (status) {
        filters["moderation.status"] = status;
    }

    return Event.find(filters)
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images")
        .sort({
            createdAt: -1,
        });
};


export const getPendingEvents = async () => {
    return Event.find({
        "moderation.status": MODERATION_STATUS.PENDING,
    })
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images")
        .sort({ createdAt: -1 });
};

export const approveEvent = async (
    eventId: string,
    adminId: string
) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new AppError(
            "Invalid event id",
            400,
            "INVALID_ID"
        );
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError(
            "Event not found",
            404,
            "NOT_FOUND"
        );
    }

    if (
        event.moderation.status ===
        MODERATION_STATUS.APPROVED
    ) {
        throw new AppError(
            "Event already approved",
            409,
            "EVENT_ALREADY_APPROVED"
        );
    }

    event.moderation.status = MODERATION_STATUS.APPROVED;
    event.moderation.reviewedBy =
        new mongoose.Types.ObjectId(adminId);
    event.moderation.reviewedAt = new Date();

    await event.save();

    return event;
};

export const rejectEvent = async (
    eventId: string,
    adminId: string,
    reason: ModerationRejectionReason,
    comment?: string
) => {

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new AppError(
            "Invalid event id",
            400,
            "INVALID_ID"
        );
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError(
            "Event not found",
            404,
            "NOT_FOUND"
        );
    }

    if (
        event.moderation.status ===
        MODERATION_STATUS.REJECTED
    ) {
        throw new AppError(
            "Event already rejected",
            409,
            "EVENT_ALREADY_REJECTED"
        );
    }

    event.moderation.status =
        MODERATION_STATUS.REJECTED;

    event.moderation.reviewedBy =
        new mongoose.Types.ObjectId(adminId);

    event.moderation.reviewedAt =
        new Date();

    event.moderation.rejectionReason = reason;
    event.moderation.rejectionComment = comment;

    console.log("===== BEFORE SAVE =====");
    console.log({
        reason,
        comment,
        moderation: event.moderation,
    });

    await event.save();

    return event;
};