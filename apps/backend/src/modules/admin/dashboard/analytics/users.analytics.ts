import { User } from "../../../users/user.model";

import {
    UsersAnalytics,
} from "./analytics.types";

export const getUsersAnalytics = async (): Promise<UsersAnalytics> => {

    const [
        total,
        verified,
        completedOnboarding,
        byCountry,
        byCity,
        byProvider,
        bySubscription,
    ] = await Promise.all([

        User.countDocuments(),

        User.countDocuments({
            isVerified: true,
        }),

        User.countDocuments({
            onboardingCompleted: true,
        }),

        User.aggregate([
            {
                $group: {
                    _id: "$originCountry",
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

        User.aggregate([
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

        User.aggregate([
            {
                $group: {
                    _id: "$provider",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]),

        User.aggregate([
            {
                $group: {
                    _id: "$subscription.plan",
                    count: {
                        $sum: 1,
                    },
                },
            },
        ]),

    ]);

    return {

        total,

        verified,

        notVerified:
            total - verified,

        completedOnboarding,

        pendingOnboarding:
            total - completedOnboarding,

        byCountry: byCountry.map((item) => ({
            country: item._id,
            count: item.count,
        })),

        byCity: byCity.map((item) => ({
            city: item._id,
            count: item.count,
        })),

        byProvider: byProvider.map((item) => ({
            provider: item._id,
            count: item.count,
        })),

        bySubscription: bySubscription.map((item) => ({
            plan: item._id,
            count: item.count,
        })),

    };

};