import mongoose, { Schema, type Document } from "mongoose";
import { BUSINESS_BEHAVIOR_EVENTS, type BusinessBehaviorEvent } from "@ndrs92/contracts";

export interface BusinessBehaviorDocument extends Document {
  businessId: mongoose.Types.ObjectId;
  visitorKey: string;
  visitorType: "user" | "anonymous";
  event: BusinessBehaviorEvent;
  resourceKey: string;
  dedupeDate: string;
  createdAt: Date;
}

const BusinessBehaviorSchema = new Schema<BusinessBehaviorDocument>({
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
  // HMAC of the authenticated user ID; no raw user ID, IP address or user agent is stored.
  visitorKey: { type: String, required: true, select: false },
  visitorType: { type: String, enum: ["user", "anonymous"], required: true },
  event: { type: String, enum: Object.values(BUSINESS_BEHAVIOR_EVENTS), required: true },
  resourceKey: { type: String, required: true, select: false },
  dedupeDate: { type: String, required: true, select: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

BusinessBehaviorSchema.index(
  { businessId: 1, visitorKey: 1, event: 1, resourceKey: 1, dedupeDate: 1 },
  { unique: true }
);
BusinessBehaviorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const BusinessBehavior = mongoose.model<BusinessBehaviorDocument>("BusinessBehavior", BusinessBehaviorSchema);
