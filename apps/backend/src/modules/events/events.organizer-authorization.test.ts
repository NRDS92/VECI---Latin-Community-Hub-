import mongoose from "mongoose";
import { Business } from "../business/business.model";
import { Community, CommunityMembership } from "../community/community.models";
import { Event } from "./event.model";
import { createEvent } from "./events.service";
import { generateUniqueSlug } from "../../shared/slug/slug.service";

const mockEventSave = jest.fn().mockResolvedValue(undefined);

jest.mock("../business/business.model", () => ({ Business: { findById: jest.fn() } }));
jest.mock("../community/community.models", () => ({ Community: { findById: jest.fn() }, CommunityMembership: { findOne: jest.fn() } }));
jest.mock("./event.model", () => ({ Event: jest.fn().mockImplementation((input) => ({ ...input, save: mockEventSave })) }));
jest.mock("../../shared/slug/slug.service", () => ({ generateUniqueSlug: jest.fn().mockResolvedValue("event-slug") }));

const userId = "507f1f77bcf86cd799439011";
const organizerId = "507f1f77bcf86cd799439012";

const data = (organizer: { type: "business" | "community"; id: string }, eventType: "official" | "community" = "community") => ({
  title: "Community Festival",
  eventType,
  category: "culture" as const,
  cityId: "berlin",
  address: "Main Square",
  latitude: 52.52,
  longitude: 13.405,
  dateStart: "2027-06-01T12:00:00.000Z",
  organizer,
});

const approvedBusiness = (owner = userId) => ({
  _id: new mongoose.Types.ObjectId(organizerId), owner: new mongoose.Types.ObjectId(owner),
  status: "active", moderation: { status: "APPROVED" },
});
const approvedCommunity = (status = "active", moderationStatus = "APPROVED") => ({
  _id: new mongoose.Types.ObjectId(organizerId), status, moderation: { status: moderationStatus },
});

describe("Event creation organizer authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows the owner of an approved active Business to create an official Event", async () => {
    (Business.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedBusiness()) });
    await expect(createEvent(data({ type: "business", id: organizerId }, "official") as never, userId)).resolves.toMatchObject({ organizer: { type: "business" } });
    expect(generateUniqueSlug).toHaveBeenCalled();
    expect(mockEventSave).toHaveBeenCalledTimes(1);
  });

  it("rejects an approved Business when the requester is not its owner", async () => {
    (Business.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedBusiness("507f1f77bcf86cd799439099")) });
    await expect(createEvent(data({ type: "business", id: organizerId }, "official") as never, userId)).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
    expect(mockEventSave).not.toHaveBeenCalled();
  });

  it.each(["owner", "admin"] as const)("allows an approved Community %s to create a Community Event", async (role) => {
    (Community.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedCommunity()) });
    (CommunityMembership.findOne as jest.Mock).mockResolvedValue({ role, status: "active" });
    await expect(createEvent(data({ type: "community", id: organizerId }) as never, userId)).resolves.toMatchObject({ organizer: { type: "community" } });
    expect(CommunityMembership.findOne).toHaveBeenCalledWith(expect.objectContaining({ userId: expect.any(mongoose.Types.ObjectId), role: { $in: ["owner", "admin"] }, status: "active" }));
    expect(mockEventSave).toHaveBeenCalledTimes(1);
  });

  it("rejects an ordinary Community member in Backend service authorization", async () => {
    (Community.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedCommunity()) });
    // The database applies the owner/admin role predicate in this query.
    (CommunityMembership.findOne as jest.Mock).mockResolvedValue(null);
    await expect(createEvent(data({ type: "community", id: organizerId }) as never, userId)).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
    expect(CommunityMembership.findOne).toHaveBeenCalledWith(expect.objectContaining({ role: { $in: ["owner", "admin"] } }));
    expect(mockEventSave).not.toHaveBeenCalled();
  });

  it("rejects creation without an organizer and rejects unapproved or suspended organizers", async () => {
    await expect(createEvent(({ ...data({ type: "business", id: organizerId }), organizer: undefined }) as never, userId)).rejects.toMatchObject({ statusCode: 400, code: "ORGANIZER_REQUIRED" });

    (Community.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedCommunity("active", "PENDING")) });
    await expect(createEvent(data({ type: "community", id: organizerId }) as never, userId)).rejects.toMatchObject({ statusCode: 403, code: "ORGANIZER_UNAVAILABLE" });

    (Community.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedCommunity("suspended")) });
    await expect(createEvent(data({ type: "community", id: organizerId }) as never, userId)).rejects.toMatchObject({ statusCode: 403, code: "ORGANIZER_UNAVAILABLE" });
    expect(CommunityMembership.findOne).not.toHaveBeenCalled();
    expect(mockEventSave).not.toHaveBeenCalled();
  });

  it.each([
    ["active", "PENDING"],
    ["blocked", "APPROVED"],
  ])("rejects a Business organizer with status %s and moderation %s", async (status, moderationStatus) => {
    (Business.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue({
      ...approvedBusiness(), status, moderation: { status: moderationStatus },
    }) });
    await expect(createEvent(data({ type: "business", id: organizerId }, "official") as never, userId)).rejects.toMatchObject({ statusCode: 403, code: "ORGANIZER_UNAVAILABLE" });
    expect(mockEventSave).not.toHaveBeenCalled();
  });

  it("preserves legacy Business event creation through businessId", async () => {
    (Business.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(approvedBusiness()) });
    const legacy = { ...data({ type: "business", id: organizerId }, "official"), organizer: undefined, businessId: organizerId };
    await expect(createEvent(legacy as never, userId)).resolves.toMatchObject({
      organizer: { type: "business" }, businessId: expect.any(mongoose.Types.ObjectId),
    });
    expect(mockEventSave).toHaveBeenCalledTimes(1);
  });
});
