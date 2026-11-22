import mongoose from "mongoose";
import {
  Community,
  CommunityMembership,
  CommunityNotification,
  type ICommunity,
  type ICommunityMembership,
} from "./community.models";
import { CommunityMembershipSchema, CreateCommunityRequestSchema, UpdateCommunityRequestSchema, OwnerCommunitySchema, PublicCommunitySchema, MyCommunitySchema, ManagedCommunityMemberSchema } from "@ndrs92/contracts";
import { AppError } from "../../shared/errors/AppError";
import { MODERATION_STATUS } from "../../shared/constants/moderation";
import { generateUniqueSlug } from "../../shared/slug/slug.service";
import { toOwnerCommunity, toPublicCommunity } from "./community.mapper";
import { PUBLIC_CONTENT_TYPES } from "../../shared/public-content/constants/public-content.types";
import { PUBLICATION_STATUS } from "../../shared/public-content/publication/publication-status";
import { Publication } from "../../shared/public-content/publication/publication.model";
import { createPublication, publish, unpublish } from "../../shared/public-content/publication/publication.service";

const objectId = (id: string, label = "community") => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(`Invalid ${label} ID`, 400, "INVALID_ID");
  return new mongoose.Types.ObjectId(id);
};

const findCommunity = async (id: string, session?: mongoose.ClientSession) => {
  const community = await Community.findById(objectId(id)).session(session ?? null);
  if (!community) throw new AppError("Community not found", 404, "NOT_FOUND");
  return community;
};

const requireActiveCommunity = async (id: string) => {
  const community = await Community.findOne({
    _id: objectId(id), status: "active", "moderation.status": MODERATION_STATUS.APPROVED,
  });
  if (!community) throw new AppError("Community not found", 404, "NOT_FOUND");
  return community;
};

export const requireMembership = async (communityId: string, userId: string) => {
  await requireActiveCommunity(communityId);
  const membership = await CommunityMembership.findOne({ communityId: objectId(communityId), userId: objectId(userId, "user"), status: "active" });
  if (!membership) throw new AppError("Active Community membership required", 403, "MEMBERSHIP_REQUIRED");
  return membership;
};

export const requireManager = async (communityId: string, userId: string, ownerOnly = false) => {
  const community = await findCommunity(communityId);
  if (community.status !== "active") throw new AppError("Community is unavailable", 403, "COMMUNITY_UNAVAILABLE");
  const membership = await CommunityMembership.findOne({ communityId: community._id, userId: objectId(userId, "user"), status: "active" });
  if (!membership || (ownerOnly ? membership.role !== "owner" : !["owner", "admin"].includes(membership.role))) {
    throw new AppError("Community management permission required", 403, "FORBIDDEN");
  }
  return { community, membership };
};

export const createCommunity = async (input: unknown, ownerId: string) => {
  const data = CreateCommunityRequestSchema.parse(input);
  const owner = objectId(ownerId, "user");
  const slug = await generateUniqueSlug({ model: Community, value: data.name });
  const session = await mongoose.startSession();
  let result: ICommunity | undefined;
  try {
    await session.withTransaction(async () => {
      const [community] = await Community.create([{
        ...data, slug, owner, memberCount: 1, status: "active", moderation: { status: MODERATION_STATUS.PENDING },
      }], { session });
      await CommunityMembership.create([{
        communityId: community._id, userId: owner, role: "owner", status: "active", joinedAt: new Date(),
      }], { session });
      result = community;
    });
  } finally {
    await session.endSession();
  }
  if (!result) throw new AppError("Community creation failed", 500, "CREATE_FAILED");
  return OwnerCommunitySchema.parse(toOwnerCommunity(result));
};

export const getMyCommunities = async (userId: string) => {
  const user = objectId(userId, "user");
  const memberships = await CommunityMembership.find({ userId: user, status: { $in: ["active", "pending"] } }).sort({ updatedAt: -1 });
  if (!memberships.length) return [];
  const communities = await Community.find({ _id: { $in: memberships.map(({ communityId }) => communityId) } }).sort({ updatedAt: -1 });
  const membershipByCommunity = new Map(memberships.map((membership) => [String(membership.communityId), membership]));
  return communities.map((community) => {
    const membership = membershipByCommunity.get(String(community._id))!;
    return MyCommunitySchema.parse({
      ...toPublicCommunity(community),
      membershipRole: membership.role,
      membershipStatus: membership.status,
    });
  });
};

export const getOwnerCommunity = async (communityId: string, userId: string) => {
  const { community } = await requireManager(communityId, userId);
  return OwnerCommunitySchema.parse(toOwnerCommunity(community));
};

export const updateCommunity = async (communityId: string, userId: string, input: unknown) => {
  const data = UpdateCommunityRequestSchema.parse(input);
  const { community } = await requireManager(communityId, userId);
  const { images, contact, ...scalars } = data;
  Object.assign(community, scalars);
  if (images) community.images = { ...community.images, ...images, gallery: images.gallery ?? community.images.gallery };
  if (contact) community.contact = { ...community.contact, ...contact };
  await community.save();
  return OwnerCommunitySchema.parse(toOwnerCommunity(community));
};

export const getPublicCommunity = async (slug: string) => {
  const publication = await Publication.findOne({ slug, entityType: PUBLIC_CONTENT_TYPES.COMMUNITY, status: PUBLICATION_STATUS.PUBLISHED });
  const community = publication
    ? await Community.findOne({ _id: publication.entityId, status: "active", "moderation.status": MODERATION_STATUS.APPROVED })
    : null;
  if (!community) throw new AppError("Community not found", 404, "NOT_FOUND");
  return PublicCommunitySchema.parse({ ...toPublicCommunity(community), slug: publication!.slug });
};

export const discoverCommunities = async ({ cityId, interest, cursor, limit = 20 }: { cityId?: string; interest?: string; cursor?: string; limit?: number }) => {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const publications = await Publication.find({ entityType: PUBLIC_CONTENT_TYPES.COMMUNITY, status: PUBLICATION_STATUS.PUBLISHED })
    .select("entityId slug").lean();
  const publicationByCommunity = new Map(publications.map(({ entityId, slug }) => [entityId, slug]));
  if (!publications.length) return { items: [], nextCursor: undefined };
  const publishedEntityIds = publications.map(({ entityId }) => entityId);
  const query: Record<string, unknown> = { _id: { $in: publishedEntityIds }, status: "active", "moderation.status": MODERATION_STATUS.APPROVED };
  if (cityId) query.cityId = cityId;
  if (interest) query.interests = interest;
  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) throw new AppError("Invalid Community cursor", 400, "INVALID_CURSOR");
    query._id = { $in: publishedEntityIds, $lt: objectId(cursor) };
  }
  const communities = await Community.find(query).sort({ _id: -1 }).limit(safeLimit + 1);
  const hasMore = communities.length > safeLimit;
  const items = communities.slice(0, safeLimit).map((community) => PublicCommunitySchema.parse({
    ...toPublicCommunity(community), slug: publicationByCommunity.get(String(community._id)) ?? community.slug,
  }));
  return { items, nextCursor: hasMore ? items.at(-1)?.id : undefined };
};

export const getMembershipStatus = async (communityId: string, userId: string) => {
  await requireActiveCommunity(communityId);
  const membership = await CommunityMembership.findOne({ communityId: objectId(communityId), userId: objectId(userId, "user") });
  return { communityId, status: membership?.status ?? "none" as const, role: membership?.status === "active" ? membership.role : undefined };
};

export const requestMembership = async (communityId: string, userId: string) => {
  const community = await requireActiveCommunity(communityId);
  const user = objectId(userId, "user");
  const existing = await CommunityMembership.findOne({ communityId: community._id, userId: user });
  if (existing?.status === "banned") throw new AppError("Membership is blocked", 403, "MEMBERSHIP_BANNED");
  if (existing?.status === "active" || existing?.status === "pending") return getMembershipStatus(communityId, userId);
  const status = community.membershipPolicy === "open" ? "active" : "pending";
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (existing) {
        const result = await CommunityMembership.updateOne(
          { _id: existing._id, status: existing.status },
          { $set: { status, role: "member", joinedAt: status === "active" ? new Date() : undefined, reviewedBy: undefined, reviewedAt: undefined } },
          { session },
        );
        if (!result.modifiedCount) throw new AppError("Membership changed concurrently; retry", 409, "MEMBERSHIP_CONFLICT");
      } else {
        await CommunityMembership.create([{ communityId: community._id, userId: user, role: "member", status, ...(status === "active" ? { joinedAt: new Date() } : {}) }], { session });
      }
      if (status === "active") await Community.updateOne({ _id: community._id }, { $inc: { memberCount: 1 } }, { session });
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  } finally {
    await session.endSession();
  }
  return getMembershipStatus(communityId, userId);
};

export const cancelMembershipRequest = async (communityId: string, userId: string) => {
  const result = await CommunityMembership.deleteOne({ communityId: objectId(communityId), userId: objectId(userId, "user"), status: "pending" });
  if (!result.deletedCount) throw new AppError("Pending membership request not found", 404, "NOT_FOUND");
};

export const leaveCommunity = async (communityId: string, userId: string) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Leaving is allowed while a Community is suspended, but a blocked or
      // unapproved Community remains unavailable. Other membership/content
      // operations continue to use requireActiveCommunity above.
      const community = await Community.findOne({
        _id: objectId(communityId),
        status: { $in: ["active", "suspended"] },
        "moderation.status": MODERATION_STATUS.APPROVED,
      }).session(session);
      if (!community) throw new AppError("Community not found", 404, "NOT_FOUND");
      const membership = await CommunityMembership.findOne({ communityId: community._id, userId: objectId(userId, "user"), status: "active" }).session(session);
      if (!membership) throw new AppError("Active membership not found", 404, "NOT_FOUND");
      if (membership.role === "owner") throw new AppError("Transfer ownership before leaving", 409, "OWNER_CANNOT_LEAVE");
      await CommunityMembership.deleteOne({ _id: membership._id, status: "active" }, { session });
      community.memberCount = await CommunityMembership.countDocuments({ communityId: community._id, status: "active" }).session(session);
      await community.save({ session });
    });
  } finally {
    await session.endSession();
  }
};

export const listMembershipRequests = async (communityId: string, userId: string) => {
  const { community } = await requireManager(communityId, userId);
  const memberships = await CommunityMembership.find({ communityId: community._id, status: "pending" }).sort({ createdAt: 1 }).populate("userId", "name profileImage");
  return memberships.map((membership) => {
    const user = membership.userId as unknown as { _id: mongoose.Types.ObjectId; name?: string; profileImage?: string };
    return ManagedCommunityMemberSchema.parse({
      userId: String(user._id), name: user.name ?? "Community member",
      ...(user.profileImage ? { profileImage: user.profileImage } : {}),
      role: membership.role, status: membership.status,
      ...(membership.joinedAt ? { joinedAt: membership.joinedAt.toISOString() } : {}),
    });
  });
};

export const listManagedMembers = async (communityId: string, userId: string) => {
  const { community } = await requireManager(communityId, userId);
  const memberships = await CommunityMembership.find({ communityId: community._id, status: { $in: ["active", "banned"] } })
    .select("role status joinedAt userId")
    .populate("userId", "name profileImage");
  return memberships.map((membership) => {
    const user = membership.userId as unknown as { _id: mongoose.Types.ObjectId; name?: string; profileImage?: string };
    return ManagedCommunityMemberSchema.parse({
      userId: String(user._id), name: user.name ?? "Community member",
      ...(user.profileImage ? { profileImage: user.profileImage } : {}),
      role: membership.role, status: membership.status,
      ...(membership.joinedAt ? { joinedAt: membership.joinedAt.toISOString() } : {}),
    });
  });
};

const notifyMembershipDecision = async (membership: ICommunityMembership, type: "membership_approved" | "membership_rejected", session: mongoose.ClientSession) => {
  await CommunityNotification.updateOne(
    { userId: membership.userId, eventKey: `membership:${membership._id}:${type}` },
    { $setOnInsert: { userId: membership.userId, communityId: membership.communityId, type, eventKey: `membership:${membership._id}:${type}` } },
    { upsert: true, session },
  );
};

export const applyMembershipAction = async (communityId: string, actorId: string, memberId: string, action: string) => {
  const session = await mongoose.startSession();
  let result: ICommunityMembership | { removed: true } | undefined;
  try {
    await session.withTransaction(async () => {
      const community = await Community.findById(objectId(communityId)).session(session);
      if (!community || community.status !== "active") throw new AppError("Community is unavailable", 404, "NOT_FOUND");
      const actor = await CommunityMembership.findOne({ communityId: community._id, userId: objectId(actorId, "user"), status: "active" }).session(session);
      if (!actor || !["owner", "admin"].includes(actor.role)) throw new AppError("Community management permission required", 403, "FORBIDDEN");
      const target = await CommunityMembership.findOne({ communityId: community._id, userId: objectId(memberId, "user") }).session(session);
      if (!target) throw new AppError("Membership not found", 404, "NOT_FOUND");
      if (target.role === "owner") throw new AppError("Owner membership is protected", 409, "OWNER_PROTECTED");
      if (String(target.userId) === actorId) throw new AppError("Cannot manage your own membership", 403, "SELF_MEMBERSHIP_ACTION");
      if (["assign_admin", "revoke_admin"].includes(action) && actor.role !== "owner") throw new AppError("Only the Owner can manage Admin roles", 403, "OWNER_REQUIRED");
      if (["remove", "ban"].includes(action) && actor.role !== "owner" && target.role === "admin") throw new AppError("Admins cannot remove other Admins", 403, "FORBIDDEN");

      if (action === "approve" || action === "reject") {
        if (target.status !== "pending") throw new AppError("Only pending requests can be reviewed", 409, "INVALID_MEMBERSHIP_STATE");
        target.status = action === "approve" ? "active" : "rejected";
        target.reviewedBy = objectId(actorId, "user");
        target.reviewedAt = new Date();
        if (action === "approve") target.joinedAt = new Date();
        await target.save({ session });
        await notifyMembershipDecision(target, action === "approve" ? "membership_approved" : "membership_rejected", session);
      } else if (action === "remove" || action === "ban") {
        if (action === "remove") {
          await CommunityMembership.deleteOne({ _id: target._id }, { session });
          result = { removed: true };
        } else {
          target.status = "banned";
          target.role = "member";
          await target.save({ session });
          result = target;
        }
      } else if (action === "unban") {
        if (target.status !== "banned") throw new AppError("Membership is not banned", 409, "INVALID_MEMBERSHIP_STATE");
        target.status = "rejected";
        await target.save({ session });
        result = target;
      } else if (action === "assign_admin" || action === "revoke_admin") {
        if (target.status !== "active") throw new AppError("Only active members can receive roles", 409, "INVALID_MEMBERSHIP_STATE");
        target.role = action === "assign_admin" ? "admin" : "member";
        await target.save({ session });
        result = target;
      } else {
        throw new AppError("Unsupported membership action", 400, "VALIDATION_ERROR");
      }
      if (action === "approve" || action === "reject") result = target;
      community.memberCount = await CommunityMembership.countDocuments({ communityId: community._id, status: "active" }).session(session);
      await community.save({ session });
    });
  } finally {
    await session.endSession();
  }
  if (!result) throw new AppError("Membership action failed", 500, "MEMBERSHIP_ACTION_FAILED");
  if ("removed" in result) return result;
  return CommunityMembershipSchema.parse({
    id: String(result._id), communityId: String(result.communityId), userId: String(result.userId),
    role: result.role, status: result.status,
    ...(result.joinedAt ? { joinedAt: result.joinedAt.toISOString() } : {}),
  });
};

export const moderateCommunity = async (communityId: string, action: "approve" | "reject" | "suspend" | "block" | "restore", adminId: string, reason?: string) => {
  const community = await findCommunity(communityId);
  if (action === "approve") {
    community.moderation.status = MODERATION_STATUS.APPROVED;
    community.moderation.reviewedBy = objectId(adminId, "admin");
    community.moderation.reviewedAt = new Date();
    community.moderation.rejectionComment = undefined;
    community.status = "active";
  } else if (action === "reject") {
    community.moderation.status = MODERATION_STATUS.REJECTED;
    community.moderation.reviewedBy = objectId(adminId, "admin");
    community.moderation.reviewedAt = new Date();
    community.moderation.rejectionComment = reason?.slice(0, 1000) || "Rejected by platform moderation";
  } else if (action === "restore") {
    if (community.moderation.status !== MODERATION_STATUS.APPROVED || community.status === "blocked") throw new AppError("Only suspended approved Communities can be restored", 409, "INVALID_MODERATION_STATE");
    community.status = "active";
  } else {
    if (community.moderation.status !== MODERATION_STATUS.APPROVED) throw new AppError("Only approved Communities can be suspended", 409, "INVALID_MODERATION_STATE");
    community.status = action === "suspend" ? "suspended" : "blocked";
  }
  await community.save();
  if (action === "approve" || action === "restore") {
    try {
      const entityId = String(community._id);
      const existing = await Publication.findOne({ entityType: PUBLIC_CONTENT_TYPES.COMMUNITY, entityId });
      const publication = existing ?? await createPublication({
        entityType: PUBLIC_CONTENT_TYPES.COMMUNITY,
        entityId,
        title: community.name,
        slug: community.slug,
        slugContext: "community",
        seoTitle: community.name,
        seoDescription: community.description,
      });
      if (publication.status !== PUBLICATION_STATUS.PUBLISHED) await publish(String(publication._id));
    } catch (error) {
      if (action === "approve") {
        community.moderation.status = MODERATION_STATUS.PENDING;
        community.moderation.reviewedBy = undefined;
        community.moderation.reviewedAt = undefined;
      } else {
        community.status = "suspended";
      }
      await community.save();
      throw error;
    }
  } else {
    const publication = await Publication.findOne({ entityType: PUBLIC_CONTENT_TYPES.COMMUNITY, entityId: String(community._id) });
    if (publication?.status === PUBLICATION_STATUS.PUBLISHED) await unpublish(String(publication._id));
  }
  return OwnerCommunitySchema.parse(toOwnerCommunity(community));
};

export const listPendingCommunities = async () => {
  const items = await Community.find({ "moderation.status": MODERATION_STATUS.PENDING }).sort({ createdAt: 1 });
  return items.map((community) => OwnerCommunitySchema.parse(toOwnerCommunity(community)));
};

export const listCommunitiesForAdmin = async () => {
  const items = await Community.find({}).sort({ createdAt: -1 });
  return items.map((community) => OwnerCommunitySchema.parse(toOwnerCommunity(community)));
};
