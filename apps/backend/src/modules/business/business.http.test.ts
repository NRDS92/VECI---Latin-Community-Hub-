import express from "express";
import http from "node:http";
import net from "node:net";
import jwt from "jsonwebtoken";
import { Business } from "./business.model";
import { User } from "../users/user.model";
import { validateBusinessCreation } from "./business.permissions";
import { generateUniqueSlug } from "../../shared/slug/slug.service";
import { buildBusiness } from "./business.builder";
import businessRoutes from "./business.routes";
import { errorMiddleware } from "../../middleware/error.middleware";
import { OwnerBusinessResponseSchema } from "@ndrs92/contracts";

jest.mock("./business.model", () => ({ Business: { findById: jest.fn(), find: jest.fn() } }));
jest.mock("../users/user.model", () => ({ User: { findById: jest.fn() } }));
jest.mock("./business.permissions", () => ({ validateBusinessCreation: jest.fn() }));
jest.mock("../../shared/slug/slug.service", () => ({ generateUniqueSlug: jest.fn() }));
jest.mock("./business.builder", () => ({ buildBusiness: jest.fn() }));

const OWNER_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439012";
const BUSINESS_ID = "507f1f77bcf86cd799439013";
const validCreate = {
    name: "Mi negocio",
    category: "food",
    images: { profile: "profile.jpg" },
    location: { address: "Calle 1", cityId: "cologne", country: "Germany", latitude: 50.9, longitude: 6.9 },
};

const makeDocument = (ownerId = OWNER_ID) => {
    const doc: any = {
        _id: { toString: () => BUSINESS_ID },
        slug: "mi-negocio",
        name: "Mi negocio",
        providerType: "business",
        category: "food",
        profile: { services: [], specialties: [], languages: [], serviceArea: [] },
        images: { profile: "profile.jpg", gallery: [] },
        documents: [],
        location: { address: "Calle 1", cityId: "cologne", country: "Germany", coordinates: { lat: 50.9, lng: 6.9 } },
        contact: {},
        community: { isLatinoOwned: true },
        tags: [],
        languages: [],
        isLatinoOwned: true,
        rating: { average: 0, count: 0 },
        likesCount: 0,
        followersCount: 0,
        eventsCount: 0,
        verification: { status: "unverified", checks: { identity: false, contact: false, activity: false } },
        isFeatured: false,
        status: "active",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        owner: { toString: () => ownerId },
        visibilityScore: 99,
        moderation: { status: "pending" },
        save: jest.fn().mockResolvedValue(undefined),
        toObject: () => ({ ...doc }),
    };
    return doc;
};

const app = express();
app.use(express.json());
app.use("/api/v1/business", businessRoutes);
app.use(errorMiddleware);

const send = (path: string, method: string, body?: unknown, token?: string) => new Promise<{ status: number; body: any }>((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const request = new http.IncomingMessage(new net.Socket());
    request.method = method;
    request.url = path;
    request.headers = {
        ...(payload ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload).toString() } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
    };
    if (payload) request.push(payload);
    request.push(null);

    const response = new http.ServerResponse(request);
    let content = "";
    response.write = ((chunk: any) => { content += chunk?.toString() ?? ""; return true; }) as any;
    response.end = ((chunk?: any) => {
        content += chunk?.toString() ?? "";
        resolve({ status: response.statusCode, body: JSON.parse(content) });
        return response;
    }) as any;
    response.on("error", reject);
    (app as any).handle(request, response);
});

const tokenFor = (userId = OWNER_ID) => jwt.sign({ userId }, process.env.JWT_SECRET!, { algorithm: "HS256" });

beforeEach(() => {
    jest.clearAllMocks();
    (User.findById as jest.Mock).mockResolvedValue({ id: OWNER_ID, accountStatus: "active" });
    (validateBusinessCreation as jest.Mock).mockResolvedValue(undefined);
    (generateUniqueSlug as jest.Mock).mockResolvedValue("mi-negocio");
});

describe("Business HTTP integration with isolated persistence mocks", () => {
    it("rejects unauthenticated create before invoking the service", async () => {
        const result = await send("/api/v1/business", "POST", validCreate);
        expect(result.status).toBe(401);
        expect(result.body.code).toBe("NO_TOKEN");
        expect(validateBusinessCreation).not.toHaveBeenCalled();
    });

    it("creates through the route and returns a validated owner DTO without internal fields", async () => {
        const document = makeDocument();
        (buildBusiness as jest.Mock).mockReturnValue(document);

        const result = await send("/api/v1/business", "POST", validCreate, tokenFor());
        expect(result.status).toBe(201);
        expect(result.body.success).toBe(true);
        expect(OwnerBusinessResponseSchema.safeParse(result.body).success).toBe(true);
        expect(result.body.data).toMatchObject({ _id: BUSINESS_ID, name: "Mi negocio", images: { profile: "profile.jpg" } });
        expect(result.body.data).not.toHaveProperty("owner");
        expect(result.body.data).not.toHaveProperty("moderation");
        expect(result.body.data).not.toHaveProperty("visibilityScore");
        expect(document.save).toHaveBeenCalledTimes(1);
    });

    it("returns HTTP 400 for invalid create data without exposing a stack", async () => {
        const result = await send("/api/v1/business", "POST", { ...validCreate, name: "x" }, tokenFor());
        expect(result.status).toBe(400);
        expect(result.body).toMatchObject({ success: false, message: "Invalid request data", code: "VALIDATION_ERROR" });
        expect(result.body).not.toHaveProperty("stack");
    });

    it("updates a partial field and persists the document for its owner", async () => {
        const document = makeDocument();
        (Business.findById as jest.Mock).mockResolvedValue(document);

        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "PUT", { contact: { phone: "+49123" } }, tokenFor());
        expect(result.status).toBe(200);
        expect(document.contact).toEqual({ phone: "+49123" });
        expect(document.slug).toBe("mi-negocio");
        expect(document.save).toHaveBeenCalledTimes(1);
    });

    it("round-trips a changed street address and coordinates through the owner response", async () => {
        const document = makeDocument();
        (Business.findById as jest.Mock).mockResolvedValue(document);

        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "PUT", {
            location: {
                address: "Gotenring 16, 50679 Köln, Germany",
                cityId: "Köln",
                country: "Germany",
                latitude: 50.9348,
                longitude: 6.9762,
            },
        }, tokenFor());

        expect(result.status).toBe(200);
        expect(result.body.data.location).toEqual({
            address: "Gotenring 16, 50679 Köln, Germany",
            cityId: "Köln",
            country: "Germany",
            coordinates: { lat: 50.9348, lng: 6.9762 },
        });
        expect(OwnerBusinessResponseSchema.safeParse(result.body).success).toBe(true);
    });

    it("round-trips the legacy price tier through the owner update response", async () => {
        const document = makeDocument();
        (Business.findById as jest.Mock).mockResolvedValue(document);
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "PUT", { priceRange: "$$" }, tokenFor());
        expect(result.status).toBe(200);
        expect(document.priceRange).toBe("$$");
        expect(result.body.data.priceRange).toBe("$$");
        expect(OwnerBusinessResponseSchema.safeParse(result.body).success).toBe(true);
    });

    it("returns HTTP 400 for invalid update data without saving or exposing a stack", async () => {
        const document = makeDocument();
        (Business.findById as jest.Mock).mockResolvedValue(document);
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "PUT", { name: "x" }, tokenFor());
        expect(result.status).toBe(400);
        expect(result.body).toMatchObject({ success: false, message: "Invalid request data", code: "VALIDATION_ERROR" });
        expect(result.body).not.toHaveProperty("stack");
        expect(document.save).not.toHaveBeenCalled();
    });

    it("returns HTTP 400 for an empty update", async () => {
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "PUT", {}, tokenFor());
        expect(result.status).toBe(400);
        expect(result.body.code).toBe("VALIDATION_ERROR");
        expect(Business.findById).not.toHaveBeenCalled();
    });

    it("rejects a non-owner update and leaves persistence unchanged", async () => {
        const document = makeDocument(OTHER_ID);
        (Business.findById as jest.Mock).mockResolvedValue(document);
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "PUT", { name: "Updated" }, tokenFor());
        expect(result.status).toBe(403);
        expect(result.body.code).toBe("FORBIDDEN");
        expect(document.save).not.toHaveBeenCalled();
    });

    it("protects follow and owner stats routes from unauthenticated callers", async () => {
        const follow = await send(`/api/v1/business/${BUSINESS_ID}/follow`, "POST");
        const stats = await send(`/api/v1/business/${BUSINESS_ID}/stats`, "GET");
        expect(follow.status).toBe(401);
        expect(stats.status).toBe(401);
    });

    it("registers static routes before the single-segment Business ID route", () => {
        const paths = (businessRoutes as any).stack
            .filter((layer: any) => layer.route)
            .map((layer: any) => layer.route.path);
        expect(paths.indexOf("/followed")).toBeGreaterThanOrEqual(0);
        expect(paths.indexOf("/followed")).toBeLessThan(paths.indexOf("/:id"));
        expect(paths.indexOf("/me")).toBeLessThan(paths.indexOf("/:id"));
    });

    it("rejects invalid behavior payloads at the HTTP boundary", async () => {
        const result = await send(
            `/api/v1/business/${BUSINESS_ID}/behavior`,
            "POST",
            { event: "menu_download", userId: OTHER_ID },
            tokenFor()
        );
        expect(result.status).toBe(400);
        expect(result.body).toMatchObject({ success: false, code: "VALIDATION_ERROR" });
    });

    it("requires authentication before returning an owner Business response", async () => {
        const document = makeDocument();
        (Business.findById as jest.Mock).mockResolvedValue(document);
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "GET");
        expect(result.status).toBe(401);
    });

    it("returns OwnerBusiness to the authenticated owner", async () => {
        const document = makeDocument();
        (Business.findById as jest.Mock).mockResolvedValue(document);
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "GET", undefined, tokenFor(OWNER_ID));
        expect(result.status).toBe(200);
        expect(OwnerBusinessResponseSchema.safeParse(result.body).success).toBe(true);
    });

    it("rejects an authenticated non-owner from the owner Business response", async () => {
        const document = makeDocument(OWNER_ID);
        (Business.findById as jest.Mock).mockResolvedValue(document);
        (User.findById as jest.Mock).mockResolvedValue({ id: OTHER_ID, accountStatus: "active" });
        const result = await send(`/api/v1/business/${BUSINESS_ID}`, "GET", undefined, tokenFor(OTHER_ID));
        expect(result.status).toBe(403);
        expect(result.body.code).toBe("FORBIDDEN");
    });
});
