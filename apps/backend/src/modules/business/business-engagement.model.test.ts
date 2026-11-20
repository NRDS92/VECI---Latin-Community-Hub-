import { BusinessFollow } from "./business-follow.model";
import { BusinessBehavior } from "./business-behavior.model";
import { BusinessBehaviorRateLimit } from "./business-behavior-rate-limit.model";

describe("Business engagement persistence indexes", () => {
  it("declares a unique user/business follow relation", () => {
    expect(BusinessFollow.schema.indexes()).toContainEqual([
      { userId: 1, businessId: 1 },
      { unique: true },
    ]);
  });

  it("deduplicates behavior events and expires them after 90 days", () => {
    const indexes = BusinessBehavior.schema.indexes();
    expect(indexes).toContainEqual([
      { businessId: 1, visitorKey: 1, event: 1, resourceKey: 1, dedupeDate: 1 },
      { unique: true },
    ]);
    expect(indexes).toContainEqual([
      { createdAt: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60 },
    ]);
  });

  it("stores only keyed rate-limit buckets and expires them quickly", () => {
    const indexes = BusinessBehaviorRateLimit.schema.indexes();
    expect(indexes).toContainEqual([
      { identityKey: 1, windowStart: 1 },
      { unique: true },
    ]);
    expect(indexes).toContainEqual([
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    ]);
    expect(BusinessBehaviorRateLimit.schema.path("identityKey").options.select).toBe(false);
  });
});
