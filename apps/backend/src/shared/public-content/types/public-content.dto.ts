export interface PublicEventDTO {
    id: string;

    slug: string;

    title: string;

    description?: string;

    category: string;

    eventType:
        | "official"
        | "community";

    cityId: string;

    address: string;

    dateStart: Date;

    dateEnd?: Date;

    image?: string;
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