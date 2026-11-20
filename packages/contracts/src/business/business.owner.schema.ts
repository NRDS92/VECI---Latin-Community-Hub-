import { z } from "zod";
import {
  BusinessAvailabilityTypeSchema,
  BusinessCategorySchema,
  BusinessDocumentTypeSchema,
  BusinessPricingTypeSchema,
  BusinessProviderTypeSchema,
  BusinessSubCategorySchema,
  BusinessVerificationStatusSchema,
  OpeningHoursSchema,
} from "./business.schema.js";

const OwnerBusinessProfileSchema = z.object({
  headline: z.string().optional(),
  services: z.array(z.string()),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  serviceArea: z.array(z.string()),
  availability: z.object({ type: BusinessAvailabilityTypeSchema, description: z.string().optional() }).optional(),
  openingHours: OpeningHoursSchema.optional(),
  pricing: z.object({
    type: BusinessPricingTypeSchema, currency: z.literal("EUR"), amount: z.number().optional(),
    minAmount: z.number().optional(), maxAmount: z.number().optional(), description: z.string().optional(),
  }).optional(),
});

/** Owner-facing Business JSON; deliberately excludes owner, moderation and internal scoring/reviewer fields. */
export const OwnerBusinessSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  providerType: BusinessProviderTypeSchema,
  category: BusinessCategorySchema,
  subCategory: BusinessSubCategorySchema.optional(),
  profile: OwnerBusinessProfileSchema,
  images: z.object({ profile: z.string(), cover: z.string().optional(), gallery: z.array(z.string()) }),
  documents: z.array(z.object({ type: BusinessDocumentTypeSchema, url: z.string(), name: z.string().optional() })),
  location: z.object({
    address: z.string().optional(), cityId: z.string(), country: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  contact: z.object({
    email: z.string().optional(), phone: z.string().optional(), website: z.string().optional(),
    instagram: z.string().optional(), whatsapp: z.string().optional(),
  }),
  community: z.object({ isLatinoOwned: z.boolean(), countryOfOrigin: z.string().optional() }),
  tags: z.array(z.string()),
  menu: z.string().optional(),
  priceRange: z.enum(["$", "$$", "$$$"]).optional(),
  languages: z.array(z.string()),
  isLatinoOwned: z.boolean(),
  countryOfOrigin: z.string().optional(),
  rating: z.object({ average: z.number(), count: z.number() }),
  likesCount: z.number(),
  followersCount: z.number(),
  eventsCount: z.number(),
  verification: z.object({
    status: BusinessVerificationStatusSchema,
    checks: z.object({ identity: z.boolean(), contact: z.boolean(), activity: z.boolean() }),
    verifiedAt: z.string().optional(),
  }),
  isFeatured: z.boolean(),
  status: z.enum(["active", "blocked"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const OwnerBusinessResponseSchema = z.object({
  success: z.literal(true),
  data: OwnerBusinessSchema,
});

export const OwnerBusinessesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(OwnerBusinessSchema),
});
