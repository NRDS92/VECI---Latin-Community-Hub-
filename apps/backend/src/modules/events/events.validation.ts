import { z } from "zod";

export const createEventSchema = z.object({
    title: z.string().min(3),

    description: z.string().optional(),

    eventType: z.enum(["official", "community"]),

    category: z.enum([
        "party",
        "food",
        "culture",
        "sports",
        "meetup",
        "concert",
    ]),

    cityId: z.string(),

    images: z.array(
        z.string().refine(
            (val) => val.startsWith("https://"),
            "Image must be a valid HTTPS URL"
    )
    ).default([]),

    contact: z.object({
        website: z.string().optional(),
        instagram: z.string().optional(),
        whatsapp: z.string().optional(),
    }).optional(),

    address: z.string(),

    latitude: z.number(),
    longitude: z.number(),

    businessId: z.string().optional(),

    dateStart: z.string().transform((val) => new Date(val)),

    dateEnd: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
        
    goodToKnow: z.array(z.string()).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export const updateEventSchema = createEventSchema.partial();