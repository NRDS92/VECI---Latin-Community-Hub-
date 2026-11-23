import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import app from "../../app";
import { User } from "../users/user.model";
import { Event } from "../events/event.model";
import { Business } from "../business/business.model";
import { Community, CommunityComment, CommunityMembership, CommunityNotification, CommunityPost } from "./community.models";
import { Publication } from "../../shared/public-content/publication/publication.model";
import { notifyCommunityEventPublished } from "./community.forum.service";

jest.setTimeout(120_000);

type ApiBody = { success?: boolean; data?: unknown; message?: string; code?: string };
type TestUser = { id: string; token: string };
let replSet: MongoMemoryReplSet;
let server: Server;
let apiBase = "";

const request = async (method: string, path: string, token?: string, body?: unknown) => {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() as ApiBody };
};

const data = <T>(response: { body: ApiBody }) => response.body.data as T;
const newUser = async (role: "user" | "admin" = "user"): Promise<TestUser> => {
  const unique = new mongoose.Types.ObjectId().toString();
  const user = await User.create({
    name: `E2E ${role}`,
    email: `${unique}@example.test`,
    provider: "google",
    providerId: unique,
    role,
  });
  return {
    id: String(user._id),
    token: jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET!, { algorithm: "HS256" }),
  };
};

const createCommunity = async (owner: TestUser, membershipPolicy: "open" | "approval") => {
  const response = await request("POST", "/communities", owner.token, {
    name: `E2E Community ${new mongoose.Types.ObjectId().toString().slice(-8)}`,
    description: "Isolated MongoDB replica-set integration fixture",
    interests: ["culture"],
    cityId: "berlin",
    country: "Germany",
    membershipPolicy,
  });
  expect(response.status).toBe(201);
  return data<{ id: string; moderationStatus: string }>(response);
};

const approveCommunity = async (admin: TestUser, communityId: string) => request(
  "POST", `/admin/communities/${communityId}/approve`, admin.token,
);

const createEventBody = (title: string, organizer?: { type: "community" | "business"; id: string }, businessId?: string, eventType: "community" | "official" = "community") => ({
  title,
  description: "Integration test event",
  eventType,
  category: "meetup",
  cityId: "berlin",
  address: "Synthetic test address",
  latitude: 52.52,
  longitude: 13.405,
  dateStart: "2030-05-01T18:00:00.000Z",
  price: { type: "free", currency: "EUR" },
  ...(organizer ? { organizer } : {}),
  ...(businessId ? { businessId } : {}),
});

const eventId = (response: { body: ApiBody }) => {
  const event = data<{ _id?: string; id?: string }>(response);
  const id = event?._id ?? event?.id;
  if (!id) throw new Error("Event create response did not include an ID");
  return id;
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "veci_community_e2e" });
  await Promise.all([
    User.init(), Community.init(), CommunityMembership.init(), CommunityPost.init(), CommunityComment.init(),
    CommunityNotification.init(), Event.init(), Business.init(), Publication.init(),
  ]);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  apiBase = `http://127.0.0.1:${address.port}/api/v1`;
});

afterAll(async () => {
  if (server?.listening) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await mongoose.disconnect();
  await replSet?.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}), Community.deleteMany({}), CommunityMembership.deleteMany({}),
    CommunityPost.deleteMany({}), CommunityComment.deleteMany({}), CommunityNotification.deleteMany({}),
    Event.deleteMany({}), Business.deleteMany({}), Publication.deleteMany({}),
  ]);
});

describe("Community V1 HTTP and MongoDB replica-set E2E", () => {
  it("persists a new Community, gates publication on Admin approval, and supports open membership and forum access", async () => {
    const owner = await newUser();
    const member = await newUser();
    const outsider = await newUser();
    const admin = await newUser("admin");
    const community = await createCommunity(owner, "open");

    expect(community.moderationStatus).toBe("pending");
    expect(await Community.countDocuments({ _id: community.id, owner: owner.id })).toBe(1);
    expect(await CommunityMembership.countDocuments({ communityId: community.id, userId: owner.id, role: "owner", status: "active" })).toBe(1);
    const hidden = await request("GET", "/communities/discover");
    expect((data<{ items: Array<{ id: string }> }>(hidden)).items.some((item) => item.id === community.id)).toBe(false);

    const nonAdminApproval = await approveCommunity(owner, community.id);
    expect(nonAdminApproval.status).toBe(403);
    const approval = await approveCommunity(admin, community.id);
    expect(approval.status).toBe(200);
    expect(await Community.findById(community.id).then((value) => value?.moderation.status)).toBe("APPROVED");
    expect(await Publication.countDocuments({ entityId: community.id, status: "PUBLISHED" })).toBe(1);
    const visible = await request("GET", "/communities/discover");
    expect((data<{ items: Array<{ id: string }> }>(visible)).items.some((item) => item.id === community.id)).toBe(true);

    expect((await request("GET", `/communities/${community.id}/posts`, outsider.token)).status).toBe(403);
    const join = await request("POST", `/communities/${community.id}/membership`, member.token);
    expect(join.status).toBe(200);
    expect(data<{ status: string }>(join).status).toBe("active");
    expect(await CommunityMembership.countDocuments({ communityId: community.id, userId: member.id, status: "active" })).toBe(1);
    expect((await Community.findById(community.id))?.memberCount).toBe(2);

    const post = await request("POST", `/communities/${community.id}/posts`, member.token, { text: "Open membership post" });
    expect(post.status).toBe(201);
    const postId = data<{ id: string }>(post).id;
    expect(await CommunityPost.countDocuments({ _id: postId, communityId: community.id, authorId: member.id })).toBe(1);
    const comment = await request("POST", `/communities/${community.id}/posts/${postId}/comments`, owner.token, { text: "Owner comment" });
    expect(comment.status).toBe(201);
    expect(await CommunityComment.countDocuments({ postId, authorId: owner.id })).toBe(1);
    const comments = await request("GET", `/communities/${community.id}/posts/${postId}/comments`, member.token);
    expect((data<{ items: Array<{ id: string }> }>(comments)).items).toHaveLength(1);
  });

  it("enforces approval membership, Owner/Admin/Member forum permissions, private isolation, and notification deduplication", async () => {
    const owner = await newUser();
    const admin = await newUser("admin");
    const communityAdmin = await newUser();
    const member = await newUser();
    const outsider = await newUser();
    const community = await createCommunity(owner, "approval");
    expect((await approveCommunity(admin, community.id)).status).toBe(200);

    const pending = await request("POST", `/communities/${community.id}/membership`, member.token);
    expect(data<{ status: string }>(pending).status).toBe("pending");
    expect((await request("GET", `/communities/${community.id}/posts`, member.token)).status).toBe(403);
    expect((await request("GET", `/communities/${community.id}/posts`, outsider.token)).status).toBe(403);
    expect((await Community.findById(community.id))?.memberCount).toBe(1);

    const approved = await request("PATCH", `/communities/${community.id}/membership/${member.id}`, owner.token, { action: "approve" });
    expect(approved.status).toBe(200);
    expect(data<{ status: string }>(approved).status).toBe("active");
    expect(await CommunityNotification.countDocuments({ userId: member.id, type: "membership_approved" })).toBe(1);
    expect((await Community.findById(community.id))?.memberCount).toBe(2);
    const duplicateApproval = await request("PATCH", `/communities/${community.id}/membership/${member.id}`, owner.token, { action: "approve" });
    expect(duplicateApproval.status).toBe(409);
    expect(await CommunityNotification.countDocuments({ userId: member.id, type: "membership_approved" })).toBe(1);

    const adminJoin = await request("POST", `/communities/${community.id}/membership`, communityAdmin.token);
    expect(data<{ status: string }>(adminJoin).status).toBe("pending");
    expect((await request("PATCH", `/communities/${community.id}/membership/${communityAdmin.id}`, owner.token, { action: "approve" })).status).toBe(200);
    expect((await request("PATCH", `/communities/${community.id}/membership/${communityAdmin.id}`, owner.token, { action: "assign_admin" })).status).toBe(200);

    const announcement = await request("POST", `/communities/${community.id}/posts`, communityAdmin.token, { type: "announcement", text: "Admin announcement" });
    expect(announcement.status).toBe(201);
    expect(await CommunityNotification.countDocuments({ communityId: community.id, type: "announcement", userId: member.id })).toBe(1);
    expect((await request("POST", `/communities/${community.id}/posts`, member.token, { type: "announcement", text: "Unauthorized announcement" })).status).toBe(403);
    expect((await request("PATCH", `/communities/${community.id}/membership/${member.id}`, communityAdmin.token, { action: "assign_admin" })).status).toBe(403);

    const memberPost = await request("POST", `/communities/${community.id}/posts`, member.token, { text: "Member post" });
    expect(memberPost.status).toBe(201);
    const postId = data<{ id: string }>(memberPost).id;
    const comment = await request("POST", `/communities/${community.id}/posts/${postId}/comments`, member.token, { text: "Member comment" });
    expect(comment.status).toBe(201);
    expect(await CommunityComment.countDocuments({ postId, authorId: member.id })).toBe(1);
    expect((await request("GET", `/communities/${community.id}/posts`, outsider.token)).status).toBe(403);
  });

  it("authorizes Community Owner/Admin and Business Event organizers, publishes approved Events, rejects others, and deduplicates notifications", async () => {
    const platformAdmin = await newUser("admin");
    const owner = await newUser();
    const communityAdmin = await newUser();
    const member = await newUser();
    const businessOwner = await newUser();
    const pendingOwner = await newUser();
    const community = await createCommunity(owner, "open");
    const pendingCommunity = await createCommunity(pendingOwner, "open");

    expect((await request("POST", "/events", pendingOwner.token, createEventBody("Pending organizer", { type: "community", id: pendingCommunity.id }))).status).toBe(403);
    expect((await approveCommunity(platformAdmin, community.id)).status).toBe(200);
    expect((await request("POST", `/communities/${community.id}/membership`, communityAdmin.token)).status).toBe(200);
    expect((await request("PATCH", `/communities/${community.id}/membership/${communityAdmin.id}`, owner.token, { action: "assign_admin" })).status).toBe(200);
    expect((await request("POST", `/communities/${community.id}/membership`, member.token)).status).toBe(200);

    expect((await request("POST", "/events", member.token, createEventBody("Member forbidden", { type: "community", id: community.id }))).status).toBe(403);
    expect((await request("POST", "/events", owner.token, createEventBody("No organizer"))).status).toBe(400);
    expect((await request("POST", "/events", owner.token, createEventBody("Official community forbidden", { type: "community", id: community.id }, undefined, "official"))).status).toBe(400);

    const ownerEvent = await request("POST", "/events", owner.token, createEventBody("Owner Community Event", { type: "community", id: community.id }));
    const adminEvent = await request("POST", "/events", communityAdmin.token, createEventBody("Admin Community Event", { type: "community", id: community.id }));
    expect(ownerEvent.status).toBe(201);
    expect(adminEvent.status).toBe(201);
    const ownerEventId = eventId(ownerEvent);
    const adminEventId = eventId(adminEvent);

    const pendingEventList = await request("GET", "/events");
    expect((data<Array<{ id: string; _id?: string }>>(pendingEventList)).some((event) => (event.id ?? event._id) === ownerEventId)).toBe(false);
    expect((await request("PATCH", `/admin/events/${ownerEventId}/approve`, platformAdmin.token)).status).toBe(200);
    expect((await request("PATCH", `/admin/events/${adminEventId}/approve`, platformAdmin.token)).status).toBe(200);
    expect((await Event.findById(ownerEventId))?.moderation.reviewedBy?.toString()).toBe(platformAdmin.id);
    expect((await request("PATCH", `/admin/events/${ownerEventId}/approve`, platformAdmin.token)).status).toBe(409);

    let published = await request("GET", "/events");
    let publishedItems = data<Array<{ id?: string; _id?: string; title: string }>>(published);
    expect(publishedItems.some((event) => (event.id ?? event._id) === ownerEventId)).toBe(true);
    expect(publishedItems.some((event) => (event.id ?? event._id) === adminEventId)).toBe(true);
    for (const userId of [owner.id, communityAdmin.id, member.id]) {
      expect(await CommunityNotification.countDocuments({ userId, communityId: community.id, type: "event_published", eventKey: `event-published:${ownerEventId}` })).toBe(1);
    }
    await notifyCommunityEventPublished(community.id, ownerEventId);
    await notifyCommunityEventPublished(community.id, ownerEventId);
    expect(await CommunityNotification.countDocuments({ communityId: community.id, type: "event_published", eventKey: `event-published:${ownerEventId}` })).toBe(3);

    const business = await Business.create({
      name: "E2E Business Organizer",
      slug: `e2e-business-${new mongoose.Types.ObjectId().toString()}`,
      category: "food",
      owner: new mongoose.Types.ObjectId(businessOwner.id),
      images: { profile: "https://example.test/business.png", gallery: [] },
      location: { cityId: "berlin" },
      status: "active",
      moderation: { status: "APPROVED", reviewedBy: new mongoose.Types.ObjectId(platformAdmin.id), reviewedAt: new Date() },
    });
    const businessEvent = await request("POST", "/events", businessOwner.token, createEventBody("Legacy Business Event", undefined, String(business._id), "official"));
    expect(businessEvent.status).toBe(201);
    const businessEventId = eventId(businessEvent);
    expect((await request("PATCH", `/admin/events/${businessEventId}/approve`, platformAdmin.token)).status).toBe(200);
    published = await request("GET", "/events");
    publishedItems = data<Array<{ id?: string; _id?: string; title: string }>>(published);
    expect(publishedItems.some((event) => (event.id ?? event._id) === businessEventId)).toBe(true);

    expect((await request("POST", `/admin/communities/${community.id}/suspend`, platformAdmin.token)).status).toBe(200);
    expect((await request("POST", "/events", owner.token, createEventBody("Suspended organizer", { type: "community", id: community.id }))).status).toBe(403);
  });
});
