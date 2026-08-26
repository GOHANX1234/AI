import { NextResponse } from "next/server";
import { connectToDatabase } from "./mongodb";
import RateLimit from "./models/RateLimit";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Durable (MongoDB-backed) fixed-window rate limiter for API route handlers.
 *
 * State is shared across every serverless instance, so the limit actually holds
 * in production (an in-process Map cannot). It must only
 * be called from Node-runtime route handlers — Mongoose cannot run on the Edge,
 * and the Next.js proxy is explicitly not meant for database round trips.
 *
 * Fails open: if the database is unreachable we allow the request rather than
 * taking the whole app down with the counter store.
 */
export async function checkRateLimitDurable(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetInSeconds = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));

  try {
    await connectToDatabase();

    const doc = await RateLimit.findOneAndUpdate(
      { _id: `${identifier}:${windowStart}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(windowStart + windowMs) },
      },
      { upsert: true, new: true }
    );

    const count = doc?.count ?? 1;

    return {
      success: count <= maxRequests,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetInSeconds,
    };
  } catch (err) {
    console.error("Durable rate limit check failed, allowing request:", err);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      resetInSeconds,
    };
  }
}

/**
 * Extracts the caller's IP from proxy headers for use as a rate limit key.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Standard 429 response with a Retry-After header.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please retry in ${result.resetInSeconds} seconds.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.resetInSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  );
}
