// --------------------------------------
// SHARED
// --------------------------------------

export interface AnalyticsCount {
    count: number;
}

export interface CountryAnalytics
    extends AnalyticsCount {
    country: string;
}

export interface CityAnalytics
    extends AnalyticsCount {
    city: string;
}

export interface ProviderAnalytics
    extends AnalyticsCount {
    provider: string;
}

export interface SubscriptionAnalytics
    extends AnalyticsCount {
    plan: string;
}

export interface CategoryAnalytics
    extends AnalyticsCount {
    category: string;
}

// --------------------------------------
// OVERVIEW
// --------------------------------------

export interface OverviewAnalytics {
    users: number;
    events: number;
    businesses: number;
    pendingModeration: number;
}

// --------------------------------------
// USERS
// --------------------------------------

export interface UsersAnalytics {
    total: number;

    verified: number;
    notVerified: number;

    completedOnboarding: number;
    pendingOnboarding: number;

    byCountry: CountryAnalytics[];

    byCity: CityAnalytics[];

    byProvider: ProviderAnalytics[];

    bySubscription: SubscriptionAnalytics[];
}

// --------------------------------------
// EVENTS
// --------------------------------------

export interface EventsAnalytics {
    total: number;

    pending: number;
    approved: number;
    rejected: number;

    community: number;
    official: number;

    byCategory: CategoryAnalytics[];

    byCity: CityAnalytics[];
}

// --------------------------------------
// BUSINESSES
// --------------------------------------

export interface BusinessesAnalytics {
    total: number;

    pending: number;
    approved: number;
    rejected: number;

    byCategory: CategoryAnalytics[];

    byCountry: CountryAnalytics[];

    byCity: CityAnalytics[];
}

// --------------------------------------
// RECENT ACTIVITY
// --------------------------------------

export type RecentActivityType =
    | "USER_CREATED"
    | "EVENT_CREATED"
    | "BUSINESS_CREATED";

export interface RecentActivityItem {

    type: RecentActivityType;

    id: string;

    title: string;

    createdAt: Date;

}

export interface RecentActivityAnalytics {

    items: RecentActivityItem[];

}



// --------------------------------------
// TRENDS
// --------------------------------------

export interface TrendPoint {

    period: string;

    count: number;

}

export interface TrendAnalytics {

    daily: TrendPoint[];

    weekly: TrendPoint[];

    monthly: TrendPoint[];

}

export interface TrendsAnalytics {

    users: TrendAnalytics;

    events: TrendAnalytics;

    businesses: TrendAnalytics;

}



// --------------------------------------
// DASHBOARD
// --------------------------------------

export interface DashboardAnalytics {

    overview: OverviewAnalytics;

    users: UsersAnalytics;

    events: EventsAnalytics;

    businesses: BusinessesAnalytics;

    recentActivity: RecentActivityAnalytics;

    trends: TrendsAnalytics;

}