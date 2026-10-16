import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
  default: {},
  isDatabaseConfigured: () => false,
}));

import { resolveRecipient } from "@/lib/outreach/send-guard";
import { NextRequest } from "next/server";

describe("Activity Heartbeat and Outreach Recipient Resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("resolveRecipient safety tests", () => {
    const contacts = [
      { id: "cnt-1", email: "sponsor.lead@acme.com" },
      { id: "cnt-2", email: "partnerships@acme.com" },
    ];

    it("rejects client requestedTo when it mismatches the contact on file", () => {
      const res = resolveRecipient({
        contactId: "cnt-1",
        contacts,
        requestedTo: "attacker@malicious.com",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("recipient_mismatch");
        expect(res.status).toBe(409);
      }
    });

    it("accepts client requestedTo when it matches the contact on file (case-insensitive)", () => {
      const res = resolveRecipient({
        contactId: "cnt-1",
        contacts,
        requestedTo: "SPONSOR.LEAD@ACME.COM",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.recipient).toBe("sponsor.lead@acme.com");
      }
    });

    it("rejects when specified contactId does not exist in company contacts", () => {
      const res = resolveRecipient({
        contactId: "cnt-deleted",
        contacts,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("no_recipient");
        expect(res.status).toBe(422);
      }
    });

    it("derives partnerships email from company domain when no contacts exist", () => {
      const res = resolveRecipient({
        contacts: [],
        companyDomain: "innovatecorp.io",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.recipient).toBe("partnerships@innovatecorp.io");
      }
    });

    it("derives partnerships email from company website URL when no contacts exist", () => {
      const res = resolveRecipient({
        contacts: [],
        companyWebsite: "https://www.futuretech.dev/about",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.recipient).toBe("partnerships@futuretech.dev");
      }
    });

    it("fails with no_recipient when neither contacts nor domain/website exist", () => {
      const res = resolveRecipient({
        contacts: [],
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("no_recipient");
        expect(res.status).toBe(422);
      }
    });
  });

  describe("POST /api/activity/heartbeat", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const { POST } = await import("@/app/api/activity/heartbeat/route");
      const req = new NextRequest("http://localhost:3000/api/activity/heartbeat", {
        method: "POST",
        body: JSON.stringify({ path: "/app" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it("returns 200 when authenticated user sends heartbeat", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-123" } });
      const { POST } = await import("@/app/api/activity/heartbeat/route");
      const req = new NextRequest("http://localhost:3000/api/activity/heartbeat", {
        method: "POST",
        body: JSON.stringify({ path: "/app/sponsors" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
