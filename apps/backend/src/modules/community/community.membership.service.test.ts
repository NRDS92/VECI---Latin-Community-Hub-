import mongoose from "mongoose";
import { Community, CommunityMembership } from "./community.models";
import { leaveCommunity, requestMembership, requireMembership } from "./community.service";

jest.mock("./community.models", () => ({
  Community: { findOne: jest.fn() },
  CommunityMembership: { findOne: jest.fn(), deleteOne: jest.fn(), countDocuments: jest.fn() },
  CommunityPost: {}, CommunityComment: {}, CommunityNotification: {}, CommunityContentReport: {},
}));
jest.mock("../../shared/slug/slug.service", () => ({ generateUniqueSlug: jest.fn() }));
jest.mock("../../shared/public-content/publication/publication.model", () => ({ Publication: {} }));
jest.mock("../../shared/public-content/publication/publication.service", () => ({ createPublication: jest.fn(), publish: jest.fn(), unpublish: jest.fn() }));

const communityId = "507f1f77bcf86cd799439011";
const memberId = "507f1f77bcf86cd799439012";
const ownerId = "507f1f77bcf86cd799439013";

const setupSession = () => {
  const session = {
    withTransaction: jest.fn(async (callback: () => Promise<void>) => callback()),
    endSession: jest.fn().mockResolvedValue(undefined),
  } as unknown as mongoose.ClientSession;
  jest.spyOn(mongoose, "startSession").mockResolvedValue(session);
  return session;
};

const setupSuspendedCommunity = (role: "member" | "owner" = "member") => {
  const community = { _id: new mongoose.Types.ObjectId(communityId), status: "suspended", memberCount: 2, save: jest.fn().mockResolvedValue(undefined) };
  const membership = { _id: new mongoose.Types.ObjectId(memberId), role, status: "active" };
  const query = { session: jest.fn().mockResolvedValue(community) };
  (Community.findOne as jest.Mock).mockReturnValue(query);
  (CommunityMembership.findOne as jest.Mock).mockReturnValue({ session: jest.fn().mockResolvedValue(membership) });
  (CommunityMembership.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
  (CommunityMembership.countDocuments as jest.Mock).mockReturnValue({ session: jest.fn().mockResolvedValue(1) });
  return { community, membership, query };
};

describe("Community membership behavior while suspended", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("allows an active member to leave a suspended Community and recounts active members", async () => {
    const { community, membership, query } = setupSuspendedCommunity();
    const session = setupSession();

    await expect(leaveCommunity(communityId, memberId)).resolves.toBeUndefined();

    expect(query.session).toHaveBeenCalledWith(session);
    expect(Community.findOne).toHaveBeenCalledWith(expect.objectContaining({
      _id: expect.any(mongoose.Types.ObjectId),
      status: { $in: ["active", "suspended"] },
      "moderation.status": "APPROVED",
    }));
    expect(CommunityMembership.findOne).toHaveBeenCalledWith(expect.objectContaining({ userId: expect.any(mongoose.Types.ObjectId), status: "active" }));
    expect(CommunityMembership.deleteOne).toHaveBeenCalledWith({ _id: membership._id, status: "active" }, { session });
    expect(CommunityMembership.countDocuments).toHaveBeenCalledWith({ communityId: community._id, status: "active" });
    expect(community.memberCount).toBe(1);
    expect(community.save).toHaveBeenCalledWith({ session });
    expect(session.endSession).toHaveBeenCalled();
  });

  it("does not let a non-member leave or mutate the count", async () => {
    setupSession();
    const query = { session: jest.fn().mockResolvedValue({ _id: new mongoose.Types.ObjectId(communityId), status: "suspended" }) };
    (Community.findOne as jest.Mock).mockReturnValue(query);
    (CommunityMembership.findOne as jest.Mock).mockReturnValue({ session: jest.fn().mockResolvedValue(null) });

    await expect(leaveCommunity(communityId, memberId)).rejects.toMatchObject({ statusCode: 404 });
    expect(CommunityMembership.deleteOne).not.toHaveBeenCalled();
    expect(CommunityMembership.countDocuments).not.toHaveBeenCalled();
  });

  it("preserves the owner safeguard even while suspended", async () => {
    setupSuspendedCommunity("owner");
    setupSession();

    await expect(leaveCommunity(communityId, ownerId)).rejects.toMatchObject({ statusCode: 409, code: "OWNER_CANNOT_LEAVE" });
    expect(CommunityMembership.deleteOne).not.toHaveBeenCalled();
    expect(CommunityMembership.countDocuments).not.toHaveBeenCalled();
  });

  it("rejects new joins to a suspended Community", async () => {
    (Community.findOne as jest.Mock).mockResolvedValue(null);

    await expect(requestMembership(communityId, memberId)).rejects.toMatchObject({ statusCode: 404 });
    expect(CommunityMembership.findOne).not.toHaveBeenCalled();
  });

  it("rejects forum membership access to a suspended Community", async () => {
    (Community.findOne as jest.Mock).mockResolvedValue(null);

    await expect(requireMembership(communityId, memberId)).rejects.toMatchObject({ statusCode: 404 });
    expect(CommunityMembership.findOne).not.toHaveBeenCalled();
  });
});
