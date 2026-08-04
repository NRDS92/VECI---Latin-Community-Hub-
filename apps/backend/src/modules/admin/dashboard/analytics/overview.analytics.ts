import { User } from "../../../users/user.model";
import { Event } from "../../../events/event.model";
import { Business } from "../../../business/business.model";

import {
    MODERATION_STATUS,
} from "../../../../shared/constants/moderation";

export const getOverview = async () => {

    const [
        users,
        events,
        businesses,
        pendingEvents,
        pendingBusinesses,
    ] = await Promise.all([

        User.countDocuments(),

        Event.countDocuments(),

        Business.countDocuments(),

        Event.countDocuments({
            "moderation.status":
                MODERATION_STATUS.PENDING,
        }),

        Business.countDocuments({
            "moderation.status":
                MODERATION_STATUS.PENDING,
        }),

    ]);

    return {

        users,

        events,

        businesses,

        pendingModeration:
            pendingEvents +
            pendingBusinesses,

    };

};