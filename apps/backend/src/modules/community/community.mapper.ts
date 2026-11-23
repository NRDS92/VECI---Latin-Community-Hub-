import type { ICommunity } from "./community.models";

type CommunitySource = Pick<ICommunity,
  "_id" | "slug" | "name" | "description" | "interests" | "cityId" | "country" |
  "images" | "contact" | "memberCount" | "owner" | "membershipPolicy" | "moderation" |
  "status" | "createdAt" | "updatedAt"
>;

const commonFields = (community: CommunitySource) => ({
  id: String(community._id),
  slug: community.slug,
  name: community.name,
  ...(community.description ? { description: community.description } : {}),
  interests: community.interests ?? [],
  cityId: community.cityId,
  country: community.country,
  images: {
    ...(community.images?.profile ? { profile: community.images.profile } : {}),
    ...(community.images?.cover ? { cover: community.images.cover } : {}),
    gallery: community.images?.gallery ?? [],
  },
  contact: {
    ...(community.contact?.website ? { website: community.contact.website } : {}),
    ...(community.contact?.instagram ? { instagram: community.contact.instagram } : {}),
    ...(community.contact?.whatsapp ? { whatsapp: community.contact.whatsapp } : {}),
    ...(community.contact?.email ? { email: community.contact.email } : {}),
  },
  memberCount: community.memberCount,
  createdAt: community.createdAt.toISOString(),
});

export const toPublicCommunity = (community: CommunitySource) => commonFields(community);

export const toOwnerCommunity = (community: CommunitySource) => ({
  ...commonFields(community),
  ownerId: String(community.owner),
  membershipPolicy: community.membershipPolicy,
  moderationStatus: community.moderation.status,
  ...(community.moderation.rejectionComment ? { moderationReason: community.moderation.rejectionComment } : {}),
  status: community.status,
  updatedAt: community.updatedAt.toISOString(),
});
