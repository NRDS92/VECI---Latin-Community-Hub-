import { z } from "zod";

const CommunityImagesSchema = z.object({
  profile: z.string().url().optional(),
  cover: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(12).default([]),
}).strict();

const CommunityContactSchema = z.object({
  website: z.string().url().optional(),
  instagram: z.string().max(100).optional(),
  whatsapp: z.string().max(40).optional(),
  email: z.email().optional(),
}).strict();

export const CommunityMembershipPolicySchema = z.enum(["open", "approval"]);
export const CommunityModerationStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const CommunityStatusSchema = z.enum(["active", "suspended", "blocked"]);
export const CommunityRoleSchema = z.enum(["owner", "admin", "member"]);
export const CommunityMembershipStatusSchema = z.enum(["pending", "active", "rejected", "banned"]);

export const CreateCommunityRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(5000).optional(),
  interests: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  cityId: z.string().trim().min(1).max(120),
  country: z.string().trim().min(2).max(120),
  images: CommunityImagesSchema.optional(),
  contact: CommunityContactSchema.optional(),
  membershipPolicy: CommunityMembershipPolicySchema,
}).strict();

export const UpdateCommunityRequestSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(5000).optional(),
  interests: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  cityId: z.string().trim().min(1).max(120).optional(),
  country: z.string().trim().min(2).max(120).optional(),
  images: z.object({
    profile: z.string().url().optional(),
    cover: z.string().url().optional(),
    gallery: z.array(z.string().url()).max(12).optional(),
  }).strict().optional(),
  contact: CommunityContactSchema.partial().strict().optional(),
  membershipPolicy: CommunityMembershipPolicySchema.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field must be updated");

export const PublicCommunitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  interests: z.array(z.string()),
  cityId: z.string(),
  country: z.string(),
  images: CommunityImagesSchema,
  contact: CommunityContactSchema,
  memberCount: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
}).strict();

export const OwnerCommunitySchema = PublicCommunitySchema.extend({
  ownerId: z.string(),
  membershipPolicy: CommunityMembershipPolicySchema,
  moderationStatus: CommunityModerationStatusSchema,
  moderationReason: z.string().optional(),
  status: CommunityStatusSchema,
  updatedAt: z.iso.datetime(),
}).strict();

export const MyCommunitySchema = PublicCommunitySchema.extend({
  membershipRole: CommunityRoleSchema,
  membershipStatus: CommunityMembershipStatusSchema,
}).strict();

export const CommunityMembershipSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  userId: z.string(),
  role: CommunityRoleSchema,
  status: CommunityMembershipStatusSchema,
  joinedAt: z.iso.datetime().optional(),
}).strict();

export const MembershipRequestSchema = z.object({
  communityId: z.string(),
  status: z.enum(["none", "pending", "active", "rejected", "banned"]),
  role: CommunityRoleSchema.optional(),
}).strict();

export const MembershipActionSchema = z.object({
  action: z.enum(["approve", "reject", "remove", "ban", "unban", "assign_admin", "revoke_admin"]),
}).strict();

export const MembershipActionResultSchema = z.union([
  z.object({ removed: z.literal(true) }).strict(),
  CommunityMembershipSchema,
]);

export const CommunityContentAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  profileImage: z.string().url().optional(),
}).strict();

export const ManagedCommunityMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  profileImage: z.string().url().optional(),
  role: CommunityRoleSchema,
  status: CommunityMembershipStatusSchema,
  joinedAt: z.iso.datetime().optional(),
}).strict();

export const CommunityPostSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  authorId: z.string(),
  author: CommunityContentAuthorSchema,
  type: z.enum(["post", "announcement"]),
  text: z.string(),
  images: z.array(z.string().url()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const CreateCommunityPostSchema = z.object({
  type: z.enum(["post", "announcement"]).default("post"),
  text: z.string().trim().min(1).max(10000),
  images: z.array(z.string().url()).max(8).default([]),
}).strict();

export const UpdateCommunityPostSchema = z.object({
  type: z.enum(["post", "announcement"]).optional(),
  text: z.string().trim().min(1).max(10000).optional(),
  images: z.array(z.string().url()).max(8).optional(),
}).strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field must be updated");

export const CommunityCommentSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  postId: z.string(),
  authorId: z.string(),
  author: CommunityContentAuthorSchema,
  text: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict();

export const CreateCommunityCommentSchema = z.object({
  text: z.string().trim().min(1).max(5000),
}).strict();

export const CommunityNotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  communityId: z.string(),
  type: z.enum(["membership_approved", "membership_rejected", "event_published", "announcement"]),
  eventKey: z.string(),
  readAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
}).strict();

export const CommunityContentReportSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  targetType: z.enum(["post", "comment"]),
  targetId: z.string(),
  reason: z.enum(["spam", "harassment", "hate", "sexual_content", "violence", "other"]),
  status: z.enum(["pending", "resolved", "dismissed"]),
  createdAt: z.iso.datetime(),
}).strict();

export const CreateCommunityContentReportSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().min(1),
  reason: z.enum(["spam", "harassment", "hate", "sexual_content", "violence", "other"]),
}).strict();

export const EventOrganizerSchema = z.object({
  type: z.enum(["business", "community"]),
  id: z.string().min(1),
}).strict();

export const AvailableEventOrganizerSchema = EventOrganizerSchema.extend({
  name: z.string(),
  slug: z.string(),
  image: z.string().url().optional(),
}).strict();
export const AvailableEventOrganizersResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(AvailableEventOrganizerSchema),
}).strict();

export type CreateCommunityRequest = z.input<typeof CreateCommunityRequestSchema>;
export type ParsedCreateCommunityRequest = z.output<typeof CreateCommunityRequestSchema>;
export type UpdateCommunityRequest = z.infer<typeof UpdateCommunityRequestSchema>;
export type PublicCommunity = z.infer<typeof PublicCommunitySchema>;
export type OwnerCommunity = z.infer<typeof OwnerCommunitySchema>;
export type MyCommunity = z.infer<typeof MyCommunitySchema>;
export type ManagedCommunityMember = z.infer<typeof ManagedCommunityMemberSchema>;
export type CommunityMembership = z.infer<typeof CommunityMembershipSchema>;
export type MembershipRequest = z.infer<typeof MembershipRequestSchema>;
export type MembershipAction = z.infer<typeof MembershipActionSchema>;
export type MembershipActionResult = z.infer<typeof MembershipActionResultSchema>;
export type CommunityContentAuthor = z.infer<typeof CommunityContentAuthorSchema>;
export type CommunityPost = z.infer<typeof CommunityPostSchema>;
export type CreateCommunityPost = z.input<typeof CreateCommunityPostSchema>;
export type ParsedCreateCommunityPost = z.output<typeof CreateCommunityPostSchema>;
export type UpdateCommunityPost = z.infer<typeof UpdateCommunityPostSchema>;
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;
export type CreateCommunityComment = z.infer<typeof CreateCommunityCommentSchema>;
export type CommunityNotification = z.infer<typeof CommunityNotificationSchema>;
export type CommunityContentReport = z.infer<typeof CommunityContentReportSchema>;
export type CreateCommunityContentReport = z.input<typeof CreateCommunityContentReportSchema>;
export type EventOrganizer = z.infer<typeof EventOrganizerSchema>;
export type AvailableEventOrganizer = z.infer<typeof AvailableEventOrganizerSchema>;
