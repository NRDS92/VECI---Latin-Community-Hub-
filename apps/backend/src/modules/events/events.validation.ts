import { z } from "zod";

const priceSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("free"),
        currency: z.literal("EUR"),
        amount: z.number().min(0).optional(),
    }),
    z.object({
        type: z.literal("paid"),
        amount: z.number().min(0),
        currency: z.literal("EUR"),
    }),
]);

const linkSchema = z.object({
    label: z.string().min(1).max(80),
    url: z
        .string()
        .url()
        .refine(
            (value) => value.startsWith("https://"),
            "Link must be a valid HTTPS URL"
        ),
});

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
    images: z
        .array(
            z.string().refine(
                (val) => val.startsWith("https://"),
                "Image must be a valid HTTPS URL"
            )
        )
        .max(6, "An event can have a maximum of 6 images")
        .default([]),
    price: priceSchema.optional(),
    links: z
        .array(linkSchema)
        .max(10, "An event can have a maximum of 10 links")
        .default([]),
    contact: z
        .object({
            website: z.string().optional(),
            instagram: z.string().optional(),
            whatsapp: z.string().optional(),
        })
        .optional(),
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