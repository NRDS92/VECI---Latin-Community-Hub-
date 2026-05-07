import { z } from "zod";

// ✅ ENUMS CENTRALIZADOS
export const categoryEnum = z.enum([
    "food",
    "entertainment",
    "services",
    "shopping",
    "education",
    "health",
]);

    export const subCategoryEnum = z.enum([
    // FOOD
    "restaurant",
    "cafe",
    "bar",
    "bakery",

    // ENTERTAINMENT
    "club",
    "event_venue",
    "cultural_center",

    // SERVICES
    "beauty_salon",
    "barbershop",
    "repair",
    "agency",

    // SHOPPING
    "latin_store",
    "supermarket",
    "clothing",

    // EDUCATION
    "language_school",
    "academy",

    // HEALTH
    "clinic",
    "gym",
]);

export const createBusinessSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),

    category: categoryEnum,
    subCategory: subCategoryEnum.optional(),

    images: z.object({
        profile: z.string(),
        cover: z.string().optional(),
    }),

    location: z.object({
        address: z.string(),
        cityId: z.string(),
        country: z.string(),
        latitude: z.number(),
        longitude: z.number(),
    }),

    contact: z.object({
        email: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        instagram: z.string().optional(),
        whatsapp: z.string().optional(),
    }),


    menu: z.string().optional(),
    priceRange: z.enum(["$", "$$", "$$$"]).optional(),

    tags: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),

    isLatinoOwned: z.boolean().default(true),
    countryOfOrigin: z.string().optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;