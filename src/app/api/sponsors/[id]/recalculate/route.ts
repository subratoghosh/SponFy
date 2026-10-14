import { NextResponse, type NextRequest } from "next/server";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { getSponsorById, updateSponsor } from "@/lib/data/repositories/sponsors";
import { computeFitScore, CompanyFeatures } from "@/lib/services/scoring";
import { requireAuth, verifyCompanyOwnership } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Server-side authentication
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }
  const userId = authRes.context.userId;

  // 2. Rate limiting
  const rateLimit = await checkRateLimit("relevance", userId);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing sponsor ID" }, { status: 400 });
  }

  const sponsor = await getSponsorById(id);
  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  // 3. IDOR Resource Ownership Check
  const owned = await verifyCompanyOwnership(sponsor.id, userId);
  if (!owned) {
    return NextResponse.json(
      { error: "Forbidden. You do not own this sponsor.", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const campaign = await getCampaignById(sponsor.campaignId);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Derive structured features from sponsor dossier & signals
  const features: CompanyFeatures = {
    industry: sponsor.industry,
    targetScale: "all",
    supportedEventTypes: [campaign.eventType || "Event & Campaign"],
    hasStudentPrograms:
      sponsor.signals.some((s) => s.toLowerCase().includes("student") || s.toLowerCase().includes("grant") || s.toLowerCase().includes("campus")) ||
      (sponsor.researchReport?.sections?.studentDeveloperPrograms?.length ?? 0) > 0,
    studentProgramsEvidence:
      sponsor.researchReport?.sections?.studentDeveloperPrograms?.[0] ||
      (sponsor.signals.find((s) => s.toLowerCase().includes("student") || s.toLowerCase().includes("grant")) ?? undefined),
    locationAlignment: [campaign.location, "India", "Global"],
    pastSponsorshipSignals:
      sponsor.signals.some((s) => s.toLowerCase().includes("sponsor") || s.toLowerCase().includes("partner") || s.toLowerCase().includes("grant")) ||
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
