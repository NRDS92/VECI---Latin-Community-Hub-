import {
  CommunityCommentSchema,
  CommunityContentReportSchema,
  CommunityNotificationSchema,
  CommunityPostSchema,
  CreateCommunityCommentSchema,
  CreateCommunityContentReportSchema,
  CreateCommunityPostSchema,
  CreateCommunityRequestSchema,
  ManagedCommunityMemberSchema,
  MembershipActionResultSchema,
  MembershipRequestSchema,
  MyCommunitySchema,
  OwnerCommunitySchema,
  PublicCommunitySchema,
  PublicEventSchema,
  UpdateCommunityRequestSchema,
  type CreateCommunityRequest,
  type CreateCommunityPost,
  type CreateCommunityComment,
  type CreateCommunityContentReport,
  type MembershipAction,
  type UpdateCommunityRequest,
} from "@ndrs92/contracts";
import { api } from "../../api/clients";

const communityPath = (id: string) => `/communities/${encodeURIComponent(id)}`;

export const discoverCommunities = async () => {
  const response = await api.get("/communities/discover");
  return response.data.data.items.map((item: unknown) => PublicCommunitySchema.parse(item));
};

export const getPublicCommunityBySlug = async (slug: string) => {
  const response = await api.get(`/communities/slug/${encodeURIComponent(slug)}`);
  return PublicCommunitySchema.parse(response.data.data);
};

export const getPublicCommunityEvents = async (communityId: string) => {
  const response = await api.get(`/public/communities/${encodeURIComponent(communityId)}/events`);
  return response.data.data.map((item: unknown) => PublicEventSchema.parse(item));
};

export const getMyCommunities = async () => {
  const response = await api.get("/communities/me");
  return response.data.data.map((item: unknown) => MyCommunitySchema.parse(item));
};

export const createCommunity = async (input: CreateCommunityRequest) => {
  const request = CreateCommunityRequestSchema.parse(input);
  const response = await api.post("/communities", request);
  return OwnerCommunitySchema.parse(response.data.data);
};

export const getOwnerCommunity = async (id: string) => {
  const response = await api.get(`${communityPath(id)}/owner`);
  return OwnerCommunitySchema.parse(response.data.data);
};

export const updateCommunity = async (id: string, input: UpdateCommunityRequest) => {
  const request = UpdateCommunityRequestSchema.parse(input);
  const response = await api.patch(communityPath(id), request);
  return OwnerCommunitySchema.parse(response.data.data);
};

export const getMembershipStatus = async (id: string) => {
  const response = await api.get(`${communityPath(id)}/membership`);
  return MembershipRequestSchema.parse(response.data.data);
};

export const requestCommunityMembership = async (id: string) => {
  const response = await api.post(`${communityPath(id)}/membership`);
  return MembershipRequestSchema.parse(response.data.data);
};

export const getMembershipRequests = async (id: string) => {
  const response = await api.get(`${communityPath(id)}/membership/requests`);
  return response.data.data.map((item: unknown) => ManagedCommunityMemberSchema.parse(item));
};

export const listCommunityPosts = async (id: string) => {
  const response = await api.get(`${communityPath(id)}/posts`);
  return response.data.data.items.map((item: unknown) => CommunityPostSchema.parse(item));
};

export const createCommunityPost = async (id: string, input: CreateCommunityPost) => {
  const request = CreateCommunityPostSchema.parse(input);
  const response = await api.post(`${communityPath(id)}/posts`, request);
  return CommunityPostSchema.parse(response.data.data);
};

export const listCommunityComments = async (communityId: string, postId: string) => {
  const response = await api.get(`${communityPath(communityId)}/posts/${encodeURIComponent(postId)}/comments`);
  return response.data.data.items.map((item: unknown) => CommunityCommentSchema.parse(item));
};

export const createCommunityComment = async (communityId: string, postId: string, input: CreateCommunityComment) => {
  const request = CreateCommunityCommentSchema.parse(input);
  const response = await api.post(`${communityPath(communityId)}/posts/${encodeURIComponent(postId)}/comments`, request);
  return CommunityCommentSchema.parse(response.data.data);
};

export const reportCommunityContent = async (communityId: string, input: CreateCommunityContentReport) => {
  const request = CreateCommunityContentReportSchema.parse(input);
  const response = await api.post(`${communityPath(communityId)}/reports`, request);
  return response.data.data;
};

export const listManagedCommunityMembers = async (id: string) => {
  const response = await api.get(`${communityPath(id)}/members`);
  return response.data.data.map((item: unknown) => ManagedCommunityMemberSchema.parse(item));
};

export const applyCommunityMembershipAction = async (communityId: string, userId: string, action: MembershipAction["action"]) => {
  const response = await api.patch(`${communityPath(communityId)}/membership/${encodeURIComponent(userId)}`, { action });
  return MembershipActionResultSchema.parse(response.data.data);
};

export const listCommunityReports = async (id: string) => {
  const response = await api.get(`${communityPath(id)}/reports`);
  return response.data.data.map((item: unknown) => CommunityContentReportSchema.parse(item));
};

export const resolveCommunityReport = async (communityId: string, reportId: string, status: "resolved" | "dismissed", resolutionNote?: string) => {
  const response = await api.patch(`${communityPath(communityId)}/reports/${encodeURIComponent(reportId)}`, { status, resolutionNote });
  return response.data.data;
};

export const moderateCommunityContent = async (communityId: string, targetType: "post" | "comment", targetId: string, status: "hidden" | "removed") => {
  const response = await api.post(`${communityPath(communityId)}/moderate-content`, { targetType, targetId, status });
  return response.data.data;
};

export const listCommunityNotifications = async () => {
  const response = await api.get("/communities/notifications");
  return response.data.data.map((item: unknown) => CommunityNotificationSchema.parse(item));
};

export const markCommunityNotificationRead = async (id: string) => {
  const response = await api.patch(`/communities/notifications/${encodeURIComponent(id)}/read`);
  return CommunityNotificationSchema.parse(response.data.data);
};
