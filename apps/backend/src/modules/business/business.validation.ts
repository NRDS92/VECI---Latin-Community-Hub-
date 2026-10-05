import { z } from "zod";


// ======================================================
// PROVIDER TYPE
// ======================================================

export const providerTypeEnum = z.enum([
    "business",
    "community",
]);


// ======================================================
// CATEGORY
// ======================================================

export const categoryEnum = z.enum([
    "food",
    "entertainment",
    "services",
    "shopping",
    "education",
    "health",
]);


// ======================================================
// SUBCATEGORY
// ======================================================

export const subCategoryEnum = z.enum([
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
]);


// ======================================================
// PROFILE
// ======================================================

export const availabilityEnum = z.enum([
    "appointment",
    "walk_in",
    "online",
    "flexible",
]);


export const pricingTypeEnum = z.enum([
    "fixed",
    "hourly",
    "starting_at",
    "range",
]);


// ======================================================
// OPENING HOURS
// ======================================================

export const openingHoursTimeSchema = z
    .string()
    .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Time must use HH:mm format."
    );


export const openingHoursIntervalSchema = z.object({

    open: openingHoursTimeSchema,

    close: openingHoursTimeSchema,

});


export const openingHoursDaySchema = z.object({

    isOpen: z
        .boolean(),

    intervals: z
        .array(openingHoursIntervalSchema)
        .default([]),

});


export const openingHoursSchema = z.object({

    monday: openingHoursDaySchema,

    tuesday: openingHoursDaySchema,

    wednesday: openingHoursDaySchema,

    thursday: openingHoursDaySchema,

    friday: openingHoursDaySchema,

    saturday: openingHoursDaySchema,

    sunday: openingHoursDaySchema,

});


// ======================================================
// PROFILE SCHEMA
// ======================================================

export const profileSchema = z.object({

    headline: z
        .string()
        .optional(),

    services: z
        .array(z.string())
        .default([]),

    specialties: z
        .array(z.string())
        .default([]),

    languages: z
        .array(z.string())
        .default([]),

    serviceArea: z
        .array(z.string())
        .default([]),

    availability: z
        .object({
            type: availabilityEnum,
            description: z.string().optional(),
        })
        .optional(),
    openingHours: openingHoursSchema
        .optional(),
    pricing: z
        .object({
            type: pricingTypeEnum,
            currency: z
                .enum(["EUR"])
                .default("EUR"),
            amount: z
                .number()
                .nonnegative()
                .optional(),
            minAmount: z
                .number()
                .nonnegative()
                .optional(),
            maxAmount: z
                .number()
                .nonnegative()
                .optional(),
            description: z
                .string()
                .optional(),
        })
        .optional(),
});
// ======================================================
// IMAGES
// ======================================================
export const imagesSchema = z.object({
    profile: z
        .string()
        .min(1),
    cover: z
        .string()
        .optional(),
    gallery: z
        .array(z.string())
        .default([]),
});
// ======================================================
// DOCUMENTS
// ======================================================
export const documentTypeEnum = z.enum([
    "menu",
    "catalog",
    "portfolio",
    "brochure",
]);
export const documentSchema = z.object({
    type: documentTypeEnum,
    url: z
        .string()
        .min(1),
    name: z
        .string()
        .optional(),
});
export const documentsSchema = z
    .array(documentSchema)
    .default([]);
// ======================================================
// LOCATION
// =====================================================
export const locationSchema = z.object({
    address: z.string(),
    cityId: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
});
// ======================================================
// CONTACT
// ======================================================
export const contactSchema = z.object({
    email: z
        .string()
        .optional(),
    phone: z
        .string()
        .optional(),
    website: z
        .string()
        .optional(),
    instagram: z
        .string()
        .optional(),
    whatsapp: z
        .string()
        .optional(),
});
// ======================================================
// COMMUNITY
// ======================================================
export const communitySchema = z.object({
    isLatinoOwned: z
        .boolean()
        .default(true),
    countryOfOrigin: z
        .string()
        .optional(),
});
// ======================================================
// CREATE BUSINESS
// ======================================================
export const createBusinessSchema = z.object({
    // ==================================================
    // IDENTITY
    // ==================================================
    name: z
        .string()
        .min(2),
    description: z
        .string()
        .optional(),
    // ==================================================
    // CLASSIFICATION
    // ==================================================
    providerType: providerTypeEnum
        .default("business"),
    category: categoryEnum,
    subCategory: subCategoryEnum
        .optional(),
    // ==================================================
    // PROFILE
    // ==================================================
    profile: profileSchema
        .default({
            services: [],
            specialties: [],
            languages: [],
            serviceArea: [],
        }),
    // ==================================================
    // MEDIA
    // ==================================================
    images: imagesSchema,
    // ==================================================
    // DOCUMENTS
    // ==================================================
    documents: documentsSchema,
    // ==================================================
    // LOCATION
    // ==================================================
    location: locationSchema,
    // ==================================================
    // CONTACT
    // ==================================================
    contact: contactSchema
        .default({}),
    // ==================================================
    // COMMUNITY
    // ==================================================
    community: communitySchema
        .default({
            isLatinoOwned: true,
        }),
    // ==================================================
    // DISCOVERY
    // ==================================================
    tags: z
        .array(z.string())
        .default([]),
});
// ======================================================
// CREATE TYPE
// ======================================================
export type CreateBusinessInput =
    z.infer<typeof createBusinessSchema>;
// ======================================================
// UPDATE BUSINESS
// ======================================================
export const updateBusinessSchema =
    createBusinessSchema.partial();
// ======================================================
// UPDATE TYPE
// ======================================================
export type UpdateBusinessInput =
    z.infer<typeof updateBusinessSchema>;