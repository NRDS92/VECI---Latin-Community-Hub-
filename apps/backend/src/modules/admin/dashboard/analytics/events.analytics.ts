import { Event } from "../../../events/event.model";

import {
    MODERATION_STATUS,
} from "../../../../shared/constants/moderation";

import {
    EventsAnalytics,
} from "./analytics.types";

export const getEventsAnalytics =
async (): Promise<EventsAnalytics> => {

    const [
        total,
        pending,
        approved,
        rejected,
        community,
        official,
        byCategory,
        byCity,
    ] = await Promise.all([

        Event.countDocuments(),

        Event.countDocuments({
            "moderation.status":
                MODERATION_STATUS.PENDING,
        }),

        Event.countDocuments({
            "moderation.status":
                MODERATION_STATUS.APPROVED,
        }),

        Event.countDocuments({
            "moderation.status":
                MODERATION_STATUS.REJECTED,
        }),

        Event.countDocuments({
            eventType: "community",
        }),

        Event.countDocuments({
            eventType: "official",
        }),

        Event.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]),

        Event.aggregate([
            {
                $group: {
                    _id: "$cityId",
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]),

    ]);

    return {

        total,

        pending,

        approved,

        rejected,

        community,

        official,

        byCategory: byCategory.map((item) => ({
            category: item._id,
            count: item.count,
        })),

        byCity: byCity.map((item) => ({
            city: item._id,
            count: item.count,
        })),

    };

};