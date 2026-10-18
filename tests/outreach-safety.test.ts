import { describe, it, expect, vi, beforeAll } from "vitest";

// Run the repositories against the in-memory demo store (no database, no Prisma engine).
vi.mock("@/lib/prisma", () => ({
  prisma: {},
  default: {},
  isDatabaseConfigured: () => false,
}));
vi.mock("@/lib/auth", () => ({
  auth: async () => ({ user: { id: "usr-demo-lead", email: "demo@sponfy.dev" } }),
}));

import { evaluateSend, resolveRecipient, effectiveDailyLimit } from "@/lib/outreach/send-guard";
import { findDuplicateCompany, normalizeDomain } from "@/lib/outreach/duplicates";
import { SYSTEM_LIMITS } from "@/lib/config/limits";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-10-10T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * DAY).toISOString();

const okInput = {
  draftStatus: "approved",
  recipient: "devrel@acme.dev",
  suppressed: false,
  priorOutbound: [] as { sentAt: string }[],
  sentInWindow: 0,
  dailyLimit: 30,
  now,
};

describe("send guard: human approval", () => {
  it("allows an approved draft", () => {
    expect(evaluateSend(okInput)).toEqual({ ok: true });
  });

  it("blocks an unapproved draft (the old code let 'draft' through)", () => {
    const r = evaluateSend({ ...okInput, draftStatus: "draft" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("not_approved");
  });

  it("blocks drafts that are sending or already sent", () => {
    for (const s of ["sending", "sent"]) {
      const r = evaluateSend({ ...okInput, draftStatus: s });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.code).toBe("already_sent");
    }
  });
});

describe("send guard: recipient", () => {
  const contacts = [
    { id: "c1", email: "first@acme.dev" },
    { id: "c2", email: "devrel@acme.dev" },
  ];

  it("uses the draft's own contact", () => {
    expect(resolveRecipient({ contactId: "c2", contacts })).toEqual({ ok: true, recipient: "devrel@acme.dev" });
  });

  it("rejects a client-supplied address that differs from the contact on file", () => {
    const r = resolveRecipient({ contactId: "c2", contacts, requestedTo: "someone@else.com" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("recipient_mismatch");
  });

  it("accepts a matching address regardless of case", () => {
    expect(resolveRecipient({ contactId: "c2", contacts, requestedTo: "DevRel@Acme.dev" }).ok).toBe(true);
  });

  it("resolves to an alternate verified contact on file when the user selects a custom recipient", () => {
    const r = resolveRecipient({ contactId: "c1", contacts, requestedTo: "devrel@acme.dev" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.recipient).toBe("devrel@acme.dev");
  });

  it("refuses when there is no valid contact instead of inventing one", () => {
    const r = resolveRecipient({ contacts: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("no_recipient");
    expect(resolveRecipient({ contactId: "gone", contacts }).ok).toBe(false);
  });
});

describe("send guard: anti-spam and duplicate outreach", () => {
  it("blocks suppressed recipients", () => {
    const r = evaluateSend({ ...okInput, suppressed: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("suppressed");
  });

  it("blocks a second email to the same company within the spacing window (teammate duplicate)", () => {
    const r = evaluateSend({ ...okInput, priorOutbound: [{ sentAt: daysAgo(0.1) }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("too_soon");
  });

  it("allows a follow-up once the spacing window has passed", () => {
    const r = evaluateSend({ ...okInput, priorOutbound: [{ sentAt: daysAgo(SYSTEM_LIMITS.MIN_DAYS_BETWEEN_TOUCHES + 0.1) }] });
    expect(r.ok).toBe(true);
  });

  it("stops after 1 initial + 2 follow-ups, forever", () => {
    const three = [{ sentAt: daysAgo(30) }, { sentAt: daysAgo(20) }, { sentAt: daysAgo(10) }];
    const r = evaluateSend({ ...okInput, priorOutbound: three });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("touch_cap_reached");
  });

  it("enforces the daily send cap", () => {
    const r = evaluateSend({ ...okInput, sentInWindow: 30, dailyLimit: 30 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("daily_cap_reached");
      expect(r.status).toBe(429);
    }
  });

  it("clamps silly daily limits into a safe range", () => {
    expect(effectiveDailyLimit(0)).toBe(SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP);
    expect(effectiveDailyLimit(-5)).toBe(SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP);
    expect(effectiveDailyLimit(10_000)).toBe(SYSTEM_LIMITS.MAX_DAILY_SEND_CAP);
  });
});

describe("duplicate companies", () => {
  const existing = [
    { id: "a", campaignId: "camp-1", name: "Postman", website: "https://www.postman.com" },
    { id: "b", campaignId: "camp-2", name: "Vercel", website: "vercel.com" },
  ];

  it("normalises domains", () => {
    expect(normalizeDomain("https://www.Postman.com/careers")).toBe("postman.com");
    expect(normalizeDomain("postman.com")).toBe("postman.com");
    expect(normalizeDomain("")).toBe("");
  });

  it("matches by domain or name within the same campaign only", () => {
    expect(findDuplicateCompany(existing, { campaignId: "camp-1", name: "Postman Inc", website: "postman.com" })?.id).toBe("a");
    expect(findDuplicateCompany(existing, { campaignId: "camp-1", name: "postman", website: "" })?.id).toBe("a");
    expect(findDuplicateCompany(existing, { campaignId: "camp-1", name: "Vercel", website: "vercel.com" })).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// End-to-end through the real route handlers, using the in-memory demo store
// and the mock Gmail client (no credentials configured).
// ---------------------------------------------------------------------------
describe("outreach routes (demo store)", () => {
  beforeAll(() => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.DATABASE_URL;
  });

  const post = (body: unknown) =>
    new Request("http://localhost/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  async function freshDraftForUncontactedCompany() {
    const { getSponsors } = await import("@/lib/data/repositories/sponsors");
    const { getMessages, createDraft } = await import("@/lib/data/repositories/outreach");
    const companies = await getSponsors();
    const messages = await getMessages();
    const company = companies.find(
      (c) =>
        (c.contacts?.length ?? 0) > 0 &&
        !messages.some((m) => m.companyId === c.id && m.direction === "outbound")
    );
    if (!company) throw new Error("seed data has no uncontacted company with a contact");
    const contact = company.contacts![0];
    const draft = await createDraft({
      companyId: company.id,
      contactId: contact.id,
      subject: "Sponsoring our hackathon",
      body: "Hello, would you like to sponsor us?",
      quality: { personalization: 80, relevance: 80, clarity: 80, cta: 80, professionalism: 80, overall: 80, suggestions: [] },
      status: "approved", // must be ignored: new drafts start unapproved
    });
    return { company, contact, draft };
  }

  it("never lets a draft be sent before approval, and only once after", async () => {
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { contact, draft } = await freshDraftForUncontactedCompany();

    // createDraft ignored the "approved" it was handed
    const { getDraftById } = await import("@/lib/data/repositories/outreach");
    expect((await getDraftById(draft.id))?.status).toBe("draft");

    let res: Response = await send(post({ draftId: draft.id, toEmail: contact.email }));
    expect(res.status).toBe(403);

    res = await approve(post({ draftId: draft.id }));
    expect(res.status).toBe(200);

    // wrong recipient is rejected even when approved
    res = await send(post({ draftId: draft.id, toEmail: "attacker@evil.test" }));
    expect(res.status).toBe(409);

    res = await send(post({ draftId: draft.id, toEmail: contact.email }));
    expect(res.status).toBe(200);
    expect((await getDraftById(draft.id))?.status).toBe("sent");

    // second click / second teammate
    res = await send(post({ draftId: draft.id, toEmail: contact.email }));
    expect(res.status).toBe(409);

    // re-approving a sent email is refused, so it can't be re-armed
    res = await approve(post({ draftId: draft.id }));
    expect(res.status).toBe(409);
  });

  it("the Outreach page's data route shows approvals and sends (page and server agree)", async () => {
    const { GET: state } = await import("@/app/api/outreach/state/route");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { POST: save } = await import("@/app/api/outreach/save/route");
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { contact, draft } = await freshDraftForUncontactedCompany();

    const statusOf = async () => {
      const body = await (await state()).json();
      return body.drafts.find((d: any) => d.id === draft.id)?.status;
    };

    expect(await statusOf()).toBe("draft");
    expect((await approve(post({ draftId: draft.id }))).status).toBe(200);
    expect(await statusOf()).toBe("approved");

    // editing through the save route sends it back for re-approval
    expect((await save(post({ id: draft.id, subject: "New subject", body: "New body" }))).status).toBe(200);
    expect(await statusOf()).toBe("draft");

    await approve(post({ draftId: draft.id }));
    expect((await send(post({ draftId: draft.id, toEmail: contact.email }))).status).toBe(200);
    expect(await statusOf()).toBe("sent");

    // a sent draft can no longer be edited
    expect((await save(post({ id: draft.id, subject: "x", body: "y" }))).status).toBe(409);
  });

  it("two separately-bundled copies of the repositories share one demo store (Next dev bundles each route alone)", async () => {
    const { vi } = await import("vitest");
    const first = await import("@/lib/data/repositories/outreach");
    const { draft } = await freshDraftForUncontactedCompany();
    await first.approveDraft(draft.id);

    vi.resetModules(); // simulates another route getting its own module instance
    const second = await import("@/lib/data/repositories/outreach");
    expect(second).not.toBe(first);
    expect((await second.getDraftById(draft.id))?.status).toBe("approved");
  });

  it("blocks a second approved draft to a company that was just emailed", async () => {
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { createDraft } = await import("@/lib/data/repositories/outreach");
    const { company, contact, draft } = await freshDraftForUncontactedCompany();

    await approve(post({ draftId: draft.id }));
    expect((await send(post({ draftId: draft.id, toEmail: contact.email }))).status).toBe(200);

    // a teammate drafts and approves their own email to the same sponsor
    const second = await createDraft({
      companyId: company.id,
      contactId: contact.id,
      subject: "Hi again",
      body: "Teammate's version",
      quality: draft.quality,
      status: "draft",
    });
    await approve(post({ draftId: second.id }));
    const res = await send(post({ draftId: second.id, toEmail: contact.email }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("too_soon");
  });

  it("editing an approved draft sends it back for re-approval", async () => {
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { saveDraft, getDraftById } = await import("@/lib/data/repositories/outreach");
    const { draft } = await freshDraftForUncontactedCompany();

    await approve(post({ draftId: draft.id }));
    expect((await getDraftById(draft.id))?.status).toBe("approved");

    await saveDraft({ id: draft.id, companyId: draft.companyId, subject: draft.subject, body: "changed after approval" });
    const after = await getDraftById(draft.id);
    expect(after?.status).toBe("draft");
    expect(after?.approvedAt).toBeUndefined();
  });

  it("enforces the daily cap at the route", async () => {
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { updateUserProfile } = await import("@/lib/data/repositories/settings");
    const { countOutboundSince } = await import("@/lib/data/repositories/outreach");

    const sentToday = await countOutboundSince(new Date(Date.now() - DAY));
    await updateUserProfile({ dailySendLimit: Math.max(1, sentToday) });

    const { contact, draft } = await freshDraftForUncontactedCompany();
    await approve(post({ draftId: draft.id }));
    const res = await send(post({ draftId: draft.id, toEmail: contact.email }));
    expect(res.status).toBe(429);

    await updateUserProfile({ dailySendLimit: 30 });
  });

  it("refuses to add the same company twice to a campaign", async () => {
    const { getSponsors, addSponsor } = await import("@/lib/data/repositories/sponsors");
    const [existing] = await getSponsors();
    await expect(
      addSponsor({ ...existing, name: existing.name.toUpperCase(), contacts: [] })
    ).rejects.toThrow(/already in this campaign/);
  });

  it("allows removing an un-sent draft from outreach queue via DELETE /api/outreach/draft?id=...", async () => {
    const { DELETE: deleteDraftRoute } = await import("@/app/api/outreach/draft/route");
    const { getDraftById } = await import("@/lib/data/repositories/outreach");
    const { draft } = await freshDraftForUncontactedCompany();

    const req = new Request(`http://localhost/api/outreach/draft?id=${draft.id}`, {
      method: "DELETE",
    });
    const res = await deleteDraftRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(await getDraftById(draft.id)).toBeNull();
  });

  it("allows bulk removing un-sent drafts from outreach queue via DELETE /api/outreach/draft with { ids: [...] }", async () => {
    const { DELETE: deleteDraftRoute } = await import("@/app/api/outreach/draft/route");
    const { getDraftById } = await import("@/lib/data/repositories/outreach");
    const item1 = await freshDraftForUncontactedCompany();
    const item2 = await freshDraftForUncontactedCompany();

    const req = new Request("http://localhost/api/outreach/draft", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [item1.draft.id, item2.draft.id] }),
    });
    const res = await deleteDraftRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.removedCount).toBe(2);
    expect(await getDraftById(item1.draft.id)).toBeNull();
    expect(await getDraftById(item2.draft.id)).toBeNull();
  });

  it("prevents removing sent or sending drafts from the outreach queue", async () => {
    const { DELETE: deleteDraftRoute } = await import("@/app/api/outreach/draft/route");
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { contact, draft } = await freshDraftForUncontactedCompany();

    await approve(post({ draftId: draft.id }));
    await send(post({ draftId: draft.id, toEmail: contact.email }));

    const req = new Request(`http://localhost/api/outreach/draft?id=${draft.id}`, {
      method: "DELETE",
    });
    const res = await deleteDraftRoute(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Cannot remove a draft that has already been dispatched/i);
  });

  it("populates executive sender tag metadata (senderName, senderEmail, senderRole, sentAt) for sent drafts", async () => {
    const { GET: state } = await import("@/app/api/outreach/state/route");
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { contact, draft } = await freshDraftForUncontactedCompany();

    await approve(post({ draftId: draft.id }));
    const sendRes = await send(post({ draftId: draft.id, toEmail: contact.email }));
    expect(sendRes.status).toBe(200);

    const stateRes = await state();
    const stateData = await stateRes.json();
    const sentDraft = stateData.drafts.find((d: any) => d.id === draft.id);

    expect(sentDraft).toBeDefined();
    expect(sentDraft.status).toBe("sent");
    expect(sentDraft.sentAt).toBeDefined();
    expect(sentDraft.senderName).toBeDefined();
    expect(sentDraft.senderRole).toBeDefined();
  });
});
