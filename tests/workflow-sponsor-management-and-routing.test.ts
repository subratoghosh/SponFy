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

import { verifyGrokRelevance } from "@/lib/discovery/grok";
import { addSponsor, removeSponsor, getSponsors, getSponsorById } from "@/lib/data/repositories/sponsors";
import { saveDraft, getDraftsByCompanyId, deleteDraftsByCompanyId } from "@/lib/data/repositories/outreach";
import { POST as postDraft, GET as getDraft } from "@/app/api/outreach/draft/route";
import { DELETE as deleteSponsorRoute } from "@/app/api/sponsors/[id]/route";
import { NextRequest } from "next/server";

describe("Sponsor Management, Grok Verification & Outreach Routing Tests", () => {
  const userId = "usr-demo-lead";
  const campaignId = "camp-demo-1";

  describe("Grok Relevance Verification", () => {
    it("returns verified false when XAI_API_KEY is not configured", async () => {
      const origKey = process.env.XAI_API_KEY;
      delete process.env.XAI_API_KEY;

      const result = await verifyGrokRelevance({
        companyName: "Acme Corp",
        userPrompt: "Indian fintech hackathon sponsors",
        website: "https://acme.com",
        snippets: ["Acme provides financial APIs in Bangalore"],
      });

      expect(result.verified).toBe(false);
      expect(result.decision).toBe("UNCERTAIN");
      expect(result.reason).toContain("not configured");

      if (origKey) process.env.XAI_API_KEY = origKey;
    });

    it("parses valid JSON response from xAI API", async () => {
      process.env.XAI_API_KEY = "xai-test-mock-key";

      // Mock global fetch for xAI chat completions
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  relevant: true,
                  decision: "RELEVANT",
                  reason: "Razorpay is a major Indian fintech payment gateway actively sponsoring developer hackathons.",
                  confidence: 95,
                  evidence: ["https://razorpay.com"],
                }),
              },
            },
          ],
        }),
      } as any);

      const result = await verifyGrokRelevance({
        companyName: "Razorpay",
        userPrompt: "Find Indian fintech companies sponsoring college hackathons",
        website: "https://razorpay.com",
        snippets: ["Razorpay hosts hackathons for student builders"],
      });

      expect(result.verified).toBe(true);
      expect(result.decision).toBe("RELEVANT");
      expect(result.confidence).toBe(95);
      expect(result.reason).toContain("Razorpay");

      global.fetch = origFetch;
      delete process.env.XAI_API_KEY;
    });

    it("parses valid JSON response from Groq Cloud (Free Llama 3.3)", async () => {
      process.env.GROQ_API_KEY = "gsk_test_mock_groq_key";

      const origFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  relevant: true,
                  decision: "RELEVANT",
                  reason: "Postman is an Indian-founded API platform with an active student developer sponsorship program.",
                  confidence: 96,
                }),
              },
            },
          ],
        }),
      } as any);

      const result = await verifyGrokRelevance({
        companyName: "Postman",
        userPrompt: "Find developer tools and API platforms sponsoring student events",
        website: "https://postman.com",
        snippets: ["Postman student programs and university sponsorships"],
      });

      expect(result.verified).toBe(true);
      expect(result.decision).toBe("RELEVANT");
      expect(result.confidence).toBe(96);
      expect(result.reason).toContain("Postman");

      global.fetch = origFetch;
      delete process.env.GROQ_API_KEY;
    });
  });

  describe("Sponsor Removal & Draft Cleanup", () => {
    it("removes a sponsor and deletes its pending unsent drafts", async () => {
      const company = await addSponsor({
        userId,
        campaignId,
        name: "Test Sponsor Removal",
        website: "https://testremove.example.com",
        industry: "Cloud",
        description: "Cloud sponsor test",
        stage: "Qualified",
        fitScore: 88,
        pipelineValue: 0,
        confidence: 85,
        scoreBreakdown: [],
        signals: [],
        researchStatus: "pending",
      });

      // Create a draft for this company
      const draft = await saveDraft({
        companyId: company.id,
        subject: "Partnership Opportunity",
        body: "Hello sponsor team...",
        status: "draft",
      });

      const draftsBefore = await getDraftsByCompanyId(company.id);
      expect(draftsBefore.length).toBeGreaterThan(0);

      // Perform removal via repository
      const removed = await removeSponsor(company.id);
      expect(removed).toBe(true);

      // Verify company is gone from sponsors
      const allSponsors = await getSponsors();
      expect(allSponsors.find((s) => s.id === company.id)).toBeUndefined();

      // Verify drafts were cleaned up
      const draftsAfter = await getDraftsByCompanyId(company.id);
      expect(draftsAfter.length).toBe(0);
    });

    it("DELETE /api/sponsors/[id] route removes sponsor and returns 200", async () => {
      const company = await addSponsor({
        userId,
        campaignId,
        name: "API Delete Company",
        website: "https://apidelete.example.com",
        industry: "AI",
        description: "AI sponsor to delete",
        stage: "Qualified",
        fitScore: 90,
        pipelineValue: 0,
        confidence: 85,
        scoreBreakdown: [],
        signals: [],
        researchStatus: "pending",
      });

      const req = new NextRequest(`http://localhost:3000/api/sponsors/${company.id}`, {
        method: "DELETE",
      });

      const res = await deleteSponsorRoute(req, {
        params: Promise.resolve({ id: company.id }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.removed).toBe(true);

      const found = await getSponsorById(company.id);
      expect(found).toBeNull();
    });
  });

  describe("Draft Generation & De-duplication Routing", () => {
    it("reuses existing draft on subsequent calls to avoid duplicates unless regenerate=true", async () => {
      const company = await addSponsor({
        userId,
        campaignId,
        name: "Draft Routing Co",
        website: "https://draftroute.example.com",
        industry: "Developer Tools",
        description: "Devtools platform",
        stage: "Approved",
        fitScore: 92,
        pipelineValue: 0,
        confidence: 85,
        scoreBreakdown: [],
        signals: [],
        researchStatus: "pending",
      });

      // 1. First call: generate draft
      const req1 = new NextRequest("http://localhost:3000/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });

      const res1 = await postDraft(req1);
      expect(res1.status).toBe(200);
      const json1 = await res1.json();
      expect(json1.success).toBe(true);
      const draftId = json1.draft.id;
      expect(draftId).toBeDefined();

      // 2. Second call without regenerate: must return existing draft and alreadyExisted: true
      const req2 = new NextRequest("http://localhost:3000/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });

      const res2 = await postDraft(req2);
      expect(res2.status).toBe(200);
      const json2 = await res2.json();
      expect(json2.success).toBe(true);
      expect(json2.alreadyExisted).toBe(true);
      expect(json2.draft.id).toBe(draftId);

      // Verify no duplicate drafts exist in repository
      const allDrafts = await getDraftsByCompanyId(company.id);
      expect(allDrafts.length).toBe(1);

      // 3. GET /api/outreach/draft?companyId=... retrieves this draft
      const getReq = new NextRequest(
        `http://localhost:3000/api/outreach/draft?companyId=${company.id}`,
        { method: "GET" }
      );
      const getRes = await getDraft(getReq);
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.success).toBe(true);
      expect(getJson.draft.id).toBe(draftId);
    });

    it("blocks draft generation for unapproved candidates", async () => {
      const company = await addSponsor({
        userId,
        campaignId,
        name: "Unapproved Candidate",
        website: "https://unapproved.example.com",
        industry: "Security",
        description: "Raw candidate",
        stage: "Discovered",
        fitScore: 60,
        pipelineValue: 0,
        sponsorApproved: false,
        confidence: 85,
        scoreBreakdown: [],
        signals: [],
        researchStatus: "pending",
      });

      const req = new NextRequest("http://localhost:3000/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });

      const res = await postDraft(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("approved sponsors");
    });

    it("allows drafting email for demo-lead company without ownership error", async () => {
      const company = await addSponsor({
        userId: "usr-demo-lead",
        campaignId: "camp-demo-1",
        name: "Demo Lead Company",
        website: "https://demolead.example.com",
        industry: "AI",
        description: "Company created by demo lead",
        stage: "Qualified",
        fitScore: 88,
        pipelineValue: 50000,
        confidence: 90,
        scoreBreakdown: [],
        signals: [],
        researchStatus: "pending",
      });

      const req = new NextRequest("http://localhost:3000/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });

      const res = await postDraft(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.draft).toBeDefined();
    });

    it("safely cleans up child drafts when deleting a sponsor", async () => {
      const company = await addSponsor({
        userId,
        campaignId,
        name: "Cascade Delete Company",
        website: "https://cascadedelete.example.com",
        industry: "Cloud",
        description: "Testing cascade delete",
        stage: "Qualified",
        fitScore: 85,
        pipelineValue: 0,
        confidence: 85,
        scoreBreakdown: [],
        signals: [],
        researchStatus: "pending",
      });

      // Create a draft for this company
      await saveDraft({
        userId,
        companyId: company.id,
        subject: "Hackathon sponsorship",
        body: "Hello sponsor",
        status: "draft",
      });

      const draftsBefore = await getDraftsByCompanyId(company.id);
      expect(draftsBefore.length).toBe(1);

      // Delete the company
      const deleted = await removeSponsor(company.id);
      expect(deleted).toBe(true);

      // Verify drafts were cleaned up
      const draftsAfter = await getDraftsByCompanyId(company.id);
      expect(draftsAfter.length).toBe(0);

      // Verify company is gone
      const found = await getSponsorById(company.id);
      expect(found).toBeNull();
    });
  });

  describe("Gmail Reply Sync Route", () => {
    it("POST /api/replies/sync synchronizes inbox and returns status without throwing", async () => {
      const { POST: syncReplies } = await import("@/app/api/replies/sync/route");
      const req = new NextRequest("http://localhost:3000/api/replies/sync", {
        method: "POST",
      });

      const res = await syncReplies(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(typeof json.syncedCount).toBe("number");
      expect(Array.isArray(json.threads)).toBe(true);
    });

    it("GET /api/replies returns inbound messages and intent analyses", async () => {
      const { GET: getReplies } = await import("@/app/api/replies/route");
      const req = new NextRequest("http://localhost:3000/api/replies", {
        method: "GET",
      });

      const res = await getReplies(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].message).toBeDefined();
      expect(json.data[0].message.direction).toBe("inbound");
    });

    it("POST /api/replies sends reply and logs outbound message", async () => {
      const { POST: postReply } = await import("@/app/api/replies/route");
      const req = new NextRequest("http://localhost:3000/api/replies", {
        method: "POST",
        body: JSON.stringify({
          toEmail: "partner@example.com",
          subject: "Re: Sponsorship Discussion",
          body: "Thank you for the reply. Let's schedule a call.",
          companyId: "comp-postman",
        }),
      });

      const res = await postReply(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toBeDefined();
      expect(json.message.direction).toBe("outbound");
      expect(json.message.toEmail).toBe("partner@example.com");
    });
  });
});
