import { CreateBusinessRequestSchema, OwnerBusinessSchema } from "@ndrs92/contracts";
import {
  buildCreateBusinessRequest,
  buildUpdateBusinessRequest,
} from "./business-form.helpers";
import type { BusinessFormValues } from "./business-form.types";

const values: BusinessFormValues = {
  name: " La Casa ", description: " Food ", category: "food", subCategory: "restaurant",
  priceRange: "$$", phone: "+49123", instagram: "lacasacologne", image: "profile-new.jpg",
  menu: "menu-new.pdf", address: "Address", cityId: "cologne", coordinates: { latitude: 50.9, longitude: 6.9 },
};

const ownerBusiness = OwnerBusinessSchema.parse({
  _id: "business-1", slug: "la-casa", name: "La Casa", providerType: "business", category: "food",
  profile: { services: ["catering"], specialties: ["arepas"], languages: ["es", "de"], serviceArea: ["cologne"] },
  images: { profile: "profile-old.jpg", cover: "cover.jpg", gallery: ["one.jpg", "two.jpg"] },
  documents: [{ type: "menu", url: "menu-old.pdf" }, { type: "catalog", url: "catalog.pdf" }],
  location: { address: "Old address", cityId: "cologne", country: "Germany", coordinates: { lat: 50.8, lng: 6.8 } },
  contact: { email: "owner@example.test", phone: "old", website: "https://example.test", instagram: "old", whatsapp: "+49111" },
  community: { isLatinoOwned: false, countryOfOrigin: "Chile" }, tags: ["latin", "food"],
  priceRange: "$$$", languages: ["es"], isLatinoOwned: false,
  rating: { average: 4.5, count: 8 }, likesCount: 0, followersCount: 0, eventsCount: 0,
  verification: { status: "unverified", checks: { identity: false, contact: false, activity: false } },
  isFeatured: false, status: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("Mobile Business request mapping", () => {
  it("constructs a shared-contract Create payload including the legacy price tier", () => {
    const payload = buildCreateBusinessRequest(values);
    expect(payload).toMatchObject({
      name: "La Casa", priceRange: "$$", profile: { languages: ["es"] },
      images: { profile: "profile-new.jpg", gallery: [] },
      documents: [{ type: "menu", url: "menu-new.pdf" }],
      location: { latitude: 50.9, longitude: 6.9 }, community: { isLatinoOwned: true },
    });
    expect(CreateBusinessRequestSchema.safeParse(payload).success).toBe(true);
  });

  it("preserves unedited owner data while updating the form-owned fields", () => {
    const payload = buildUpdateBusinessRequest(values, ownerBusiness);
    expect(payload).toMatchObject({
      name: "La Casa", priceRange: "$$", profile: { services: ["catering"], specialties: ["arepas"], languages: ["es", "de"] },
      images: { profile: "profile-new.jpg", cover: "cover.jpg", gallery: ["one.jpg", "two.jpg"] },
      documents: [{ type: "catalog", url: "catalog.pdf" }, { type: "menu", url: "menu-new.pdf" }],
      location: { country: "Germany", latitude: 50.9, longitude: 6.9 },
      contact: { email: "owner@example.test", website: "https://example.test", whatsapp: "+49111", phone: "+49123", instagram: "lacasacologne" },
      community: { isLatinoOwned: false, countryOfOrigin: "Chile" }, tags: ["latin", "food"],
    });
  });

  it("does not send a legacy menu URL as a duplicate root field", () => {
    expect(buildCreateBusinessRequest({ ...values, menu: "" })).not.toHaveProperty("menu");
  });
});
