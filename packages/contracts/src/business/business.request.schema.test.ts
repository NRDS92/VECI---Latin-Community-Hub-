import { describe, expect, it } from "vitest";
import type { CreateBusinessRequest } from "./business.request.types.js";
import { CreateBusinessRequestSchema, UpdateBusinessRequestSchema } from "./business.request.schema.js";

const validCreate = {
  name: "Mi negocio",
  category: "food",
  images: { profile: "https://example.com/profile.jpg" },
  location: { address: "Calle 1", cityId: "cologne", country: "Germany", latitude: 50.9, longitude: 6.9 },
} as const;

const fullCreate = {
  ...validCreate,
  description: "Full contract fixture",
  providerType: "business",
  subCategory: "restaurant",
  profile: {
    headline: "Latin kitchen",
    services: ["dine-in"],
    specialties: ["arepas"],
    languages: ["es", "de"],
    serviceArea: ["cologne"],
    availability: { type: "walk_in", description: "Walk ins welcome" },
    openingHours: {
      monday: { isOpen: true, intervals: [{ open: "09:00", close: "18:00" }] },
      tuesday: { isOpen: false, intervals: [] },
      wednesday: { isOpen: false, intervals: [] },
      thursday: { isOpen: false, intervals: [] },
      friday: { isOpen: false, intervals: [] },
      saturday: { isOpen: false, intervals: [] },
      sunday: { isOpen: false, intervals: [] },
    },
    pricing: { type: "fixed", amount: 12 },
  },
  images: { profile: "profile.jpg", cover: "cover.jpg", gallery: ["gallery.jpg"] },
  documents: [{ type: "menu", url: "menu.pdf", name: "Menu" }],
  contact: { email: "hello@example.test", phone: "+49123" },
  community: { isLatinoOwned: false, countryOfOrigin: "Colombia" },
  tags: ["latin", "food"],
};

describe("Business request schemas", () => {
  it("accepts valid create data and applies existing defaults", () => {
    const wire: CreateBusinessRequest = validCreate;
    const result = CreateBusinessRequestSchema.parse(wire);
    expect(result.providerType).toBe("business");
    expect(result.profile.services).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.contact).toEqual({});
    expect(result.community.isLatinoOwned).toBe(true);
    expect(result.tags).toEqual([]);
    expect(result.images.gallery).toEqual([]);
  });

  it("accepts a full create request without losing supported nested data", () => {
    const result = CreateBusinessRequestSchema.parse(fullCreate);
    expect(result.profile.languages).toEqual(["es", "de"]);
    expect(result.profile.openingHours?.monday.intervals[0]).toEqual({ open: "09:00", close: "18:00" });
    expect(result.profile.pricing?.currency).toBe("EUR");
    expect(result.images.gallery).toEqual(["gallery.jpg"]);
    expect(result.documents[0]).toEqual({ type: "menu", url: "menu.pdf", name: "Menu" });
  });

  it("preserves the existing legacy price tier on create and update", () => {
    expect(CreateBusinessRequestSchema.parse({ ...validCreate, priceRange: "$$" }).priceRange).toBe("$$");
    expect(UpdateBusinessRequestSchema.parse({ priceRange: "$$$" })).toEqual({ priceRange: "$$$" });
    expect(CreateBusinessRequestSchema.safeParse({ ...validCreate, priceRange: "$$$$" }).success).toBe(false);
  });

  it("rejects invalid required fields and enum values", () => {
    expect(CreateBusinessRequestSchema.safeParse({ ...validCreate, name: "x" }).success).toBe(false);
    expect(CreateBusinessRequestSchema.safeParse({ ...validCreate, category: "other" }).success).toBe(false);
    expect(CreateBusinessRequestSchema.safeParse({ ...validCreate, images: { profile: "" } }).success).toBe(false);
    expect(CreateBusinessRequestSchema.safeParse({ ...validCreate, location: undefined }).success).toBe(false);
  });

  it("rejects invalid nested values", () => {
    expect(CreateBusinessRequestSchema.safeParse({
      ...fullCreate,
      profile: { ...fullCreate.profile, pricing: { type: "fixed", amount: -1 } },
    }).success).toBe(false);
    expect(CreateBusinessRequestSchema.safeParse({
      ...fullCreate,
      profile: { ...fullCreate.profile, openingHours: { ...fullCreate.profile.openingHours, monday: { isOpen: true, intervals: [{ open: "25:00", close: "18:00" }] } } },
    }).success).toBe(false);
    expect(CreateBusinessRequestSchema.safeParse({ ...fullCreate, documents: [{ type: "invalid", url: "x" }] }).success).toBe(false);
  });

  it("allows omitted optional create fields", () => {
    expect(CreateBusinessRequestSchema.safeParse(validCreate).success).toBe(true);
  });

  it("allows shallow partial updates and validates supplied values", () => {
    expect(UpdateBusinessRequestSchema.safeParse({ name: "Updated" }).success).toBe(true);
    expect(UpdateBusinessRequestSchema.safeParse({ contact: { phone: "123" } }).success).toBe(true);
    expect(UpdateBusinessRequestSchema.safeParse({ name: "x" }).success).toBe(false);
    expect(UpdateBusinessRequestSchema.safeParse({ images: {} }).success).toBe(false);
  });

  it("rejects an empty update after unknown keys are stripped", () => {
    expect(UpdateBusinessRequestSchema.safeParse({}).success).toBe(false);
    expect(UpdateBusinessRequestSchema.safeParse({ owner: "attacker-id" }).success).toBe(false);
  });

  it("does not inject top-level defaults into a partial update", () => {
    expect(UpdateBusinessRequestSchema.parse({ name: "Updated" })).toEqual({ name: "Updated" });
  });

  it("preserves defaults inside an explicitly supplied nested object", () => {
    expect(UpdateBusinessRequestSchema.parse({ profile: { languages: ["en"] } })).toEqual({
      profile: { services: [], specialties: [], languages: ["en"], serviceArea: [] },
    });
  });

  it("does not make nested update objects partial", () => {
    expect(UpdateBusinessRequestSchema.safeParse({ location: { cityId: "cologne" } }).success).toBe(false);
  });

  it("strips unknown keys at request and nested-object levels", () => {
    const create = CreateBusinessRequestSchema.parse({
      ...validCreate,
      owner: "attacker-id",
      moderation: { status: "approved" },
      menu: "legacy-menu.pdf",
      priceRange: "$$",
      contact: { email: "hello@example.test", internalFlag: true },
    });
    expect(create).not.toHaveProperty("owner");
    expect(create).not.toHaveProperty("moderation");
    expect(create).not.toHaveProperty("menu");
    expect(create.priceRange).toBe("$$");
    expect(create.contact).not.toHaveProperty("internalFlag");

    const update = UpdateBusinessRequestSchema.parse({ owner: "attacker-id", name: "Updated" });
    expect(update).toEqual({ name: "Updated" });
  });

  it("shows the wire-input versus parsed-output default differences", () => {
    const wire: CreateBusinessRequest = validCreate;
    const parsed = CreateBusinessRequestSchema.parse(wire);
    expect(wire).not.toHaveProperty("providerType");
    expect(parsed.providerType).toBe("business");
    expect(wire.images).not.toHaveProperty("gallery");
    expect(parsed.images.gallery).toEqual([]);
  });
});
