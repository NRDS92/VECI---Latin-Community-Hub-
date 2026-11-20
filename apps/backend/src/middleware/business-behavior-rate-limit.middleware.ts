import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { BusinessBehaviorRateLimit } from "../modules/business/business-behavior-rate-limit.model";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

const bucketKey = (req: Request) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured");
  const userId = (req as any).user?.id;
  // req.ip is never retained; only this HMAC is persisted for the active minute.
  const identity = userId
    ? `user:${userId}`
    : `anonymous:${req.ip ?? req.socket.remoteAddress ?? "unknown"}:${req.get("user-agent") ?? ""}`;
  return crypto.createHmac("sha256", secret).update(`business-behavior-rate:${identity}`).digest("hex");
};

export const businessBehaviorRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / WINDOW_MS) * WINDOW_MS);
  const identityKey = bucketKey(req);
  try {
    await BusinessBehaviorRateLimit.findOneAndUpdate(
      { identityKey, windowStart, count: { $lt: MAX_REQUESTS_PER_WINDOW } },
      {
        $inc: { count: 1 },
        $setOnInsert: { identityKey, windowStart, expiresAt: new Date(windowStart.getTime() + 2 * WINDOW_MS) },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: false }
    );
    return next();
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) return next(error);
  }

  try {
    // A duplicate-key race can mean either a full bucket or a concurrent first insert; retry without upsert.
    const bucket = await BusinessBehaviorRateLimit.findOneAndUpdate(
      { identityKey, windowStart, count: { $lt: MAX_REQUESTS_PER_WINDOW } },
      { $inc: { count: 1 } },
      { returnDocument: "after" }
    );
    if (bucket) return next();
    return res.status(429).json({ success: false, message: "Too many behavior events", code: "RATE_LIMITED" });
  } catch (error) {
    return next(error);
  }
};
