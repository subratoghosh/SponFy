import { NextResponse } from "next/server";
import { runOutreachWorkflow } from "@/lib/workflows/outreach-graph";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { saveDraft } from "@/lib/data/repositories/outreach";

export async function POST(req: Request) {
  try {
    const { companyId, campaignId, tone = "professional" } = await req.json();

    const company = await getSponsorById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const campaign = await getCampaignById(campaignId || company.campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const result = await runOutreachWorkflow(company, campaign, tone);

    const saved = await saveDraft({
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
