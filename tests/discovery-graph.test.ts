import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Ensure zero network/DB calls during tests
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), findFirst: vi.fn() },
    campaign: { findFirst: vi.fn() },
  },
  default: {},
  isDatabaseConfigured: () => false,
}));

vi.mock("@/lib/auth", () => ({
  auth: async () => ({
    user: { id: "usr-demo-lead", email: "demo@sponfy.dev", name: "Test Lead" },
  }),
}));

vi.mock("@/lib/security/redis", () => ({
  getRedisClient: () => null,
}));

import {
  runDiscoveryGraph,
  createDiscoveryGraph,
  isLangGraphDiscoveryEnabled,
} from "@/lib/ai/discovery-graph";
import { POST } from "@/app/api/discover/route";
import { addSponsor, getSponsors } from "@/lib/data/repositories/sponsors";
import { NextRequest } from "next/server";

const postJson = (url: string, body: any) =>
  new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("LangGraph Discovery Orchestration Suite", () => {
  const originalEnv = process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED;

  beforeEach(() => {
    delete process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = originalEnv;
    } else {
      delete process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED;
    }
  });

  describe("1. Feature Flag Configuration", () => {
    it("defaults to false when environment variable is unset", () => {
      delete process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED;
      expect(isLangGraphDiscoveryEnabled()).toBe(false);
    });

    it("evaluates to false when explicitly set to 'false' or '0'", () => {
      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "false";
      expect(isLangGraphDiscoveryEnabled()).toBe(false);

      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "0";
      expect(isLangGraphDiscoveryEnabled()).toBe(false);
    });

    it("evaluates to true when set to 'true' or '1'", () => {
      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "true";
      expect(isLangGraphDiscoveryEnabled()).toBe(true);

      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "1";
      expect(isLangGraphDiscoveryEnabled()).toBe(true);
    });
  });

  describe("2. Isolated Graph Compilation and Execution", () => {
    it("compiles the StateGraph workflow with defined nodes and edges", () => {
      const graph = createDiscoveryGraph();
      expect(graph).toBeDefined();
      expect(typeof graph.invoke).toBe("function");
    });

    it("executes synchronous discovery graph with valid prompt and parameters", async () => {
      const result = await runDiscoveryGraph({
        prompt: "Find 5 cloud and developer tools sponsors",
        userId: "usr-demo-lead",
        campaignId: "camp-demo-1",
        targetCount: 5,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("completed");
      expect(result.error).toBeNull();
      expect(result.resultPayload).toBeDefined();

      const payload = result.resultPayload!;
      expect(payload.success).toBe(true);
      expect(payload.count).toBe(5);
      expect(payload.candidates).toHaveLength(5);
      expect(payload.campaignId).toBeDefined();

      // Verify complete candidate structure
      const first = payload.candidates[0];
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("website");
      expect(first).toHaveProperty("domain");
      expect(first).toHaveProperty("industry");
      expect(first).toHaveProperty("description");
      expect(first).toHaveProperty("fitScore");
      expect(first.fitScore).toBeGreaterThanOrEqual(80);
      expect(first).toHaveProperty("pipelineValue");
      expect(first.pipelineValue).toBeGreaterThanOrEqual(30000);
      expect(first).toHaveProperty("signals");
      expect(Array.isArray(first.signals)).toBe(true);
      expect(first).toHaveProperty("scoreBreakdown");
      expect(first.scoreBreakdown).toHaveLength(7);
    });

    it("extracts and honors requested count from prompt via count parser node", async () => {
      const result = await runDiscoveryGraph({
        prompt: "give me 3 sponsors for hackathon",
        userId: "usr-demo-lead",
        campaignId: "camp-demo-1",
        targetCount: 10, // prompt should override targetCount to 3
      });

      expect(result.success).toBe(true);
      expect(result.resultPayload?.count).toBe(3);
      expect(result.resultPayload?.candidates).toHaveLength(3);
    });

    it("deduplicates candidates against existing approved sponsors in campaign", async () => {
      const campaignId = "camp-dedup-test";

      // Seed an existing sponsor in the campaign
      await addSponsor({
        name: "Postman",
        website: "https://www.postman.com",
        industry: "Developer Tools",
        description: "API platform",
        stage: "Approved",
        fitScore: 95,
        pipelineValue: 75000,
        confidence: 90,
        scoreBreakdown: [],
        signals: ["Active API Partner"],
        researchStatus: "completed",
        campaignId,
        userId: "usr-demo-lead",
      });

      const existingSponsors = await getSponsors(campaignId);
      expect(existingSponsors.some((s) => s.name.toLowerCase() === "postman")).toBe(true);

      const result = await runDiscoveryGraph({
        prompt: "Find 4 devtools sponsors",
        userId: "usr-demo-lead",
        campaignId,
        targetCount: 4,
      });

      expect(result.success).toBe(true);
      const candidates = result.resultPayload?.candidates || [];
      // Candidates must NOT contain Postman because it's already an existing sponsor
      const hasDuplicate = candidates.some(
        (c: any) => c.name.toLowerCase() === "postman" || c.website.includes("postman.com")
      );
      expect(hasDuplicate).toBe(false);
    });
  });

  describe("3. API Boundary & Feature Flag Routing (/api/discover)", () => {
    it("runs legacy path when SPONFY_LANGGRAPH_DISCOVERY_ENABLED=false", async () => {
      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "false";

      const req = postJson("http://localhost:3000/api/discover", {
        prompt: "top 5 tech companies sponsoring events India",
        targetCount: 5,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(5);
      expect(Array.isArray(data.candidates)).toBe(true);
      expect(data.candidates).toHaveLength(5);
    });

    it("runs LangGraph orchestration path when SPONFY_LANGGRAPH_DISCOVERY_ENABLED=true with matching contract", async () => {
      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "true";

      const req = postJson("http://localhost:3000/api/discover", {
        prompt: "top 4 cloud platforms",
        targetCount: 4,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(4);
      expect(Array.isArray(data.candidates)).toBe(true);
      expect(data.candidates).toHaveLength(4);

      // Verify exact contract equivalence with legacy path
      expect(data).toHaveProperty("campaignId");
      expect(data).toHaveProperty("campaignName");
      expect(data).toHaveProperty("existingTotal");
      expect(data.candidates[0]).toHaveProperty("name");
      expect(data.candidates[0]).toHaveProperty("website");
      expect(data.candidates[0]).toHaveProperty("fitScore");
      expect(data.candidates[0]).toHaveProperty("scoreBreakdown");
    });

    it("does not trigger email dispatch or unrelated side effects during graph discovery", async () => {
      process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED = "true";

      const req = postJson("http://localhost:3000/api/discover", {
        prompt: "Find 2 partners",
        targetCount: 2,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      // Confirm result only contains prospective discovery items, no email sending side effects
      expect(data.candidates.every((c: any) => !c.messageId && !c.sentAt)).toBe(true);
    });
  });
});
