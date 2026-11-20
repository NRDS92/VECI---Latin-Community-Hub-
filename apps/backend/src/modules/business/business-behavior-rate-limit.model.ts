import mongoose, { Schema, type Document } from "mongoose";

export interface BusinessBehaviorRateLimitDocument extends Document {
  identityKey: string;
  windowStart: Date;
  count: number;
  expiresAt: Date;
}

const BusinessBehaviorRateLimitSchema = new Schema<BusinessBehaviorRateLimitDocument>({
  identityKey: { type: String, required: true, select: false },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, min: 1 },
  expiresAt: { type: Date, required: true },
}, { versionKey: false });

BusinessBehaviorRateLimitSchema.index({ identityKey: 1, windowStart: 1 }, { unique: true });
BusinessBehaviorRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BusinessBehaviorRateLimit = mongoose.model<BusinessBehaviorRateLimitDocument>(
  "BusinessBehaviorRateLimit",
  BusinessBehaviorRateLimitSchema
);
