import express from "express";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import mongoose from "mongoose";
import { CreateBusinessRequestSchema, PublicBusinessSchema } from "@ndrs92/contracts";
import { errorMiddleware } from "../../middleware/error.middleware";
import { MODERATION_STATUS } from "../../shared/constants/moderation";
import { PUBLIC_CONTENT_TYPES } from "../../shared/public-content/constants/public-content.types";
import { PUBLICATION_STATUS, type PublicationStatus } from "../../shared/public-content/publication/publication-status";
import publicContentRoutes from "../../shared/public-content/resolver/public-content.routes";
import { buildBusiness } from "../business/business.builder";
import { Event } from "../events/event.model";
import discoverRoutes from "./discover.routes";

const app = express();
app.use("/api/v1/discover", discoverRoutes);
app.use("/api/v1/public/content", publicContentRoutes);
app.use(errorMiddleware);

function get<T>(path: string): Promise<{ status: number; body: T }> {
  return new Promise((resolve, reject) => {
    const request = new IncomingMessage(new Socket());
    request.method = "GET";
    request.url = path;
    request.push(null);
    const response = new ServerResponse(request);
    response.on("error", reject);
    response.end = (chunk?: unknown) => {
      resolve({ status: response.statusCode, body: JSON.parse(String(chunk)) });
      return response;
    };
    app(request, response);
  });
}

const request = CreateBusinessRequestSchema.parse({
  name: "Café & Pan",
  category: "food",
  images: { profile: "cafe.jpg" },
  location: { address: "Calle 1", cityId: "cologne", country: "Germany", latitude: 50, longitude: 7 },
});

function makeBusiness(slug: string, score: number) {
  const business = buildBusiness({ data: request, ownerId: "507f1f77bcf86cd799439011", slug });
  business.createdAt = new Date("2026-01-01T00:00:00Z");
  business.updatedAt = business.createdAt;
  business.moderation.status = MODERATION_STATUS.APPROVED;
  business.visibilityScore = score;
  return business;
}

const first = makeBusiness("cafe-pan", 30);
const second = makeBusiness("otro-cafe", 20);
const third = makeBusiness("tercer-cafe", 10);
const blocked = makeBusiness("blocked", 0);
blocked.status = "blocked";
const rejected = makeBusiness("rejected", 0);
rejected.moderation.status = MODERATION_STATUS.REJECTED;
const deleted = makeBusiness("deleted", 0);
const unpublished = makeBusiness("unpublished", 0);
const privateBusiness = makeBusiness("private", 0);
const archived = makeBusiness("archived", 0);
const missing = makeBusiness("missing", 0);
const event = new Event({ title: "Evento", dateStart: new Date("2099-01-01T00:00:00Z") });

function publishBusiness(
  business: typeof first,
  slug: string,
  status: PublicationStatus = PUBLICATION_STATUS.PUBLISHED
) {
  return { entityType: PUBLIC_CONTENT_TYPES.BUSINESS, entityId: String(business._id), slug, status };
}

const publications = [
  publishBusiness(first, "cafe-and-pan"),
  publishBusiness(second, "otro-cafe-publico"),
  publishBusiness(third, "tercer-cafe-publico"),
  publishBusiness(blocked, "blocked"),
  publishBusiness(rejected, "rejected"),
  publishBusiness(deleted, "deleted"),
  publishBusiness(unpublished, "unpublished", PUBLICATION_STATUS.UNPUBLISHED),
  publishBusiness(privateBusiness, "private", PUBLICATION_STATUS.PRIVATE),
  publishBusiness(archived, "archived", PUBLICATION_STATUS.ARCHIVED),
  {
    entityType: PUBLIC_CONTENT_TYPES.EVENT,
    entityId: String(event._id),
    slug: first.slug,
    status: PUBLICATION_STATUS.PUBLISHED,
  },
];

type Feed = {
  success: boolean;
  data: {
    recommended: Array<{ type: string; id?: string; _id?: string; slug?: string }>;
    page: number;
    hasMore: boolean;
  };
};

type QueryFilter = {
  entityType?: string;
  entityId?: { $in: string[] };
  status?: string;
  slug?: string;
  _id?: string | mongoose.Types.ObjectId | { $in: string[] };
  "moderation.status"?: string;
};

const publicationQueries: Array<{ filter: QueryFilter; projection: unknown }> = [];
let unavailableOnSecondRead: string | undefined;

beforeEach(() => {
  publicationQueries.length = 0;
  unavailableOnSecondRead = undefined;
  // Execute real routing, filters, ranking and mapping with an in-memory persistence boundary.
  jest.spyOn(mongoose.Query.prototype, "exec").mockImplementation(async function (
    this: mongoose.Query<unknown, unknown>
  ) {
    const filter = this.getFilter() as QueryFilter;
    if (this.model.modelName === "Publication") {
      publicationQueries.push({ filter, projection: this.projection() });
      const matches = publications.filter(row =>
        (!filter.entityType || row.entityType === filter.entityType) &&
        row.status === filter.status &&
        (!filter.slug || row.slug === filter.slug) &&
        (!filter.entityId || (
          filter.entityId.$in.includes(row.entityId) && row.entityId !== unavailableOnSecondRead
        ))
      );
      return filter.slug ? matches[0] ?? null : matches;
    }

    if (this.model.modelName === "Business") {
      const rows = [first, second, third, blocked, rejected, unpublished, privateBusiness, archived, missing];
      const id = filter._id;
      const ids = typeof id === "object" && "$in" in id ? id.$in : undefined;
      const matches = rows.filter(row =>
        (ids ? ids.includes(String(row._id)) : String(row._id) === String(id)) &&
        row.status === filter.status &&
        row.moderation.status === filter["moderation.status"]
      );
      return ids ? matches.slice(0, this.getOptions().limit) : matches[0] ?? null;
    }

    if (this.model.modelName === "Event") return [event];
    throw new Error(`Unexpected query for ${this.model.modelName}`);
  });
});

afterEach(() => jest.restoreAllMocks());

it("uses the published slug despite a collision with an Event and resolves the same Business id", async () => {
  const feed = await get<Feed>("/api/v1/discover?type=business");
  expect(feed.status).toBe(200);
  const { type, ...entity } = feed.body.data.recommended[0];
  expect(type).toBe("business");
  expect(PublicBusinessSchema.parse(entity)).toMatchObject({
    id: String(first._id),
    slug: "cafe-and-pan",
  });

  const detail = await get<{ data: { entity: unknown } }>(`/api/v1/public/content/${entity.slug}`);
  expect(detail.status).toBe(200);
  expect(PublicBusinessSchema.parse(detail.body.data.entity)).toEqual(entity);
  expect(publicationQueries).toContainEqual(expect.objectContaining({
    filter: { slug: "cafe-and-pan", status: PUBLICATION_STATUS.PUBLISHED },
  }));
});

it("excludes invalid publications and blocked, rejected or deleted businesses", async () => {
  const feed = await get<Feed>("/api/v1/discover?type=business");
  expect(feed.status).toBe(200);
  expect(feed.body.data.recommended.map(item => item.id)).toEqual(
    [first, second, third].map(business => String(business._id))
  );
});

it("preserves mixed-feed order and queries only the page's Business ids in one batch", async () => {
  const result = await get<Feed>("/api/v1/discover?type=all&page=1&limit=3");
  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    success: true,
    data: {
      recommended: [
        expect.objectContaining({ type: "event", _id: String(event._id), title: event.title }),
        expect.objectContaining({ type: "business", id: String(first._id), slug: "cafe-and-pan" }),
        expect.objectContaining({ type: "business", id: String(second._id), slug: "otro-cafe-publico" }),
      ],
      page: 1,
      hasMore: true,
    },
  });
  expect(publicationQueries).toHaveLength(3);
  expect(publicationQueries.filter(query => query.filter.entityId)).toEqual([{
    filter: {
      entityType: PUBLIC_CONTENT_TYPES.BUSINESS,
      entityId: { $in: [String(first._id), String(second._id)] },
      status: PUBLICATION_STATUS.PUBLISHED,
    },
    projection: { entityId: 1, slug: 1, _id: 0 },
  }]);
});

it("omits a Business whose publication disappears and keeps pagination metadata", async () => {
  unavailableOnSecondRead = String(first._id);
  const result = await get<Feed>("/api/v1/discover?type=all&limit=2");
  expect(result.status).toBe(200);
  expect(result.body.data).toEqual({
    recommended: [expect.objectContaining({ type: "event", _id: String(event._id) })],
    page: 1,
    hasMore: true,
  });
});

it("skips the batch lookup on a page without Business entries", async () => {
  const result = await get<Feed>("/api/v1/discover?type=all&limit=1");
  expect(result.status).toBe(200);
  expect(result.body.data.recommended.map(item => item.type)).toEqual(["event"]);
  expect(publicationQueries).toHaveLength(2);
  expect(publicationQueries.some(query => query.filter.entityId)).toBe(false);
});
