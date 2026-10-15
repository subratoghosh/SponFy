import { SYSTEM_LIMITS } from "@/lib/config/limits";
import type { Campaign, Company, EmailDraft, Message } from "@/types";

/**
 * Follow-up rules. Pure functions (no I/O) so every rule is unit-testable.
 *
 *  - A company gets 1 initial email + MAX_FOLLOWUP_COUNT follow-ups, then we stop.
 *  - Follow-up 1 is due FIRST delay days after the initial email, follow-up 2 SECOND delay days
 *    after follow-up 1 (never sooner than MIN_DAYS_BETWEEN_TOUCHES).
 *  - Any reply from the company halts the sequence.
 *  - Companies that already progressed (replied / interested / negotiation / committed / lost) halt it too.
 *  - Suppressed recipients are never followed up.
 *  - Follow-ups are only ever DRAFTS here. A human approves each one, and the normal send guard
 *    (/api/outreach/send) still applies on top.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_TOUCHES = 1 + SYSTEM_LIMITS.MAX_FOLLOWUP_COUNT;

export type FollowupState =
  | "due" // window open, no draft yet
  | "draft_ready" // window open and a follow-up draft exists waiting for a human
  | "waiting" // contacted, window not open yet
  | "replied" // the company answered: sequence halted
  | "closed" // pipeline moved on (interested / negotiation / committed / lost)
  | "suppressed" // recipient is on the do-not-contact list
  | "complete"; // all touches used

export interface FollowupItem {
  companyId: string;
  companyName: string;
  recipientEmail: string;
  recipientName?: string;
  touchesSent: number;
  /** 2 or 3 when another touch is still possible, otherwise null. */
  nextTouch: number | null;
  lastSentAt: string;
  lastSubject: string;
  daysSinceLast: number;
  /** Days between the last touch and the next one. */
  delayDays: number;
  /** Days until the window opens (0 when open). */
  dueInDays: number;
  state: FollowupState;
  reason: string;
  pendingDraft?: EmailDraft;
}

const HALTED_STAGES = new Set(["Replied", "Interested", "Negotiation", "Committed", "Lost"]);

export function delayForNextTouch(touchesSent: number): number {
  const base =
    touchesSent <= 1
      ? SYSTEM_LIMITS.DEFAULT_FIRST_FOLLOWUP_DELAY_DAYS
      : SYSTEM_LIMITS.DEFAULT_SECOND_FOLLOWUP_DELAY_DAYS;
  return Math.max(base, SYSTEM_LIMITS.MIN_DAYS_BETWEEN_TOUCHES);
}

export interface ComputeInput {
  companies: Company[];
  messages: Message[];
  drafts: EmailDraft[];
  suppressedEmails: Set<string>;
  now?: Date;
}

export function computeFollowups(input: ComputeInput): FollowupItem[] {
  const now = input.now ?? new Date();
  const items: FollowupItem[] = [];

  for (const company of input.companies) {
    const msgs = input.messages.filter((m) => m.companyId === company.id);
    const outbound = msgs
      .filter((m) => m.direction === "outbound")
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    if (outbound.length === 0) continue; // never contacted: nothing to follow up

    const last = outbound[outbound.length - 1];
    const touchesSent = outbound.length;
    const daysSinceLast = (now.getTime() - new Date(last.sentAt).getTime()) / DAY_MS;
    const recipientEmail = last.toEmail || "";
    const contact = company.contacts?.find((c) => c?.email && recipientEmail && c.email.toLowerCase() === recipientEmail.toLowerCase());
    const hasReply = msgs.some((m) => m.direction === "inbound");
    const delayDays = delayForNextTouch(touchesSent);
    const nextTouch = touchesSent < MAX_TOUCHES ? touchesSent + 1 : null;

    const base = {
      companyId: company.id,
      companyName: company.name,
      recipientEmail,
      recipientName: contact?.name,
      touchesSent,
      nextTouch,
      lastSentAt: last.sentAt,
      lastSubject: last.subject,
      daysSinceLast,
      delayDays,
    };

    if (hasReply) {
      items.push({ ...base, nextTouch: null, dueInDays: 0, state: "replied", reason: "They replied, so the sequence is halted." });
      continue;
    }
    if (HALTED_STAGES.has(company.stage)) {
      items.push({ ...base, nextTouch: null, dueInDays: 0, state: "closed", reason: `Pipeline stage is "${company.stage}", so no automatic follow-ups.` });
      continue;
    }
    if (input.suppressedEmails.has(recipientEmail.toLowerCase())) {
      items.push({ ...base, nextTouch: null, dueInDays: 0, state: "suppressed", reason: "Recipient is on the suppression list." });
      continue;
    }
    if (nextTouch === null) {
      items.push({ ...base, dueInDays: 0, state: "complete", reason: `All ${MAX_TOUCHES} touches used (1 initial + ${SYSTEM_LIMITS.MAX_FOLLOWUP_COUNT} follow-ups). We stop here.` });
      continue;
    }

    const dueInDays = Math.max(0, Math.ceil(delayDays - daysSinceLast));
    const open = daysSinceLast >= delayDays;
    const pendingDraft = input.drafts.find(
      (d) =>
        d.companyId === company.id &&
        (d.status === "draft" || d.status === "approved") &&
        new Date(d.createdAt).getTime() > new Date(last.sentAt).getTime()
    );

    if (!open) {
      items.push({ ...base, dueInDays, state: "waiting", reason: `Follow-up ${nextTouch - 1} opens in ${dueInDays} day(s).` });
    } else if (pendingDraft) {
      items.push({ ...base, dueInDays: 0, state: "draft_ready", pendingDraft, reason: "Follow-up drafted. Waiting for a human to approve." });
    } else {
      items.push({ ...base, dueInDays: 0, state: "due", reason: `No reply after ${Math.floor(daysSinceLast)} day(s).` });
    }
  }

  const order: Record<FollowupState, number> = { due: 0, draft_ready: 1, waiting: 2, replied: 3, closed: 4, suppressed: 5, complete: 6 };
  return items.sort(
    (a, b) => order[a.state] - order[b.state] || b.daysSinceLast - a.daysSinceLast
  );
}

function stripReply(subject: string): string {
  return subject.replace(/^\s*(re:\s*)+/i, "").trim();
}

function firstName(name?: string): string {
  const n = (name || "").trim().split(/\s+/)[0];
  return n || "there";
}

/**
 * Template follow-up. It only uses facts we actually have (campaign name, deck link, the previous
 * subject and the sender's signature) and never invents statistics, registrations or dates.
 */
export function buildFollowupDraft(input: {
  item: Pick<FollowupItem, "companyName" | "recipientName" | "lastSubject" | "nextTouch">;
  campaign: Pick<Campaign, "name" | "deckUrl">;
  signature: string;
}): { subject: string; body: string } {
  const { item, campaign, signature } = input;
  const hi = `Hi ${firstName(item.recipientName)},`;
  const deck = campaign.deckUrl ? `\n\nDeck: ${campaign.deckUrl}` : "";
  const sign = signature.trim();

  if (item.nextTouch === 3) {
    return {
      subject: `Re: ${stripReply(item.lastSubject)}`,
      body: `${hi}

This is my last note about ${campaign.name}. I don't want to fill your inbox, so if the timing isn't right for ${item.companyName}, no worries at all, and we'd be glad to stay in touch for a future edition.

If you'd like the sponsorship details or a short call, just reply to this email.${deck}

${sign}`,
    };
  }

  return {
    subject: `Re: ${stripReply(item.lastSubject)}`,
    body: `${hi}

Just following up on my earlier note about ${campaign.name}. I know inboxes get busy, so I'll keep this short: we'd still love to explore a partnership with ${item.companyName}, and I'm happy to answer any questions or send the sponsorship details.

Would a quick call this week work?${deck}

${sign}`,
  };
}
