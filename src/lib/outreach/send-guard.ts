import { SYSTEM_LIMITS } from "@/lib/config/limits";
import type { DraftStatus } from "@/types";

/**
 * Server-side send guard. Pure functions only (no I/O) so every rule is unit-testable.
 * The /api/outreach/send route gathers the facts and this module decides.
 *
 * Rules, in the order they are checked:
 *  1. The draft must be explicitly APPROVED by a human (never "draft", "sending" or "sent").
 *  2. The recipient comes from the company's stored contact, never from the client.
 *  3. The recipient must not be on the suppression list.
 *  4. A company gets at most 1 initial email + MAX_FOLLOWUP_COUNT follow-ups, ever.
 *  5. Two sends to the same company must be MIN_DAYS_BETWEEN_TOUCHES apart
 *     (stops two teammates contacting the same sponsor at the same time).
 *  6. The rolling 24h daily send cap must not be exceeded.
 */

export type GuardFailure = {
  ok: false;
  status: number;
  code:
    | "not_approved"
    | "already_sent"
    | "no_recipient"
    | "recipient_mismatch"
    | "suppressed"
    | "touch_cap_reached"
    | "too_soon"
    | "daily_cap_reached";
  error: string;
};

export type RecipientResult = { ok: true; recipient: string } | GuardFailure;
export type GuardResult = { ok: true } | GuardFailure;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function fail(status: number, code: GuardFailure["code"], error: string): GuardFailure {
  return { ok: false, status, code, error };
}

/** Normalise a configured daily limit into a safe integer in [1, MAX_DAILY_SEND_CAP]. */
export function effectiveDailyLimit(configured: number | undefined | null): number {
  const n = Math.floor(Number(configured));
  const base = Number.isFinite(n) && n > 0 ? n : SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP;
  return Math.min(base, SYSTEM_LIMITS.MAX_DAILY_SEND_CAP);
}

/**
 * Decide who the email goes to. The address always comes from a stored contact.
 * If the client also states a recipient it must match, so the person who clicked
 * "send" is always sending to the address they saw on screen.
 */
export function resolveRecipient(input: {
  contactId?: string | null;
  contacts: { id: string; email: string }[];
  requestedTo?: string | null;
}): RecipientResult {
  const { contactId, contacts, requestedTo } = input;

  let contact: { id: string; email: string } | undefined;
  if (contactId) {
    contact = contacts.find((c) => c.id === contactId);
    if (!contact) {
      return fail(422, "no_recipient", "The contact attached to this draft no longer exists. Re-attach a contact and try again.");
    }
  } else {
    // Drafts created before a contact existed fall back to the first contact (what the UI displays).
    contact = contacts[0];
  }

  const email = (contact?.email || "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return fail(422, "no_recipient", "No valid recipient email on file for this company. Add a verified contact first.");
  }

  if (requestedTo && requestedTo.trim().toLowerCase() !== email.toLowerCase()) {
    return fail(409, "recipient_mismatch", "The recipient shown does not match the contact on file. Refresh and try again.");
  }

  return { ok: true, recipient: email };
}

export interface SendGuardInput {
  draftStatus: DraftStatus | string;
  recipient: string;
  suppressed: boolean;
  /** Outbound messages already sent to this company (any email in its history). */
  priorOutbound: { sentAt: string }[];
  /** Outbound messages sent by the whole workspace inside the cap window. */
  sentInWindow: number;
  dailyLimit: number;
  now?: Date;
}

export function evaluateSend(input: SendGuardInput): GuardResult {
  const now = input.now ?? new Date();

  // 1. Human approval — the non-negotiable gate.
  if (input.draftStatus === "sent" || input.draftStatus === "sending") {
    return fail(409, "already_sent", "This draft has already been sent (or is being sent right now).");
  }
  if (input.draftStatus !== "approved") {
    return fail(403, "not_approved", "Blocked: this draft has not been approved by a human organizer.");
  }

  // 3. Suppression list.
  if (input.suppressed) {
    return fail(403, "suppressed", `Blocked: ${input.recipient} is on the suppression list.`);
  }

  // 4. Lifetime touch cap per company (initial + max follow-ups).
  const maxTouches = 1 + SYSTEM_LIMITS.MAX_FOLLOWUP_COUNT;
  if (input.priorOutbound.length >= maxTouches) {
    return fail(
      409,
      "touch_cap_reached",
      `Blocked: this company already received ${input.priorOutbound.length} emails (1 initial + ${SYSTEM_LIMITS.MAX_FOLLOWUP_COUNT} follow-ups). We stop here so no sponsor is spammed.`
    );
  }

  // 5. Minimum spacing / duplicate-outreach guard.
  if (input.priorOutbound.length > 0) {
    const latest = Math.max(...input.priorOutbound.map((m) => new Date(m.sentAt).getTime()));
    const daysSince = (now.getTime() - latest) / DAY_MS;
    if (daysSince < SYSTEM_LIMITS.MIN_DAYS_BETWEEN_TOUCHES) {
      const waitDays = Math.ceil(SYSTEM_LIMITS.MIN_DAYS_BETWEEN_TOUCHES - daysSince);
      return fail(
        409,
        "too_soon",
        `Blocked: this company was already emailed ${daysSince < 1 ? "today" : `${Math.floor(daysSince)} day(s) ago`}. Another send is allowed in ${waitDays} day(s). This prevents two teammates contacting the same sponsor.`
      );
    }
  }

  // 6. Daily send cap (rolling window).
  const limit = effectiveDailyLimit(input.dailyLimit);
  if (input.sentInWindow >= limit) {
    return fail(429, "daily_cap_reached", `Daily send cap reached (${input.sentInWindow}/${limit} in the last ${SYSTEM_LIMITS.SEND_CAP_WINDOW_HOURS}h). Try again later.`);
  }

  return { ok: true };
}
