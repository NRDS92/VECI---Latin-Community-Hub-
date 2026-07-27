import mongoose from "mongoose";
import { AppError } from "../../shared/errors/AppError";
import { Event } from "../events/event.model";
import { MODERATION_STATUS } from "../../shared/constants/moderation";

// TODO:
// Verify that the authenticated user has ADMIN role
// before approving events.


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