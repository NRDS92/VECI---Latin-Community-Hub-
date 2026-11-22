import { CreateBusinessRequestSchema } from "@ndrs92/contracts";
import { buildBusiness } from "./business.builder";
import { toOwnerBusiness } from "./business.mapper";
import type { BusinessDocument } from "./business.model";
import { toPublicBusiness } from "../../shared/public-content/mappers/business.mapper";

describe("Business builder and Mongoose schema integrity (in-memory only)", () => {
    it("validates and stores supported request fields at their expected model paths", async () => {
        const request = CreateBusinessRequestSchema.parse({
            name: "  Mi negocio  ",
            description: "  A description  ",
            providerType: "business",
            category: "food",
            subCategory: "restaurant",
            priceRange: "$$",
            profile: {
                headline: "  Latin kitchen  ",
                services: ["dine-in"],
                specialties: ["arepas"],
                languages: ["es"],
                serviceArea: ["cologne"],
                availability: { type: "walk_in" },
                pricing: { type: "fixed", amount: 12 },
            },
            images: { profile: "profile.jpg", cover: "cover.jpg", gallery: ["gallery.jpg"] },
            documents: [{ type: "menu", url: "menu.pdf", name: "Menu" }],
            location: { address: "  Address  ", cityId: "  cologne  ", country: "  Germany  ", latitude: 50.9, longitude: 6.9 },
            contact: { email: "hello@example.test", phone: "+49123", website: "https://example.test" },
            community: { isLatinoOwned: false, countryOfOrigin: "Colombia" },
            tags: ["latin"],
        });
        const document = buildBusiness({ data: request, ownerId: "507f1f77bcf86cd799439011", slug: "mi-negocio" });

        await expect(document.validate()).resolves.toBeUndefined();
        expect(document.name).toBe("Mi negocio");
        expect(document.description).toBe("A description");
        expect(document.profile.headline).toBe("Latin kitchen");
        expect(document.profile.languages).toEqual(["es"]);
        expect(document.images.gallery).toEqual(["gallery.jpg"]);
        expect(document.location.coordinates).toEqual({ lat: 50.9, lng: 6.9 });
        expect(document.contact.email).toBe("hello@example.test");
        expect(document.community.countryOfOrigin).toBe("Colombia");
        expect(document.tags).toEqual(["latin"]);
        expect(document.menu).toBeUndefined();
        expect(document.priceRange).toBe("$$");
    });

    it("serializes a model-shaped document into the existing PublicBusiness contract", async () => {
        const request = CreateBusinessRequestSchema.parse({
            name: "Mi negocio", category: "food", images: { profile: "profile.jpg" },
            profile: { languages: ["es"] },
            location: { address: "Address", cityId: "cologne", country: "Germany", latitude: 50.9, longitude: 6.9 },
        });
        const document = buildBusiness({ data: request, ownerId: "507f1f77bcf86cd799439011", slug: "mi-negocio" });
        await document.validate();
        (document as any).createdAt = new Date("2026-01-01T00:00:00.000Z");
        (document as any).updatedAt = new Date("2026-01-02T00:00:00.000Z");

        const publicBusiness = toPublicBusiness(document as BusinessDocument, "mi-negocio");
        expect(publicBusiness.name).toBe("Mi negocio");
        expect(publicBusiness.image).toBe("profile.jpg");
        expect(publicBusiness.profile.languages).toEqual(["es"]);
        expect(publicBusiness.languages).toEqual([]);
        expect(publicBusiness.coordinates).toEqual({ lat: 50.9, lng: 6.9 });
        expect(publicBusiness).not.toHaveProperty("owner");
        expect(publicBusiness).not.toHaveProperty("moderation");
    });

    it("maps verifiedAt to a valid owner DTO timestamp and excludes reviewer IDs", () => {
        const source = {
            _id: { toString: () => "business-id" }, slug: "slug", name: "Name", providerType: "business", category: "food",
            profile: { services: [], specialties: [], languages: [], serviceArea: [] },
            images: { profile: "profile.jpg", gallery: [] }, documents: [], location: { cityId: "cologne" }, contact: {},
            community: { isLatinoOwned: true }, tags: [], languages: [], isLatinoOwned: true,
            rating: { average: 0, count: 0 }, likesCount: 0, followersCount: 0, eventsCount: 0,
            verification: { status: "verified", checks: { identity: true, contact: true, activity: true }, verifiedAt: new Date("2026-02-01T00:00:00.000Z"), verifiedBy: "reviewer-id" },
            isFeatured: false, status: "active", createdAt: new Date("2026-01-01T00:00:00.000Z"), updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        };
        const business = { toObject: () => source } as unknown as BusinessDocument;
        const dto = toOwnerBusiness(business);
        expect(dto.verification.verifiedAt).toBe("2026-02-01T00:00:00.000Z");
        expect(dto.verification).not.toHaveProperty("verifiedBy");
    });
});
