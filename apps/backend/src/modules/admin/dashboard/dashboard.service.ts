import { getOverview } from "./analytics/overview.analytics";
import { getUsersAnalytics } from "./analytics/users.analytics";
import { getEventsAnalytics } from "./analytics/events.analytics";
import { getBusinessesAnalytics } from "./analytics/businesses.analytics";
import { getRecentActivity } from "./analytics/recent-activity.analytics";
import { getTrends } from "./analytics/trends.analytics";

export const getDashboard = async () => {

    const [
        overview,
        users,
        events,
        businesses,
        recentActivity,
        trends,
    ] = await Promise.all([

        getOverview(),

        getUsersAnalytics(),

        getEventsAnalytics(),

        getBusinessesAnalytics(),

        getRecentActivity(),

        getTrends(),

    ]);

    return {

        overview,

        users,

        events,

        businesses,

        recentActivity,

        trends,

    };

};