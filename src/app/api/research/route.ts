import { NextResponse } from "next/server";
import { runResearchWorkflow } from "@/lib/workflows/research-graph";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { getSponsorById, updateSponsor } from "@/lib/data/repositories/sponsors";
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

  // 2. Rate limiting (relevance / research quota)
  const rateLimit = await checkRateLimit("relevance", userId);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { companyId, campaignId } = body || {};
    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const company = await getSponsorById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 3. IDOR Resource Ownership Check
    const owned = await verifyCompanyOwnership(companyId, userId);
    if (!owned) {
      return NextResponse.json(
        { error: "Forbidden. You do not own this company.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const campaign = await getCampaignById(campaignId || company.campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

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
    });

    return NextResponse.json({ success: true, company: updated });
  } catch (err: any) {
    console.error("[API research error]:", err);
    return NextResponse.json({ error: err.message || "Research failed" }, { status: 500 });
  }
}
