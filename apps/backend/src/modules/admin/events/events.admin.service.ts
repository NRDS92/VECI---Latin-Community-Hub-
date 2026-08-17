import { Event } from "../../events/event.model";
import { AppError } from "../../../shared/errors/AppError";
import {
    MODERATION_STATUS,
    ModerationRejectionReason,
} from "../../../shared/constants/moderation";
import {
    approveModeration,
    rejectModeration,
} from "../../../shared/moderation/moderation.service";
import { findDocumentOrFail } from "../../../shared/moderation/moderation.document.service";
import {
    PUBLIC_CONTENT_TYPES,
} from "../../../shared/public-content/constants/public-content.types";
import {
    publishContent,
} from "../../../shared/public-content/publisher/publisher.service";

// TODO:
// Verify that the authenticated user has ADMIN role
// before approving events.

export const getAdminEvents = async (
    status?: string
) => {
    const filters: Record<string, unknown> = {};
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

export const getPendingAdminEvents = async () => {

    return Event.find({
        "moderation.status": MODERATION_STATUS.PENDING,
    })
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images")
        .sort({
            createdAt: -1,
        });

};

export const approveEvent = async (
    eventId: string,
    adminId: string
) => {
    const event =
        await findDocumentOrFail(
            Event,
            eventId,
            "Event"
        );
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
    /*
     * First approve the domain entity.
     */
    approveModeration(
        event,
        adminId
    );
    await event.save();
    /*
     * Once moderation succeeds,
     * create and publish the public content.
     */
    const publication =
        await publishContent({
            entityType:
                PUBLIC_CONTENT_TYPES.EVENT,
            entityId:
                event._id.toString(),
            title:
                event.title,
            seoTitle:
                `${event.title} | VECI`,
            seoDescription:
                event.description,
        });
    return {
        event,
        publication,
    };
};

export const rejectEvent = async (
    eventId: string,
    adminId: string,
    reason: ModerationRejectionReason,
    comment?: string
) => {

    const event = await findDocumentOrFail(
        Event,
        eventId,
        "Event"
    );

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

    rejectModeration(
        event,
        adminId,
        reason,
        comment
    );

    await event.save();

    return event;

};