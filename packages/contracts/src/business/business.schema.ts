
import { z } from "zod";

// ======================================================
// ENUMS
// ======================================================

export const BusinessProviderTypeSchema = z.enum([
  "business",
  "community",
]);

export const BusinessCategorySchema = z.enum([
  "food",
  "entertainment",
  "services",
  "shopping",
  "education",
  "health",
]);

export const BusinessSubCategorySchema = z.enum([
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "catering",
  "club",
  "event_venue",
  "event_organizer",
  "cultural_center",
  "dance_school",
  "beauty_salon",
  "barbershop",
  "repair",
  "agency",
  "translator",
  "photographer",
  "freelancer",
  "latin_store",
  "supermarket",
  "clothing",
  "product_seller",
  "language_school",
  "academy",
  "private_teacher",
  "clinic",
  "gym",
]);

export const BusinessAvailabilityTypeSchema = z.enum([
  "appointment",
  "walk_in",
  "online",
  "flexible",
]);

export const BusinessPricingTypeSchema = z.enum([
  "fixed",
  "hourly",
  "starting_at",
  "range",
]);

export const BusinessDocumentTypeSchema = z.enum([
  "menu",
  "catalog",
  "portfolio",
  "brochure",
]);

export const BusinessVerificationStatusSchema = z.enum([
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

// ======================================================
// PROFILE
// ======================================================

const OpeningHoursIntervalSchema = z.object({
  open: z.string(),
  close: z.string(),
}).strict();

const OpeningHoursDaySchema = z.object({
  isOpen: z.boolean(),
  intervals: z.array(OpeningHoursIntervalSchema),
}).strict();

export const OpeningHoursSchema = z.object({
  monday: OpeningHoursDaySchema,
  tuesday: OpeningHoursDaySchema,
  wednesday: OpeningHoursDaySchema,
  thursday: OpeningHoursDaySchema,
  friday: OpeningHoursDaySchema,
  saturday: OpeningHoursDaySchema,
  sunday: OpeningHoursDaySchema,
}).strict();

const BusinessAvailabilitySchema = z.object({
  type: BusinessAvailabilityTypeSchema,
  description: z.string().optional(),
}).strict();

const BusinessPricingSchema = z.object({
  type: BusinessPricingTypeSchema,
  currency: z.literal("EUR"),
  amount: z.number().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  description: z.string().optional(),
}).strict();

export const PublicBusinessProfileSchema = z.object({
  headline: z.string().optional(),
  services: z.array(z.string()),
  specialties: z.array(z.string()),
  languages: z.array(z.string()),
  serviceArea: z.array(z.string()),
  availability: BusinessAvailabilitySchema.optional(),
  openingHours: OpeningHoursSchema.optional(),
  pricing: BusinessPricingSchema.optional(),
}).strict();

// ======================================================
// CONTACT / COMMUNITY
// ======================================================

export const PublicBusinessContactSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
}).strict();

export const PublicBusinessCommunitySchema = z.object({
  isLatinoOwned: z.boolean(),
  countryOfOrigin: z.string().optional(),
}).strict();

// ======================================================
// DOCUMENTS / IMAGES / LOCATION
// ======================================================

const PublicBusinessDocumentSchema = z.object({
  type: BusinessDocumentTypeSchema,
  url: z.string(),
  name: z.string().optional(),
}).strict();

const PublicBusinessCoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
}).strict();

// ======================================================
// RATING / ENGAGEMENT / VERIFICATION
// ======================================================

export const PublicBusinessRatingSchema = z.object({
  average: z.number(),
  count: z.number(),
}).strict();

export const PublicBusinessVerificationSchema = z.object({
  status: BusinessVerificationStatusSchema,
  checks: z.object({
    identity: z.boolean(),
    contact: z.boolean(),
    activity: z.boolean(),
  }).strict(),
}).strict();

// ======================================================
// PUBLIC BUSINESS
// ======================================================

export const PublicBusinessSchema = z.object({
        // Identity
        id: z.string(),
        slug: z.string(),
        name: z.string(),
        description: z.string().optional(),
        // Classification
        providerType: BusinessProviderTypeSchema,
        category: BusinessCategorySchema,
        subCategory: BusinessSubCategorySchema.optional(),
        // Location
        cityId: z.string(),
        country: z.string().optional(),
        address: z.string().optional(),
        coordinates: PublicBusinessCoordinatesSchema.optional(),
        // Images
        image: z.string().optional(),
        coverImage: z.string().optional(),
        gallery: z.array(z.string()),
        // Existing root-level contact fields (backward compatibility)
        website: z.string().optional(),
        instagram: z.string().optional(),
        whatsapp: z.string().optional(),
        // New structured contact
        contact: PublicBusinessContactSchema,
        // New structured community information
        community: PublicBusinessCommunitySchema,
        // Existing profile
        profile: PublicBusinessProfileSchema,
        // Documents and legacy fields
        documents: z.array(PublicBusinessDocumentSchema),
        menu: z.string().optional(),
        priceRange: z.enum(["$", "$$", "$$$"]).optional(),
        // Existing legacy community fields
        tags: z.array(z.string()),
        languages: z.array(z.string()),
        isLatinoOwned: z.boolean(),
        countryOfOrigin: z.string().optional(),
        // Rating and engagement
        rating: PublicBusinessRatingSchema,
        likesCount: z.number(),
        followersCount: z.number(),
        eventsCount: z.number(),
        // Verification
        verification: PublicBusinessVerificationSchema,
        verificationStatus: BusinessVerificationStatusSchema,
        // Discovery and status
        isFeatured: z.boolean(),
        status: z.enum(["active", "blocked"]),
        // Timestamps (serialized JSON dates)
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    }
).strict();
