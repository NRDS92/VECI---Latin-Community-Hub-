import {
    TrendsAnalytics,
} from "./analytics.types";

export const getTrends =
async (): Promise<TrendsAnalytics> => {

    return {

        users: {

            daily: [],

            weekly: [],

            monthly: [],

        },

        events: {

            daily: [],

            weekly: [],

            monthly: [],

        },

        businesses: {

            daily: [],

            weekly: [],

            monthly: [],

        },

    };

};