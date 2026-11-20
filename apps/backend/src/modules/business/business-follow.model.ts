import mongoose, { Schema, type Document } from "mongoose";

export interface BusinessFollowDocument extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessFollowSchema = new Schema<BusinessFollowDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
}, { timestamps: true });

BusinessFollowSchema.index({ userId: 1, businessId: 1 }, { unique: true });
BusinessFollowSchema.index({ userId: 1, createdAt: -1 });

export const BusinessFollow = mongoose.model<BusinessFollowDocument>("BusinessFollow", BusinessFollowSchema);
