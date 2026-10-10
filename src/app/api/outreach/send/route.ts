import { NextResponse } from "next/server";
import {
  getDraftById,
  getMessages,
  recordSentMessage,
  claimDraftForSending,
  releaseDraftClaim,
  countOutboundSince,
} from "@/lib/data/repositories/outreach";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { isSuppressed, getUserProfile } from "@/lib/data/repositories/settings";
import { executeApprovedSend } from "@/lib/workflows/outreach-graph";
import { resolveRecipient, evaluateSend } from "@/lib/outreach/send-guard";
import { SYSTEM_LIMITS } from "@/lib/config/limits";

export async function POST(req: Request) {
  let body: { draftId?: string; toEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { draftId, toEmail } = body;
  if (!draftId) {
    return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
  }

  try {
    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const company = await getSponsorById(draft.companyId);
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
      getUserProfile(),
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
    const claimed = await claimDraftForSending(draft.id);
    if (!claimed) {
      return NextResponse.json(
        { error: "This draft is already being sent or is no longer approved.", code: "already_sent" },
        { status: 409 }
      );
    }

    let sendResult: { messageId: string; threadId: string };
    try {
      sendResult = await executeApprovedSend(draft, recipient.recipient);
    } catch (err: any) {
      // Nothing went out: give the approval back so the organizer can retry.
      await releaseDraftClaim(draft.id);
      return NextResponse.json(
        { error: `Email was NOT sent: ${err?.message || "send failed"}`, code: "send_failed" },
        { status: 502 }
      );
    }

    try {
      const msg = await recordSentMessage(draft.id, recipient.recipient, sendResult.messageId, sendResult.threadId);
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
