export type Event = {
  _id: string;
  title: string;
  category: string;
  cityId: string;
  dateStart: string;
  eventType: "official" | "community";
  verificationStatus?: "verified" | "pending";
  images?: string[];
  location: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type AdItem = {
  _id: string;
  type: "ad";
  isAd: true;
  title: string;
  subtitle: string;
  cta: string;
};

export type FeedItem =
  | (Event & { type: "event"; isAd?: boolean })
  | (any & { type: "business"; isAd?: boolean })
  | AdItem;

export type DiscoverResponse = {
  recommended: FeedItem[];
  page: number;
  hasMore: boolean;
};

export type DiscoverApiResponse = {
  success: boolean;
  data: DiscoverResponse;
};

export interface Category {
  name: string;
}

export type DiscoverType =
  | "events"
  | "restaurants"
  | "businesses";

export interface SearchSuggestion {
  id: string;
  label: string;
  type: "event" | "business";
}