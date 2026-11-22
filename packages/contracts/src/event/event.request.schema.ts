import { z } from "zod";
import { EventOrganizerSchema } from "../community/community.schema.js";

const EventPriceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("free"), currency: z.literal("EUR"), amount: z.number().min(0).optional() }).strict(),
  z.object({ type: z.literal("paid"), currency: z.literal("EUR"), amount: z.number().min(0) }).strict(),
]);

const EventLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.url().refine((value) => value.startsWith("https://"), "Link must use HTTPS"),
}).strict();

export const CreateEventRequestSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().max(10000).optional(),
  eventType: z.enum(["official", "community"]),
  category: z.enum(["party", "food", "culture", "sports", "meetup", "concert"]),
  cityId: z.string().min(1),
  images: z.array(z.url().refine((value) => value.startsWith("https://"))).max(6).default([]),
  price: EventPriceSchema.optional(),
  links: z.array(EventLinkSchema).max(10).default([]),
  contact: z.object({ website: z.string().optional(), instagram: z.string().optional(), whatsapp: z.string().optional() }).strict().optional(),
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  organizer: EventOrganizerSchema.optional(),
  /** Legacy Business association accepted during the additive organizer rollout. */
  businessId: z.string().optional(),
  dateStart: z.iso.datetime().transform((value) => new Date(value)),
  dateEnd: z.iso.datetime().optional().transform((value) => value ? new Date(value) : undefined),
  goodToKnow: z.array(z.string().max(500)).max(30).default([]),
}).strict().superRefine((value, ctx) => {
  const hasCanonicalOrganizer = value.organizer !== undefined;
  const hasLegacyBusiness = value.businessId !== undefined;
  if (hasCanonicalOrganizer === hasLegacyBusiness) {
    ctx.addIssue({ code: "custom", message: "Provide exactly one organizer or legacy businessId", path: ["organizer"] });
  }
  if (value.eventType === "official" && value.organizer?.type === "community") {
    ctx.addIssue({ code: "custom", message: "Official events must be organized by a Business", path: ["organizer"] });
  }
});

export const UpdateEventRequestSchema = z.object({
  title: CreateEventRequestSchema.shape.title.optional(),
  description: CreateEventRequestSchema.shape.description,
  eventType: CreateEventRequestSchema.shape.eventType.optional(),
  category: CreateEventRequestSchema.shape.category.optional(),
  cityId: CreateEventRequestSchema.shape.cityId.optional(),
  images: CreateEventRequestSchema.shape.images.optional(),
  price: CreateEventRequestSchema.shape.price,
  links: CreateEventRequestSchema.shape.links.optional(),
  contact: CreateEventRequestSchema.shape.contact,
  address: CreateEventRequestSchema.shape.address.optional(),
  latitude: CreateEventRequestSchema.shape.latitude.optional(),
  longitude: CreateEventRequestSchema.shape.longitude.optional(),
  dateStart: z.iso.datetime().transform((value) => new Date(value)).optional(),
  dateEnd: z.iso.datetime().optional().transform((value) => value ? new Date(value) : undefined),
  goodToKnow: CreateEventRequestSchema.shape.goodToKnow.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field must be updated");

export type CreateEventRequest = z.input<typeof CreateEventRequestSchema>;
export type ParsedCreateEventRequest = z.output<typeof CreateEventRequestSchema>;
export type UpdateEventRequest = z.input<typeof UpdateEventRequestSchema>;
export type ParsedUpdateEventRequest = z.output<typeof UpdateEventRequestSchema>;
