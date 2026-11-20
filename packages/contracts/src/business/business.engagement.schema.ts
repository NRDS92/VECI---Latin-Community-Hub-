import { z } from "zod";

export const BUSINESS_BEHAVIOR_EVENTS = {
  BUSINESS_VIEW: "business_view",
  // Records that a visitor initiated the direct menu link; file delivery is not verified by Backend.
  MENU_DOWNLOAD: "menu_download",
} as const;

export const BusinessBehaviorEventSchema = z.enum([
  BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW,
  BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD,
]);

export const TrackBusinessBehaviorRequestSchema = z.object({
  event: BusinessBehaviorEventSchema,
  /** Required for menu_download and matched against a current menu document. */
  documentUrl: z.string().min(1).optional(),
}).strict().superRefine((value, context) => {
  if (value.event === BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD && !value.documentUrl) {
    context.addIssue({ code: "custom", path: ["documentUrl"], message: "A menu document URL is required" });
  }
  if (value.event === BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW && value.documentUrl !== undefined) {
    context.addIssue({ code: "custom", path: ["documentUrl"], message: "A document URL is not valid for a business view" });
  }
});

export const BusinessFollowStatusSchema = z.object({
  businessId: z.string().min(1),
  isFollowing: z.boolean(),
}).strict();

export const BusinessFollowStatusResponseSchema = z.object({
  success: z.literal(true),
  data: BusinessFollowStatusSchema,
}).strict();

export const OwnerBusinessStatsSchema = z.object({
  businessId: z.string().min(1),
  followersCount: z.number().int().nonnegative(),
  eventsCount: z.number().int().nonnegative(),
  businessViews: z.number().int().nonnegative(),
  menuDownloadAttempts: z.number().int().nonnegative(),
  periodDays: z.literal(90),
}).strict();

export const OwnerBusinessStatsResponseSchema = z.object({
  success: z.literal(true),
  data: OwnerBusinessStatsSchema,
}).strict();
