import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { getSponsorById, updateSponsor } from "@/lib/data/repositories/sponsors";
import { computeFitScore, CompanyFeatures } from "@/lib/services/scoring";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !userId;

  if (!userId && !isDemo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing sponsor ID" }, { status: 400 });
  }

  const sponsor = await getSponsorById(id);
  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  const campaign = await getCampaignById(sponsor.campaignId);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Derive structured features from sponsor dossier & signals
  const features: CompanyFeatures = {
    industry: sponsor.industry,
    targetScale: "all",
    supportedEventTypes: [campaign.eventType || "Hackathon"],
    hasStudentPrograms:
      sponsor.signals.some((s) => s.toLowerCase().includes("student") || s.toLowerCase().includes("grant") || s.toLowerCase().includes("campus")) ||
      (sponsor.researchReport?.sections?.studentDeveloperPrograms?.length ?? 0) > 0,
    studentProgramsEvidence:
      sponsor.researchReport?.sections?.studentDeveloperPrograms?.[0] ||
      (sponsor.signals.find((s) => s.toLowerCase().includes("student") || s.toLowerCase().includes("grant")) ?? undefined),
    locationAlignment: [campaign.location, "India", "Global"],
    pastSponsorshipSignals:
      sponsor.signals.some((s) => s.toLowerCase().includes("sponsor") || s.toLowerCase().includes("hackathon")) ||
      (sponsor.researchReport?.sections?.sponsorshipOpportunities?.length ?? 0) > 0,
    pastSponsorshipEvidence:
      sponsor.researchReport?.sections?.sponsorshipOpportunities?.[0] ||
      (sponsor.signals.find((s) => s.toLowerCase().includes("sponsor")) ?? undefined),
    hasContacts: (sponsor.contacts?.length ?? 0) > 0,
    contactsCount: sponsor.contacts?.length ?? 0,
  };

  const scoreResult = computeFitScore(campaign, features);

  // Update sponsor in repository
  const updated = await updateSponsor(sponsor.id, {
    fitScore: scoreResult.score,
    confidence: scoreResult.confidence,
    scoreBreakdown: scoreResult.breakdown,
    stage: scoreResult.isQualified && sponsor.stage === "Discovered" ? "Qualified" : sponsor.stage,
  });

  return NextResponse.json({
    success: true,
    data: {
      sponsor: updated,
      scoreResult,
    },
  });
}
