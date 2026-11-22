import type { Request, Response } from "express";
import { z } from "zod";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../shared/errors/AppError";
import * as service from "./community.service";
import * as forum from "./community.forum.service";

const adminId = (req: Request) => {
  const id = (req as Request & { user?: { id?: string } }).user?.id;
  if (!id) throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  return id;
};
const params = (req: Request, key: string): string => {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};
const moderationBody = z.object({ reason: z.string().trim().min(3).max(1000) }).strict();
const reportBody = z.object({ status: z.enum(["resolved", "dismissed"]), resolutionNote: z.string().max(1000).optional() }).strict();
const contentBody = z.object({ targetType: z.enum(["post", "comment"]), targetId: z.string().min(1), status: z.enum(["hidden", "removed"]) }).strict();

export const pending = catchAsync(async (_req: Request, res: Response) => res.json({ success: true, data: await service.listPendingCommunities() }));
export const list = catchAsync(async (_req: Request, res: Response) => res.json({ success: true, data: await service.listCommunitiesForAdmin() }));
export const approve = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.moderateCommunity(params(req, "communityId"), "approve", adminId(req)) }));
export const reject = catchAsync(async (req: Request, res: Response) => {
  const { reason } = moderationBody.parse(req.body);
  res.json({ success: true, data: await service.moderateCommunity(params(req, "communityId"), "reject", adminId(req), reason) });
});
export const suspend = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.moderateCommunity(params(req, "communityId"), "suspend", adminId(req)) }));
export const block = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.moderateCommunity(params(req, "communityId"), "block", adminId(req)) }));
export const restore = catchAsync(async (req: Request, res: Response) => res.json({ success: true, data: await service.moderateCommunity(params(req, "communityId"), "restore", adminId(req)) }));
export const reports = catchAsync(async (_req: Request, res: Response) => res.json({ success: true, data: await forum.listPendingContentReports() }));
export const resolveReport = catchAsync(async (req: Request, res: Response) => {
  const body = reportBody.parse(req.body);
  res.json({ success: true, data: await forum.resolveContentReport(params(req, "reportId"), adminId(req), body.status, body.resolutionNote) });
});
export const moderateContent = catchAsync(async (req: Request, res: Response) => {
  const body = contentBody.parse(req.body);
  res.json({ success: true, data: await forum.moderateCommunityContent(params(req, "communityId"), body.targetType, body.targetId, adminId(req), body.status) });
});
