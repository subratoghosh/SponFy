import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDrafts, getTodayMidnight } from "@/lib/data/repositories/outreach";
import { getSponsors } from "@/lib/data/repositories/sponsors";
import { isSuppressed, getUserProfile } from "@/lib/data/repositories/settings";
import { getMessages, countOutboundSince } from "@/lib/data/repositories/outreach";
import { resolveRecipient, evaluateSend } from "@/lib/outreach/send-guard";
import { getVerificationService } from "@/lib/integrations/verification";
import { SYSTEM_LIMITS } from "@/lib/config/limits";

export const runtime = "nodejs";

export interface EligibilityItem {
  draftId: string;
  companyName: string;
  toEmail: string;
  subject: string;
  status: "ready" | "needs_review" | "blocked";
  reason: string;
  nextAction: string;
  verificationStatus?: string;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: verify policy (20 requests/minute/user)
    const { checkRateLimit, createRateLimitResponse } = await import("@/lib/security/rate-limit");
    const rateLimit = await checkRateLimit("verify", userId);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const { searchParams } = new URL(req.url);
    const draftIdParam = searchParams.get("draftId");

    const [allDrafts, allSponsors, profile] = await Promise.all([
      getDrafts(undefined, userId),
      getSponsors(undefined, userId),
      getUserProfile(),
    ]);

    // Everyday at 12:00 AM (midnight), the daily send quota cleanly resets
    const todayMidnight = getTodayMidnight();
    const sentInWindow = await countOutboundSince(todayMidnight, userId);
    const dailyLimit = profile.dailySendLimit || SYSTEM_LIMITS.DEFAULT_DAILY_SEND_CAP;

    const verificationService = getVerificationService();

    let candidateDrafts = allDrafts;
    if (draftIdParam) {
      candidateDrafts = allDrafts.filter((d) => d.id === draftIdParam);
    }

    const ready: EligibilityItem[] = [];
    const needsReview: EligibilityItem[] = [];
    const blocked: EligibilityItem[] = [];

    for (const draft of candidateDrafts) {
      const company = allSponsors.find((s) => s.id === draft.companyId);
      const companyName = company?.name || "Unknown Company";

      if (!company) {
        blocked.push({
          draftId: draft.id,
          companyName,
          toEmail: "",
          subject: draft.subject,
          status: "blocked",
          reason: "Associated company profile was not found",
          nextAction: "Delete draft or re-associate company",
        });
        continue;
      }

      // 1. Placeholder check
      if ((draft as any).needsAttention) {
        blocked.push({
          draftId: draft.id,
          companyName,
          toEmail: "",
          subject: draft.subject,
          status: "blocked",
          reason: (draft as any).attentionReason || "Draft contains unresolved template placeholders (e.g. {{name}})",
          nextAction: "Edit draft and fill in missing information",
        });
        continue;
      }

      // 2. Resolve recipient
      const recipientResult = resolveRecipient({
        contactId: draft.contactId,
        contacts: company.contacts ?? [],
        companyDomain: company.domain,
        companyWebsite: company.website,
      });

      if (!recipientResult.ok) {
        blocked.push({
          draftId: draft.id,
          companyName,
          toEmail: "",
          subject: draft.subject,
          status: "blocked",
          reason: recipientResult.error,
          nextAction: "Add a valid contact person and email to company",
        });
        continue;
      }

      const toEmail = recipientResult.recipient;

      // 3. Suppression check
      const [suppressed, companyMessages] = await Promise.all([
        isSuppressed(toEmail),
        getMessages(company.id),
      ]);

      if (suppressed) {
        blocked.push({
          draftId: draft.id,
          companyName,
          toEmail,
          subject: draft.subject,
          status: "blocked",
          reason: "Recipient address is on the suppression/opt-out list",
          nextAction: "Sending permanently blocked; respect opt-out",
        });
        continue;
      }

      // 4. Verification check
      let vResult = null;
      try {
        vResult = await verificationService.verify(toEmail);
      } catch (err) {
        console.warn("Verification lookup error in eligibility check:", err);
      }

      const vStatus = vResult?.status || "UNKNOWN";

      if (vStatus === "INVALID" || vStatus === "DISPOSABLE") {
        blocked.push({
          draftId: draft.id,
          companyName,
          toEmail,
          subject: draft.subject,
          status: "blocked",
          verificationStatus: vStatus,
          reason: `Email address is verified as ${vStatus.toLowerCase()} (${vResult?.reason || "undeliverable"})`,
          nextAction: "Replace contact email with a valid corporate address",
        });
        continue;
      }

      // 5. Send-guard check (approval, touch cap, cadence, daily cap)
      const verdict = evaluateSend({
        draftStatus: draft.status,
        recipient: toEmail,
        suppressed,
        needsAttention: (draft as any).needsAttention,
        hasReply: companyMessages.some((m) => m.direction === "inbound"),
        companyStage: company.stage,
        priorOutbound: companyMessages.filter((m) => m.direction === "outbound"),
        sentInWindow,
        dailyLimit,
        verificationStatus: vStatus,
      });

      if (!verdict.ok) {
        blocked.push({
          draftId: draft.id,
          companyName,
          toEmail,
          subject: draft.subject,
          status: "blocked",
          verificationStatus: vStatus,
          reason: verdict.error,
          nextAction:
            verdict.code === "not_approved"
              ? "Approve draft first in the queue"
              : verdict.code === "daily_cap_reached"
              ? "Wait for 24-hour daily limit window to reset"
              : "Review company outreach history",
        });
        continue;
      }

      // 6. Needs Review category
      if (
        vStatus === "ACCEPT_ALL" ||
        vStatus === "RISKY" ||
        vStatus === "UNKNOWN" ||
        vStatus === "PROVIDER_DISAGREEMENT" ||
        vStatus === "VERIFICATION_UNAVAILABLE"
      ) {
        needsReview.push({
          draftId: draft.id,
          companyName,
          toEmail,
          subject: draft.subject,
          status: "needs_review",
          verificationStatus: vStatus,
          reason:
            vStatus === "ACCEPT_ALL"
              ? "Domain accepts all emails; specific mailbox existence is unconfirmed"
              : vStatus === "VERIFICATION_UNAVAILABLE"
              ? "Verification service not configured; address syntax is valid"
              : `Verification result: ${vStatus.toLowerCase()} (${vResult?.reason || "review recommended"})`,
          nextAction: "Proceed with caution or manually verify on LinkedIn",
        });
        continue;
      }

      // 7. Ready to send
      ready.push({
        draftId: draft.id,
        companyName,
        toEmail,
        subject: draft.subject,
        status: "ready",
        verificationStatus: vStatus,
        reason: "All safety, approval, and deliverability checks passed",
        nextAction: "Ready to dispatch via connected Gmail account",
      });
    }

    return NextResponse.json({
      success: true,
      readyCount: ready.length,
      needsReviewCount: needsReview.length,
      blockedCount: blocked.length,
      totalCount: ready.length + needsReviewCount(needsReview) + blocked.length,
      ready,
      needsReview,
      blocked,
      dailyCap: dailyLimit,
      sentInWindow,
      remainingCap: Math.max(0, dailyLimit - sentInWindow),
    });
  } catch (err: any) {
    console.error("Eligibility check API error:", err);
    return NextResponse.json({ error: err.message || "Failed to check eligibility" }, { status: 500 });
  }
}

function needsReviewCount(arr: any[]) {
  return arr.length;
}
