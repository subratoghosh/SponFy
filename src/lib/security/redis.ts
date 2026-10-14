import { Redis } from "@upstash/redis";

/**
 * Server-only Upstash Redis client.
 * Reuses initialized Redis instance across Vercel serverless executions.
 */
let redisInstance: Redis | null = null;

export function isRedisConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return !!(
    url &&
    token &&
    url.startsWith("https://") &&
    token.length > 5 &&
    !token.includes("your-")
  );
}

export function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisInstance;
}
