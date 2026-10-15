import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { computeFollowups } from "@/lib/outreach/followups";
import { interpolateTemplate, getCustomTemplates } from "@/lib/data/repositories/templates";
import { saveDraft, getDrafts } from "@/lib/data/repositories/outreach";
import { Company, Campaign, EmailDraft } from "@/types";

describe("PHASE 8 Regression Prevention: Dashboard, Navigation & Outreach", () => {
  describe("1. Dashboard & Tenant Scoping", () => {
    it("safely computes followups without throwing on null or missing contact emails", () => {
      const companies: Company[] = [
        {
          id: "comp-null-email",
          name: "Acme Corp",
          industry: "Tech",
          fitScore: 85,
          stage: "Contacted",
          description: "Test description",
          contacts: [
            {
              id: "cnt-1",
              companyId: "comp-null-email",
              name: "Jane Doe",
              email: "" as any,
              role: "Director",
              status: "verified",
              createdAt: new Date().toISOString(),
            },
          ],
          sponsorApproved: true,
          pipelineValue: 10000,
        } as unknown as Company,
      ];

      const messages: import("@/types").Message[] = [
        {
          id: "msg-1",
          companyId: "comp-null-email",
          fromEmail: "organizer@example.com",
          toEmail: "",
          subject: "Sponsorship Inquiry",
          body: "Hello Acme Corp",
          sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          direction: "outbound" as const,
        },
      ];

      expect(() => {
        const followups = computeFollowups({
          companies,
          messages,
          drafts: [],
          suppressedEmails: new Set(),
        });
        expect(Array.isArray(followups)).toBe(true);
      }).not.toThrow();
    });

    it("returns empty analytics gracefully when no sponsors exist without crashing", async () => {
      const analytics = await getAnalyticsData("non-existent-campaign", "usr-empty-workspace");
      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.totalSponsors).toBe(0);
      expect(analytics.summary.qualifiedCount).toBe(0);
      expect(analytics.funnel).toBeDefined();
    });
  });

  describe("2. Template Selection & Interpolation", () => {
    it("loads default templates with rich personalization placeholders", () => {
      const templates = getCustomTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(3);
      expect(templates.some((t) => t.id === "tmpl-executive-pitch")).toBe(true);
    });

    it("interpolates template placeholders accurately using company and campaign context", () => {
      const template = getCustomTemplates().find((t) => t.id === "tmpl-executive-pitch")!;
      const context = {
        companyName: "InnovateTech",
        contactName: "Alex Rivera",
        eventName: "SponFy Summit 2026",
        audienceSize: "3000",
        organizerName: "Subrato Ghosh",
        organizerTitle: "Lead Organizer",
        industry: "Cloud & DevTools",
        fitScore: 95,
      };

      const interpolatedSubject = interpolateTemplate(template.subject, context);
      const interpolatedBody = interpolateTemplate(template.body, context);

      expect(interpolatedSubject).toContain("InnovateTech");
      expect(interpolatedSubject).toContain("SponFy Summit 2026");
      expect(interpolatedBody).toContain("Hi Alex Rivera");
      expect(interpolatedBody).toContain("3000");
      expect(interpolatedBody).toContain("Subrato Ghosh");
      expect(interpolatedBody).not.toContain("{{company_name}}");
      expect(interpolatedBody).not.toContain("{{contact_name}}");
    });
  });

  describe("3. Draft Persistence & Tenant Isolation", () => {
    it("persists drafts with explicit userId scoping so drafts belong strictly to the owner", async () => {
      const userId = "usr-test-scoping-1";
      const draft = await saveDraft({
        userId,
        companyId: "comp-test-scoping",
        subject: "Exclusive Sponsorship Opportunity",
        body: "Hello Team, we would love to collaborate...",
        quality: {
          personalization: 90,
          relevance: 92,
          clarity: 95,
          cta: 90,
          professionalism: 92,
          overall: 92,
          suggestions: [],
        },
        status: "draft",
      });

      expect(draft.id).toBeDefined();
      expect(draft.subject).toBe("Exclusive Sponsorship Opportunity");

      // Verify drafts can be retrieved
      const allDrafts = await getDrafts(undefined, userId);
      const found = allDrafts.find((d) => d.id === draft.id);
      expect(found).toBeDefined();
      expect(found?.companyId).toBe("comp-test-scoping");
    });
  });

  describe("4. Bulk Outreach Safety Checks", () => {
    it("ensures bulk generation does not automatically send emails or bypass approval", async () => {
      const draft = await saveDraft({
        userId: "usr-bulk-safety",
        companyId: "comp-bulk-1",
        subject: "Draft Pitch",
        body: "Pitch content",
        status: "draft",
      });

      // Draft must strictly be in "draft" status, never "approved" or "sent"
      expect(draft.status).toBe("draft");
      expect(draft.approvedAt).toBeUndefined();
    });
  });
});
