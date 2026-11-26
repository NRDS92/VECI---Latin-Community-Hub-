import { once } from "node:events";
import type { Server } from "node:http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import crypto from "node:crypto";
import { resend } from "../../config/resend";
import app from "../../app";
import { User } from "../users/user.model";
import { resetAuthRateLimitState } from "../../middleware/auth-rate-limit.middleware";

jest.mock("../../config/resend", () => ({
  resend: { emails: { send: jest.fn().mockResolvedValue({ data: { id: "isolated-email" }, error: null }) } },
}));

jest.setTimeout(120_000);
type ApiBody = { success?: boolean; data?: { token?: string }; message?: string; code?: string };
let replSet: MongoMemoryReplSet;
let server: Server;
let base = "";

const call = async (method: string, path: string, token?: string, body?: unknown, extraHeaders: Record<string, string> = {}) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }), ...extraHeaders },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, retryAfter: response.headers.get("retry-after"), body: await response.json() as ApiBody };
};

const makeEmailUser = async (password: string) => {
  const email = `${new mongoose.Types.ObjectId()}@example.test`;
  const user = await User.create({ name: "Password E2E", email, provider: "email", passwordHash: await bcrypt.hash(password, 12), isVerified: true });
  return { user, token: jwt.sign({ userId: String(user._id), tokenVersion: user.tokenVersion ?? 0 }, process.env.JWT_SECRET!, { algorithm: "HS256" }) };
};

const getResetTokenFromCapturedEmail = () => {
  const send = resend.emails.send as jest.Mock;
  const html = String(send.mock.calls.at(-1)?.[0]?.html ?? "");
  const url = html.match(/href="([^"]*reset-password[^"]*)"/)?.[1];
  if (!url) throw new Error("Reset link was not captured in the local email mock");
  return { url, token: decodeURIComponent(new URL(url).pathname.split("/").at(-1) ?? "") };
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "veci_password_e2e" });
  process.env.LANDING_BASE_URL = "http://localhost:3000";
  process.env.EMAIL_FROM = "test@example.test";
  (resend.emails.send as jest.Mock).mockClear();
  server = app.listen(0);
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server failed to bind");
  base = `http://127.0.0.1:${address.port}/api/v1`;
});

beforeEach(() => {
  resetAuthRateLimitState();
  (resend.emails.send as jest.Mock).mockClear();
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

describe("password recovery security", () => {
  it("returns a generic response and sends a localized reset link using configured local Landing", async () => {
    const { user } = await makeEmailUser("LegacyPass!7");
    const missing = await call("POST", "/auth/forgot-password", undefined, { email: "missing@example.test" });
    const existing = await call("POST", "/auth/forgot-password", undefined, { email: user.email, redirectUrl: "https://attacker.example.test/" }, { "accept-language": "es,de;q=0.8" });
    expect(missing.status).toBe(200);
    expect(existing.status).toBe(200);
    expect(existing.body.message).toBe(missing.body.message);
    expect(resend.emails.send).toHaveBeenCalledTimes(1);
    const { url, token } = getResetTokenFromCapturedEmail();
    expect(url).toMatch(/^http:\/\/localhost:3000\/es\/reset-password\//);
    expect(url).not.toContain("veci-latin.com");
    expect(url).toContain(encodeURIComponent(token));

    const saved = await User.findById(user._id);
    expect(saved?.passwordResetToken).toBe(crypto.createHash("sha256").update(token).digest("hex"));
    expect(saved?.passwordResetToken).not.toBe(token);
    expect(saved?.passwordResetExpires).toBeInstanceOf(Date);
    expect(saved!.passwordResetExpires!.getTime()).toBeGreaterThan(Date.now());
    expect(saved!.passwordResetExpires!.getTime() - Date.now()).toBeLessThanOrEqual(15 * 60 * 1000);
    expect(User.schema.path("passwordResetToken").options.index).toBe(true);
  });

  it("resets password, revokes prior JWT, clears token state and rejects reuse", async () => {
    const { user, token: oldJwt } = await makeEmailUser("LegacyPass!7");
    await call("POST", "/auth/forgot-password", undefined, { email: user.email });
    const { token: resetToken } = getResetTokenFromCapturedEmail();

    const result = await call("POST", "/auth/reset-password", undefined, { token: resetToken, password: "NewPass!8" });
    expect(result.status).toBe(200);
    const saved = await User.findById(user._id).select("+passwordHash");
    expect(await bcrypt.compare("NewPass!8", saved!.passwordHash!)).toBe(true);
    expect(saved?.passwordResetToken).toBeFalsy();
    expect(saved?.passwordResetExpires).toBeFalsy();
    expect(saved?.tokenVersion).toBe(1);
    expect((await call("GET", "/auth/me", oldJwt)).status).toBe(401);
    expect((await call("POST", "/auth/reset-password", undefined, { token: resetToken, password: "OtherPass!9" })).status).toBe(400);
    expect((await call("POST", "/auth/login", undefined, { email: user.email, password: "NewPass!8" })).status).toBe(200);
  });

  it("rejects expired and invalid tokens and accepts a still-valid legacy raw token once", async () => {
    const { user } = await makeEmailUser("LegacyPass!7");
    const invalid = await call("POST", "/auth/reset-password", undefined, { token: "invalid-token", password: "NewPass!8" });
    expect(invalid.status).toBe(400);

    user.passwordResetToken = "expired-legacy-token";
    user.passwordResetExpires = new Date(Date.now() - 1_000);
    await user.save();
    const expired = await call("POST", "/auth/reset-password", undefined, { token: "expired-legacy-token", password: "NewPass!8" });
    expect(expired.status).toBe(400);

    user.passwordResetToken = "pending-legacy-token";
    user.passwordResetExpires = new Date(Date.now() + 60_000);
    await user.save();
    const legacy = await call("POST", "/auth/reset-password", undefined, { token: "pending-legacy-token", password: "NewPass!8" });
    expect(legacy.status).toBe(200);
    expect((await User.findById(user._id))?.passwordResetToken).toBeFalsy();
  });

  it("allows only one of two concurrent requests to consume the same reset token", async () => {
    const { user } = await makeEmailUser("LegacyPass!7");
    await call("POST", "/auth/forgot-password", undefined, { email: user.email });
    const { token: resetToken } = getResetTokenFromCapturedEmail();
    const results = await Promise.all([
      call("POST", "/auth/reset-password", undefined, { token: resetToken, password: "NewPass!8" }),
      call("POST", "/auth/reset-password", undefined, { token: resetToken, password: "OtherPass!9" }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 400]);
    const saved = await User.findById(user._id).select("+passwordHash");
    expect(saved?.tokenVersion).toBe(1);
    expect(saved?.passwordResetToken).toBeFalsy();
  });

  it("keeps Google-only accounts on the existing generic recovery response", async () => {
    const google = await User.create({ name: "Google", email: `${new mongoose.Types.ObjectId()}@example.test`, provider: "google", providerId: "google-id", isVerified: true });
    const response = await call("POST", "/auth/forgot-password", undefined, { email: google.email });
    expect(response.status).toBe(200);
    expect(resend.emails.send).not.toHaveBeenCalled();
    expect(await User.findById(google._id).then((saved) => saved?.passwordResetToken)).toBeFalsy();
  });

  it("keeps the response generic if the local email provider fails", async () => {
    const { user } = await makeEmailUser("LegacyPass!7");
    (resend.emails.send as jest.Mock).mockRejectedValueOnce(new Error("provider rejected mail"));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const existing = await call("POST", "/auth/forgot-password", undefined, { email: user.email });
    const missing = await call("POST", "/auth/forgot-password", undefined, { email: "not-here@example.test" });
    expect(existing.status).toBe(200);
    expect(existing.body.message).toBe(missing.body.message);
    expect(warn).toHaveBeenCalledWith("Password reset email delivery failed");
    expect(warn.mock.calls.flat().join(" ")).not.toContain("LegacyPass");
    warn.mockRestore();
  });

  it("returns HTTP 429 with Retry-After for forgot and reset requests", async () => {
    const forgotResponses = await Promise.all(Array.from({ length: 6 }, (_, index) =>
      call("POST", "/auth/forgot-password", undefined, { email: `rate-${index}@example.test` })
    ));
    const forgotLimited = forgotResponses.find((result) => result.status === 429);
    expect(forgotLimited).toBeDefined();
    expect(forgotLimited?.retryAfter).toMatch(/^\d+$/);
    expect(forgotLimited?.body.code).toBe("RATE_LIMITED");
    const resetResponses = await Promise.all(Array.from({ length: 11 }, (_, index) =>
      call("POST", "/auth/reset-password", undefined, { token: `bad-rate-${index}`, password: "NewPass!8" })
    ));
    const resetLimited = resetResponses.find((result) => result.status === 429);
    expect(resetLimited).toBeDefined();
    expect(resetLimited?.retryAfter).toMatch(/^\d+$/);
    expect(resetLimited?.body.code).toBe("RATE_LIMITED");
  });
});
