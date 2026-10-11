import "server-only";
import { NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
// Note: In serverless environments, state is stored per-instance and resets on cold start.
const store = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
let lastGc = Date.now();
function runGarbageCollection() {
  const now = Date.now();
  if (now - lastGc < 300000) return;
  lastGc = now;
  for (const [key, record] of store.entries()) {
    // Keep timestamps from the last 24 hours (for daily limits)
    record.timestamps = record.timestamps.filter((t) => now - t < 86400000);
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Seconds until oldest entry expires
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  runGarbageCollection();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const threshold = now - windowMs;

  const record = store.get(key) || { timestamps: [] };
  // Filter out timestamps outside the active window
  record.timestamps = record.timestamps.filter((t) => t > threshold);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0] || now;
    const reset = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, record);
    return {
      allowed: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  record.timestamps.push(now);
  store.set(key, record);

  const remaining = Math.max(0, limit - record.timestamps.length);
  const oldest = record.timestamps[0];
  const reset = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  return {
    allowed: true,
    limit,
    remaining,
    reset,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip");
  return realIp ? realIp.trim() : "127.0.0.1";
}

export function createRateLimitResponse(resetSeconds: number = 60): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again later.",
      retryAfter: resetSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(resetSeconds),
        "Content-Type": "application/json",
      },
    }
  );
}

// Preset limits matching project security specifications
export const RATE_LIMIT_CONFIGS = {
  auth: { limit: 10, windowSeconds: 60 }, // 10/min per IP
  discover: { limit: 15, windowSeconds: 60, maxBatch: 50 }, // 15/min, max 50 sponsors
  research: { limit: 10, windowSeconds: 60, maxConcurrency: 3 }, // 10/min, max 3 concurrent
  draft: { limit: 20, windowSeconds: 60 }, // 20/min per user
  send: { limit: 30, windowSeconds: 86400 }, // 30/day per user default send cap
  sync: { limit: 10, windowSeconds: 60 }, // 10/min per user
  ai: { limit: 20, windowSeconds: 60 }, // 20/min per user
} as const;
