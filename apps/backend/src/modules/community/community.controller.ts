import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../shared/errors/AppError";
import { z } from "zod";
import { MembershipActionSchema } from "@ndrs92/contracts";
import * as service from "./community.service";
import * as forum from "./community.forum.service";

const userId = (req: Request) => {
  const id = (req as Request & { user?: { id?: string } }).user?.id;
  if (!id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  return id;
};
const idParam = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};
const communityReportActionSchema = z.object({ status: z.enum(["resolved", "dismissed"]), resolutionNote: z.string().max(1000).optional() }).strict();
const communityContentActionSchema = z.object({ targetType: z.enum(["post", "comment"]), targetId: z.string().min(1), status: z.enum(["hidden", "removed"]) }).strict();
const communityDiscoveryQuerySchema = z.object({
  cityId: z.string().trim().min(1).optional(),
  interest: z.string().trim().min(1).optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const create = catchAsync(async (req: Request, res: Response) => {
  const data = await service.createCommunity(req.body, userId(req));
  res.status(201).json({ success: true, data });
});
export const mine = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.getMyCommunities(userId(req)) }));
export const owner = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.getOwnerCommunity(idParam(req, "communityId"), userId(req)) }));
export const update = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.updateCommunity(idParam(req, "communityId"), userId(req), req.body) }));
export const publicBySlug = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.getPublicCommunity(idParam(req, "slug")) }));
export const discover = catchAsync(async (req: Request, res: Response) => {
  const query = communityDiscoveryQuerySchema.parse(req.query);
  const data = await service.discoverCommunities(query);
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.json({ success: true, data });
});
export const membershipStatus = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.getMembershipStatus(idParam(req, "communityId"), userId(req)) }));
export const join = catchAsync(async (req: Request, res: Response) => res.status(200).json({ success: true, data: await service.requestMembership(idParam(req, "communityId"), userId(req)) }));
export const cancelRequest = catchAsync(async (req: Request, res: Response) => { await service.cancelMembershipRequest(idParam(req, "communityId"), userId(req)); res.json({ success: true }); });
export const leave = catchAsync(async (req: Request, res: Response) => { await service.leaveCommunity(idParam(req, "communityId"), userId(req)); res.json({ success: true }); });
export const pendingMemberships = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.listMembershipRequests(idParam(req, "communityId"), userId(req)) }));
export const managedMembers = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.listManagedMembers(idParam(req, "communityId"), userId(req)) }));
export const membershipAction = catchAsync(async (req: Request, res: Response) => {
  const { action } = MembershipActionSchema.parse(req.body);
  res.json({ success: true, data: await service.applyMembershipAction(idParam(req, "communityId"), userId(req), idParam(req, "userId"), action) });
});
export const listPosts = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await forum.listCommunityPosts(idParam(req, "communityId"), userId(req), req.query.cursor as string, Number(req.query.limit) || 20) }));
export const createPost = catchAsync(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await forum.createCommunityPost(idParam(req, "communityId"), userId(req), req.body) }));
export const updatePost = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await forum.updateCommunityPost(idParam(req, "communityId"), idParam(req, "postId"), userId(req), req.body) }));
export const deletePost = catchAsync(async (req: Request, res: Response) => { await forum.removeCommunityPost(idParam(req, "communityId"), idParam(req, "postId"), userId(req)); res.json({ success: true }); });
export const listComments = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await forum.listPostComments(idParam(req, "communityId"), idParam(req, "postId"), userId(req), req.query.cursor as string, Number(req.query.limit) || 50) }));
export const createComment = catchAsync(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await forum.createCommunityComment(idParam(req, "communityId"), idParam(req, "postId"), userId(req), req.body) }));
export const reportContent = catchAsync(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await forum.reportCommunityContent(idParam(req, "communityId"), userId(req), req.body) }));
export const listCommunityReports = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await forum.listCommunityContentReports(idParam(req, "communityId"), userId(req)) }));
export const resolveCommunityReport = catchAsync(async (req: Request, res: Response) => {
  const body = communityReportActionSchema.parse(req.body);
  res.json({ success: true, data: await forum.resolveCommunityContentReport(idParam(req, "communityId"), idParam(req, "reportId"), userId(req), body.status, body.resolutionNote) });
});
export const moderateCommunityContent = catchAsync(async (req: Request, res: Response) => {
  const body = communityContentActionSchema.parse(req.body);
  res.json({ success: true, data: await forum.moderateCommunityContent(idParam(req, "communityId"), body.targetType, body.targetId, userId(req), body.status) });
});
export const listNotifications = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await forum.listNotifications(userId(req), Number(req.query.limit) || 50) }));
export const markNotificationRead = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await forum.markNotificationRead(userId(req), idParam(req, "notificationId")) }));
