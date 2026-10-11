import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { runResearchWorkflow } from "@/lib/workflows/research-graph";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { getSponsorById, updateSponsor } from "@/lib/data/repositories/sponsors";
import { checkRateLimit, createRateLimitResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const researchRequestSchema = z.object({
  companyId: z.string().min(1).max(100),
  campaignId: z.string().min(1).max(100).optional(),
}).strict();

// Concurrency tracking for research (max 3 concurrent per user)
const activeResearchPerUser = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limit per user
    const rl = checkRateLimit(
      `research:${userId}`,
      RATE_LIMIT_CONFIGS.research.limit,
      RATE_LIMIT_CONFIGS.research.windowSeconds
    );
    if (!rl.allowed) {
      return createRateLimitResponse(rl.reset);
    }

    // Enforce research concurrency cap (max 3 per user)
    const currentConcurrency = activeResearchPerUser.get(userId) || 0;
    if (currentConcurrency >= RATE_LIMIT_CONFIGS.research.maxConcurrency) {
      return NextResponse.json(
        { error: "Too many concurrent research requests. Maximum 3 concurrent jobs allowed." },
        { status: 429 }
      );
    }

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = researchRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyId, campaignId } = parsed.data;

    const company = await getSponsorById(companyId, userId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const campaign = await getCampaignById(campaignId || company.campaignId, userId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    activeResearchPerUser.set(userId, currentConcurrency + 1);

    try {
      const result = await runResearchWorkflow(
        company.name,
        company.website,
        company.industry,
        company.description,
        campaign
      );

      const updated = await updateSponsor(companyId, {
        fitScore: result.fitScore,
        confidence: result.confidence,
        scoreBreakdown: result.scoreBreakdown,
        sources: result.sources,
        researchReport: {
          sections: result.sections,
          recommendedAngle: result.recommendedAngle,
        },
        researchStatus: "completed",
        stage: company.stage === "Discovered" ? "Researched" : company.stage,
      }, userId);

      return NextResponse.json({ success: true, company: updated });
    } finally {
      const active = activeResearchPerUser.get(userId) || 1;
      activeResearchPerUser.set(userId, Math.max(0, active - 1));
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Research failed" }, { status: 500 });
  }
}
