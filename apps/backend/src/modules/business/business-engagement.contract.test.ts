import {
  BUSINESS_BEHAVIOR_EVENTS,
  BusinessFollowStatusSchema,
  OwnerBusinessStatsSchema,
  TrackBusinessBehaviorRequestSchema,
} from "@ndrs92/contracts";

describe("Business engagement shared contracts", () => {
  it("accepts centralized behavior event identifiers and valid payloads", () => {
    expect(TrackBusinessBehaviorRequestSchema.parse({ event: BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW })).toEqual({ event: "business_view" });
    expect(TrackBusinessBehaviorRequestSchema.parse({ event: BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD, documentUrl: "https://cdn.example/menu.pdf" })).toMatchObject({ event: "menu_download" });
  });

  it("rejects invalid event names, missing menu URLs, and client visitor identifiers", () => {
    expect(TrackBusinessBehaviorRequestSchema.safeParse({ event: "business_view", userId: "private" }).success).toBe(false);
    expect(TrackBusinessBehaviorRequestSchema.safeParse({ event: "menu_download" }).success).toBe(false);
    expect(TrackBusinessBehaviorRequestSchema.safeParse({ event: "unknown" }).success).toBe(false);
  });

  it("validates follow status and aggregate owner stats without visitor data", () => {
    expect(BusinessFollowStatusSchema.safeParse({ businessId: "id", isFollowing: true }).success).toBe(true);
    expect(OwnerBusinessStatsSchema.safeParse({ businessId: "id", followersCount: 1, eventsCount: 2, businessViews: 3, menuDownloadAttempts: 4, periodDays: 90 }).success).toBe(true);
    expect(OwnerBusinessStatsSchema.safeParse({ businessId: "id", visitorIds: ["private"] }).success).toBe(false);
  });
});
