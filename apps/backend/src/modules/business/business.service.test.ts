import { Business } from "./business.model";
import { validateBusinessCreation } from "./business.permissions";
import { generateUniqueSlug } from "../../shared/slug/slug.service";
import { buildBusiness } from "./business.builder";
import { createBusiness, getBusinessById, getMyBusinesses, updateBusiness } from "./business.service";

jest.mock("./business.model", () => ({ Business: { findById: jest.fn() } }));
jest.mock("./business.permissions", () => ({ validateBusinessCreation: jest.fn() }));
jest.mock("../../shared/slug/slug.service", () => ({ generateUniqueSlug: jest.fn() }));
jest.mock("./business.builder", () => ({ buildBusiness: jest.fn() }));

const baseCreate = {
    name: "Mi negocio",
    category: "food",
    images: { profile: "profile.jpg" },
    location: { address: "Calle 1", cityId: "cologne", country: "Germany", latitude: 50.9, longitude: 6.9 },
} as const;

describe("business service contract boundary", () => {
    beforeEach(() => jest.clearAllMocks());

    it("validates create and preserves eligibility and slug generation", async () => {
        const document = { save: jest.fn().mockResolvedValue(undefined) };
        (generateUniqueSlug as jest.Mock).mockResolvedValue("mi-negocio");
        (buildBusiness as jest.Mock).mockReturnValue(document);

        await expect(createBusiness(baseCreate, "owner-1")).resolves.toBe(document);
        expect(validateBusinessCreation).toHaveBeenCalledWith("owner-1");
        expect(generateUniqueSlug).toHaveBeenCalledWith(expect.objectContaining({ value: "Mi negocio" }));
        expect(document.save).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid create before business eligibility or persistence", async () => {
        await expect(createBusiness({ ...baseCreate, name: "x" }, "owner-1")).rejects.toMatchObject({ name: "ZodError" });
        expect(validateBusinessCreation).not.toHaveBeenCalled();
        expect(buildBusiness).not.toHaveBeenCalled();
    });

    it("validates updates and preserves ownership and shallow replacement semantics", async () => {
        const business = {
            owner: { toString: () => "owner-1" },
            profile: { languages: ["es"], services: ["existing"] },
            documents: [{ type: "menu", url: "old-menu.pdf" }],
            contact: { email: "old@example.com" },
            community: { isLatinoOwned: false, countryOfOrigin: "Chile" },
            tags: ["existing-tag"],
            slug: "stable-slug",
            save: jest.fn().mockResolvedValue(undefined),
        };
        (Business.findById as jest.Mock).mockResolvedValue(business);

        await expect(updateBusiness("507f1f77bcf86cd799439011", "owner-1", { contact: { phone: "123" } })).resolves.toBe(business);
        expect(business.contact).toEqual({ phone: "123" });
        expect(business.profile).toEqual({ languages: ["es"], services: ["existing"] });
        expect(business.documents).toEqual([{ type: "menu", url: "old-menu.pdf" }]);
        expect(business.community).toEqual({ isLatinoOwned: false, countryOfOrigin: "Chile" });
        expect(business.tags).toEqual(["existing-tag"]);
        expect(business.slug).toBe("stable-slug");
        expect(business.save).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid update data before reading the database", async () => {
        await expect(updateBusiness("business-1", "owner-1", { name: "x" })).rejects.toMatchObject({ name: "ZodError" });
        expect(Business.findById).not.toHaveBeenCalled();
    });

    it("keeps the ownership check before mutation", async () => {
        const business = {
            owner: { toString: () => "another-owner" },
            save: jest.fn(),
        };
        (Business.findById as jest.Mock).mockResolvedValue(business);

        await expect(updateBusiness("507f1f77bcf86cd799439011", "owner-1", { name: "Updated" })).rejects.toMatchObject({ statusCode: 403 });
        expect(business.save).not.toHaveBeenCalled();
    });

    it("retrieves a business by ID and a sorted list for an owner", async () => {
        const business = { _id: "business-id" };
        (Business.findById as jest.Mock).mockResolvedValue(business);
        await expect(getBusinessById("507f1f77bcf86cd799439011")).resolves.toBe(business);

        const rows = [business];
        const sort = jest.fn().mockResolvedValue(rows);
        (Business as any).find = jest.fn().mockReturnValue({ sort });
        await expect(getMyBusinesses("owner-1")).resolves.toBe(rows);
        expect((Business as any).find).toHaveBeenCalledWith({ owner: "owner-1" });
        expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("rejects an empty update without reading or saving the document", async () => {
        const business = {
            owner: { toString: () => "owner-1" },
            slug: "stable-slug",
            profile: { languages: ["es"], services: ["old-service"] },
            documents: [{ type: "menu", url: "old-menu.pdf" }],
            contact: { email: "old@example.test" },
            community: { isLatinoOwned: false, countryOfOrigin: "Chile" },
            tags: ["old-tag"],
            save: jest.fn().mockResolvedValue(undefined),
        };
        (Business.findById as jest.Mock).mockResolvedValue(business);
        await expect(updateBusiness("507f1f77bcf86cd799439011", "owner-1", {})).rejects.toMatchObject({ name: "ZodError" });
        expect(Business.findById).not.toHaveBeenCalled();
        expect(business.save).not.toHaveBeenCalled();
    });

    it("preserves every omitted writable field during a one-field update", async () => {
        const business = {
            owner: { toString: () => "owner-1" },
            name: "Original",
            description: "Description",
            profile: { languages: ["es"], services: ["catering"] },
            images: { profile: "profile.jpg", cover: "cover.jpg", gallery: ["one.jpg", "two.jpg"] },
            documents: [{ type: "menu", url: "menu.pdf" }],
            location: { address: "Address", cityId: "cologne", country: "Germany", coordinates: { lat: 50.9, lng: 6.9 } },
            contact: { email: "owner@example.test", phone: "+49123" },
            community: { isLatinoOwned: false, countryOfOrigin: "Chile" },
            tags: ["latin"],
            priceRange: "$$",
            slug: "stable-slug",
            save: jest.fn().mockResolvedValue(undefined),
        };
        (Business.findById as jest.Mock).mockResolvedValue(business);

        await updateBusiness("507f1f77bcf86cd799439011", "owner-1", { name: "Updated" });

        expect(business).toMatchObject({
            name: "Updated", description: "Description",
            profile: { languages: ["es"], services: ["catering"] },
            images: { profile: "profile.jpg", cover: "cover.jpg", gallery: ["one.jpg", "two.jpg"] },
            documents: [{ type: "menu", url: "menu.pdf" }],
            location: { address: "Address", cityId: "cologne", country: "Germany", coordinates: { lat: 50.9, lng: 6.9 } },
            contact: { email: "owner@example.test", phone: "+49123" },
            community: { isLatinoOwned: false, countryOfOrigin: "Chile" },
            tags: ["latin"], priceRange: "$$", slug: "stable-slug",
        });
        expect(business.save).toHaveBeenCalledTimes(1);
    });

    it("does not clear a legacy price tier when Update omits priceRange", async () => {
        const business = {
            owner: { toString: () => "owner-1" },
            name: "Original",
            priceRange: "$$",
            save: jest.fn().mockResolvedValue(undefined),
        };
        (Business.findById as jest.Mock).mockResolvedValue(business);

        await updateBusiness("507f1f77bcf86cd799439011", "owner-1", { name: "Updated" });

        expect(business.name).toBe("Updated");
        expect(business.priceRange).toBe("$$");
        expect(business.save).toHaveBeenCalledTimes(1);
    });
});
