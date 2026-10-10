import { NextResponse } from "next/server";
import { runResearchWorkflow } from "@/lib/workflows/research-graph";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { getSponsorById, updateSponsor } from "@/lib/data/repositories/sponsors";

export async function POST(req: Request) {
  try {
    const { companyId, campaignId } = await req.json();

    const company = await getSponsorById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
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
    return NextResponse.json({ error: err.message || "Research failed" }, { status: 500 });
  }
}
