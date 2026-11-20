import mongoose from "mongoose";
import { Business } from "./business.model";
import { BusinessFollow } from "./business-follow.model";
import { BusinessBehavior } from "./business-behavior.model";
import { Publication } from "../../shared/public-content/publication/publication.model";
import {
  getBusinessFollowStatus,
  getFollowedBusinesses,
  getOwnerBusinessStats,
  assertMongoTransactionSupport,
  setBusinessFollow,
  trackBusinessBehavior,
} from "./business-engagement.service";
import { BUSINESS_BEHAVIOR_EVENTS } from "@ndrs92/contracts";

jest.mock("./business.model", () => ({ Business: { findOne: jest.fn(), findById: jest.fn(), updateOne: jest.fn(), find: jest.fn() } }));
jest.mock("./business-follow.model", () => ({ BusinessFollow: { updateOne: jest.fn(), deleteOne: jest.fn(), countDocuments: jest.fn(), exists: jest.fn(), find: jest.fn(), deleteMany: jest.fn() } }));
jest.mock("./business-behavior.model", () => ({ BusinessBehavior: { create: jest.fn(), countDocuments: jest.fn(), deleteMany: jest.fn() } }));
jest.mock("../../shared/public-content/publication/publication.model", () => ({ Publication: { exists: jest.fn(), find: jest.fn() } }));

const BUSINESS_ID = "507f1f77bcf86cd799439013";
const USER_ID = "507f1f77bcf86cd799439011";
const session = { withTransaction: jest.fn(async (callback: () => Promise<void>) => callback()), endSession: jest.fn() };
const sessionCount = (count: number) => ({ session: jest.fn().mockResolvedValue(count) });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(mongoose, "startSession").mockResolvedValue(session as any);
  Object.defineProperty(mongoose.connection, "db", {
    configurable: true,
    value: { admin: () => ({ command: jest.fn().mockResolvedValue({ setName: "rs0", logicalSessionTimeoutMinutes: 30 }) }) },
  });
  (Publication.exists as jest.Mock).mockResolvedValue(true);
  (Business.findOne as jest.Mock).mockResolvedValue({ documents: [{ type: "menu", url: "https://cdn.example/menu.pdf" }] });
  (BusinessFollow.countDocuments as jest.Mock).mockReturnValue(sessionCount(2));
  (Business.updateOne as jest.Mock).mockResolvedValue({ acknowledged: true });
});

describe("Business engagement service", () => {
  it("uses a unique-key upsert and transaction recount for idempotent follow", async () => {
    await expect(setBusinessFollow(BUSINESS_ID, USER_ID, true)).resolves.toEqual({ businessId: BUSINESS_ID, isFollowing: true });
    expect(BusinessFollow.updateOne).toHaveBeenCalledWith(
      { userId: USER_ID, businessId: BUSINESS_ID },
      { $setOnInsert: { userId: USER_ID, businessId: BUSINESS_ID } },
      { upsert: true, session }
    );
    expect(Business.updateOne).toHaveBeenCalledWith({ _id: BUSINESS_ID }, { $set: { followersCount: 2 } }, { session });
  });

  it("reconciles each concurrent follow through its own transaction", async () => {
    const firstSession = { withTransaction: jest.fn(async (callback: () => Promise<void>) => callback()), endSession: jest.fn() };
    const secondSession = { withTransaction: jest.fn(async (callback: () => Promise<void>) => callback()), endSession: jest.fn() };
    (mongoose.startSession as jest.Mock).mockResolvedValueOnce(firstSession).mockResolvedValueOnce(secondSession);
    await Promise.all([
      setBusinessFollow(BUSINESS_ID, USER_ID, true),
      setBusinessFollow(BUSINESS_ID, "507f1f77bcf86cd799439012", true),
    ]);
    expect(firstSession.withTransaction).toHaveBeenCalledTimes(1);
    expect(secondSession.withTransaction).toHaveBeenCalledTimes(1);
    expect(Business.updateOne).toHaveBeenCalledTimes(2);
    expect(BusinessFollow.countDocuments).toHaveBeenCalledTimes(2);
  });

  it("rejects standalone MongoDB before starting a transactional mutation", async () => {
    Object.defineProperty(mongoose.connection, "db", {
      configurable: true,
      value: { admin: () => ({ command: jest.fn().mockResolvedValue({ isWritablePrimary: true }) }) },
    });
    await expect(assertMongoTransactionSupport()).rejects.toMatchObject({ statusCode: 503, code: "TRANSACTIONS_UNAVAILABLE" });
    expect(mongoose.startSession).not.toHaveBeenCalled();
  });

  it("unfollows idempotently and keeps counter equal to surviving relations", async () => {
    await expect(setBusinessFollow(BUSINESS_ID, USER_ID, false)).resolves.toMatchObject({ isFollowing: false });
    expect(BusinessFollow.deleteOne).toHaveBeenCalledWith({ userId: USER_ID, businessId: BUSINESS_ID }, { session });
    expect(Business.updateOne).toHaveBeenCalledWith({ _id: BUSINESS_ID }, { $set: { followersCount: 2 } }, { session });
  });

  it("rejects ineligible businesses for follow and follow status", async () => {
    (Publication.exists as jest.Mock).mockResolvedValue(false);
    await expect(setBusinessFollow(BUSINESS_ID, USER_ID, true)).rejects.toMatchObject({ statusCode: 404 });
    await expect(getBusinessFollowStatus(BUSINESS_ID, USER_ID)).rejects.toMatchObject({ statusCode: 404 });
    expect(BusinessFollow.updateOne).not.toHaveBeenCalled();
  });

  it("returns status based on the authenticated relation", async () => {
    (BusinessFollow.exists as jest.Mock).mockResolvedValue({ _id: "relation" });
    await expect(getBusinessFollowStatus(BUSINESS_ID, USER_ID)).resolves.toEqual({ businessId: BUSINESS_ID, isFollowing: true });
  });

  it("records one authenticated daily view and treats duplicate-key retries as deduped", async () => {
    (BusinessBehavior.create as jest.Mock).mockRejectedValueOnce({ code: 11000 });
    await expect(trackBusinessBehavior(BUSINESS_ID, { userId: USER_ID, ip: "127.0.0.1", userAgent: "test" }, { event: BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW })).resolves.toEqual({ recorded: false });
    expect(BusinessBehavior.create).toHaveBeenCalledWith(expect.objectContaining({
      businessId: BUSINESS_ID,
      event: BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW,
      dedupeDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      visitorKey: expect.not.stringContaining(USER_ID),
      visitorType: "user",
    }));
  });

  it("records anonymous public views with a keyed network fingerprint only", async () => {
    await expect(trackBusinessBehavior(BUSINESS_ID, {
      ip: "203.0.113.10",
      userAgent: "public-browser",
    }, { event: BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW })).resolves.toEqual({ recorded: true });
    expect(BusinessBehavior.create).toHaveBeenCalledWith(expect.objectContaining({
      event: BUSINESS_BEHAVIOR_EVENTS.BUSINESS_VIEW,
      visitorType: "anonymous",
      visitorKey: expect.not.stringContaining("203.0.113.10"),
    }));
  });

  it("records menu initiation only for an actual current menu document", async () => {
    await expect(trackBusinessBehavior(BUSINESS_ID, { ip: "192.0.2.5", userAgent: "anonymous-test" }, {
      event: BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD,
      documentUrl: "https://cdn.example/menu.pdf",
    })).resolves.toEqual({ recorded: true });
    expect(BusinessBehavior.create).toHaveBeenCalledWith(expect.objectContaining({
      event: BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD,
      visitorType: "anonymous",
      visitorKey: expect.not.stringContaining("192.0.2.5"),
    }));
    await expect(trackBusinessBehavior(BUSINESS_ID, { userId: USER_ID, ip: "192.0.2.5", userAgent: "anonymous-test" }, {
      event: BUSINESS_BEHAVIOR_EVENTS.MENU_DOWNLOAD,
      documentUrl: "https://attacker.example/file.pdf",
    })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("allows owner stats only for the owner and returns aggregate counters only", async () => {
    (Business.findById as jest.Mock).mockResolvedValue({ owner: USER_ID, followersCount: 3, eventsCount: 4 });
    (BusinessBehavior.countDocuments as jest.Mock).mockResolvedValueOnce(10).mockResolvedValueOnce(2);
    await expect(getOwnerBusinessStats(BUSINESS_ID, USER_ID)).resolves.toEqual({
      businessId: BUSINESS_ID, followersCount: 3, eventsCount: 4, businessViews: 10, menuDownloadAttempts: 2, periodDays: 90,
    });
    await expect(getOwnerBusinessStats(BUSINESS_ID, "507f1f77bcf86cd799439012")).rejects.toMatchObject({ statusCode: 403 });
  });

  it("only lists followed businesses with a published public representation", async () => {
    const query: any = { sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([{ businessId: BUSINESS_ID }]) };
    query.select = jest.fn().mockReturnValue(query);
    (BusinessFollow.find as jest.Mock).mockReturnValue(query);
    const pubQuery: any = { select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([{ entityId: BUSINESS_ID, slug: "public-slug" }]) };
    (Publication.find as jest.Mock).mockReturnValue(pubQuery);
    const business = { _id: BUSINESS_ID };
    (Business.find as jest.Mock).mockResolvedValue([business]);
    await expect(getFollowedBusinesses(USER_ID)).resolves.toEqual([{ business, slug: "public-slug" }]);
    expect(Business.find).toHaveBeenCalledWith(expect.objectContaining({ status: "active", "moderation.status": "APPROVED" }));
  });
});

