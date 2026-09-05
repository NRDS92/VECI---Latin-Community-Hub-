export type DiscoveryContentType =
    | "event"
    | "business";


export type DiscoveryVisibility =
    | "public";


export type DiscoveryRanking =
    | "personalized"
    | "contextual"
    | "public";


export type DiscoveryDateFilter =
    | {
        type: "upcoming";
        }
    | {
        type: "today";
        }
    | {
        type: "custom";
        date: string;
        };


export interface DiscoveryQuery {

    search?: string;

    city?: string;

    category?: string;

    date?: DiscoveryDateFilter;

    contentTypes?: DiscoveryContentType[];

}


export interface DiscoveryContext {

    userId?: string;

    location?: {
        lat: number;
        lng: number;
    };

    favoriteCategories?: string[];

}


export interface DiscoveryOptions {

    visibility: DiscoveryVisibility;

    ranking: DiscoveryRanking;

    page?: number;

    limit?: number;

    excludeEntityIds?: string[];

}


export interface DiscoveryRequest {

    query: DiscoveryQuery;

    context: DiscoveryContext;

    options: DiscoveryOptions;

}