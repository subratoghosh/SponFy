import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { loadFollowups } from "@/lib/outreach/followup-service";
import { buildFollowupDraft } from "@/lib/outreach/followups";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { createDraft } from "@/lib/data/repositories/outreach";
import { getUserProfile } from "@/lib/data/repositories/settings";
import { checkRateLimit, createRateLimitResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const followupDraftRequestSchema = z.object({
  companyId: z.string().min(1).max(100),
}).strict();

/**
 * Creates a follow-up DRAFT for a company whose follow-up window is open.
 * It never sends anything: a human still has to approve it, and /api/outreach/send
 * re-checks every safety rule when it is sent.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const rl = checkRateLimit(
      `draft:${userId}`,
      RATE_LIMIT_CONFIGS.draft.limit,
      RATE_LIMIT_CONFIGS.draft.windowSeconds
    );
    if (!rl.allowed) {
      return createRateLimitResponse(rl.reset);
    }

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = followupDraftRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId } = parsed.data;

    const item = (await loadFollowups()).find((i) => i.companyId === companyId);
    if (!item) return NextResponse.json({ error: "This company has not been contacted yet." }, { status: 404 });

    if (item.state === "draft_ready" && item.pendingDraft) {
      return NextResponse.json({ success: true, draft: item.pendingDraft, existing: true });
    }
    if (item.state !== "due" || !item.nextTouch) {
      return NextResponse.json({ error: item.reason, state: item.state }, { status: 409 });
    }

    const company = await getSponsorById(companyId, userId);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    const campaign = await getCampaignById(company.campaignId, userId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Follow up with the same person who got the first email, never a different address.
    const contact = company.contacts?.find((c) => c.email.toLowerCase() === item.recipientEmail.toLowerCase());
    if (!contact) {
      return NextResponse.json(
        { error: `${item.recipientEmail} is no longer a contact on file for ${company.name}. Add the contact again first.` },
        { status: 409 }
      );
    }

    const profile = await getUserProfile(userId);
    const { subject, body } = buildFollowupDraft({
      item,
      campaign,
      signature: profile.signature || profile.fullName,
    });

    const draft = await createDraft({
      userId,
      companyId,
      contactId: contact.id,
      subject,
      body,
      status: "draft",
      quality: {
        personalization: 0,
        relevance: 0,
        clarity: 0,
        cta: 0,
        professionalism: 0,
        overall: 0,
        suggestions: ["Human review required before approval"],
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Drafting follow-up failed" }, { status: 500 });
  }
}
