import mongoose from "mongoose";
import { CommunityCommentSchema, CommunityContentReportSchema, CommunityNotificationSchema, CommunityPostSchema, CreateCommunityCommentSchema, CreateCommunityContentReportSchema, CreateCommunityPostSchema, UpdateCommunityPostSchema } from "@ndrs92/contracts";
import { AppError } from "../../shared/errors/AppError";
import { CommunityComment, CommunityContentReport, CommunityMembership, CommunityNotification, CommunityPost } from "./community.models";
import { requireManager, requireMembership } from "./community.service";

const objectId = (value: string, kind: string) => {
  if (!mongoose.Types.ObjectId.isValid(value)) throw new AppError(`Invalid ${kind} ID`, 400, "INVALID_ID");
  return new mongoose.Types.ObjectId(value);
};

const toAuthor = (populated: unknown, fallbackId: unknown) => {
  const value = populated as { _id?: unknown; name?: string; profileImage?: string } | null;
  if (!value || typeof value !== "object") return { id: String(fallbackId), name: "Community member" };
  return {
    id: String(value._id ?? fallbackId),
    name: value.name ?? "Community member",
    ...(value.profileImage ? { profileImage: value.profileImage } : {}),
  };
};

type PopulatedContentAuthor = { _id?: unknown; name?: string; profileImage?: string };
type ContentDocument = {
  _id: unknown; communityId: unknown; postId?: unknown; authorId: unknown; type?: "post" | "announcement";
  text: string; images?: string[]; createdAt: Date; updatedAt: Date;
};

const postDto = (post: ContentDocument) => CommunityPostSchema.parse({
  id: String(post._id), communityId: String(post.communityId), authorId: String((post.authorId as PopulatedContentAuthor)?._id ?? post.authorId),
  author: toAuthor(post.authorId, (post.authorId as PopulatedContentAuthor)?._id ?? post.authorId), type: post.type, text: post.text,
  images: post.images ?? [], createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString(),
});
const commentDto = (comment: ContentDocument) => CommunityCommentSchema.parse({
  id: String(comment._id), communityId: String(comment.communityId), postId: String(comment.postId),
  authorId: String((comment.authorId as PopulatedContentAuthor)?._id ?? comment.authorId), author: toAuthor(comment.authorId, (comment.authorId as PopulatedContentAuthor)?._id ?? comment.authorId),
  text: comment.text, createdAt: comment.createdAt.toISOString(), updatedAt: comment.updatedAt.toISOString(),
});

const sendAnnouncementNotifications = async (communityId: mongoose.Types.ObjectId, postId: mongoose.Types.ObjectId, authorId: mongoose.Types.ObjectId) => {
  const memberships = await CommunityMembership.find({ communityId, status: "active", userId: { $ne: authorId } }).select("userId").lean();
  if (!memberships.length) return;
  await CommunityNotification.bulkWrite(memberships.map(({ userId }) => ({
    updateOne: {
      filter: { userId, eventKey: `announcement:${postId}` },
      update: { $setOnInsert: { userId, communityId, type: "announcement", eventKey: `announcement:${postId}` } },
      upsert: true,
    },
  })), { ordered: false });
};

export const listCommunityPosts = async (communityId: string, userId: string, cursor?: string, limit = 20) => {
  await requireMembership(communityId, userId);
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const query: Record<string, unknown> = { communityId: objectId(communityId, "community"), status: "active" };
  if (cursor) {
    const before = await CommunityPost.findOne({ _id: objectId(cursor, "post"), communityId: objectId(communityId, "community") }).select("createdAt");
    if (!before) throw new AppError("Invalid feed cursor", 400, "INVALID_CURSOR");
    query.$or = [{ createdAt: { $lt: before.createdAt } }, { createdAt: before.createdAt, _id: { $lt: before._id } }];
  }
  const posts = await CommunityPost.find(query).sort({ createdAt: -1, _id: -1 }).limit(safeLimit + 1).populate("authorId", "name profileImage");
  const hasMore = posts.length > safeLimit;
  const items = posts.slice(0, safeLimit).map((post) => postDto(post as unknown as ContentDocument));
  return { items, nextCursor: hasMore ? items.at(-1)?.id : undefined };
};

export const createCommunityPost = async (communityId: string, userId: string, input: unknown) => {
  const data = CreateCommunityPostSchema.parse(input);
  const membership = await requireMembership(communityId, userId);
  if (data.type === "announcement" && !["owner", "admin"].includes(membership.role)) {
    throw new AppError("Only Community Owner/Admin can publish announcements", 403, "FORBIDDEN");
  }
  const [post] = await CommunityPost.create([{
    communityId: objectId(communityId, "community"), authorId: objectId(userId, "user"), ...data, status: "active",
  }]);
  if (post.type === "announcement") {
    try {
      await sendAnnouncementNotifications(post.communityId, post._id, post.authorId);
    } catch (error) {
      console.error("Community announcement notification dispatch failed", error);
    }
  }
  const populated = await CommunityPost.findById(post._id).populate("authorId", "name profileImage");
  return postDto(populated as unknown as ContentDocument);
};

export const updateCommunityPost = async (communityId: string, postId: string, userId: string, input: unknown) => {
  const data = UpdateCommunityPostSchema.parse(input);
  const membership = await requireMembership(communityId, userId);
  const post = await CommunityPost.findOne({ _id: objectId(postId, "post"), communityId: objectId(communityId, "community"), status: "active" });
  if (!post) throw new AppError("Post not found", 404, "NOT_FOUND");
  if (String(post.authorId) !== userId && !["owner", "admin"].includes(membership.role)) throw new AppError("Cannot modify this post", 403, "FORBIDDEN");
  if (data.type === "announcement" && !["owner", "admin"].includes(membership.role)) throw new AppError("Only Community Owner/Admin can publish announcements", 403, "FORBIDDEN");
  Object.assign(post, data);
  await post.save();
  const populated = await CommunityPost.findById(post._id).populate("authorId", "name profileImage");
  return postDto(populated as unknown as ContentDocument);
};

export const removeCommunityPost = async (communityId: string, postId: string, userId: string) => {
  const membership = await requireMembership(communityId, userId);
  const post = await CommunityPost.findOne({ _id: objectId(postId, "post"), communityId: objectId(communityId, "community"), status: "active" });
  if (!post) throw new AppError("Post not found", 404, "NOT_FOUND");
  if (String(post.authorId) !== userId && !["owner", "admin"].includes(membership.role)) throw new AppError("Cannot delete this post", 403, "FORBIDDEN");
  post.status = "removed";
  await post.save();
};

export const listPostComments = async (communityId: string, postId: string, userId: string, cursor?: string, limit = 50) => {
  await requireMembership(communityId, userId);
  const community = objectId(communityId, "community");
  const post = await CommunityPost.findOne({ _id: objectId(postId, "post"), communityId: community, status: "active" });
  if (!post) throw new AppError("Post not found", 404, "NOT_FOUND");
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const query: Record<string, unknown> = { communityId: community, postId: post._id, status: "active" };
  if (cursor) query._id = { $gt: objectId(cursor, "comment") };
  const comments = await CommunityComment.find(query).sort({ createdAt: 1, _id: 1 }).limit(safeLimit + 1).populate("authorId", "name profileImage");
  const hasMore = comments.length > safeLimit;
  const items = comments.slice(0, safeLimit).map((comment) => commentDto(comment as unknown as ContentDocument));
  return { items, nextCursor: hasMore ? items.at(-1)?.id : undefined };
};

export const createCommunityComment = async (communityId: string, postId: string, userId: string, input: unknown) => {
  const data = CreateCommunityCommentSchema.parse(input);
  await requireMembership(communityId, userId);
  const community = objectId(communityId, "community");
  const post = await CommunityPost.findOne({ _id: objectId(postId, "post"), communityId: community, status: "active" });
  if (!post) throw new AppError("Post not found", 404, "NOT_FOUND");
  const [comment] = await CommunityComment.create([{
    communityId: community, postId: post._id, authorId: objectId(userId, "user"), ...data, status: "active",
  }]);
  const populated = await CommunityComment.findById(comment._id).populate("authorId", "name profileImage");
  return commentDto(populated as unknown as ContentDocument);
};

export const reportCommunityContent = async (communityId: string, reporterId: string, input: unknown) => {
  const data = CreateCommunityContentReportSchema.parse(input);
  await requireMembership(communityId, reporterId);
  const community = objectId(communityId, "community");
  const target = data.targetType === "post"
    ? await CommunityPost.exists({ _id: objectId(data.targetId, "content"), communityId: community, status: "active" })
    : await CommunityComment.exists({ _id: objectId(data.targetId, "content"), communityId: community, status: "active" });
  if (!target) throw new AppError("Content not found", 404, "NOT_FOUND");
  const report = await CommunityContentReport.findOneAndUpdate(
    { reporterId: objectId(reporterId, "user"), targetType: data.targetType, targetId: objectId(data.targetId, "content") },
    { $setOnInsert: { communityId: community, reporterId: objectId(reporterId, "user"), ...data, targetId: objectId(data.targetId, "content"), status: "pending" } },
    { upsert: true, new: true },
  );
  return CommunityContentReportSchema.parse({
    id: String(report!._id), communityId: String(report!.communityId), targetType: report!.targetType,
    targetId: String(report!.targetId), reason: report!.reason, status: report!.status,
    createdAt: report!.createdAt.toISOString(),
  });
};

export const listCommunityContentReports = async (communityId: string, actorId: string) => {
  const { community } = await requireManager(communityId, actorId);
  const reports = await CommunityContentReport.find({ communityId: community._id, status: "pending" }).sort({ createdAt: 1 });
  return reports.map(reportDto);
};

export const resolveCommunityContentReport = async (communityId: string, reportId: string, actorId: string, status: "resolved" | "dismissed", resolutionNote?: string) => {
  const { community } = await requireManager(communityId, actorId);
  const report = await CommunityContentReport.findOneAndUpdate(
    { _id: objectId(reportId, "report"), communityId: community._id, status: "pending" },
    { $set: { status, resolvedBy: objectId(actorId, "user"), resolutionNote: resolutionNote?.slice(0, 1000) } },
    { new: true },
  );
  if (!report) throw new AppError("Pending report not found", 404, "NOT_FOUND");
  return reportDto(report);
};

export const moderateCommunityContent = async (communityId: string, targetType: "post" | "comment", targetId: string, actorId: string, status: "hidden" | "removed") => {
  const { community } = await requireManager(communityId, actorId);
  const filter = { _id: objectId(targetId, "content"), communityId: community._id, status: "active" as const };
  const content = targetType === "post"
    ? await CommunityPost.findOne(filter)
    : await CommunityComment.findOne(filter);
  if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
  content.status = status;
  await content.save();
  return { id: String(content._id), status };
};

const reportDto = (report: InstanceType<typeof CommunityContentReport>) => CommunityContentReportSchema.parse({
  id: String(report._id), communityId: String(report.communityId), targetType: report.targetType,
  targetId: String(report.targetId), reason: report.reason, status: report.status,
  createdAt: report.createdAt.toISOString(),
});
export const listPendingContentReports = async () => (await CommunityContentReport.find({ status: "pending" }).sort({ createdAt: 1 })).map(reportDto);

export const resolveContentReport = async (reportId: string, adminId: string, status: "resolved" | "dismissed", resolutionNote?: string) => {
  const report = await CommunityContentReport.findOneAndUpdate(
    { _id: objectId(reportId, "report"), status: "pending" },
    { $set: { status, resolvedBy: objectId(adminId, "admin"), resolutionNote: resolutionNote?.slice(0, 1000) } },
    { new: true },
  );
  if (!report) throw new AppError("Pending report not found", 404, "NOT_FOUND");
  return reportDto(report);
};

const notificationDto = (notification: InstanceType<typeof CommunityNotification>) => CommunityNotificationSchema.parse({
  id: String(notification._id), userId: String(notification.userId), communityId: String(notification.communityId),
  type: notification.type, eventKey: notification.eventKey,
  ...(notification.readAt ? { readAt: notification.readAt.toISOString() } : {}), createdAt: notification.createdAt.toISOString(),
});
export const listNotifications = async (userId: string, limit = 50) => (await CommunityNotification.find({ userId: objectId(userId, "user") }).sort({ createdAt: -1 }).limit(Math.max(1, Math.min(100, limit)))).map(notificationDto);

export const markNotificationRead = async (userId: string, notificationId: string) => {
  const notification = await CommunityNotification.findOneAndUpdate(
    { _id: objectId(notificationId, "notification"), userId: objectId(userId, "user") },
    { $set: { readAt: new Date() } }, { new: true },
  );
  if (!notification) throw new AppError("Notification not found", 404, "NOT_FOUND");
  return notificationDto(notification);
};

export const notifyCommunityEventPublished = async (communityId: string, eventId: string) => {
  const memberships = await CommunityMembership.find({ communityId: objectId(communityId, "community"), status: "active" }).select("userId").lean();
  if (!memberships.length) return;
  const community = objectId(communityId, "community");
  await CommunityNotification.bulkWrite(memberships.map(({ userId }) => ({
    updateOne: {
      filter: { userId, eventKey: `event-published:${eventId}` },
      update: { $setOnInsert: { userId, communityId: community, type: "event_published", eventKey: `event-published:${eventId}` } },
      upsert: true,
    },
  })), { ordered: false });
};
