import { describe, expect, it } from "vitest";
import {
  CreateCommunityRequestSchema,
  UpdateCommunityRequestSchema,
  PublicCommunitySchema,
  MembershipActionSchema,
  CreateCommunityPostSchema,
  CreateEventRequestSchema,
  UpdateCommunityPostSchema,
} from "../index.js";

describe("Community contracts", () => {
  const validCommunity = {
    name: "Colombianos en Köln",
    cityId: "cologne",
    country: "Germany",
    membershipPolicy: "approval" as const,
  };

  it("accepts a valid creation request and supplies only the defined interests default", () => {
    expect(CreateCommunityRequestSchema.parse(validCommunity)).toMatchObject({ interests: [] });
  });

  it("rejects an empty update and preserves fields omitted from a partial update", () => {
    expect(UpdateCommunityRequestSchema.safeParse({}).success).toBe(false);
    expect(UpdateCommunityRequestSchema.parse({ name: "Nuevo nombre" })).toEqual({ name: "Nuevo nombre" });
  });

  it("keeps public Community DTOs free of owner and moderation fields", () => {
    const dto = {
      id: "community-1", slug: "colombianos-koeln", name: validCommunity.name,
      interests: [], cityId: "cologne", country: "Germany", images: { gallery: [] }, contact: {},
      memberCount: 4, createdAt: "2026-01-01T00:00:00.000Z",
    };
    expect(PublicCommunitySchema.safeParse(dto).success).toBe(true);
    expect(PublicCommunitySchema.safeParse({ ...dto, ownerId: "private" }).success).toBe(false);
  });

  it("limits membership actions to the explicit server-supported set", () => {
    expect(MembershipActionSchema.safeParse({ action: "approve" }).success).toBe(true);
    expect(MembershipActionSchema.safeParse({ action: "transfer_owner" }).success).toBe(false);
  });

  it("supports post defaults and requires one authorized Event organizer", () => {
    expect(CreateCommunityPostSchema.parse({ text: "A message" })).toEqual({ type: "post", text: "A message", images: [] });
    const event = {
      title: "Community celebration", eventType: "community", category: "culture", cityId: "cologne",
      address: "Town Hall", latitude: 50.9, longitude: 6.9, dateStart: "2027-06-01T18:00:00.000Z",
      organizer: { type: "community", id: "community-1" },
    };
    expect(CreateEventRequestSchema.safeParse(event).success).toBe(true);
    expect(CreateEventRequestSchema.safeParse({ ...event, organizer: undefined }).success).toBe(false);
    expect(CreateEventRequestSchema.safeParse({ ...event, businessId: "business-1" }).success).toBe(false);
    expect(CreateEventRequestSchema.safeParse({ ...event, eventType: "official" }).success).toBe(false);
    expect(CreateEventRequestSchema.safeParse({ ...event, eventType: "official", organizer: { type: "business", id: "business-1" } }).success).toBe(true);
    expect(UpdateCommunityPostSchema.safeParse({}).success).toBe(false);
    expect(UpdateCommunityPostSchema.parse({ text: "Edited text" })).toEqual({ text: "Edited text" });
  });
});
