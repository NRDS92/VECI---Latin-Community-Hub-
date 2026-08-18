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

    console.log(
        "🟡 APPROVE EVENT START",
        {
            eventId,
            adminId,
        }
    );


    const event =
        await findDocumentOrFail(
            Event,
            eventId,
            "Event"
        );


    console.log(
        "🟢 EVENT FOUND",
        {
            id:
                event._id.toString(),

            title:
                event.title,

            moderationStatus:
                event.moderation.status,
        }
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
     * Approve the event.
     */
    approveModeration(
        event,
        adminId
    );


    console.log(
        "🟠 EVENT MODERATION UPDATED",
        {
            status:
                event.moderation.status,
        }
    );


    /*
     * Persist approval.
     */
    await event.save();


    console.log(
        "🟢 EVENT SAVED AS APPROVED",
        {
            id:
                event._id.toString(),

            status:
                event.moderation.status,
        }
    );


    /*
     * Create and publish public content.
     */
    console.log(
        "📢 CALLING PUBLISH CONTENT",
        {
            entityType:
                PUBLIC_CONTENT_TYPES.EVENT,

            entityId:
                event._id.toString(),

            title:
                event.title,
        }
    );


    try {

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


        console.log(
            "🚀 EVENT PUBLICATION CREATED",
            {
                publicationId:
                    publication._id.toString(),

                entityType:
                    publication.entityType,

                entityId:
                    publication.entityId,

                slug:
                    publication.slug,

                status:
                    publication.status,

                publishedAt:
                    publication.publishedAt,
            }
        );


        return {
            event,
            publication,
        };

    } catch (error) {

        console.error(
            "🔴 PUBLISH CONTENT FAILED",
            error
        );

        throw error;
    }
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