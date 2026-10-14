import { describe, it, expect, beforeEach } from "vitest";
import { HunterVerifier } from "@/lib/integrations/verification/hunter";
import { ZeroBounceVerifier } from "@/lib/integrations/verification/zerobounce";
import { TieredVerificationService } from "@/lib/integrations/verification";
import { filterCandidateRelevance } from "@/lib/discovery/relevance";
import { evaluateSend, resolveRecipient } from "@/lib/outreach/send-guard";
import { MockGmailClient } from "@/lib/integrations/gmail";

describe("Email Verification Layer", () => {
  it("Hunter verifier reports UNAVAILABLE when API key is missing (never fakes VALID)", async () => {
    const verifier = new HunterVerifier("");
    expect(verifier.isConfigured()).toBe(false);

    const result = await verifier.verifyEmail("test@example.com");
    expect(result.status).toBe("VERIFICATION_UNAVAILABLE");
    expect(result.recommendation).toBe("review");
    expect(result.isDeliverable).toBe(false);
  });

  it("ZeroBounce verifier reports UNAVAILABLE when API key is missing", async () => {
    const verifier = new ZeroBounceVerifier("");
    expect(verifier.isConfigured()).toBe(false);

    const result = await verifier.verifyEmail("test@example.com");
    expect(result.status).toBe("VERIFICATION_UNAVAILABLE");
    expect(result.recommendation).toBe("review");
  });

  it("TieredVerificationService catches syntax errors before calling APIs", async () => {
    const service = new TieredVerificationService();
    const result = await service.verify("invalid-email-address");

    expect(result.status).toBe("INVALID");
    expect(result.recommendation).toBe("block");
    expect(result.isDeliverable).toBe(false);
  });

  it("Caches verification results to prevent redundant API spending", async () => {
    const service = new TieredVerificationService();
    // Pre-cache an address
    const first = await service.verify("bad-syntax");
    expect(first.status).toBe("INVALID");

    const second = await service.verify("bad-syntax");
    expect(second.provider).toBe("cache");
  });
});

describe("Sponsor Fast Relevance Filter", () => {
  it("filters out informational and campus-internal domains deterministically", async () => {
    const irrelevantCandidate = {
      name: "Wikipedia Foundation",
      website: "https://en.wikipedia.org/wiki/Sponsorship",
      description: "Online encyclopedia article.",
    };

    const res = await filterCandidateRelevance(irrelevantCandidate, "Find developer tools sponsors");
    expect(res.verdict).toBe("IRRELEVANT");
    expect(res.confidence).toBeGreaterThanOrEqual(90);
  });

  it("filters out student clubs or campus societies", async () => {
    const clubCandidate = {
      name: "ACM Student Chapter",
      website: "https://acm-chapter.edu",
      description: "College campus student chapter organizing workshops.",
    };

    const res = await filterCandidateRelevance(clubCandidate, "Find sponsors for event");
    expect(res.verdict).toBe("IRRELEVANT");
  });

  it("marks genuine matching tech sponsors as RELEVANT", async () => {
    const candidate = {
      name: "Postman",
      website: "https://postman.com",
      industry: "Developer Tools",
      description: "API platform supporting community grants and student hackathons.",
    };

    const res = await filterCandidateRelevance(
      candidate,
      "Find API and developer tools sponsors",
      ["Developer Tools", "AI"]
    );

    expect(res.verdict).toBe("RELEVANT");
    expect(res.confidence).toBeGreaterThan(80);
  });
});

describe("Pre-Send Send-Guard Deliverability Checks", () => {
  it("blocks sends to contacts with INVALID email verification status", () => {
    const verdict = evaluateSend({
      draftStatus: "approved",
      recipient: "bounce@test.com",
      suppressed: false,
      priorOutbound: [],
      sentInWindow: 0,
      dailyLimit: 30,
      verificationStatus: "INVALID",
    });

    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe("verification_invalid");
    }
  });

  it("blocks sends to contacts with DISPOSABLE email verification status", () => {
    const verdict = evaluateSend({
      draftStatus: "approved",
      recipient: "temp@mailinator.com",
      suppressed: false,
      priorOutbound: [],
      sentInWindow: 0,
      dailyLimit: 30,
      verificationStatus: "DISPOSABLE",
    });

    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe("verification_disposable");
    }
  });

  it("blocks RISKY emails when sender health is AT_RISK", () => {
    const verdict = evaluateSend({
      draftStatus: "approved",
      recipient: "risky@domain.com",
      suppressed: false,
      priorOutbound: [],
      sentInWindow: 0,
      dailyLimit: 30,
      verificationStatus: "RISKY",
      senderHealthAtRisk: true,
    });

    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.code).toBe("verification_risky");
    }
  });

  it("allows sends when status is VALID and all gates pass", () => {
    const verdict = evaluateSend({
      draftStatus: "approved",
      recipient: "verified@sponsor.com",
      suppressed: false,
      priorOutbound: [],
      sentInWindow: 5,
      dailyLimit: 30,
      verificationStatus: "VALID",
    });

    expect(verdict.ok).toBe(true);
  });
});

describe("Gmail Bounce Inspection Adapter", () => {
  it("MockGmailClient provides scanBounces returning empty array without error", async () => {
    const client = new MockGmailClient();
    const bounces = await client.scanBounces();
    expect(Array.isArray(bounces)).toBe(true);
    expect(bounces.length).toBe(0);
  });
});
