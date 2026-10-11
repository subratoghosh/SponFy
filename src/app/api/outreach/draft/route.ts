import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { runOutreachWorkflow } from "@/lib/workflows/outreach-graph";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { saveDraft } from "@/lib/data/repositories/outreach";
import { checkRateLimit, createRateLimitResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const outreachDraftRequestSchema = z.object({
  companyId: z.string().min(1).max(100),
  campaignId: z.string().min(1).max(100).optional(),
  tone: z.enum(["professional", "enthusiastic", "value_first", "short"]).default("professional"),
}).strict();

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

    const parsed = outreachDraftRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId, campaignId, tone } = parsed.data;

    const company = await getSponsorById(companyId, userId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const campaign = await getCampaignById(campaignId || company.campaignId, userId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const result = await runOutreachWorkflow(company, campaign, tone);

    const saved = await saveDraft({
      userId,
      companyId,
      contactId: company.contacts?.[0]?.id,
      subject: result.subject,
      body: result.body,
      quality: result.quality,
      status: "draft",
    });

    return NextResponse.json({
      success: true,
      draft: saved,
      safetyChecklist: result.safetyChecklist,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Drafting failed" }, { status: 500 });
  }
}
