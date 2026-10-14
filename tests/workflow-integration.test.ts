import { describe, it, expect, beforeEach, vi } from "vitest";

// Run repositories against in-memory demo store
vi.mock("@/lib/prisma", () => ({
  prisma: {},
  default: {},
  isDatabaseConfigured: () => false,
}));
vi.mock("@/lib/auth", () => ({
  auth: async () => ({ user: { id: "usr-demo-lead", email: "demo@sponfy.dev" } }),
}));

import { evaluateSend, resolveRecipient } from "@/lib/outreach/send-guard";
import { computeFollowups, buildFollowupDraft, MAX_TOUCHES } from "@/lib/outreach/followups";
import { SYSTEM_LIMITS } from "@/lib/config/limits";
import { addSponsor, DuplicateCompanyError } from "@/lib/data/repositories/sponsors";
import {
  saveDiscoveryResults,
  getDiscoveryResults,
  clearDiscoveryResults,
} from "@/lib/data/repositories/discovery-results";
import type { Company, EmailDraft, Message, Contact } from "@/types";

const makeDummyCompany = (over: Partial<Company> = {}): Company => ({
  id: "comp-default",
  campaignId: "camp-test",
  name: "Default Company",
  website: "https://example.com",
  industry: "Technology",
  description: "Test description",
  stage: "Contacted",
  fitScore: 80,
  scoreBreakdown: [],
  pipelineValue: 0,
  signals: [],
  confidence: 90,
  researchStatus: "pending",
  contacts: [],
  sources: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...over,
});

const makeDummyContact = (over: Partial<Contact> = {}): Contact => ({
  id: "con-default",
  companyId: "comp-default",
  name: "Contact Person",
  role: "Sponsorship Manager",
  email: "partner@example.com",
  status: "verified",
  createdAt: new Date().toISOString(),
  ...over,
});

describe("Workflow Integration: Discovery, Approval, Drafts, Send & Follow-ups", () => {
  describe("1. Discovery Isolation", () => {
    it("stores unapproved candidates separately from the sponsor pipeline", async () => {
      const campaignId = "camp-test-isolation";
      const userId = "usr-test-disc";
      await clearDiscoveryResults(userId, campaignId);

      const saved = await saveDiscoveryResults(userId, campaignId, [
        {
          name: "Acme Cloud",
          domain: "acme.cloud",
          industry: "Cloud",
          fitScore: 88,
          whyRelevant: "Relevant for tech events",
        },
      ]);

      expect(saved.length).toBe(1);
      const retrieved = await getDiscoveryResults(userId, campaignId);
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].domain).toBe("acme.cloud");

      // Clearing discovery results clears candidates without affecting pipeline records
      const cleared = await clearDiscoveryResults(userId, campaignId);
      expect(cleared).toBeGreaterThanOrEqual(1);
      const empty = await getDiscoveryResults(userId, campaignId);
      expect(empty.length).toBe(0);
    });
  });

  describe("2. Approval Idempotency", () => {
    it("approving the same domain across searches does not create duplicate sponsor records", async () => {
      const campaignId = "camp-test-approval-idem";

      // First approval succeeds
      const first = await addSponsor({
        ...makeDummyCompany({
          campaignId,
          name: "Stripe India",
          website: "https://stripe.com/in",
          industry: "Fintech",
          fitScore: 92,
          stage: "Qualified",
        }),
      });
      expect(first.name).toBe("Stripe India");

      // Second approval with same normalized domain must throw DuplicateCompanyError
      await expect(
        addSponsor({
          ...makeDummyCompany({
            campaignId,
            name: "Stripe",
            website: "https://www.stripe.com",
            industry: "Payments",
            fitScore: 95,
            stage: "Qualified",
          }),
        })
      ).rejects.toThrow(DuplicateCompanyError);
    });
  });

  describe("3. Draft Safety Gate & Unresolved Placeholders", () => {
    it("blocks sending if the draft has needsAttention: true", () => {
      const verdict = evaluateSend({
        draftStatus: "approved",
        recipient: "sponsor@acme.com",
        suppressed: false,
        needsAttention: true,
        priorOutbound: [],
        sentInWindow: 0,
        dailyLimit: 30,
      });

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe("needs_attention");
        expect(verdict.status).toBe(422);
      }
    });

    it("requires explicit human approval: unapproved drafts are blocked", () => {
      const verdict = evaluateSend({
        draftStatus: "draft",
        recipient: "sponsor@acme.com",
        suppressed: false,
        needsAttention: false,
        priorOutbound: [],
        sentInWindow: 0,
        dailyLimit: 30,
      });

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe("not_approved");
        expect(verdict.status).toBe(403);
      }
    });
  });

  describe("4. Send Guard: Rolling Daily Send Cap & Spacing", () => {
    it("blocks send if rolling daily send limit is reached", () => {
      const verdict = evaluateSend({
        draftStatus: "approved",
        recipient: "sponsor@acme.com",
        suppressed: false,
        needsAttention: false,
        priorOutbound: [],
        sentInWindow: 30,
        dailyLimit: 30,
      });

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe("daily_cap_reached");
        expect(verdict.status).toBe(429);
      }
    });

    it("blocks sending if the company was emailed less than 2 days ago", () => {
      const now = new Date("2026-10-14T12:00:00Z");
      const yesterday = new Date("2026-10-13T12:00:00Z");

      const verdict = evaluateSend({
        draftStatus: "approved",
        recipient: "sponsor@acme.com",
        suppressed: false,
        needsAttention: false,
        priorOutbound: [{ sentAt: yesterday.toISOString() }],
        sentInWindow: 5,
        dailyLimit: 30,
        now,
      });

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe("too_soon");
        expect(verdict.status).toBe(409);
      }
    });
  });

  describe("5. Replies & Follow-up Halting", () => {
    it("halts follow-up send when a reply has already been received", () => {
      const now = new Date("2026-10-18T12:00:00Z");
      const initialSend = new Date("2026-10-14T12:00:00Z");

      const verdict = evaluateSend({
        draftStatus: "approved",
        recipient: "sponsor@acme.com",
        suppressed: false,
        needsAttention: false,
        hasReply: true,
        companyStage: "Replied",
        priorOutbound: [{ sentAt: initialSend.toISOString() }],
        sentInWindow: 5,
        dailyLimit: 30,
        now,
      });

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe("reply_received");
        expect(verdict.status).toBe(409);
      }
    });

    it("halts follow-up send when company stage is marked Lost or Interested", () => {
      const now = new Date("2026-10-18T12:00:00Z");
      const initialSend = new Date("2026-10-14T12:00:00Z");

      const verdict = evaluateSend({
        draftStatus: "approved",
        recipient: "sponsor@acme.com",
        suppressed: false,
        needsAttention: false,
        hasReply: false,
        companyStage: "Lost",
        priorOutbound: [{ sentAt: initialSend.toISOString() }],
        sentInWindow: 5,
        dailyLimit: 30,
        now,
      });

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.code).toBe("stage_halted");
        expect(verdict.status).toBe(409);
      }
    });

    it("computes follow-up as due after 2 days (MIN_DAYS_BETWEEN_TOUCHES = 2)", () => {
      const now = new Date("2026-10-16T12:00:00Z"); // 2 days after Oct 14
      const company = makeDummyCompany({
        id: "comp-fu-1",
        name: "Test Corp",
        stage: "Contacted",
        fitScore: 85,
        contacts: [makeDummyContact({ id: "con-1", email: "lead@testcorp.com", name: "Bob", companyId: "comp-fu-1" })],
      });

      const messages: Message[] = [
        {
          id: "msg-1",
          companyId: "comp-fu-1",
          direction: "outbound",
          fromEmail: "organizer@sponfy.com",
          toEmail: "lead@testcorp.com",
          subject: "Sponsorship for Hackathon",
          body: "Initial note",
          sentAt: new Date("2026-10-14T12:00:00Z").toISOString(),
        },
      ];

      const followups = computeFollowups({
        companies: [company],
        messages,
        drafts: [],
        suppressedEmails: new Set(),
        now,
      });

      expect(followups.length).toBe(1);
      expect(followups[0].state).toBe("due");
      expect(followups[0].touchesSent).toBe(1);
      expect(followups[0].nextTouch).toBe(2);
    });

    it("enforces max 2 follow-ups: halts sequence once 3 total touches are reached", () => {
      const now = new Date("2026-10-25T12:00:00Z");
      const company = makeDummyCompany({
        id: "comp-max-touches",
        name: "Max Touches Inc",
        stage: "Contacted",
        fitScore: 80,
        contacts: [makeDummyContact({ id: "con-2", email: "info@maxtouches.com", companyId: "comp-max-touches" })],
      });

      const messages: Message[] = [
        {
          id: "m-1",
          companyId: "comp-max-touches",
          direction: "outbound",
          fromEmail: "organizer@sponfy.com",
          toEmail: "info@maxtouches.com",
          subject: "Touch 1",
          body: "Initial",
          sentAt: new Date("2026-10-10T12:00:00Z").toISOString(),
        },
        {
          id: "m-2",
          companyId: "comp-max-touches",
          direction: "outbound",
          fromEmail: "organizer@sponfy.com",
          toEmail: "info@maxtouches.com",
          subject: "Touch 2",
          body: "Followup 1",
          sentAt: new Date("2026-10-13T12:00:00Z").toISOString(),
        },
        {
          id: "m-3",
          companyId: "comp-max-touches",
          direction: "outbound",
          fromEmail: "organizer@sponfy.com",
          toEmail: "info@maxtouches.com",
          subject: "Touch 3",
          body: "Followup 2",
          sentAt: new Date("2026-10-16T12:00:00Z").toISOString(),
        },
      ];

      const followups = computeFollowups({
        companies: [company],
        messages,
        drafts: [],
        suppressedEmails: new Set(),
        now,
      });

      expect(followups.length).toBe(1);
      expect(followups[0].state).toBe("complete");
      expect(followups[0].nextTouch).toBeNull();
      expect(followups[0].touchesSent).toBe(3);
    });
  });
});
