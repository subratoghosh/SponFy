import { getRedisClient, isRedisConfigured } from "./redis";

interface InMemCacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, InMemCacheEntry<any>>();

// Bounded in-memory size to prevent memory leaks in serverless/local
const MAX_IN_MEM_ENTRIES = 500;

function pruneMemoryCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
  if (memoryCache.size > MAX_IN_MEM_ENTRIES) {
    const oldestKeys = Array.from(memoryCache.keys()).slice(0, 100);
    for (const k of oldestKeys) {
      memoryCache.delete(k);
    }
  }
}

/**
 * Retrieve cached JSON value from Upstash Redis or local memory cache.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();

  if (redis && isRedisConfigured()) {
    try {
      const data = await redis.get<T>(`sponfy:cache:${key}`);
      if (data !== null && data !== undefined) {
        return data;
      }
    } catch (err) {
      console.warn(`[Cache Warning] Failed to read Redis cache key ${key}:`, err);
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (entry) {
    if (Date.now() < entry.expiresAt) {
      return entry.value as T;
    }
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Store JSON value in Upstash Redis or local memory cache with TTL.
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds = 300
): Promise<void> {
  const redis = getRedisClient();

  if (redis && isRedisConfigured()) {
    try {
      await redis.set(`sponfy:cache:${key}`, value, { ex: ttlSeconds });
      return;
    } catch (err) {
      console.warn(`[Cache Warning] Failed to write Redis cache key ${key}:`, err);
    }
  }

  // Memory fallback
  pruneMemoryCache();
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Remove cached value or invalidation by key.
 */
export async function deleteCached(key: string): Promise<void> {
  const redis = getRedisClient();

  if (redis && isRedisConfigured()) {
    try {
      await redis.del(`sponfy:cache:${key}`);
    } catch (err) {
      console.warn(`[Cache Warning] Failed to delete Redis key ${key}:`, err);
    }
  }

  memoryCache.delete(key);
}
