import mongoose, {
    Schema,
    Document,
    HydratedDocument,
} from "mongoose";

import {
    ModerationStatus,
    ModerationRejectionReason,
} from "../../shared/constants/moderation";

import { ModerationSchema } from "../../shared/moderation/moderation.schema";


// ======================================================
// TYPES
// ======================================================

export type ProviderType =
    | "business"
    | "community";


export type BusinessCategory =
    | "food"
    | "entertainment"
    | "services"
    | "shopping"
    | "education"
    | "health";


export type BusinessSubCategory =
    // FOOD
    | "restaurant"
    | "cafe"
    | "bar"
    | "bakery"
    | "catering"

    // ENTERTAINMENT
    | "club"
    | "event_venue"
    | "event_organizer"
    | "cultural_center"
    | "dance_school"

    // SERVICES
    | "beauty_salon"
    | "barbershop"
    | "repair"
    | "agency"
    | "translator"
    | "photographer"
    | "freelancer"

    // SHOPPING
    | "latin_store"
    | "supermarket"
    | "clothing"
    | "product_seller"

    // EDUCATION
    | "language_school"
    | "academy"
    | "private_teacher"

    // HEALTH
    | "clinic"
    | "gym";


export type AvailabilityType =
    | "appointment"
    | "walk_in"
    | "online"
    | "flexible";


export type PricingType =
    | "fixed"
    | "hourly"
    | "starting_at"
    | "range";


export type DocumentType =
    | "menu"
    | "catalog"
    | "portfolio"
    | "brochure";


// ======================================================
// BUSINESS INTERFACE
// ======================================================

export interface IBusiness extends Document {

    // ==================================================
    // IDENTITY
    // ==================================================

    name: string;

    description?: string;

    slug: string;


    // ==================================================
    // CLASSIFICATION
    // ==================================================

    providerType: ProviderType;

    category: BusinessCategory;

    subCategory?: BusinessSubCategory;


    // ==================================================
    // OWNER
    // ==================================================

    owner: mongoose.Types.ObjectId;


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
            type: AvailabilityType;
            description?: string;
        };

        pricing?: {
            type: PricingType;

            currency: "EUR";

            amount?: number;

            minAmount?: number;

            maxAmount?: number;

            description?: string;
        };
    };


    // ==================================================
    // IMAGES
    // ==================================================

    images: {
        profile: string;

        cover?: string;

        gallery: string[];
    };


    // ==================================================
    // DOCUMENTS / RESOURCES
    // ==================================================

    documents: {
        type: DocumentType;

        url: string;

        name?: string;
    }[];


    // ==================================================
    // LOCATION
    // ==================================================

    location: {

        address: string;

        cityId: string;

        country: string;

        coordinates: {
            lat: number;

            lng: number;
        };
    };


    // ==================================================
    // CONTACT
    // ==================================================

    contact: {

        email?: string;

        phone?: string;

        website?: string;

        instagram?: string;

        whatsapp?: string;
    };


    // ==================================================
    // COMMUNITY
    // ==================================================

    community: {

        isLatinoOwned: boolean;

        countryOfOrigin?: string;
    };


    // ==================================================
    // DISCOVERY
    // ==================================================

    tags: string[];


    // ==================================================
    // LEGACY
    // Mantener temporalmente durante migración
    // ==================================================

    /**
     * @deprecated
     * Use documents[] with type "menu".
     */
    menu?: string;

    /**
     * @deprecated
     * Use profile.pricing instead.
     */
    priceRange?: "$" | "$$" | "$$$";

    /**
     * @deprecated
     * Use profile.languages instead.
     */
    languages: string[];

    /**
     * @deprecated
     * Use community.isLatinoOwned instead.
     */
    isLatinoOwned: boolean;

    /**
     * @deprecated
     * Use community.countryOfOrigin instead.
     */
    countryOfOrigin?: string;


    // ==================================================
    // RATING
    // ==================================================

    rating: {

        average: number;

        count: number;
    };


    // ==================================================
    // ENGAGEMENT
    // ==================================================

    likesCount: number;

    followersCount: number;

    eventsCount: number;


    // ==================================================
    // VERIFICATION
    // ==================================================

    verification: {

        status:
            | "unverified"
            | "pending"
            | "verified"
            | "rejected";

        checks: {

            identity: boolean;

            contact: boolean;

            activity: boolean;
        };

        verifiedAt?: Date;

        verifiedBy?: mongoose.Types.ObjectId;
    };


    // ==================================================
    // MODERATION
    // ==================================================

    moderation: {

        status: ModerationStatus;

        reviewedBy?: mongoose.Types.ObjectId;

        reviewedAt?: Date;

        rejectionReason?: ModerationRejectionReason;

        rejectionComment?: string;
    };


    // ==================================================
    // DISCOVERY / STATUS
    // ==================================================

    isFeatured: boolean;

    visibilityScore: number;

    status: "active" | "blocked";


    // ==================================================
    // TIMESTAMPS
    // ==================================================

    createdAt: Date;

    updatedAt: Date;
}


// ======================================================
// AVAILABILITY SCHEMA
// ======================================================

const AvailabilitySchema = new Schema(
    {
        type: {
            type: String,

            enum: [
                "appointment",
                "walk_in",
                "online",
                "flexible",
            ],

            required: true,
        },

        description: {
            type: String,
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// PRICING SCHEMA
// ======================================================

const PricingSchema = new Schema(
    {
        type: {
            type: String,

            enum: [
                "fixed",
                "hourly",
                "starting_at",
                "range",
            ],

            required: true,
        },

        currency: {
            type: String,

            enum: ["EUR"],

            default: "EUR",
        },

        amount: {
            type: Number,

            min: 0,
        },

        minAmount: {
            type: Number,

            min: 0,
        },

        maxAmount: {
            type: Number,

            min: 0,
        },

        description: {
            type: String,
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// PROFILE SCHEMA
// ======================================================

const ProfileSchema = new Schema(
    {
        headline: {
            type: String,
        },

        services: {
            type: [String],

            default: [],
        },

        specialties: {
            type: [String],

            default: [],
        },

        languages: {
            type: [String],

            default: [],
        },

        serviceArea: {
            type: [String],

            default: [],
        },

        availability: {
            type: AvailabilitySchema,
        },

        pricing: {
            type: PricingSchema,
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// IMAGES SCHEMA
// ======================================================

const ImagesSchema = new Schema(
    {
        profile: {
            type: String,

            required: true,
        },

        cover: {
            type: String,
        },

        gallery: {
            type: [String],

            default: [],
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// DOCUMENTS SCHEMA
// ======================================================

const DocumentSchema = new Schema(
    {
        type: {
            type: String,

            enum: [
                "menu",
                "catalog",
                "portfolio",
                "brochure",
            ],

            required: true,
        },

        url: {
            type: String,

            required: true,
        },

        name: {
            type: String,
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// LOCATION SCHEMA
// ======================================================

const LocationSchema = new Schema(
    {
        address: {
            type: String,
        },

        cityId: {
            type: String,

            required: true,
        },

        country: {
            type: String,
        },

        coordinates: {
            lat: {
                type: Number,
            },

            lng: {
                type: Number,
            },
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// CONTACT SCHEMA
// ======================================================

const ContactSchema = new Schema(
    {
        email: String,

        phone: String,

        website: String,

        instagram: String,

        whatsapp: String,
    },
    {
        _id: false,
    }
);


// ======================================================
// COMMUNITY SCHEMA
// ======================================================

const CommunitySchema = new Schema(
    {
        isLatinoOwned: {
            type: Boolean,

            default: true,
        },

        countryOfOrigin: {
            type: String,
        },
    },
    {
        _id: false,
    }
);


// ======================================================
// BUSINESS SCHEMA
// ======================================================

const BusinessSchema = new Schema<IBusiness>(
    {

        // ==================================================
        // IDENTITY
        // ==================================================

        name: {
            type: String,

            required: true,

            trim: true,
        },

        description: {
            type: String,
        },

        slug: {
            type: String,

            required: true,

            unique: true,

            index: true,

            trim: true,
        },


        // ==================================================
        // CLASSIFICATION
        // ==================================================

        providerType: {
            type: String,

            enum: [
                "business",
                "community",
            ],

            default: "business",

            required: true,

            index: true,
        },

        category: {
            type: String,

            enum: [
                "food",
                "entertainment",
                "services",
                "shopping",
                "education",
                "health",
            ],

            required: true,

            index: true,
        },

        subCategory: {
            type: String,

            enum: [

                // FOOD
                "restaurant",
                "cafe",
                "bar",
                "bakery",
                "catering",

                // ENTERTAINMENT
                "club",
                "event_venue",
                "event_organizer",
                "cultural_center",
                "dance_school",

                // SERVICES
                "beauty_salon",
                "barbershop",
                "repair",
                "agency",
                "translator",
                "photographer",
                "freelancer",

                // SHOPPING
                "latin_store",
                "supermarket",
                "clothing",
                "product_seller",

                // EDUCATION
                "language_school",
                "academy",
                "private_teacher",

                // HEALTH
                "clinic",
                "gym",
            ],

            index: true,
        },


        // ==================================================
        // OWNER
        // ==================================================

        owner: {
            type: Schema.Types.ObjectId,

            ref: "User",

            required: true,

            index: true,
        },


        // ==================================================
        // PROFILE
        // ==================================================

        profile: {
            type: ProfileSchema,

            default: () => ({}),
        },


        // ==================================================
        // IMAGES
        // ==================================================

        images: {
            type: ImagesSchema,

            required: true,
        },


        // ==================================================
        // DOCUMENTS
        // ==================================================

        documents: {
            type: [DocumentSchema],

            default: [],
        },


        // ==================================================
        // LOCATION
        // ==================================================

        location: {
            type: LocationSchema,

            required: true,
        },


        // ==================================================
        // CONTACT
        // ==================================================

        contact: {
            type: ContactSchema,

            default: () => ({}),
        },


        // ==================================================
        // COMMUNITY
        // ==================================================

        community: {
            type: CommunitySchema,

            default: () => ({}),
        },


        // ==================================================
        // DISCOVERY
        // ==================================================

        tags: {
            type: [String],

            default: [],
        },


        // ==================================================
        // LEGACY
        // Mantener temporalmente durante migración
        // ==================================================

        menu: {
            type: String,
        },

        priceRange: {
            type: String,

            enum: [
                "$",
                "$$",
                "$$$",
            ],
        },

        languages: {
            type: [String],

            default: [],
        },

        isLatinoOwned: {
            type: Boolean,

            default: true,
        },

        countryOfOrigin: {
            type: String,
        },


        // ==================================================
        // RATING
        // ==================================================

        rating: {

            average: {
                type: Number,

                default: 0,

                min: 0,

                max: 5,
            },

            count: {
                type: Number,

                default: 0,

                min: 0,
            },
        },


        // ==================================================
        // ENGAGEMENT
        // ==================================================

        likesCount: {
            type: Number,

            default: 0,

            min: 0,
        },

        followersCount: {
            type: Number,

            default: 0,

            min: 0,
        },

        eventsCount: {
            type: Number,

            default: 0,

            min: 0,
        },


        // ==================================================
        // VERIFICATION
        // ==================================================

        verification: {

            status: {
                type: String,

                enum: [
                    "unverified",
                    "pending",
                    "verified",
                    "rejected",
                ],

                default: "unverified",
            },

            checks: {

                identity: {
                    type: Boolean,

                    default: false,
                },

                contact: {
                    type: Boolean,

                    default: false,
                },

                activity: {
                    type: Boolean,

                    default: false,
                },
            },

            verifiedAt: {
                type: Date,
            },

            verifiedBy: {
                type: Schema.Types.ObjectId,

                ref: "User",
            },
        },


        // ==================================================
        // MODERATION
        // ==================================================

        moderation: {
            type: ModerationSchema,

            default: () => ({}),
        },


        // ==================================================
        // DISCOVERY / STATUS
        // ==================================================

        isFeatured: {
            type: Boolean,

            default: false,
        },

        visibilityScore: {
            type: Number,

            default: 0,
        },

        status: {
            type: String,

            enum: [
                "active",
                "blocked",
            ],

            default: "active",

            index: true,
        },
    },

    {
        timestamps: true,
    }
);


// ======================================================
// MODEL
// ======================================================

export const Business = mongoose.model<IBusiness>(
    "Business",
    BusinessSchema
);


export type BusinessDocument =
    HydratedDocument<IBusiness>;