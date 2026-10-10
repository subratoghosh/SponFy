import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Simulate a REAL deployment: database configured, nobody logged in.
const findFirst = vi.fn();
let dbConfigured = true;
let session: any = null;

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findFirst: (...a: any[]) => findFirst(...a) } },
  default: {},
  isDatabaseConfigured: () => dbConfigured,
}));
vi.mock("@/lib/auth", () => ({ auth: async () => session }));

import { verifyAdminSession } from "@/lib/admin/auth";

describe("admin access", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    findFirst.mockReset();
    dbConfigured = true;
    session = null;
    process.env.NEXT_PUBLIC_DEMO_MODE = "true"; // the value .env.example ships with
    process.env.DATABASE_URL = "postgresql://user:pw@db.example.com/sponfy";
    process.env.ADMIN_EMAILS = "lead@club.org";
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it("does NOT give an anonymous visitor admin just because the demo flag is on", async () => {
    const r = await verifyAdminSession();
    expect(r.authorized).toBe(false);
    expect(r.reason).toBe("UNAUTHENTICATED");
  });

  it("does NOT give a normal logged-in user admin when the demo flag is on", async () => {
    session = { user: { id: "u1", email: "member@club.org" } };
    findFirst.mockResolvedValue({ id: "u1", email: "member@club.org", role: "USER", status: "ACTIVE" });
    const r = await verifyAdminSession();
    expect(r.authorized).toBe(false);
    expect(r.reason).toBe("FORBIDDEN");
  });

  it("still allows a real admin", async () => {
    session = { user: { id: "a1", email: "lead@club.org" } };
    findFirst.mockResolvedValue({ id: "a1", email: "lead@club.org", role: "USER", status: "ACTIVE" });
    expect((await verifyAdminSession()).authorized).toBe(true);
  });

  it("keeps the demo admin when there is no database at all", async () => {
    dbConfigured = false;
    const r = await verifyAdminSession();
    expect(r.authorized).toBe(true);
    expect(r.isDemo).toBe(true);
  });
});
