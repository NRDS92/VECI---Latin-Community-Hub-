import type { z } from "zod";
import {
  BusinessBehaviorEventSchema,
  BusinessFollowStatusSchema,
  BusinessFollowStatusResponseSchema,
  OwnerBusinessStatsSchema,
  OwnerBusinessStatsResponseSchema,
  TrackBusinessBehaviorRequestSchema,
} from "./business.engagement.schema.js";

export type BusinessBehaviorEvent = z.infer<typeof BusinessBehaviorEventSchema>;
export type TrackBusinessBehaviorRequest = z.infer<typeof TrackBusinessBehaviorRequestSchema>;
export type BusinessFollowStatus = z.infer<typeof BusinessFollowStatusSchema>;
export type BusinessFollowStatusResponse = z.infer<typeof BusinessFollowStatusResponseSchema>;
export type OwnerBusinessStats = z.infer<typeof OwnerBusinessStatsSchema>;
export type OwnerBusinessStatsResponse = z.infer<typeof OwnerBusinessStatsResponseSchema>;
