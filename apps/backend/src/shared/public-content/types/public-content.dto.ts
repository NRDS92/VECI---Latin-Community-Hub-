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

    // ==================================================
    // CLASSIFICATION
    // ==================================================

    category: string;

    subCategory?: string;


    // ==================================================
    // LOCATION
    // ==================================================

    cityId: string;

    country?: string;

    address?: string;

    coordinates?: {
        lat: number;
        lng: number;
    };


    // ==================================================
    // IMAGES
    // ==================================================

    image?: string;

    coverImage?: string;

    gallery: string[];


    // ==================================================
    // CONTACT
    // ==================================================

    website?: string;

    instagram?: string;

    whatsapp?: string;


    // ==================================================
    // PROFILE
    // ==================================================

    profile: {

        headline?: string;

        services: string[];

        specialties: string[];

        languages: string[];

        serviceArea: string[];

        availability?: {

            type:
                | "appointment"
                | "walk_in"
                | "online"
                | "flexible";

            description?: string;
        };

        openingHours?: {

            monday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };

            tuesday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };

            wednesday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };

            thursday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };

            friday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };

            saturday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };

            sunday: {
                isOpen: boolean;

                intervals: {
                    open: string;
                    close: string;
                }[];
            };
        };

        pricing?: {

            type:
                | "fixed"
                | "hourly"
                | "starting_at"
                | "range";

            currency: "EUR";

            amount?: number;

            minAmount?: number;

            maxAmount?: number;

            description?: string;
        };
    };


    // ==================================================
    // DOCUMENTS
    // ==================================================

    documents: {

        type:
            | "menu"
            | "catalog"
            | "portfolio"
            | "brochure";

        url: string;

        name?: string;
    }[];


    // ==================================================
    // DISCOVERY
    // ==================================================

    priceRange?:
        | "$"
        | "$$"
        | "$$$";

    tags: string[];

    languages: string[];


    // ==================================================
    // COMMUNITY
    // ==================================================

    isLatinoOwned: boolean;

    countryOfOrigin?: string;


    // ==================================================
    // RATING
    // ==================================================

    rating: {

        average: number;

        count: number;
    };


    // ==================================================
    // SOCIAL
    // ==================================================

    likesCount: number;

    followersCount: number;

    eventsCount: number;


    // ==================================================
    // VERIFICATION
    // ==================================================

    verificationStatus:
        | "unverified"
        | "pending"
        | "verified"
        | "rejected";
}