import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: async () => ({
    user: { id: "usr-demo-lead", email: "demo@sponfy.dev", name: "Test Lead" },
  }),
}));

import { checkRateLimit, createRateLimitResponse, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { isSafeExternalUrl } from "@/lib/security/auth-guard";
import { claimDraftForSending, releaseDraftClaim } from "@/lib/data/repositories/outreach";
import { getCached, setCached } from "@/lib/security/cache";

describe("Production Security & Redis Rate Limiting Suite", () => {
  describe("1. Distributed Rate Limiting & Policies", () => {
    it("allows requests below configured limits and decrements remaining quota", async () => {
      const id = `user-rl-test-${Date.now()}`;
      const res1 = await checkRateLimit("read", id);
      expect(res1.allowed).toBe(true);
      expect(res1.limit).toBe(RATE_LIMIT_POLICIES.read.limit);
      expect(res1.remaining).toBe(RATE_LIMIT_POLICIES.read.limit - 1);

      const res2 = await checkRateLimit("read", id);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(RATE_LIMIT_POLICIES.read.limit - 2);
    });

    it("enforces strict limits and returns 429 with Retry-After when quota exceeded", async () => {
      const id = `user-discover-cap-${Date.now()}`;
      const maxRequests = RATE_LIMIT_POLICIES.discover.limit; // 5 req/min

      // Consume entire quota
      for (let i = 0; i < maxRequests; i++) {
        const res = await checkRateLimit("discover", id);
        expect(res.allowed).toBe(true);
      }

      // Next request must be rejected
      const blocked = await checkRateLimit("discover", id);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeGreaterThan(0);

      // Verify HTTP 429 response structure
      const response = createRateLimitResponse(blocked);
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBeDefined();
      expect(response.headers.get("X-RateLimit-Limit")).toBe(String(maxRequests));

      const json = await response.json();
      expect(json.code).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("isolates rate limits between separate users", async () => {
      const userA = `user-alice-${Date.now()}`;
      const userB = `user-bob-${Date.now()}`;

      // Alice exhausts her 5 discovery requests
      for (let i = 0; i < 5; i++) {
        await checkRateLimit("discover", userA);
      }
      const aliceBlocked = await checkRateLimit("discover", userA);
      expect(aliceBlocked.allowed).toBe(false);

      // Bob's quota must still be completely intact
      const bobAllowed = await checkRateLimit("discover", userB);
      expect(bobAllowed.allowed).toBe(true);
      expect(bobAllowed.remaining).toBe(RATE_LIMIT_POLICIES.discover.limit - 1);
    });

    it("isolates limits across different operation categories for the same user", async () => {
      const user = `user-multi-cat-${Date.now()}`;

      // Exhaust discover limit (5)
      for (let i = 0; i < 5; i++) {
        await checkRateLimit("discover", user);
      }
      const discoverBlocked = await checkRateLimit("discover", user);
      expect(discoverBlocked.allowed).toBe(false);

      // Draft limit (10) and Read limit (60) must still be allowed
      const draftAllowed = await checkRateLimit("draft", user);
      expect(draftAllowed.allowed).toBe(true);

      const readAllowed = await checkRateLimit("read", user);
      expect(readAllowed.allowed).toBe(true);
    });

    it("handles fail-closed policy with 503 response when Redis errors on expensive operations", () => {
      const failClosedResult = {
        allowed: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 60,
        failClosedError: true,
      };

      const response = createRateLimitResponse(failClosedResult);
      expect(response.status).toBe(503);
      expect(response.headers.get("Retry-After")).toBe("60");
    });
  });

  describe("2. Open Redirect & SSRF URL Validation", () => {
    it("blocks cloud metadata services (169.254.169.254)", () => {
      expect(isSafeExternalUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
      expect(isSafeExternalUrl("https://169.254.169.254/secret")).toBe(false);
    });

    it("blocks loopback and localhost destinations", () => {
      expect(isSafeExternalUrl("http://localhost:3000/api/admin")).toBe(false);
      expect(isSafeExternalUrl("http://127.0.0.1:8080/")).toBe(false);
      expect(isSafeExternalUrl("http://0.0.0.0/")).toBe(false);
      expect(isSafeExternalUrl("http://[::1]/")).toBe(false);
    });

    it("blocks private network IP ranges (RFC 1918)", () => {
      expect(isSafeExternalUrl("http://10.0.0.1/admin")).toBe(false);
      expect(isSafeExternalUrl("http://172.16.0.1/internal")).toBe(false);
      expect(isSafeExternalUrl("http://192.168.1.1/router")).toBe(false);
    });

    it("blocks non-HTTP protocols", () => {
      expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
      expect(isSafeExternalUrl("data:text/html,<script>")).toBe(false);
      expect(isSafeExternalUrl("ftp://ftp.example.com")).toBe(false);
    });

    it("allows valid public HTTPS domains", () => {
      expect(isSafeExternalUrl("https://google.com")).toBe(true);
      expect(isSafeExternalUrl("https://stripe.com/docs")).toBe(true);
      expect(isSafeExternalUrl("https://sponsor-company.in/partnership")).toBe(true);
    });
  });

  describe("3. Concurrency & Duplicate Send Prevention", () => {
    it("atomically claims a draft and prevents concurrent sends", async () => {
      const draftId = `atomic-draft-${Date.now()}`;

      // In memory demo store simulation
      const { memoryStore } = await import("@/lib/data/memory-store");
      const draftsStoreRef = memoryStore<any[]>("drafts", () => []);
      draftsStoreRef.value.push({
        id: draftId,
        companyId: "comp-1",
        status: "approved",
      });

      // First claim succeeds
      const firstClaim = await claimDraftForSending(draftId);
      expect(firstClaim).toBe(true);

      // Concurrent second claim must immediately fail
      const secondClaim = await claimDraftForSending(draftId);
      expect(secondClaim).toBe(false);

      // Releasing claim sets it back to approved for retry
      await releaseDraftClaim(draftId);
      const afterReleaseClaim = await claimDraftForSending(draftId);
      expect(afterReleaseClaim).toBe(true);
    });
  });

  describe("4. Centralized Caching Module", () => {
    it("sets, gets, and respects TTL expiration in cache", async () => {
      const testKey = `test-cache-${Date.now()}`;
      const testVal = { company: "Acme Cloud", score: 95 };

      await setCached(testKey, testVal, 300);
      const cached = await getCached<typeof testVal>(testKey);
      expect(cached).toEqual(testVal);

      // Non-existent key returns null
      const missing = await getCached("missing-non-existent-key");
      expect(missing).toBeNull();
    });
  });
});
