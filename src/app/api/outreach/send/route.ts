import { NextResponse } from "next/server";
import {
  getDraftById,
  getMessages,
  recordSentMessage,
  claimDraftForSending,
  releaseDraftClaim,
  countOutboundSince,
  getTodayMidnight,
} from "@/lib/data/repositories/outreach";
import { getSponsorById, addContact } from "@/lib/data/repositories/sponsors";
import { isSuppressed, getUserProfile } from "@/lib/data/repositories/settings";
import { executeApprovedSend } from "@/lib/workflows/outreach-graph";
import { resolveRecipient, evaluateSend } from "@/lib/outreach/send-guard";
import { verifyEmailStrictly } from "@/lib/integrations/verification/strict-verifier";
import { SYSTEM_LIMITS } from "@/lib/config/limits";
import { requireAuth, verifyCompanyOwnership } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. Server-side authentication
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }
  const userId = authRes.context.userId;

  // 2. Strict rate limit on email sending (10 requests/minute/user)
  const rateLimit = await checkRateLimit("send", userId);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  let body: { draftId?: string; toEmail?: string; allowOverLimit?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { draftId, toEmail, allowOverLimit } = body;
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

    // 3. IDOR Resource Ownership Check: ensure company belongs to authenticated user
    const ownedCompany = await verifyCompanyOwnership(company.id, userId);
    if (!ownedCompany) {
      return NextResponse.json(
        { error: "Forbidden. You do not own the company associated with this draft.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // If the user specified a custom or typed email in the modal/dialog:
    if (toEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail.trim())) {
      const cleanTo = toEmail.trim().toLowerCase();
      const existingContact = company.contacts?.find((c) => c.email?.toLowerCase() === cleanTo);
      if (!existingContact) {
        try {
          const newContact = await addContact(company.id, {
            name: `${company.name} Contact`,
            email: cleanTo,
            role: "Direct Outreach / Sponsor Relations",
            status: "verified",
          });
          if (newContact) {
            company.contacts = [...(company.contacts ?? []), newContact];
          }
        } catch (cErr) {
          console.warn("Could not auto-persist custom contact:", cErr);
        }
      }
    }

    // Recipient comes from the stored contact or verified direct outreach address
    const recipient = resolveRecipient({
      contactId: draft.contactId,
      contacts: company.contacts ?? [],
      requestedTo: toEmail,
      companyDomain: company.domain,
      companyWebsite: company.website,
    });
    if (!recipient.ok) {
      return NextResponse.json({ error: recipient.error, code: recipient.code }, { status: recipient.status });
    }

    // Pre-flight Deliverability Assessment: MX, SPF, DMARC check for auditing (alert shown in UI; user authorized to send)
    const verif = await verifyEmailStrictly(recipient.recipient, { companyName: company.name }).catch(() => null);
    if (verif && (!verif.isDeliverable || verif.status === "NO_MX" || verif.status === "INVALID")) {
      console.warn(`[Send Route] Dispatching email despite safety alert on ${recipient.recipient} (${verif.reason}) per user authorization.`);
    }

    // Auto-persist contact in database if missing so followups and thread sync attach seamlessly
    if (!company.contacts?.some((c) => c.email?.toLowerCase() === recipient.recipient.toLowerCase())) {
      try {
        await addContact(company.id, {
          name: `${company.name} Team`,
          email: recipient.recipient,
          role: "Partnerships / Sponsor Relations",
          status: "verified",
        });
      } catch (cErr) {
        console.warn("Could not auto-persist contact during send:", cErr);
      }
    }

    // Everyday at 12:00 AM (midnight), the daily send quota cleanly resets
    const todayMidnight = getTodayMidnight();
    const [suppressed, companyMessages, sentInWindow, profile] = await Promise.all([
      isSuppressed(recipient.recipient),
      getMessages(company.id, userId),
      countOutboundSince(todayMidnight, userId),
      getUserProfile(),
    ]);

    const verdict = evaluateSend({
      draftStatus: draft.status,
      recipient: recipient.recipient,
      suppressed,
      needsAttention: (draft as any).needsAttention,
      hasReply: companyMessages.some((m) => m.direction === "inbound"),
      companyStage: company.stage,
      priorOutbound: companyMessages.filter((m) => m.direction === "outbound"),
      sentInWindow,
      dailyLimit: profile.dailySendLimit,
      allowOverLimit: Boolean(allowOverLimit),
    });
    if (!verdict.ok) {
      return NextResponse.json({ error: verdict.error, code: verdict.code }, { status: verdict.status });
    }

    // Atomically claim the draft so a double click or a concurrent request cannot send it twice.
    const claimed = await claimDraftForSending(draft.id);
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
      await releaseDraftClaim(draft.id);
      return NextResponse.json(
        { error: `Email was NOT sent: ${err?.message || "send failed"}`, code: "send_failed" },
        { status: 502 }
      );
    }

    try {
      const msg = await recordSentMessage(draft.id, recipient.recipient, sendResult.messageId, sendResult.threadId, userId);
      if (!msg) throw new Error("draft disappeared while recording");
      return NextResponse.json({
        success: true,
        message: msg,
        warning: (verdict as any).warning || undefined,
      });
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
    console.error("[outreach/send error]:", err);
    return NextResponse.json({ error: err?.message || "Send failed" }, { status: 500 });
  }
}
