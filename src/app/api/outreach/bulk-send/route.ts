import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDrafts,
  getDraftById,
  getMessages,
  claimDraftForSending,
  releaseDraftClaim,
  countOutboundSince,
  recordSentMessage,
  getTodayMidnight,
} from "@/lib/data/repositories/outreach";
import { getSponsors, getSponsorById, updateSponsorStage } from "@/lib/data/repositories/sponsors";
import { isSuppressed, getUserProfile } from "@/lib/data/repositories/settings";
import { executeApprovedSend } from "@/lib/workflows/outreach-graph";
import { resolveRecipient, evaluateSend } from "@/lib/outreach/send-guard";
import { verifyEmailStrictly } from "@/lib/integrations/verification/strict-verifier";
import { SYSTEM_LIMITS } from "@/lib/config/limits";
import { EmailDraft, Company } from "@/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [allDrafts, allSponsors, profile] = await Promise.all([
      getDrafts(undefined, userId),
      getSponsors(undefined, userId),
      getUserProfile(),
    ]);

    // Everyday at 12:00 AM (midnight), the daily send quota cleanly resets
    const todayMidnight = getTodayMidnight();
    const sentInWindow = await countOutboundSince(todayMidnight, userId);
    const dailyLimit = profile.dailySendLimit || SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP;
    let remainingCap = Math.max(0, dailyLimit - sentInWindow);

    const eligible: Array<{ draftId: string; companyName: string; toEmail: string; subject: string }> = [];
    const excluded: Array<{ draftId: string; companyName: string; reason: string }> = [];

    // Filter drafts that are currently in approved state
    const candidateDrafts = allDrafts.filter((d) => d.status === "approved");

    for (const draft of candidateDrafts) {
      const company = allSponsors.find((s) => s.id === draft.companyId);
      const companyName = company?.name || "Unknown Company";

      if (!company) {
        excluded.push({ draftId: draft.id, companyName, reason: "Company not found" });
        continue;
      }

      if ((draft as any).needsAttention) {
        excluded.push({
          draftId: draft.id,
          companyName,
          reason: (draft as any).attentionReason || "Draft contains unresolved template placeholders",
        });
        continue;
      }

      const recipient = resolveRecipient({
        contactId: draft.contactId,
        contacts: company.contacts ?? [],
        companyDomain: company.domain,
        companyWebsite: company.website,
      });

      if (!recipient.ok) {
        excluded.push({ draftId: draft.id, companyName, reason: recipient.error });
        continue;
      }

      // Pre-flight Deliverability Shield
      const verif = await verifyEmailStrictly(recipient.recipient, { companyName: company.name });
      if (!verif.isDeliverable || verif.status === "NO_MX" || verif.status === "INVALID" || verif.status === "BOUNCED" || verif.status === "DISPOSABLE") {
        excluded.push({ draftId: draft.id, companyName, reason: `Deliverability Shield: ${verif.reason}` });
        continue;
      }

      const [suppressed, companyMessages] = await Promise.all([
        isSuppressed(recipient.recipient),
        getMessages(company.id),
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
        dailyLimit,
      });

      if (!verdict.ok) {
        excluded.push({ draftId: draft.id, companyName, reason: verdict.error });
        continue;
      }

      if (remainingCap <= 0) {
        excluded.push({
          draftId: draft.id,
          companyName,
          reason: `Daily send cap reached (${dailyLimit}/day). Resets in rolling 24h window.`,
        });
        continue;
      }

      remainingCap--;
      eligible.push({
        draftId: draft.id,
        companyName,
        toEmail: recipient.recipient,
        subject: draft.subject,
      });
    }

    return NextResponse.json({
      success: true,
      eligibleCount: eligible.length,
      excludedCount: excluded.length,
      eligible,
      excluded,
      dailyCap: dailyLimit,
      sentInWindow,
      remainingCap: Math.max(0, dailyLimit - sentInWindow),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to inspect bulk send eligibility" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply send rate limit
    const { checkRateLimit, createRateLimitResponse } = await import("@/lib/security/rate-limit");
    const rateLimit = await checkRateLimit("send", userId);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    let targetDraftIds: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body.draftIds)) {
        targetDraftIds = body.draftIds;
      }
    } catch {
      // payload optional: if empty, sends all eligible approved
    }

    // Spec Non-negotiable 5: Each item in a bulk request is authorized individually. One unauthorized ID fails the entire request.
    if (targetDraftIds.length > 0) {
      const { verifyDraftOwnership } = await import("@/lib/security/auth-guard");
      for (const draftId of targetDraftIds) {
        const verified = await verifyDraftOwnership(draftId, userId);
        if (!verified) {
          return NextResponse.json(
            {
              error: `Forbidden. You do not have authorization for draft "${draftId}".`,
              code: "FORBIDDEN",
            },
            { status: 403 }
          );
        }
      }
    }

    const [allDrafts, allSponsors, profile] = await Promise.all([
      getDrafts(undefined, userId),
      getSponsors(undefined, userId),
      getUserProfile(),
    ]);

    // Everyday at 12:00 AM (midnight), the daily send quota cleanly resets
    const todayMidnight = getTodayMidnight();
    let sentInWindow = await countOutboundSince(todayMidnight, userId);
    const dailyLimit = profile.dailySendLimit || SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP;

    const draftsToSend = allDrafts.filter((d) => {
      const isApproved = d.status === "approved";
      if (!isApproved) return false;
      if (targetDraftIds.length > 0) return targetDraftIds.includes(d.id);
      return true;
    });

    const sent: Array<{ draftId: string; companyName: string; toEmail: string; messageId: string }> = [];
    const failed: Array<{ draftId: string; companyName: string; reason: string }> = [];

    // Process sequentially or in chunks of 2 to respect serverless timeouts and Gmail API rate limits
    for (const draft of draftsToSend) {
      if (sentInWindow >= dailyLimit) {
        failed.push({
          draftId: draft.id,
          companyName: draft.companyId,
          reason: "Daily send limit reached",
        });
        continue;
      }

      const company = allSponsors.find((s) => s.id === draft.companyId);
      if (!company) {
        failed.push({ draftId: draft.id, companyName: "Unknown", reason: "Company not found" });
        continue;
      }

      if ((draft as any).needsAttention) {
        failed.push({ draftId: draft.id, companyName: company.name, reason: "Contains unresolved template placeholders" });
        continue;
      }

      const recipient = resolveRecipient({
        contactId: draft.contactId,
        contacts: company.contacts ?? [],
        companyDomain: company.domain,
        companyWebsite: company.website,
      });
      if (!recipient.ok) {
        failed.push({ draftId: draft.id, companyName: company.name, reason: recipient.error });
        continue;
      }

      // Pre-flight Deliverability Shield
      const verif = await verifyEmailStrictly(recipient.recipient, { companyName: company.name });
      if (!verif.isDeliverable || verif.status === "NO_MX" || verif.status === "INVALID" || verif.status === "BOUNCED" || verif.status === "DISPOSABLE") {
        failed.push({ draftId: draft.id, companyName: company.name, reason: `Deliverability Shield: ${verif.reason}` });
        continue;
      }

      const [suppressed, companyMessages] = await Promise.all([
        isSuppressed(recipient.recipient),
        getMessages(company.id),
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
        dailyLimit,
      });

      if (!verdict.ok) {
        failed.push({ draftId: draft.id, companyName: company.name, reason: verdict.error });
        continue;
      }

      // Atomically claim draft
      const claimed = await claimDraftForSending(draft.id);
      if (!claimed) {
        failed.push({ draftId: draft.id, companyName: company.name, reason: "Already sending or claim failed" });
        continue;
      }

      try {
        const sendResult = await executeApprovedSend(draft, recipient.recipient, userId);

        await recordSentMessage(
          draft.id,
          recipient.recipient,
          sendResult.messageId,
          sendResult.threadId,
          userId
        );

        await updateSponsorStage(company.id, "Contacted");

        sent.push({
          draftId: draft.id,
          companyName: company.name,
          toEmail: recipient.recipient,
          messageId: sendResult.messageId,
        });

        sentInWindow++;
      } catch (err: any) {
        await releaseDraftClaim(draft.id);
        failed.push({
          draftId: draft.id,
          companyName: company.name,
          reason: err?.message || "Gmail dispatch failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: sent.length,
      failedCount: failed.length,
      sent,
      failed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Bulk send execution failed" }, { status: 500 });
  }
}
