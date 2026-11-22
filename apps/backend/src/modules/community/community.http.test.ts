import express from "express";
import http from "node:http";
import net from "node:net";
import jwt from "jsonwebtoken";
import { User } from "../users/user.model";
import { errorMiddleware } from "../../middleware/error.middleware";
import communityRoutes from "./community.routes";
import * as service from "./community.service";

jest.mock("../users/user.model", () => ({ User: { findById: jest.fn() } }));
jest.mock("./community.service", () => ({
  getMyCommunities: jest.fn(),
  getOwnerCommunity: jest.fn(),
}));
jest.mock("./community.forum.service", () => ({}));

const USER_ID = "507f1f77bcf86cd799439011";
const COMMUNITY_ID = "507f1f77bcf86cd799439012";
const app = express();
app.use(express.json());
app.use("/api/v1/communities", communityRoutes);
app.use(errorMiddleware);

const send = (path: string, token?: string) => new Promise<{ status: number; body: Record<string, unknown>; headers: http.OutgoingHttpHeaders }>((resolve, reject) => {
  const request = new http.IncomingMessage(new net.Socket());
  request.method = "GET";
  request.url = path;
  request.headers = token ? { authorization: `Bearer ${token}` } : {};
  request.push(null);
  const response = new http.ServerResponse(request);
  let content = "";
  response.write = ((chunk: unknown) => { content += String(chunk ?? ""); return true; }) as typeof response.write;
  response.end = ((chunk?: unknown) => {
    content += String(chunk ?? "");
    resolve({ status: response.statusCode, body: JSON.parse(content), headers: response.getHeaders() });
    return response;
  }) as typeof response.end;
  response.on("error", reject);
  (app as unknown as { handle: (req: http.IncomingMessage, res: http.ServerResponse) => void }).handle(request, response);
});

const tokenFor = (userId = USER_ID) => jwt.sign({ userId }, process.env.JWT_SECRET!, { algorithm: "HS256" });

describe("Community HTTP authorization and route ordering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (User.findById as jest.Mock).mockResolvedValue({ id: USER_ID, accountStatus: "active" });
  });

  it("requires authentication for the private /me route", async () => {
    const response = await send("/api/v1/communities/me");
    expect(response.status).toBe(401);
    expect(service.getMyCommunities).not.toHaveBeenCalled();
  });

  it("keeps /me ahead of the parameter route and does not call owner lookup", async () => {
    (service.getMyCommunities as jest.Mock).mockResolvedValue([]);
    const response = await send("/api/v1/communities/me", tokenFor());
    expect(response.status).toBe(200);
    expect(service.getMyCommunities).toHaveBeenCalledWith(USER_ID);
    expect(service.getOwnerCommunity).not.toHaveBeenCalled();
    expect(response.headers["cache-control"]).toBe("private, no-store");
  });

  it("keeps owner details on the dedicated owner route", async () => {
    (service.getOwnerCommunity as jest.Mock).mockResolvedValue({ id: COMMUNITY_ID, ownerId: USER_ID });
    const response = await send(`/api/v1/communities/${COMMUNITY_ID}/owner`, tokenFor());
    expect(response.status).toBe(200);
    expect(service.getOwnerCommunity).toHaveBeenCalledWith(COMMUNITY_ID, USER_ID);
  });
});
