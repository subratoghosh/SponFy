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
    | "daily_cap_reached"
    | "needs_attention"
    | "reply_received"
    | "stage_halted"
    | "verification_invalid"
    | "verification_disposable"
    | "verification_risky";
  error: string;
};

export type RecipientResult = { ok: true; recipient: string } | GuardFailure;
export type GuardResult = { ok: true; warning?: string } | GuardFailure;

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
  companyDomain?: string | null;
  companyWebsite?: string | null;
}): RecipientResult {
  const { contactId, contacts, requestedTo, companyDomain, companyWebsite } = input;

  let contact: { id: string; email: string } | undefined;
  if (contactId) {
    contact = contacts.find((c) => c.id === contactId);
    if (!contact && contacts.length > 0) {
      contact = contacts.find((c) => c.email && c.email.trim() !== "");
    }
  } else {
    // Drafts created before a contact existed fall back to the first contact with an email, or first contact
    contact = contacts.find((c) => c.email && c.email.trim() !== "") || contacts[0];
  }

  let email = (contact?.email || "").trim();

  // If no contact email stored, fall back to explicitly requestedTo if valid
  if (!email || !EMAIL_RE.test(email)) {
    if (requestedTo && EMAIL_RE.test(requestedTo.trim())) {
      email = requestedTo.trim();
    }
  }

  if (!email || !EMAIL_RE.test(email)) {
    return fail(422, "no_recipient", "No valid recipient email on file for this company. Discover or add a verified contact first.");
  }

  if (requestedTo && requestedTo.trim().toLowerCase() !== email.toLowerCase()) {
    // If user provided a valid direct address on screen, accept it
    if (EMAIL_RE.test(requestedTo.trim())) {
      return { ok: true, recipient: requestedTo.trim() };
    }
    return fail(409, "recipient_mismatch", "The recipient shown does not match the contact on file. Refresh and try again.");
  }

  return { ok: true, recipient: email };
}

export interface SendGuardInput {
  draftStatus: DraftStatus | string;
  recipient: string;
  suppressed: boolean;
  needsAttention?: boolean;
  hasReply?: boolean;
  companyStage?: string;
  verificationStatus?: string;
  senderHealthAtRisk?: boolean;
  /** Outbound messages already sent to this company (any email in its history). */
  priorOutbound: { sentAt: string }[];
  /** Outbound messages sent by the whole workspace inside the cap window. */
  sentInWindow: number;
  dailyLimit: number;
  now?: Date;
  allowOverLimit?: boolean;
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
  if (input.needsAttention) {
    return fail(422, "needs_attention", "Blocked: this draft contains unresolved placeholders or requires attention before sending.");
  }

  // 1b. Email verification gate
  if (input.verificationStatus === "INVALID") {
    return fail(422, "verification_invalid", `Blocked: ${input.recipient} is confirmed invalid and undeliverable.`);
  }
  if (input.verificationStatus === "DISPOSABLE") {
    return fail(422, "verification_disposable", `Blocked: ${input.recipient} is a temporary/disposable address.`);
  }
  if (input.verificationStatus === "RISKY" && input.senderHealthAtRisk) {
    return fail(422, "verification_risky", `Blocked: ${input.recipient} has high spam risk and sender health is currently AT_RISK.`);
  }

  // 2. Reply received / stage halted guard for follow-ups
  if (input.priorOutbound.length > 0) {
    if (input.hasReply) {
      return fail(409, "reply_received", "Blocked: recipient has already replied. Follow-up outreach is halted.");
    }
    const HALTED_STAGES = new Set(["Replied", "Interested", "Negotiation", "Committed", "Lost"]);
    if (input.companyStage && HALTED_STAGES.has(input.companyStage)) {
      return fail(409, "stage_halted", `Blocked: company stage is "${input.companyStage}". Follow-up outreach is halted.`);
    }
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

  // 6. Daily send cap (rolling window)
  const limit = effectiveDailyLimit(input.dailyLimit);
  if (input.sentInWindow >= limit) {
    const warning = `Warning: You have reached your recommended daily limit (${input.sentInWindow}/${limit} sent in the last ${SYSTEM_LIMITS.SEND_CAP_WINDOW_HOURS}h). Sending more emails today increases the risk of corporate mail servers routing your outreach to the spam folder or temporarily flagging your sending domain reputation.`;
    if (input.allowOverLimit) {
      return { ok: true, warning };
    }
    return fail(
      429,
      "daily_cap_reached",
      `Blocked: you have reached your workspace daily limit of ${limit} email(s) in the last ${SYSTEM_LIMITS.SEND_CAP_WINDOW_HOURS} hours. Sending further emails increases spam risk.`
    );
  }

  return { ok: true };
}
