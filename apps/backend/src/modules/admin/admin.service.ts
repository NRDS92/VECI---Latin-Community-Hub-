import { Event } from "../events/event.model";
import { MODERATION_STATUS } from "../../shared/constants/moderation";

export const getPendingEvents = async () => {
    return Event.find({
        "moderation.status": MODERATION_STATUS.PENDING,
    })
        .populate("createdBy", "name profileImage")
        .populate("businessId", "name images")
        .sort({ createdAt: -1 });
};