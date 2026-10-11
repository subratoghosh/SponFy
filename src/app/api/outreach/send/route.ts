import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  getDraftById,
  getMessages,
  recordSentMessage,
  claimDraftForSending,
  releaseDraftClaim,
  countOutboundSince,
} from "@/lib/data/repositories/outreach";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { isSuppressed, getUserProfile, getGmailStatus } from "@/lib/data/repositories/settings";
import { executeApprovedSend } from "@/lib/workflows/outreach-graph";
import { resolveRecipient, evaluateSend } from "@/lib/outreach/send-guard";
import { SYSTEM_LIMITS } from "@/lib/config/limits";
import { isDatabaseConfigured } from "@/lib/prisma";
import { checkRateLimit, createRateLimitResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const sendRequestSchema = z.object({
  draftId: z.string().min(1).max(100),
  toEmail: z.string().email().max(254).optional(),
}).strict();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = sendRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { draftId, toEmail } = parsed.data;

    // Per-user daily send cap rate limit
    const rl = checkRateLimit(
      `send:${userId}`,
      RATE_LIMIT_CONFIGS.send.limit,
      RATE_LIMIT_CONFIGS.send.windowSeconds
    );
    if (!rl.allowed) {
      return createRateLimitResponse(rl.reset);
    }

    // Verify Gmail account is active if database is configured
    if (isDatabaseConfigured()) {
      const gmail = await getGmailStatus(userId);
      if (!gmail.connected) {
        return NextResponse.json(
          { error: "Gmail integration is not connected or active. Please connect Gmail in Settings.", code: "gmail_inactive" },
          { status: 400 }
        );
      }
    }

    const draft = await getDraftById(draftId, userId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const company = await getSponsorById(draft.companyId, userId);
    if (!company) {
      return NextResponse.json({ error: "Company not found for this draft" }, { status: 404 });
    }

    // Recipient always comes from the stored contact; the client's value must match it.
    const recipient = resolveRecipient({
      contactId: draft.contactId,
      contacts: company.contacts ?? [],
      requestedTo: toEmail,
    });
    if (!recipient.ok) {
      return NextResponse.json({ error: recipient.error, code: recipient.code }, { status: recipient.status });
    }

    const windowStart = new Date(Date.now() - SYSTEM_LIMITS.SEND_CAP_WINDOW_HOURS * 60 * 60 * 1000);
    const [suppressed, companyMessages, sentInWindow, profile] = await Promise.all([
      isSuppressed(recipient.recipient),
      getMessages(company.id),
      countOutboundSince(windowStart),
      getUserProfile(userId),
    ]);

    const verdict = evaluateSend({
      draftStatus: draft.status,
      recipient: recipient.recipient,
      suppressed,
      priorOutbound: companyMessages.filter((m) => m.direction === "outbound"),
      sentInWindow,
      dailyLimit: profile.dailySendLimit,
    });
    if (!verdict.ok) {
      return NextResponse.json({ error: verdict.error, code: verdict.code }, { status: verdict.status });
    }

    // Atomically claim the draft so a double click or a teammate cannot send it twice.
    const claimed = await claimDraftForSending(draft.id, userId);
    if (!claimed) {
      return NextResponse.json(
        { error: "This draft is already being sent or is no longer approved.", code: "already_sent" },
        { status: 409 }
      );
    }

    let sendResult: { messageId: string; threadId: string };
    try {
      sendResult = await executeApprovedSend(draft, recipient.recipient, userId);
    } catch (err: any) {
      // Nothing went out: give the approval back so the organizer can retry.
      await releaseDraftClaim(draft.id, userId);
      return NextResponse.json(
        { error: `Email was NOT sent: ${err?.message || "send failed"}`, code: "send_failed" },
        { status: 502 }
      );
    }

    try {
      const msg = await recordSentMessage(draft.id, recipient.recipient, sendResult.messageId, sendResult.threadId, userId);
      if (!msg) throw new Error("draft disappeared while recording");
      return NextResponse.json({ success: true, message: msg });
    } catch (err: any) {
      // The email DID go out. Leave the draft claimed (SENDING) so it can never be re-sent.
      console.error(`Email for draft ${draft.id} was sent but could not be recorded:`, err);
      return NextResponse.json(
        {
          error: "The email was sent, but recording it failed. Do NOT resend; check the tracker.",
          code: "sent_not_recorded",
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Send failed" }, { status: 500 });
  }
}
