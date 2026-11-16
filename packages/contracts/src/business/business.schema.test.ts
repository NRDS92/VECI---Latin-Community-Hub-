
import { describe, expect, it } from "vitest";
import { PublicBusinessSchema } from "./business.schema.js";

const validBusiness = {
    id: "business-123",
    slug: "mi-restaurante",
    name: "Mi Restaurante",
    description: "Restaurante latino en Köln",

    providerType: "business",
    category: "food",
    subCategory: "restaurant",

    cityId: "cologne",
    country: "Germany",
    address: "Venloer Straße 100",
    coordinates: {
        lat: 50.9500,
        lng: 6.9400,
    },

    image: "https://example.com/profile.jpg",
    coverImage: "https://example.com/cover.jpg",
    gallery: [
        "https://example.com/image-1.jpg",
        "https://example.com/image-2.jpg",
    ],

    website: "https://example.com",
    instagram: "@mirestaurante",
    whatsapp: "+49123456789",

    contact: {
        email: "info@example.com",
        phone: "+49123456789",
        website: "https://example.com",
        instagram: "@mirestaurante",
        whatsapp: "+49123456789",
    },

    community: {
        isLatinoOwned: true,
        countryOfOrigin: "Colombia",
    },

    profile: {
        headline: "Auténtica comida colombiana",
        services: ["Dine-in", "Takeaway"],
        specialties: ["Empanadas", "Arepas"],
        languages: ["Spanish", "German", "English"],
        serviceArea: ["Köln"],
        availability: {
            type: "walk_in",
            description: "Sin cita previa",
        },
        openingHours: {
            monday: { isOpen: true, intervals: [{ open: "09:00", close: "18:00" }] },
            tuesday: { isOpen: true, intervals: [{ open: "09:00", close: "18:00" }] },
            wednesday: { isOpen: true, intervals: [{ open: "09:00", close: "18:00" }] },
            thursday: { isOpen: true, intervals: [{ open: "09:00", close: "18:00" }] },
            friday: { isOpen: true, intervals: [{ open: "09:00", close: "20:00" }] },
            saturday: { isOpen: true, intervals: [{ open: "10:00", close: "20:00" }] },
            sunday: { isOpen: false, intervals: [] },
        },
        pricing: {
            type: "fixed",
            currency: "EUR",
            amount: 12,
            description: "Precio medio por persona",
        },
    },

    documents: [
        {
            type: "menu",
            url: "https://example.com/menu.pdf",
            name: "Menú",
        },
    ],

    menu: "https://example.com/menu.pdf",
    priceRange: "$$",

    tags: ["colombian", "restaurant"],
    languages: ["Spanish", "German"],
    isLatinoOwned: true,
    countryOfOrigin: "Colombia",

    rating: {
        average: 4.8,
        count: 120,
    },

    likesCount: 250,
    followersCount: 180,
    eventsCount: 12,

    verification: {
        status: "verified",
        checks: {
            identity: true,
            contact: true,
            activity: true,
        },
    },

    verificationStatus: "verified",

    isFeatured: true,
    status: "active",

    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-11-16T10:00:00.000Z",
};

describe("PublicBusinessSchema", () => {
    it("accepts a complete valid public business", () => {
        const result = PublicBusinessSchema.safeParse(validBusiness);

        expect(result.success).toBe(true);
    });

    it("accepts optional contact fields to be omitted", () => {
        const business = {
            ...validBusiness,
            contact: {},
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(true);
    });

    it("accepts zero rating and engagement counters", () => {
        const business = {
            ...validBusiness,
            rating: {
                average: 0,
                count: 0,
            },
            likesCount: 0,
            followersCount: 0,
            eventsCount: 0,
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(true);
    });

    it("rejects internal owner information", () => {
        const business = {
            ...validBusiness,
            owner: "internal-owner-id",
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(false);
    });

    it("rejects internal moderation information", () => {
        const business = {
            ...validBusiness,
            moderation: {
                status: "approved",
            },
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(false);
    });

    it("rejects visibilityScore", () => {
        const business = {
            ...validBusiness,
            visibilityScore: 100,
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(false);
    });

    it("rejects invalid verification status", () => {
        const business = {
            ...validBusiness,
            verificationStatus: "approved",
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(false);
    });

    it("rejects invalid timestamps", () => {
        const business = {
            ...validBusiness,
            createdAt: "not-a-date",
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(false);
    });

    it("rejects invalid business categories", () => {
        const business = {
            ...validBusiness,
            category: "automotive",
        };

        const result = PublicBusinessSchema.safeParse(business);

        expect(result.success).toBe(false);
    });
});
