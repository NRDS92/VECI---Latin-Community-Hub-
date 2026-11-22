import mongoose, { Schema, model, type Document, type HydratedDocument } from "mongoose";
import { ModerationSchema } from "../../shared/moderation/moderation.schema";
import type { ModerationRejectionReason, ModerationStatus } from "../../shared/constants/moderation";

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description?: string;
  interests: string[];
  cityId: string;
  country: string;
  images: { profile?: string; cover?: string; gallery: string[] };
  contact: { website?: string; instagram?: string; whatsapp?: string; email?: string };
  owner: mongoose.Types.ObjectId;
  membershipPolicy: "open" | "approval";
  memberCount: number;
  moderation: { status: ModerationStatus; reviewedBy?: mongoose.Types.ObjectId; reviewedAt?: Date; rejectionReason?: ModerationRejectionReason; rejectionComment?: string };
  status: "active" | "suspended" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, maxlength: 5000 },
  interests: { type: [String], default: [] },
  cityId: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  images: {
    profile: String,
    cover: String,
    gallery: { type: [String], default: [] },
  },
  contact: { website: String, instagram: String, whatsapp: String, email: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  membershipPolicy: { type: String, enum: ["open", "approval"], required: true },
  memberCount: { type: Number, min: 1, default: 1, required: true },
  moderation: { type: ModerationSchema, default: () => ({}) },
  status: { type: String, enum: ["active", "suspended", "blocked"], default: "active", required: true },
}, { timestamps: true, strict: "throw" });

communitySchema.index({ status: 1, "moderation.status": 1, createdAt: -1 });
communitySchema.index({ cityId: 1, status: 1, "moderation.status": 1 });
communitySchema.index({ interests: 1, status: 1, "moderation.status": 1 });

export const Community = (mongoose.models.Community as mongoose.Model<ICommunity> | undefined)
  ?? model<ICommunity>("Community", communitySchema);

export interface ICommunityMembership extends Document {
  communityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "member";
  status: "pending" | "active" | "rejected" | "banned";
  joinedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<ICommunityMembership>({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member", required: true },
  status: { type: String, enum: ["pending", "active", "rejected", "banned"], required: true },
  joinedAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
}, { timestamps: true, strict: "throw" });
membershipSchema.index({ communityId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ communityId: 1, status: 1, createdAt: 1 });
membershipSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const CommunityMembership = (mongoose.models.CommunityMembership as mongoose.Model<ICommunityMembership> | undefined)
  ?? model<ICommunityMembership>("CommunityMembership", membershipSchema);

export interface ICommunityPost extends Document {
  communityId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  type: "post" | "announcement";
  text: string;
  images: string[];
  status: "active" | "hidden" | "removed";
  createdAt: Date;
  updatedAt: Date;
}
const postSchema = new Schema<ICommunityPost>({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["post", "announcement"], required: true },
  text: { type: String, required: true, maxlength: 10000 },
  images: { type: [String], default: [] },
  status: { type: String, enum: ["active", "hidden", "removed"], default: "active", required: true },
}, { timestamps: true, strict: "throw" });
postSchema.index({ communityId: 1, status: 1, createdAt: -1, _id: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });
export const CommunityPost = (mongoose.models.CommunityPost as mongoose.Model<ICommunityPost> | undefined)
  ?? model<ICommunityPost>("CommunityPost", postSchema);

export interface ICommunityComment extends Document {
  communityId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  text: string;
  status: "active" | "hidden" | "removed";
  createdAt: Date;
  updatedAt: Date;
}
const commentSchema = new Schema<ICommunityComment>({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  postId: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ["active", "hidden", "removed"], default: "active", required: true },
}, { timestamps: true, strict: "throw" });
commentSchema.index({ communityId: 1, postId: 1, status: 1, createdAt: 1 });
export const CommunityComment = (mongoose.models.CommunityComment as mongoose.Model<ICommunityComment> | undefined)
  ?? model<ICommunityComment>("CommunityComment", commentSchema);

export interface ICommunityNotification extends Document {
  userId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  type: "membership_approved" | "membership_rejected" | "event_published" | "announcement";
  eventKey: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const notificationSchema = new Schema<ICommunityNotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  type: { type: String, enum: ["membership_approved", "membership_rejected", "event_published", "announcement"], required: true },
  eventKey: { type: String, required: true },
  readAt: Date,
}, { timestamps: true, strict: "throw" });
notificationSchema.index({ userId: 1, eventKey: 1 }, { unique: true });
notificationSchema.index({ userId: 1, createdAt: -1 });
export const CommunityNotification = (mongoose.models.CommunityNotification as mongoose.Model<ICommunityNotification> | undefined)
  ?? model<ICommunityNotification>("CommunityNotification", notificationSchema);

export interface ICommunityContentReport extends Document {
  communityId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  targetType: "post" | "comment";
  targetId: mongoose.Types.ObjectId;
  reason: "spam" | "harassment" | "hate" | "sexual_content" | "violence" | "other";
  status: "pending" | "resolved" | "dismissed";
  resolvedBy?: mongoose.Types.ObjectId;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
const contentReportSchema = new Schema<ICommunityContentReport>({
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true },
  reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["post", "comment"], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  reason: { type: String, enum: ["spam", "harassment", "hate", "sexual_content", "violence", "other"], required: true },
  status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending", required: true },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolutionNote: { type: String, maxlength: 1000 },
}, { timestamps: true, strict: "throw" });
contentReportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 }, { unique: true });
contentReportSchema.index({ status: 1, createdAt: 1 });
export const CommunityContentReport = (mongoose.models.CommunityContentReport as mongoose.Model<ICommunityContentReport> | undefined)
  ?? model<ICommunityContentReport>("CommunityContentReport", contentReportSchema);
