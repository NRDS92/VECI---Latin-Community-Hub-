import { toOwnerBusiness } from "./business.mapper";
import type { BusinessDocument } from "./business.model";

describe("toOwnerBusiness", () => {
    it("maps compatible fields and omits persistence internals", () => {
        const source = {
            _id: { toString: () => "business-id" },
            slug: "mi-negocio",
            name: "Mi negocio",
            providerType: "business",
            category: "food",
            profile: { services: [], specialties: [], languages: [], serviceArea: [] },
            images: { profile: "profile.jpg", gallery: [] },
            documents: [],
            location: { cityId: "cologne", coordinates: { lat: 50.9, lng: 6.9 } },
            contact: {},
            community: { isLatinoOwned: true },
            tags: [],
            languages: [],
            isLatinoOwned: true,
            rating: { average: 0, count: 0 },
            likesCount: 0,
            followersCount: 0,
            eventsCount: 0,
            verification: { status: "unverified", checks: {} },
            isFeatured: false,
            status: "active",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-02T00:00:00.000Z"),
            owner: "private-owner",
            visibilityScore: 10,
            moderation: { status: "pending" },
        };
        const document = { toObject: () => source } as unknown as BusinessDocument;

        const result = toOwnerBusiness(document);
        expect(result._id).toBe("business-id");
        expect(result.images.profile).toBe("profile.jpg");
        expect(result.location.coordinates).toEqual({ lat: 50.9, lng: 6.9 });
        expect(result).not.toHaveProperty("owner");
        expect(result).not.toHaveProperty("visibilityScore");
        expect(result).not.toHaveProperty("moderation");
    });
});
