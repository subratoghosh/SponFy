import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
  default: {},
  isDatabaseConfigured: () => false,
}));

import { computeFollowups, buildFollowupDraft, delayForNextTouch, MAX_TOUCHES } from "@/lib/outreach/followups";
import { SYSTEM_LIMITS } from "@/lib/config/limits";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-10-10T12:00:00Z");
const ago = (d: number) => new Date(now.getTime() - d * DAY).toISOString();

const company = (over: any = {}) => ({
  id: "c1",
  campaignId: "camp",
  name: "Acme",
  stage: "Contacted",
  contacts: [{ id: "k1", companyId: "c1", name: "Dana Lee", email: "dana@acme.dev", role: "DevRel", status: "verified", createdAt: "" }],
  ...over,
});
const out = (daysAgo: number, id = "m" + daysAgo) => ({
  id, companyId: "c1", direction: "outbound" as const, fromEmail: "me@x.org", toEmail: "dana@acme.dev",
  subject: "Sponsoring our hackathon", body: "hi", sentAt: ago(daysAgo),
});
const inbound = (daysAgo: number) => ({ ...out(daysAgo, "in"), direction: "inbound" as const, fromEmail: "dana@acme.dev", toEmail: "me@x.org" });

const run = (over: any = {}) =>
  computeFollowups({
    companies: [company(over.company)] as any,
    messages: (over.messages ?? []) as any,
    drafts: (over.drafts ?? []) as any,
    suppressedEmails: new Set(over.suppressed ?? []),
    now,
  });

describe("follow-up rules", () => {
  it("ignores companies we never emailed", () => {
    expect(run({ messages: [] })).toEqual([]);
  });

  it("waits until the first delay has passed", () => {
    const [item] = run({ messages: [out(1)] });
    expect(item.state).toBe("waiting");
    expect(item.nextTouch).toBe(2);
    expect(item.dueInDays).toBe(SYSTEM_LIMITS.DEFAULT_FIRST_FOLLOWUP_DELAY_DAYS - 1);
  });

  it("opens follow-up 1 after the delay", () => {
    const [item] = run({ messages: [out(SYSTEM_LIMITS.DEFAULT_FIRST_FOLLOWUP_DELAY_DAYS + 1)] });
    expect(item.state).toBe("due");
    expect(item.nextTouch).toBe(2);
  });

  it("uses the longer delay for follow-up 2, counted from follow-up 1", () => {
    expect(run({ messages: [out(20), out(5)] })[0].state).toBe("waiting");
    const [item] = run({ messages: [out(20), out(SYSTEM_LIMITS.DEFAULT_SECOND_FOLLOWUP_DELAY_DAYS + 1)] });
    expect(item.state).toBe("due");
    expect(item.nextTouch).toBe(3);
  });

  it("never allows a follow-up sooner than the minimum spacing", () => {
    expect(delayForNextTouch(1)).toBeGreaterThanOrEqual(SYSTEM_LIMITS.MIN_DAYS_BETWEEN_TOUCHES);
    expect(delayForNextTouch(2)).toBeGreaterThanOrEqual(SYSTEM_LIMITS.MIN_DAYS_BETWEEN_TOUCHES);
  });

  it("stops after 1 initial + 2 follow-ups", () => {
    const [item] = run({ messages: [out(40), out(30), out(20)] });
    expect(MAX_TOUCHES).toBe(3);
    expect(item.state).toBe("complete");
    expect(item.nextTouch).toBeNull();
  });

  it("halts when the company replied", () => {
    const [item] = run({ messages: [out(10), inbound(8)] });
    expect(item.state).toBe("replied");
  });

  it("halts when the pipeline moved on or the company was lost", () => {
    for (const stage of ["Interested", "Negotiation", "Committed", "Lost", "Replied"]) {
      expect(run({ company: { stage }, messages: [out(10)] })[0].state).toBe("closed");
    }
  });

  it("never follows up a suppressed recipient", () => {
    expect(run({ messages: [out(10)], suppressed: ["dana@acme.dev"] })[0].state).toBe("suppressed");
  });

  it("shows a pending follow-up draft instead of asking for another", () => {
    const draft = { id: "d1", companyId: "c1", status: "draft", createdAt: ago(1), subject: "Re", body: "b" };
    const [item] = run({ messages: [out(6)], drafts: [draft] });
    expect(item.state).toBe("draft_ready");
    expect(item.pendingDraft?.id).toBe("d1");
  });

  it("ignores drafts that were made before the last send", () => {
    const old = { id: "d0", companyId: "c1", status: "draft", createdAt: ago(9), subject: "x", body: "y" };
    expect(run({ messages: [out(6)], drafts: [old] })[0].state).toBe("due");
  });

  it("puts the things that need action first", () => {
    const res = computeFollowups({
      companies: [company({ id: "a", name: "A" }), company({ id: "b", name: "B" })] as any,
      messages: [{ ...out(1), companyId: "a" }, { ...out(9), companyId: "b" }] as any,
      drafts: [],
      suppressedEmails: new Set(),
      now,
    });
    expect(res.map((r) => r.companyName)).toEqual(["B", "A"]);
  });
});

describe("follow-up drafts never invent facts", () => {
  const base = { companyName: "Acme", recipientName: "Dana Lee", lastSubject: "Re: Sponsoring our hackathon" };

  it("builds a short bump for follow-up 1 using only known facts", () => {
    const d = buildFollowupDraft({ item: { ...base, nextTouch: 2 }, campaign: { name: "SponFy 2026", deckUrl: "https://x.test/deck" }, signature: "Priya" });
    expect(d.subject).toBe("Re: Sponsoring our hackathon");
    expect(d.body).toContain("Hi Dana,");
    expect(d.body).toContain("SponFy 2026");
    expect(d.body).toContain("https://x.test/deck");
    expect(d.body).not.toMatch(/\d{2,}\+?\s*(developers|teams|students|registrations)/i);
  });

  it("builds a polite last note for follow-up 2 and omits the deck when there is none", () => {
    const d = buildFollowupDraft({ item: { ...base, nextTouch: 3 }, campaign: { name: "SponFy 2026" }, signature: "Priya" });
    expect(d.body).toMatch(/last note/i);
    expect(d.body).not.toContain("Deck:");
  });
});

// ---------------------------------------------------------------------------
// End to end through the routes and the in-memory demo store
// ---------------------------------------------------------------------------
describe("follow-up routes (demo store)", () => {
  const post = (body: unknown) =>
    new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  it("takes a company from first email, to waiting, to due, to a sent follow-up, to finished", async () => {
    const { getSponsors } = await import("@/lib/data/repositories/sponsors");
    const { getMessages, createDraft } = await import("@/lib/data/repositories/outreach");
    const { POST: approve } = await import("@/app/api/outreach/approve/route");
    const { POST: send } = await import("@/app/api/outreach/send/route");
    const { GET: list } = await import("@/app/api/followups/route");
    const { POST: makeDraft } = await import("@/app/api/followups/draft/route");

    const companies = await getSponsors();
    const messages = await getMessages();
    const company = companies.find(
      (c) => (c.contacts?.length ?? 0) > 0 && !messages.some((m) => m.companyId === c.id)
    )!;
    const contact = company.contacts![0];

    const stateOf = async () => (await (await list()).json()).items.find((i: any) => i.companyId === company.id);
    const backdate = async (days: number) => {
      // move every message of this company back in time (demo store objects are shared)
      for (const m of await getMessages(company.id)) m.sentAt = new Date(new Date(m.sentAt).getTime() - days * DAY).toISOString();
    };
    const sendDraft = async (draftId: string) => {
      expect((await approve(post({ draftId }))).status).toBe(200);
      return send(post({ draftId, toEmail: contact.email }));
    };

    // 1. first email
    const first = await createDraft({
      companyId: company.id, contactId: contact.id, subject: "Sponsoring our hackathon", body: "Hello",
      quality: { personalization: 1, relevance: 1, clarity: 1, cta: 1, professionalism: 1, overall: 1, suggestions: [] }, status: "draft",
    });
    expect((await sendDraft(first.id)).status).toBe(200);

    // 2. it is now listed as waiting, and a follow-up draft is refused for now
    expect((await stateOf()).state).toBe("waiting");
    expect((await makeDraft(post({ companyId: company.id }))).status).toBe(409);

    // 3. window opens
    await backdate(SYSTEM_LIMITS.DEFAULT_FIRST_FOLLOWUP_DELAY_DAYS + 1);
    expect((await stateOf()).state).toBe("due");

    // 4. draft it (twice is idempotent), it starts unapproved and cannot be sent yet
    const made = await (await makeDraft(post({ companyId: company.id }))).json();
    expect(made.draft.status).toBe("draft");
    expect(made.draft.subject.startsWith("Re:")).toBe(true);
    const again = await (await makeDraft(post({ companyId: company.id }))).json();
    expect(again.draft.id).toBe(made.draft.id);
    expect((await stateOf()).state).toBe("draft_ready");
    expect((await send(post({ draftId: made.draft.id, toEmail: contact.email }))).status).toBe(403);

    // 5. approve and send follow-up 1
    expect((await sendDraft(made.draft.id)).status).toBe(200);
    expect((await stateOf()).touchesSent).toBe(2);
    expect((await stateOf()).state).toBe("waiting");

    // 6. follow-up 2
    await backdate(SYSTEM_LIMITS.DEFAULT_SECOND_FOLLOWUP_DELAY_DAYS + 1);
    const second = await (await makeDraft(post({ companyId: company.id }))).json();
    expect(second.draft.body).toMatch(/last note/i);
    expect((await sendDraft(second.draft.id)).status).toBe(200);

    // 7. finished: no more drafts, and the send guard also refuses a manual extra email
    await backdate(30);
    expect((await stateOf()).state).toBe("complete");
    expect((await makeDraft(post({ companyId: company.id }))).status).toBe(409);
    const extra = await createDraft({
      companyId: company.id, contactId: contact.id, subject: "one more", body: "x",
      quality: first.quality, status: "draft",
    });
    const res = await sendDraft(extra.id);
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("touch_cap_reached");
  });

  it("stops the sequence for companies that already replied (seed data: Postman)", async () => {
    const { GET: list } = await import("@/app/api/followups/route");
    const items = (await (await list()).json()).items;
    const replied = items.filter((i: any) => i.state === "replied");
    expect(replied.length).toBeGreaterThan(0);
    for (const r of replied) expect(r.nextTouch).toBeNull();
  });
});
