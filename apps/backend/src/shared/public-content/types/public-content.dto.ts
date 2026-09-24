export interface PublicEventDTO {
    id: string;
    slug: string;
    title: string;
    description?: string;
    category: string;
    eventType: string;
    cityId: string;
    address: string;
    dateStart: Date;
    dateEnd?: Date;
    images: string[];
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    price?: {
        type: "free" | "paid";
        amount?: number;
        currency: "EUR";
    };
    links: {
        label: string;
        url: string;
    }[];
    createdBy?: {
        id: string;
        name: string;
        profileImage?: string;
    };
    goodToKnow: string[];
    attachment?: {
        url: string;
        name: string;
        size: number;
    };
}


/**
 * Public representation of a Business.
 *
 * This DTO defines the information that
 * may cross the public-content boundary.
 *
 * It intentionally does not expose
 * internal ownership or administrative data.
 */
export interface PublicBusinessDTO {

    id: string;

    slug: string;

    name: string;

    description?: string;

    category: string;

    subCategory?: string;

    cityId: string;

    country?: string;

    address?: string;

    coordinates?: {
        lat: number;
        lng: number;
    };

    image?: string;

    coverImage?: string;

    website?: string;

    instagram?: string;

    whatsapp?: string;

    priceRange?:
        | "$"
        | "$$"
        | "$$$";

    tags: string[];

    languages: string[];

    isLatinoOwned: boolean;

    countryOfOrigin?: string;

    rating: {
        average: number;
        count: number;
    };

    verificationStatus:
        | "unverified"
        | "pending"
        | "verified"
        | "rejected";
}