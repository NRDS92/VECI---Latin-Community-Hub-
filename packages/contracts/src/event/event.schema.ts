
import { z } from "zod";
import { EventOrganizerSchema } from "../community/community.schema.js";

export const PublicEventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.enum([
    "party",
    "food",
    "culture",
    "sports",
    "meetup",
    "concert",
  ]),
  eventType: z.enum([
    "official",
    "community",
  ]),
  cityId: z.string(),
  address: z.string(),
  dateStart: z.iso.datetime(),
  dateEnd: z.iso.datetime().optional(),
  organizer: EventOrganizerSchema.extend({
    slug: z.string(),
    name: z.string(),
    image: z.string().optional(),
  }).strict().optional(),
  images: z.array(z.string()),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number(),
      z.number(),
    ]),
  }).strict().optional(),
  price: z.object({
    type: z.enum(["free", "paid"]),
    amount: z.number().optional(),
    currency: z.literal("EUR"),
  }).strict().optional(),
  links: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    }).strict()
  ),
  goodToKnow: z.array(z.string()),
  attachment: z.object({
    url: z.string(),
    name: z.string(),
    size: z.number(),
  }).strict().optional(),
}).strict();

export const PublicEventCreatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  profileImage: z.string().optional(),
}).strict();

export const PublicEventWithCreatorSchema =
  PublicEventSchema.extend({
    createdBy: PublicEventCreatorSchema,
  });
