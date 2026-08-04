import { User } from "../../../users/user.model";
import { Event } from "../../../events/event.model";
import { Business } from "../../../business/business.model";

import {
    RecentActivityAnalytics,
    RecentActivityItem,
} from "./analytics.types";

export const getRecentActivity =
async (): Promise<RecentActivityAnalytics> => {

    const [
        users,
        events,
        businesses,
    ] = await Promise.all([

        User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name createdAt"),

        Event.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title createdAt"),

        Business.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name createdAt"),

    ]);

    const activities: RecentActivityItem[] = [

        ...users.map(user => ({
            type: "USER_CREATED" as const,
            id: user._id.toString(),
            title: user.name,
            createdAt: user.createdAt,
        })),

        ...events.map(event => ({
            type: "EVENT_CREATED" as const,
            id: event._id.toString(),
            title: event.title,
            createdAt: event.createdAt,
        })),

        ...businesses.map(business => ({
            type: "BUSINESS_CREATED" as const,
            id: business._id.toString(),
            title: business.name,
            createdAt: business.createdAt,
        })),

    ];

    activities.sort(
        (a, b) =>
            b.createdAt.getTime() -
            a.createdAt.getTime()
    );

    return {

        items: activities.slice(0, 20),

    };

};