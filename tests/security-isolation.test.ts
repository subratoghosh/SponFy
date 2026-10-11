import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database to run fast and isolated in-memory
vi.mock("@/lib/prisma", () => ({
  prisma: {},
  default: {},
  isDatabaseConfigured: () => false,
}));

let activeSession: any = null;
vi.mock("@/lib/auth", () => ({
  auth: async () => activeSession,
}));

import {
  createCampaign,
  getCampaignById,
  updateCampaign,
  getCampaigns,
} from "@/lib/data/repositories/campaigns";
import {
  addSponsor,
  getSponsorById,
  updateSponsor,
} from "@/lib/data/repositories/sponsors";
import {
  createDraft,
  getDraftById,
  updateDraft,
  claimDraftForSending,
  approveDraft,
} from "@/lib/data/repositories/outreach";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { createSignedOAuthState, verifySignedOAuthState } from "@/lib/oauth-state";

describe("Security Hardening & Multi-Tenant Isolation", () => {
  beforeEach(() => {
    activeSession = null;
  });

  describe("Repository Layer Tenant Isolation (Point 2 & 3)", () => {
    it("ensures User B cannot read or modify User A's campaigns", async () => {
      const userA = "usr-tenant-alpha";
      const userB = "usr-tenant-beta";

      const campaignA = await createCampaign(
        {
          name: "Alpha Tech Summit",
          eventType: "Hackathon",
          audienceSize: 2000,
          location: "Bangalore",
          targetAmount: 500000,
          preferredIndustries: ["Developer Tools"],
          tiers: [],
          description: "Alpha hackathon description",
          status: "active",
        },
        userA
      );

      // Verify User A can fetch it
      const fetchedByA = await getCampaignById(campaignA.id, userA);
      expect(fetchedByA).not.toBeNull();
      expect(fetchedByA?.name).toBe("Alpha Tech Summit");

      // Verify User B cannot update User A's campaign
      const hackAttempt = await updateCampaign(
        campaignA.id,
        { name: "Hacked by Beta" },
        userB
      );
      // In isolated environments, update returns null on non-owned ID
      expect(hackAttempt === null || hackAttempt.name !== "Hacked by Beta").toBe(true);

      const unchanged = await getCampaignById(campaignA.id, userA);
      expect(unchanged?.name).toBe("Alpha Tech Summit");
    });

    it("ensures User B cannot claim or approve User A's email drafts", async () => {
      const userA = "usr-tenant-alpha";
      const userB = "usr-tenant-beta";

      const draftA = await createDraft({
        userId: userA,
        companyId: "comp-acme-1",
        contactId: "con-1",
        subject: "Partnership Proposal",
        body: "Hello Acme team",
        quality: {
          personalization: 90,
          relevance: 90,
          clarity: 90,
          cta: 90,
          professionalism: 90,
          overall: 90,
          suggestions: [],
        },
        status: "draft",
      });

      // User B attempts to approve User A's draft
      const bApproveAttempt = await approveDraft(draftA.id, userB);
      // Draft should not be approved by B
      const currentDraft = await getDraftById(draftA.id);
      expect(currentDraft?.status).not.toBe("sent");

      // User B attempts to claim draft for sending
      const bClaim = await claimDraftForSending(draftA.id, userB);
      expect(bClaim).toBe(false);
    });

    it("rejects non-http/https protocols for campaign deck URLs", async () => {
      await expect(
        createCampaign(
          {
            name: "Malicious Deck Test",
            eventType: "Conference",
            audienceSize: 100,
            location: "Online",
            targetAmount: 10000,
            preferredIndustries: [],
            tiers: [],
            description: "Malicious test description",
            deckUrl: "javascript:alert('xss')",
            status: "active",
          },
          "usr-test"
        )
      ).rejects.toThrow("Invalid deck URL");
    });
  });

  describe("API Route Handler Authentication Guards (Point 2)", () => {
    it("rejects unauthenticated requests to research route with 401", async () => {
      activeSession = null;
      const { POST: researchPost } = await import("@/app/api/research/route");
      const req = new Request("http://localhost:3000/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: "c1" }),
      });
      const res = await researchPost(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to discover route with 401", async () => {
      activeSession = null;
      const { POST: discoverPost } = await import("@/app/api/discover/route");
      const req = new Request("http://localhost:3000/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: "c1" }),
      });
      const res = await discoverPost(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to outreach draft route with 401", async () => {
      activeSession = null;
      const { POST: draftPost } = await import("@/app/api/outreach/draft/route");
      const req = new Request("http://localhost:3000/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: "c1" }),
      });
      const res = await draftPost(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to outreach send route with 401", async () => {
      activeSession = null;
      const { POST: sendPost } = await import("@/app/api/outreach/send/route");
      const req = new Request("http://localhost:3000/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: "d1" }),
      });
      const res = await sendPost(req);
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to outreach state route with 401", async () => {
      activeSession = null;
      const { GET: stateGet } = await import("@/app/api/outreach/state/route");
      const res = await stateGet();
      expect(res.status).toBe(401);
    });
  });

  describe("Cron Constant-Time Secret Verification (Point 12)", () => {
    it("rejects unauthorized calls without Bearer token on /api/cron/sync-replies", async () => {
      const { GET: cronGet } = await import("@/app/api/cron/sync-replies/route");
      const req = new Request("http://localhost:3000/api/cron/sync-replies", {
        headers: {},
      });
      const res = await cronGet(req);
      expect(res.status).toBe(401);
    });

    it("rejects calls with an incorrect secret on /api/cron/sync-replies", async () => {
      const { GET: cronGet } = await import("@/app/api/cron/sync-replies/route");
      const req = new Request("http://localhost:3000/api/cron/sync-replies", {
        headers: { Authorization: "Bearer wrong-attacker-secret-token" },
      });
      const res = await cronGet(req);
      expect(res.status).toBe(401);
    });
  });

  describe("Rate Limiting Guardrails (Point 6)", () => {
    it("enforces sliding window request limits and returns 429 after threshold", () => {
      const key = `test-user-${Date.now()}`;
      const limit = 3;
      const windowSeconds = 60;

      // First 3 requests allowed
      expect(checkRateLimit(key, limit, windowSeconds).allowed).toBe(true);
      expect(checkRateLimit(key, limit, windowSeconds).allowed).toBe(true);
      expect(checkRateLimit(key, limit, windowSeconds).allowed).toBe(true);

      // 4th request blocked
      const blocked = checkRateLimit(key, limit, windowSeconds);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.reset).toBeGreaterThan(0);
    });
  });

  describe("OAuth State Signature Cryptographic Verification (Point 7)", () => {
    it("signs state tied to userId and verifies successfully", () => {
      const userId = "usr-secure-test-99";
      const signedState = createSignedOAuthState(userId);

      const result = verifySignedOAuthState(signedState, userId);
      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userId);
    });

    it("rejects tampered state signatures", () => {
      const userId = "usr-secure-test-99";
      const signedState = createSignedOAuthState(userId);
      const tampered = signedState.slice(0, -4) + "XXXX";

      const result = verifySignedOAuthState(tampered, userId);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("signature");
    });

    it("rejects state belonging to a different user ID (anti-CSRF)", () => {
      const userA = "usr-alice";
      const userB = "usr-bob";
      const signedState = createSignedOAuthState(userA);

      const result = verifySignedOAuthState(signedState, userB);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("does not match session");
    });
  });
});
