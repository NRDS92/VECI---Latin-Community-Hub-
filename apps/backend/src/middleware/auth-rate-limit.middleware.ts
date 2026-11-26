import { NextFunction, Request, Response } from "express";

type Bucket = { count: number; expiresAt: number };
type RateLimitOptions = { limit: number; windowMs: number };

const buckets = new Map<string, Bucket>();

export const createAuthRateLimiter = ({ limit, windowMs }: RateLimitOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(key);
    }

    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${req.baseUrl}${req.path}:${clientIp}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.expiresAt <= now) {
      bucket = { count: 0, expiresAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        code: "RATE_LIMITED",
      });
    }

    // Bound memory usage if an attacker supplies many distinct source IPs.
    if (buckets.size > 10_000) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }

    return next();
  };

export const forgotPasswordRateLimit = createAuthRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
export const resetPasswordRateLimit = createAuthRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

// Isolated HTTP tests use this to avoid sharing rate-limit state between cases.
export const resetAuthRateLimitState = () => buckets.clear();
