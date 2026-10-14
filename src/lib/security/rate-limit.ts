import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient, isRedisConfigured } from "./redis";
import { NextResponse } from "next/server";

export type RateLimitCategory =
  | "read"
  | "discover"
  | "relevance"
  | "draft"
  | "verify"
  | "send"
  | "auth";

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
  windowStr: `${number} m` | `${number} s` | `${number} h` | `${number} d`;
  failClosed: boolean;
}

export const RATE_LIMIT_POLICIES: Record<RateLimitCategory, RateLimitPolicy> = {
  read: {
    limit: 60,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: false, // Low-risk reads can degrade gracefully in dev/outage
  },
  discover: {
    limit: 5,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: true, // Expensive Tavily API
  },
  relevance: {
    limit: 10,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: true, // LLM/Grok/Groq API
  },
  draft: {
    limit: 10,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: true, // Expensive AI generation
  },
  verify: {
    limit: 20,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: true, // Hunter / ZeroBounce credits
  },
  send: {
    limit: 10,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: true, // Strict Gmail sending
  },
  auth: {
    limit: 10,
    windowMs: 60 * 1000,
    windowStr: "1 m",
    failClosed: true, // Brute-force protection
  },
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in ms
  retryAfter: number; // Seconds
  failClosedError?: boolean;
}

// Cached Upstash Ratelimit instances
const upstashLimiters = new Map<RateLimitCategory, Ratelimit>();

// In-memory sliding window fallback for local dev & testing when Redis is not configured
interface InMemRecord {
  timestamps: number[];
}
const inMemoryStores = new Map<string, InMemRecord>();

function checkInMemoryFallback(
  category: RateLimitCategory,
  identifier: string
): RateLimitResult {
  const policy = RATE_LIMIT_POLICIES[category];
  const now = Date.now();
  const windowStart = now - policy.windowMs;
  const storeKey = `${category}:${identifier}`;

  let record = inMemoryStores.get(storeKey);
  if (!record) {
    record = { timestamps: [] };
    inMemoryStores.set(storeKey, record);
  }

  // Filter timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= policy.limit) {
    const oldest = record.timestamps[0];
    const reset = oldest + policy.windowMs;
    const retryAfter = Math.max(1, Math.ceil((reset - now) / 1000));
    return {
      allowed: false,
      limit: policy.limit,
      remaining: 0,
      reset,
      retryAfter,
    };
  }

  record.timestamps.push(now);
  const remaining = policy.limit - record.timestamps.length;
  const reset = now + policy.windowMs;

  return {
    allowed: true,
    limit: policy.limit,
    remaining,
    reset,
    retryAfter: 0,
  };
}

/**
 * Check rate limit for a given category and identifier (e.g. userId or IP).
 */
export async function checkRateLimit(
  category: RateLimitCategory,
  identifier: string
): Promise<RateLimitResult> {
  const policy = RATE_LIMIT_POLICIES[category];
  const redis = getRedisClient();

  // If Redis is not configured (local dev, test environment without Upstash credentials)
  if (!redis || !isRedisConfigured()) {
    return checkInMemoryFallback(category, identifier);
  }

  try {
    let limiter = upstashLimiters.get(category);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(policy.limit, policy.windowStr),
        prefix: `sponfy:rl:${category}`,
        analytics: true,
      });
      upstashLimiters.set(category, limiter);
    }

    const res = await limiter.limit(identifier);
    const retryAfter = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));

    return {
      allowed: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: res.reset,
      retryAfter: res.success ? 0 : retryAfter,
    };
  } catch (error) {
    console.error(`[RateLimit Error] Failed checking Redis rate limit for ${category}:`, error);

    // If failClosed is true for expensive operations, safely block to protect external quotas
    if (policy.failClosed) {
      return {
        allowed: false,
        limit: policy.limit,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 60,
        failClosedError: true,
      };
    }

    // Otherwise fallback to in-memory for low-risk read operations
    return checkInMemoryFallback(category, identifier);
  }
}

/**
 * Standard HTTP 429 or 503 response for rate limit violations.
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  if (result.failClosedError) {
    return NextResponse.json(
      {
        error: "Rate limiting service temporarily unavailable. Please retry in a moment.",
        code: "RATE_LIMIT_SERVICE_UNAVAILABLE",
      },
      {
        status: 503,
        headers: {
          "Retry-After": String(result.retryAfter || 60),
        },
      }
    );
  }

  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      limit: result.limit,
      remaining: result.remaining,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    }
  );
}
