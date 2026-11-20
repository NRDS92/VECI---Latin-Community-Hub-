import crypto from "node:crypto";
import mongoose from "mongoose";
import {
  BUSINESS_BEHAVIOR_EVENTS,
  type BusinessBehaviorEvent,
  type TrackBusinessBehaviorRequest,
} from "@ndrs92/contracts";
import { Business } from "./business.model";
import { BusinessFollow } from "./business-follow.model";
import { BusinessBehavior } from "./business-behavior.model";
import { Publication } from "../../shared/public-content/publication/publication.model";
import { PUBLICATION_STATUS } from "../../shared/public-content/publication/publication-status";
import { PUBLIC_CONTENT_TYPES } from "../../shared/public-content/constants/public-content.types";
import { MODERATION_STATUS } from "../../shared/constants/moderation";
import { AppError } from "../../shared/errors/AppError";

const OWNER_STATS_PERIOD_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

export const assertMongoTransactionSupport = async () => {
  const db = mongoose.connection.db;
  if (!db) throw new AppError("Database connection is unavailable", 503, "DATABASE_UNAVAILABLE");
  const hello = await db.admin().command({ hello: 1 });
  const transactionalTopology = Boolean(hello.setName || hello.msg === "isdbgrid" || hello.serviceId);
  if (!transactionalTopology || typeof hello.logicalSessionTimeoutMinutes !== "number") {
    throw new AppError("Business engagement requires MongoDB transaction support", 503, "TRANSACTIONS_UNAVAILABLE");
  }
};

const eligibleBusinessFilter = async (businessId: string) => {
  const published = await Publication.exists({
    entityType: PUBLIC_CONTENT_TYPES.BUSINESS,
    entityId: businessId,
    status: PUBLICATION_STATUS.PUBLISHED,
  });
  if (!published) return null;
  return Business.findOne({
    _id: businessId,
    status: "active",
    "moderation.status": MODERATION_STATUS.APPROVED,
  });
};

export const setBusinessFollow = async (businessId: string, userId: string, following: boolean) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new AppError("Invalid business ID", 400, "INVALID_ID");
  const business = await eligibleBusinessFilter(businessId);
  if (!business) throw new AppError("Business not found", 404, "NOT_FOUND");

  // The relation is authoritative. In a transaction, recounting repairs any legacy/stale counter on first mutation;
  // conflicting concurrent writes retry against the latest relation set.
  await assertMongoTransactionSupport();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (following) {
        await BusinessFollow.updateOne(
          { userId, businessId },
          { $setOnInsert: { userId, businessId } },
          { upsert: true, session }
        );
      } else {
        await BusinessFollow.deleteOne({ userId, businessId }, { session });
      }
      const followersCount = await BusinessFollow.countDocuments({ businessId }).session(session);
      await Business.updateOne({ _id: businessId }, { $set: { followersCount } }, { session });
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    // A competing transaction already inserted this unique relation and committed its counter recount.
    // Avoid an out-of-transaction counter write that could race with another follow/unfollow.
  } finally {
    await session.endSession();
  }
  return { businessId, isFollowing: following };
};

export const getBusinessFollowStatus = async (businessId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new AppError("Invalid business ID", 400, "INVALID_ID");
  const business = await eligibleBusinessFilter(businessId);
  if (!business) throw new AppError("Business not found", 404, "NOT_FOUND");
  const relation = await BusinessFollow.exists({ businessId, userId });
  return { businessId, isFollowing: Boolean(relation) };
};

export const getFollowedBusinesses = async (userId: string) => {
  const relations = await BusinessFollow.find({ userId }).sort({ createdAt: -1 }).lean();
  if (!relations.length) return [];
  const businessIds = relations.map(({ businessId }) => String(businessId));
  const publications = await Publication.find({
    entityType: PUBLIC_CONTENT_TYPES.BUSINESS,
    entityId: { $in: businessIds },
    status: PUBLICATION_STATUS.PUBLISHED,
  }).select("entityId slug").lean();
  const slugs = new Map(publications.map(({ entityId, slug }) => [entityId, slug]));
  const eligibleIds = [...slugs.keys()];
  if (!eligibleIds.length) return [];
  const businesses = await Business.find({
    _id: { $in: eligibleIds },
    status: "active",
    "moderation.status": MODERATION_STATUS.APPROVED,
  });
  const byId = new Map(businesses.map((business) => [String(business._id), business]));
  return relations.flatMap(({ businessId }) => {
    const id = String(businessId);
    const business = byId.get(id);
    const slug = slugs.get(id);
    return business && slug ? [{ business, slug }] : [];
  });
};

const privacyKey = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured");
  return crypto.createHmac("sha256", secret).update(`business-behavior:${userId}`).digest("hex");
};

const anonymousPrivacyKey = (ip: string, userAgent: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured");
  return crypto.createHmac("sha256", secret).update(`business-anonymous:${ip}:${userAgent}`).digest("hex");
};

export const trackBusinessBehavior = async (
  businessId: string,
  visitor: { userId?: string; ip: string; userAgent: string },
  input: TrackBusinessBehaviorRequest
) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new AppError("Invalid business ID", 400, "INVALID_ID");
  const business = await eligibleBusinessFilter(businessId);
  if (!business) throw new AppError("Business not found", 404, "NOT_FOUND");
  if (input.event === BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD) {
    const hasMenuDocument = business.documents?.some(
      (document) => document.type === "menu" && document.url === input.documentUrl
    );
    if (!hasMenuDocument) throw new AppError("Menu document not found", 404, "MENU_NOT_FOUND");
  }

  // One authenticated account per event/resource/business per UTC day; no client visitor identifier is accepted.
  const now = new Date();
  const resourceKey = input.documentUrl
    ? crypto.createHash("sha256").update(input.documentUrl).digest("hex")
    : "";
  const dedupeDate = now.toISOString().slice(0, 10);
  try {
    await BusinessBehavior.create({
      businessId,
      visitorKey: visitor.userId ? privacyKey(visitor.userId) : anonymousPrivacyKey(visitor.ip, visitor.userAgent),
      visitorType: visitor.userId ? "user" : "anonymous",
      event: input.event,
      resourceKey,
      dedupeDate,
      createdAt: now,
    });
    return { recorded: true };
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return { recorded: false };
    throw error;
  }
};

export const getOwnerBusinessStats = async (businessId: string, ownerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new AppError("Invalid business ID", 400, "INVALID_ID");
  const business = await Business.findById(businessId);
  if (!business) throw new AppError("Business not found", 404, "NOT_FOUND");
  if (String(business.owner) !== ownerId) throw new AppError("Unauthorized", 403, "FORBIDDEN");
  const since = new Date(Date.now() - OWNER_STATS_PERIOD_DAYS * DAY_MS);
  const countEvent = (event: BusinessBehaviorEvent) => BusinessBehavior.countDocuments({
    businessId,
    event,
    createdAt: { $gte: since },
  });
  const [businessViews, menuDownloadAttempts] = await Promise.all([
    countEvent(BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW),
    countEvent(BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD),
  ]);
  return {
    businessId,
    followersCount: business.followersCount ?? 0,
    eventsCount: business.eventsCount ?? 0,
    businessViews,
    menuDownloadAttempts,
    periodDays: OWNER_STATS_PERIOD_DAYS as 90,
  };
};

/** Remove account-linked edges and pseudonymous events when an account is deleted. */
export const removeUserBusinessEngagement = async (userId: string) => {
  await assertMongoTransactionSupport();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const relations = await BusinessFollow.find({ userId }).select("businessId").session(session).lean();
      const businessIds = [...new Set(relations.map(({ businessId }) => String(businessId)))];
      await BusinessFollow.deleteMany({ userId }, { session });
      for (const businessId of businessIds) {
        const followersCount = await BusinessFollow.countDocuments({ businessId }).session(session);
        await Business.updateOne({ _id: businessId }, { $set: { followersCount } }, { session });
      }
      await BusinessBehavior.deleteMany({ visitorKey: privacyKey(userId) }, { session });
    });
  } finally {
    await session.endSession();
  }
};
