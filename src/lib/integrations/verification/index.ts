import { HunterVerifier } from "./hunter";
import { ZeroBounceVerifier } from "./zerobounce";
import { VerificationResult, NormalizedVerificationStatus } from "./types";
import { getRedisClient } from "@/lib/security/redis";

// In-memory cache for fast verification lookup (prevents duplicate API spending)
const memoryCache = new Map<string, { result: VerificationResult; cachedAt: number }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cache freshness
const REDIS_TTL_SEC = 7 * 24 * 60 * 60; // 7 days in Redis

export class TieredVerificationService {
  private hunter: HunterVerifier;
  private zeroBounce: ZeroBounceVerifier;

  constructor(hunterKey?: string, zeroBounceKey?: string) {
    this.hunter = new HunterVerifier(hunterKey);
    this.zeroBounce = new ZeroBounceVerifier(zeroBounceKey);
  }

  isHunterConfigured(): boolean {
    return this.hunter.isConfigured();
  }

  isZeroBounceConfigured(): boolean {
    return this.zeroBounce.isConfigured();
  }

  /**
   * Verify an email using intelligent tiered verification:
   * 1. Check local memory cache and distributed Redis cache (within TTL)
   * 2. Call Layer 1: Hunter
   * 3. If Layer 1 is ACCEPT_ALL or UNKNOWN, or if high-risk, call Layer 2: ZeroBounce
   * 4. Cache and return normalized verdict
   */
  async verify(email: string, forceFresh = false): Promise<VerificationResult> {
    const cleanEmail = email.trim().toLowerCase();
    const redis = getRedisClient();

    // 1. Check local memory cache
    if (!forceFresh) {
      const cached = memoryCache.get(cleanEmail);
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        return {
          ...cached.result,
          provider: "cache",
        };
      }

      // Check distributed Upstash Redis cache
      if (redis) {
        try {
          const redisCached = await redis.get<VerificationResult | string>(`verif:${cleanEmail}`);
          if (redisCached) {
            const parsed = typeof redisCached === "string" ? JSON.parse(redisCached) : redisCached;
            memoryCache.set(cleanEmail, { result: parsed, cachedAt: Date.now() });
            return {
              ...parsed,
              provider: "cache",
            };
          }
        } catch {
          // Gracefully continue to fresh check on Redis read error
        }
      }
    }

    const persistCache = (res: VerificationResult) => {
      memoryCache.set(cleanEmail, { result: res, cachedAt: Date.now() });
      if (redis) {
        redis.set(`verif:${cleanEmail}`, JSON.stringify(res), { ex: REDIS_TTL_SEC }).catch(() => {});
      }
    };

    // Check basic email syntax first before spending any credits
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      const result: VerificationResult = {
        email: cleanEmail,
        status: "INVALID",
        provider: "tiered",
        isDeliverable: false,
        isDisposable: false,
        isAcceptAll: false,
        reason: "Invalid email syntax",
        recommendation: "block",
        checkedAt: new Date().toISOString(),
      };
      persistCache(result);
      return result;
    }

    // 2. Layer 1: Hunter (Primary verification)
    let primaryResult: VerificationResult;
    if (this.hunter.isConfigured()) {
      primaryResult = await this.hunter.verifyEmail(cleanEmail);
    } else if (this.zeroBounce.isConfigured()) {
      // Fallback directly to ZeroBounce if only ZeroBounce is configured
      primaryResult = await this.zeroBounce.verifyEmail(cleanEmail);
      persistCache(primaryResult);
      return primaryResult;
    } else {
      // Neither API configured: return graceful UNAVAILABLE (do not crash or fake VALID)
      return {
        email: cleanEmail,
        status: "VERIFICATION_UNAVAILABLE",
        provider: "tiered",
        isDeliverable: false,
        isDisposable: false,
        isAcceptAll: false,
        reason: "Neither Hunter nor ZeroBounce API keys are configured",
        recommendation: "review",
        checkedAt: new Date().toISOString(),
      };
    }

    // 3. Layer 2: ZeroBounce secondary verification (selective credit optimization)
    // Only trigger ZeroBounce if:
    // - Hunter gave ACCEPT_ALL or UNKNOWN
    // - Hunter marked it RISKY
    const needsSecondaryVerification =
      primaryResult.status === "ACCEPT_ALL" ||
      primaryResult.status === "UNKNOWN" ||
      primaryResult.status === "RISKY";

    if (needsSecondaryVerification && this.zeroBounce.isConfigured()) {
      try {
        const secondaryResult = await this.zeroBounce.verifyEmail(cleanEmail);

        // Reconcile findings
        if (secondaryResult.status === "VALID") {
          primaryResult = {
            ...secondaryResult,
            provider: "tiered",
            reason: `ZeroBounce confirmed valid after Hunter reported ${primaryResult.status}`,
          };
        } else if (secondaryResult.status === "INVALID" || secondaryResult.status === "DISPOSABLE") {
          primaryResult = {
            ...secondaryResult,
            provider: "tiered",
            reason: `ZeroBounce flagged as ${secondaryResult.status} (${secondaryResult.reason})`,
          };
        } else if (secondaryResult.status !== primaryResult.status) {
          primaryResult = {
            ...primaryResult,
            status: "PROVIDER_DISAGREEMENT",
            recommendation: "review",
            reason: `Providers disagreed: Hunter reported ${primaryResult.status}, ZeroBounce reported ${secondaryResult.status}`,
          };
        }
      } catch (err) {
        console.warn("Secondary ZeroBounce verification skipped:", err);
      }
    }

    // Cache final verdict
    persistCache(primaryResult);
    return primaryResult;
  }

  clearCache(): void {
    memoryCache.clear();
  }
}

let instance: TieredVerificationService | null = null;

export function getVerificationService(): TieredVerificationService {
  if (!instance) {
    instance = new TieredVerificationService();
  }
  return instance;
}
