export const PUBLIC_CONTENT_TYPES = {
    EVENT: "EVENT",
    BUSINESS: "BUSINESS",
    COMMUNITY: "COMMUNITY",
    JOB: "JOB",
    ARTICLE: "ARTICLE",
    CITY: "CITY",
    CATEGORY: "CATEGORY",
    COUNTRY: "COUNTRY",

} as const;

export type PublicContentType =
    (typeof PUBLIC_CONTENT_TYPES)[keyof typeof PUBLIC_CONTENT_TYPES];