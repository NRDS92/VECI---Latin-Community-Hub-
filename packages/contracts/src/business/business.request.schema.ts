import { z } from "zod";
import {
  BusinessAvailabilityTypeSchema,
  BusinessCategorySchema,
  BusinessDocumentTypeSchema,
  BusinessPricingTypeSchema,
  BusinessProviderTypeSchema,
  BusinessSubCategorySchema,
} from "./business.schema.js";

const OpeningHoursTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const OpeningHoursIntervalRequestSchema = z.object({
  open: OpeningHoursTimeSchema,
  close: OpeningHoursTimeSchema,
});
const OpeningHoursDayRequestSchema = z.object({
  isOpen: z.boolean(),
  intervals: z.array(OpeningHoursIntervalRequestSchema).default([]),
});
const OpeningHoursRequestSchema = z.object({
  monday: OpeningHoursDayRequestSchema,
  tuesday: OpeningHoursDayRequestSchema,
  wednesday: OpeningHoursDayRequestSchema,
  thursday: OpeningHoursDayRequestSchema,
  friday: OpeningHoursDayRequestSchema,
  saturday: OpeningHoursDayRequestSchema,
  sunday: OpeningHoursDayRequestSchema,
});

const BusinessProfileRequestSchema = z.object({
  headline: z.string().optional(),
  services: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  serviceArea: z.array(z.string()).default([]),
  availability: z.object({
    type: BusinessAvailabilityTypeSchema,
    description: z.string().optional(),
  }).optional(),
  openingHours: OpeningHoursRequestSchema.optional(),
  pricing: z.object({
    type: BusinessPricingTypeSchema,
    currency: z.enum(["EUR"]).default("EUR"),
    amount: z.number().nonnegative().optional(),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
    description: z.string().optional(),
  }).optional(),
});

const BusinessImagesRequestSchema = z.object({
  profile: z.string().min(1),
  cover: z.string().optional(),
  gallery: z.array(z.string()).default([]),
});
const BusinessDocumentRequestSchema = z.object({
  type: BusinessDocumentTypeSchema,
  url: z.string().min(1),
  name: z.string().optional(),
});
const BusinessLocationRequestSchema = z.object({
  address: z.string(),
  cityId: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});
const BusinessContactRequestSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
});
const BusinessCommunityRequestSchema = z.object({
  isLatinoOwned: z.boolean().default(true),
  countryOfOrigin: z.string().optional(),
});

/** Wire-format payload accepted by POST /business. */
export const CreateBusinessRequestSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  providerType: BusinessProviderTypeSchema.default("business"),
  category: BusinessCategorySchema,
  subCategory: BusinessSubCategorySchema.optional(),
  profile: BusinessProfileRequestSchema.default({
    services: [], specialties: [], languages: [], serviceArea: [],
  }),
  images: BusinessImagesRequestSchema,
  documents: z.array(BusinessDocumentRequestSchema).default([]),
  location: BusinessLocationRequestSchema,
  contact: BusinessContactRequestSchema.default({}),
  community: BusinessCommunityRequestSchema.default({ isLatinoOwned: true }),
  tags: z.array(z.string()).default([]),
});

/**
 * Wire-format partial update. Top-level defaults are intentionally removed,
 * while defaults inside an explicitly supplied nested object remain active.
 * Nested objects retain the existing shallow replacement behavior.
 */
const createShape = CreateBusinessRequestSchema.shape;

export const UpdateBusinessRequestSchema = z.object({
  name: createShape.name.optional(),
  description: createShape.description,
  providerType: createShape.providerType.unwrap().optional(),
  category: createShape.category.optional(),
  subCategory: createShape.subCategory,
  profile: createShape.profile.unwrap().optional(),
  images: createShape.images.optional(),
  documents: createShape.documents.unwrap().optional(),
  location: createShape.location.optional(),
  contact: createShape.contact.unwrap().optional(),
  community: createShape.community.unwrap().optional(),
  tags: createShape.tags.unwrap().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one supported field must be provided.",
});
