import { SubscriptionPlan, SUBSCRIPTION_PLANS } from "../../modules/users/user.model";

export const SUBSCRIPTION_CONFIG: Record<
    SubscriptionPlan,
    {
        maxBusinesses: number;
    }
> = {
    [SUBSCRIPTION_PLANS.FREE]: {
        maxBusinesses: 1,
    },

    [SUBSCRIPTION_PLANS.BUSINESS]: {
        maxBusinesses: 5,
    },

    [SUBSCRIPTION_PLANS.BUSINESS_PRO]: {
        maxBusinesses: 20,
    },

    [SUBSCRIPTION_PLANS.ENTERPRISE]: {
        maxBusinesses: Number.MAX_SAFE_INTEGER,
    },
};