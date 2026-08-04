import { Business } from "../../../business/business.model";

import {
    MODERATION_STATUS,
} from "../../../../shared/constants/moderation";

import {
    BusinessesAnalytics,
} from "./analytics.types";

export const getBusinessesAnalytics =
async (): Promise<BusinessesAnalytics> => {

    const [
        total,
        pending,
        approved,
        rejected,
        byCategory,
        byCountry,
        byCity,
    ] = await Promise.all([

        Business.countDocuments(),

        Business.countDocuments({
            "moderation.status":
                MODERATION_STATUS.PENDING,
        }),

        Business.countDocuments({
            "moderation.status":
                MODERATION_STATUS.APPROVED,
        }),

        Business.countDocuments({
            "moderation.status":
                MODERATION_STATUS.REJECTED,
        }),

        Business.aggregate([
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

        Business.aggregate([
            {
                $group: {
                    _id: "$countryOfOrigin",
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

        Business.aggregate([
            {
                $group: {
                    _id: "$location.cityId",
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

        byCategory: byCategory.map((item) => ({
            category: item._id,
            count: item.count,
        })),

        byCountry: byCountry.map((item) => ({
            country: item._id,
            count: item.count,
        })),

        byCity: byCity.map((item) => ({
            city: item._id,
            count: item.count,
        })),

    };

};