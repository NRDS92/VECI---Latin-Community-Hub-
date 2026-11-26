import { once } from "node:events";
import type { Server } from "node:http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import app from "../../app";
import { User } from "../users/user.model";

jest.setTimeout(120_000);
type ApiBody = { success?: boolean; data?: { token?: string }; message?: string; code?: string };
let replSet: MongoMemoryReplSet;
let server: Server;
let base = "";

const call = async (method: string, path: string, token?: string, body?: unknown) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json() as ApiBody };
};

const makeEmailUser = async (password: string) => {
  const email = `${new mongoose.Types.ObjectId()}@example.test`;
  const user = await User.create({ name: "Password E2E", email, provider: "email", passwordHash: await bcrypt.hash(password, 12), isVerified: true });
  return { user, token: jwt.sign({ userId: String(user._id), tokenVersion: user.tokenVersion ?? 0 }, process.env.JWT_SECRET!, { algorithm: "HS256" }) };
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "veci_password_e2e" });
  server = app.listen(0);
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server failed to bind");
  base = `http://127.0.0.1:${address.port}/api/v1`;
});

afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

describe("password policy and authenticated password change", () => {
  it("changes password, revokes old JWTs, and returns a valid replacement token", async () => {
    const { user, token } = await makeEmailUser("legacy7");
    const result = await call("PATCH", "/auth/change-password", token, { currentPassword: "legacy7", newPassword: "NewPass!8" });
    expect(result.status).toBe(200);
    expect(result.body.data?.token).toBeTruthy();
    expect(JSON.stringify(result.body)).not.toContain("passwordHash");
    expect(JSON.stringify(result.body)).not.toContain("NewPass!8");
    const saved = await User.findById(user._id).select("+passwordHash");
    expect(saved?.passwordHash).not.toBe("legacy7");
    expect(await bcrypt.compare("NewPass!8", saved!.passwordHash!)).toBe(true);
    expect((await call("GET", "/auth/me", token)).status).toBe(401);
    expect((await call("GET", "/auth/me", result.body.data!.token)).status).toBe(200);
  });

  it("rejects missing auth, bad current password, reuse, Google-only accounts and weak registration", async () => {
    expect((await call("PATCH", "/auth/change-password", undefined, { currentPassword: "x", newPassword: "NewPass!8" })).status).toBe(401);
    expect((await call("PATCH", "/auth/change-password", undefined, { newPassword: "NewPass!8" })).status).toBe(401);
    const { token } = await makeEmailUser("legacy7");
    expect((await call("PATCH", "/auth/change-password", token, { newPassword: "NewPass!8" })).status).toBe(400);
    expect((await call("PATCH", "/auth/change-password", token, { currentPassword: "wrong", newPassword: "NewPass!8" })).body.code).toBe("INVALID_CURRENT_PASSWORD");
    expect((await call("PATCH", "/auth/change-password", token, { currentPassword: "legacy7", newPassword: "legacy7" })).status).toBe(400);
    const google = await User.create({ name: "Google", email: `${new mongoose.Types.ObjectId()}@example.test`, provider: "google", providerId: "google-id", isVerified: true });
    const googleToken = jwt.sign({ userId: String(google._id), tokenVersion: 0 }, process.env.JWT_SECRET!, { algorithm: "HS256" });
    expect((await call("PATCH", "/auth/change-password", googleToken, { currentPassword: "x", newPassword: "NewPass!8" })).body.code).toBe("GOOGLE_ACCOUNT_NO_PASSWORD");
    expect((await call("POST", "/auth/register", undefined, { name: "Weak", email: `${new mongoose.Types.ObjectId()}@example.test`, password: "weak123", cityId: "berlin" })).status).toBe(400);
  });

  it("allows a weak legacy password to log in and rejects weak reset passwords", async () => {
    const { user } = await makeEmailUser("weak123");
    const login = await call("POST", "/auth/login", undefined, { email: user.email, password: "weak123" });
    expect(login.status).toBe(200);
    user.passwordResetToken = "isolated-reset-token";
    user.passwordResetExpires = new Date(Date.now() + 60_000);
    await user.save();
    expect((await call("POST", "/auth/reset-password", undefined, { token: "isolated-reset-token", password: "weak123" })).status).toBe(400);
    expect((await User.findById(user._id).select("+passwordHash"))?.passwordResetToken).toBe("isolated-reset-token");
  });
});
