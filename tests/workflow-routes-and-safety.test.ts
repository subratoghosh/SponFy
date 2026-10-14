import { describe, it, expect, vi, beforeEach } from "vitest";

// Strict database isolation guarantee: mocks ensure zero network/DB calls
vi.mock("@/lib/prisma", () => ({
  prisma: {},
  default: {},
  isDatabaseConfigured: () => false,
}));

vi.mock("@/lib/auth", () => ({
  auth: async () => ({
    user: { id: "usr-demo-lead", email: "demo@sponfy.dev", name: "Test Lead" },
  }),
}));

import { isDatabaseConfigured } from "@/lib/prisma";
import {
  saveDiscoveryResults,
  getDiscoveryResults,
  deleteDiscoveryResult,
  clearDiscoveryResults,
} from "@/lib/data/repositories/discovery-results";
import { getSponsors, addSponsor, getSponsorById } from "@/lib/data/repositories/sponsors";
import { createDraft, getDrafts, approveDraft } from "@/lib/data/repositories/outreach";
import { NextRequest } from "next/server";

const postJson = (url: string, body: any) =>
  new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const deleteReq = (url: string) =>
  new NextRequest(url, {
    method: "DELETE",
  });

const getReq = (url: string) =>
  new NextRequest(url, {
    method: "GET",
  });

describe("Safe In-Memory Workflow & Regression Testing", () => {
  const userId = "usr-demo-lead";
  const campaignId = "camp-safe-testing-1";

  it("DATABASE SAFETY: confirms environment never connects to real database", () => {
    expect(isDatabaseConfigured()).toBe(false);
  });

  describe("Discovery Results Repository & CRUD", () => {
    beforeEach(async () => {
      await clearDiscoveryResults(userId, campaignId);
    });

    it("saves discovery candidates with 7-day TTL and domain normalization", async () => {
      const candidates = [
        {
          name: "Vercel India",
          website: "https://vercel.com/contact",
          industry: "Cloud & DevTools",
          fitScore: 94,
          pipelineValue: 50000,
          signals: ["Active sponsor in 2025", "Hiring Web Developers"],
        },
        {
          name: "Postman API",
          website: "https://postman.com",
          industry: "APIs",
          fitScore: 89,
          pipelineValue: 35000,
        },
      ];

      const saved = await saveDiscoveryResults(userId, campaignId, candidates, "cloud sponsors");
      expect(saved.length).toBe(2);
      expect(saved[0].domain).toBe("vercel.com");
      expect(saved[0].pipelineValue).toBe(50000);
      expect(saved[0].signals).toContain("Active sponsor in 2025");
      expect(new Date(saved[0].expiresAt).getTime()).toBeGreaterThan(Date.now());

      const fetched = await getDiscoveryResults(userId, campaignId);
      expect(fetched.length).toBe(2);
    });

    it("deletes a single discovery result by ID with user isolation", async () => {
      const saved = await saveDiscoveryResults(userId, campaignId, [
        { name: "Single To Delete", domain: "delete-me.org", fitScore: 70 },
        { name: "Keep Me", domain: "keep-me.org", fitScore: 80 },
      ]);

      const toDeleteId = saved[0].id;

      // Cannot delete under another user's identity
      const wrongUserSuccess = await deleteDiscoveryResult(toDeleteId, "another-user-999");
      expect(wrongUserSuccess).toBe(false);

      // Successfully deletes under correct user
      const deleted = await deleteDiscoveryResult(toDeleteId, userId);
      expect(deleted).toBe(true);

      // Non-existent ID returns false
      const nonExistent = await deleteDiscoveryResult("invalid-non-existent-id", userId);
      expect(nonExistent).toBe(false);

      const remaining = await getDiscoveryResults(userId, campaignId);
      expect(remaining.length).toBe(1);
      expect(remaining[0].name).toBe("Keep Me");
    });

    it("clears all discovery candidates for a given campaign without affecting others", async () => {
      await saveDiscoveryResults(userId, campaignId, [
        { name: "Campaign 1 Lead", domain: "camp1.com" },
      ]);
      await saveDiscoveryResults(userId, "camp-other-id", [
        { name: "Campaign 2 Lead", domain: "camp2.com" },
      ]);

      const cleared = await clearDiscoveryResults(userId, campaignId);
      expect(cleared).toBe(1);

      const remainingCamp1 = await getDiscoveryResults(userId, campaignId);
      expect(remainingCamp1.length).toBe(0);

      const remainingCamp2 = await getDiscoveryResults(userId, "camp-other-id");
      expect(remainingCamp2.length).toBe(1);

      // Clean up camp 2
      await clearDiscoveryResults(userId, "camp-other-id");
    });
  });

  describe("Discovery API Route (/api/discover/results)", () => {
    it("handles GET and DELETE requests correctly", async () => {
      const { GET, DELETE } = await import("@/app/api/discover/results/route");

      // Seed 2 candidates
      await clearDiscoveryResults(userId, campaignId);
      const saved = await saveDiscoveryResults(userId, campaignId, [
        { name: "Candidate Route Alpha", domain: "alpha.io" },
        { name: "Candidate Route Beta", domain: "beta.io" },
      ]);

      // GET
      const getRes = await GET(getReq(`http://localhost:3000/api/discover/results?campaignId=${campaignId}`));
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.success).toBe(true);
      expect(getData.data.length).toBe(2);

      // DELETE single item
      const delSingleRes = await DELETE(deleteReq(`http://localhost:3000/api/discover/results?id=${saved[0].id}`));
      expect(delSingleRes.status).toBe(200);
      const delSingleData = await delSingleRes.json();
      expect(delSingleData.success).toBe(true);
      expect(delSingleData.deleted).toBe(true);

      // DELETE clear all
      const delAllRes = await DELETE(deleteReq(`http://localhost:3000/api/discover/results?campaignId=${campaignId}`));
      expect(delAllRes.status).toBe(200);
      const delAllData = await delAllRes.json();
      expect(delAllData.success).toBe(true);
      expect(delAllData.clearedCount).toBe(1);
    });
  });

  describe("Sponsor Approval Route (/api/sponsors/approve)", () => {
    it("approves candidates and skips duplicates idempotently", async () => {
      const { POST: approvePost } = await import("@/app/api/sponsors/approve/route");

      const testDomain = `test-corp-${Date.now()}.com`;
      const saved = await saveDiscoveryResults(userId, campaignId, [
        {
          name: "Test Unique Sponsor",
          domain: testDomain,
          website: `https://${testDomain}`,
          industry: "Technology",
          fitScore: 88,
          pipelineValue: 25000,
        },
      ]);

      // First approval succeeds
      const firstRes = await approvePost(
        postJson("http://localhost:3000/api/sponsors/approve", {
          campaignId,
          candidateIds: [saved[0].id],
        })
      );
      expect(firstRes.status).toBe(200);
      const firstData = await firstRes.json();
      expect(firstData.success).toBe(true);
      expect(firstData.approvedCount).toBe(1);

      // Add another candidate with the exact same domain
      const duplicateSaved = await saveDiscoveryResults(userId, campaignId, [
        {
          name: "Test Duplicate Sponsor",
          domain: testDomain,
          website: `https://www.${testDomain}`,
          industry: "Technology",
          fitScore: 88,
        },
      ]);

      // Second approval detects duplicate domain and adds to alreadyApproved without error
      const secondRes = await approvePost(
        postJson("http://localhost:3000/api/sponsors/approve", {
          campaignId,
          candidateIds: [duplicateSaved[0].id],
        })
      );
      expect(secondRes.status).toBe(200);
      const secondData = await secondRes.json();
      expect(secondData.success).toBe(true);
      expect(secondData.alreadyApproved.length).toBe(1);
    });
  });

  describe("Bulk Send Route (/api/outreach/bulk-send)", () => {
    it("validates eligibility with GET and executes sending with POST", async () => {
      const { GET: bulkSendGet, POST: bulkSendPost } = await import("@/app/api/outreach/bulk-send/route");

      // 1. Create a sponsor with contact
      const sponsor = await addSponsor({
        campaignId,
        name: "Bulk Target Corp",
        website: "https://bulktarget.io",
        industry: "Technology",
        description: "Bulk target company",
        stage: "Qualified",
        fitScore: 85,
        scoreBreakdown: [],
        pipelineValue: 20000,
        signals: [],
        confidence: 80,
        researchStatus: "completed",
        contacts: [
          {
            id: `con-bulk-${Date.now()}`,
            companyId: `comp-bulk-${Date.now()}`,
            name: "Bulk Lead",
            email: "lead@bulktarget.io",
            role: "Marketing Director",
            status: "verified",
            createdAt: new Date().toISOString(),
          },
        ],
        sources: [],
      });

      // 2. Draft 1: unapproved
      const unapprovedDraft = await createDraft({
        companyId: sponsor.id,
        contactId: sponsor.contacts![0].id,
        subject: "Unapproved Pitch",
        body: "Hello",
        status: "draft",
        quality: { personalization: 8, relevance: 8, clarity: 8, cta: 8, professionalism: 8, overall: 8, suggestions: [] },
      });

      // 3. Draft 2: approved
      const approvedDraft = await createDraft({
        companyId: sponsor.id,
        contactId: sponsor.contacts![0].id,
        subject: "Approved Pitch",
        body: "Hello sponsor",
        status: "draft",
        quality: { personalization: 9, relevance: 9, clarity: 9, cta: 9, professionalism: 9, overall: 9, suggestions: [] },
      });
      await approveDraft(approvedDraft.id);

      // 4. Test pre-flight GET inspection
      const getRes = await bulkSendGet(getReq("http://localhost:3000/api/outreach/bulk-send"));
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.success).toBe(true);
      // Unapproved draft is never in getData.eligible
      expect(getData.eligible.some((d: any) => d.draftId === unapprovedDraft.id)).toBe(false);
      // Approved draft is in eligible
      expect(getData.eligible.some((d: any) => d.draftId === approvedDraft.id)).toBe(true);

      // 5. Test execution POST: sending the approved draft
      const execRes = await bulkSendPost(
        postJson("http://localhost:3000/api/outreach/bulk-send", {
          draftIds: [approvedDraft.id],
        })
      );
      expect(execRes.status).toBe(200);
      const execData = await execRes.json();
      expect(execData.success).toBe(true);
      expect(execData.sentCount).toBe(1);
      expect(execData.sent[0].draftId).toBe(approvedDraft.id);
    });
  });

  describe("Follow-up Actions Route (/api/followups/action)", () => {
    it("supports closing prospect (moving to Lost stage to halt touches)", async () => {
      const { POST: actionPost } = await import("@/app/api/followups/action/route");

      const company = await addSponsor({
        campaignId,
        name: "Prospect To Close",
        website: "https://closeprospect.io",
        industry: "Technology",
        description: "Prospect to close",
        stage: "Contacted",
        fitScore: 75,
        scoreBreakdown: [],
        pipelineValue: 15000,
        signals: [],
        confidence: 70,
        researchStatus: "completed",
        contacts: [],
        sources: [],
      });

      const res = await actionPost(
        postJson("http://localhost:3000/api/followups/action", {
          companyId: company.id,
          action: "close",
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const updated = await getSponsorById(company.id);
      expect(updated?.stage).toBe("Lost");
    });
  });
});
