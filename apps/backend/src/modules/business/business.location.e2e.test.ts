import express from "express";
import http from "node:http";
import net from "node:net";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CreateBusinessRequestSchema, OwnerBusinessResponseSchema } from "@ndrs92/contracts";
import { errorMiddleware } from "../../middleware/error.middleware";
import { User } from "../users/user.model";
import businessRoutes from "./business.routes";
import { Business } from "./business.model";

let mongo: MongoMemoryServer;
let ownerId: string;
let token: string;

const app = express();
app.use(express.json());
app.use("/api/v1/business", businessRoutes);
app.use(errorMiddleware);

const send = (method: string, path: string, body: unknown, token: string) => new Promise<{ status: number; body: any }>((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = new http.IncomingMessage(new net.Socket());
    request.method = method;
    request.url = path;
    request.headers = {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(payload).toString(),
        authorization: `Bearer ${token}`,
    };
    request.push(payload);
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

describe("Business location update MongoDB E2E", () => {
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri(), { dbName: "veci_business_location_e2e" });

        const owner = await User.create({
            name: "Location Test Owner",
            email: "business-location-owner@example.test",
            provider: "google",
            providerId: "business-location-owner",
        });
        ownerId = owner._id.toString();
        token = jwt.sign({ userId: ownerId }, process.env.JWT_SECRET!, { algorithm: "HS256" });
    }, 30000);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongo?.stop();
    });

    it("creates a street address, preserves it on unrelated edits, and persists an edited address and coordinates", async () => {
        const createRequest = CreateBusinessRequestSchema.parse({
            name: "Café Köln",
            category: "food",
            images: { profile: "https://cdn.example/profile.jpg" },
            location: {
                address: "Gotenring 16, 50679 Köln, Germany",
                cityId: "Köln",
                country: "Germany",
                latitude: 50.9348,
                longitude: 6.9762,
            },
        });
        const createResponse = await send("POST", "/api/v1/business", createRequest, token);
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data.location).toEqual({
            address: "Gotenring 16, 50679 Köln, Germany",
            cityId: "Köln",
            country: "Germany",
            coordinates: { lat: 50.9348, lng: 6.9762 },
        });
        const businessId = createResponse.body.data._id as string;
        const originalLocation = {
            address: "Gotenring 16, 50679 Köln, Germany",
            cityId: "Köln",
            country: "Germany",
            coordinates: { lat: 50.9348, lng: 6.9762 },
        };

        const nameUpdate = await send("PUT", `/api/v1/business/${businessId}`, { name: "Café Köln Updated" }, token);
        expect(nameUpdate.status).toBe(200);
        expect(await Business.findById(businessId).then((business) => business?.toObject().location)).toEqual(originalLocation);

        const addressUpdate = await send("PUT", `/api/v1/business/${businessId}`, {
            location: {
                address: "Gotenring 18, 50679 Köln, Germany",
                cityId: "Köln",
                country: "Germany",
                latitude: 50.9349,
                longitude: 6.9763,
            },
        }, token);

        expect(addressUpdate.status).toBe(200);
        expect(addressUpdate.body.data.location).toEqual({
            address: "Gotenring 18, 50679 Köln, Germany",
            cityId: "Köln",
            country: "Germany",
            coordinates: { lat: 50.9349, lng: 6.9763 },
        });
        expect(OwnerBusinessResponseSchema.safeParse(addressUpdate.body).success).toBe(true);
        expect(await Business.findById(businessId).then((business) => business?.toObject().location)).toEqual(addressUpdate.body.data.location);
    });
});
