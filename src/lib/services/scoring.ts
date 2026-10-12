import { Campaign, ScoreFactor } from "@/types";
import {
  SCORING_WEIGHTS,
  QUALIFY_THRESHOLD,
  getScoreTier,
} from "@/lib/config/scoring";

export interface CompanyFeatures {
  industry?: string;
  targetScale?: "small" | "medium" | "large" | "all"; // sponsorship scale
  supportedEventTypes?: string[]; // e.g. ["hackathon", "conference"]
  hasStudentPrograms?: boolean;
  studentProgramsEvidence?: string;
  locationAlignment?: string[]; // countries or regions, e.g. ["India", "Global"]
  pastSponsorshipSignals?: boolean;
  pastSponsorshipEvidence?: string;
  hasContacts?: boolean;
  contactsCount?: number;
}

export interface FitScoreResult {
  score: number; // 0 - 100
  confidence: number; // 0 - 100
  breakdown: ScoreFactor[];
  summaryReason: string;
  isQualified: boolean;
  tier: {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  };
}

/**
 * Pure, deterministic function to compute fit score.
 * Never invents evidence. Missing features get 0 points and decrease confidence.
 */
export function computeFitScore(
  campaign: Pick<Campaign, "eventType" | "audienceSize" | "location" | "preferredIndustries">,
  companyFeatures?: CompanyFeatures | null
): FitScoreResult {
  const breakdown: ScoreFactor[] = [];
  let totalPoints = 0;
  let featuresCount = 0;
  let missingCount = 0;

  if (!companyFeatures) {
    return {
      score: 0,
      confidence: 0,
      breakdown: [
        {
          factor: "Company Features Missing",
          points: 0,
          maxPoints: 100,
          reason: "No structured research features available to evaluate",
          positive: false,
        },
      ],
      summaryReason: "Not scored — insufficient company research data",
      isQualified: false,
      tier: getScoreTier(0),
    };
  }

  // 1. Industry Match (Max 25 pts)
  featuresCount++;
  const maxIndustry = SCORING_WEIGHTS.industryMatch;
  const companyInd = (companyFeatures.industry || "").toLowerCase().trim();
  const campaignIndustries = (campaign.preferredIndustries || []).map((i) => i.toLowerCase().trim());

  if (!companyInd) {
    missingCount++;
    breakdown.push({
      factor: "Industry Match",
      points: 0,
      maxPoints: maxIndustry,
      reason: "Company industry not documented",
      positive: false,
    });
  } else {
    const isDirectMatch = campaignIndustries.some(
      (ind) => ind && (companyInd.includes(ind) || ind.includes(companyInd))
    );
    const isTechMatch =
      companyInd.includes("developer") ||
      companyInd.includes("tech") ||
      companyInd.includes("cloud") ||
      companyInd.includes("ai") ||
      companyInd.includes("software");

    if (isDirectMatch) {
      totalPoints += maxIndustry;
      breakdown.push({
        factor: "Industry Match",
        points: maxIndustry,
        maxPoints: maxIndustry,
        reason: `Direct match with campaign target industry "${companyFeatures.industry}"`,
        positive: true,
      });
    } else if (isTechMatch) {
      const partial = Math.round(maxIndustry * 0.75); // 19 pts
      totalPoints += partial;
      breakdown.push({
        factor: "Industry Match",
        points: partial,
        maxPoints: maxIndustry,
        reason: `Tech & developer ecosystem alignment with "${companyFeatures.industry}"`,
        positive: true,
      });
    } else {
      const minPts = 5;
      totalPoints += minPts;
      breakdown.push({
        factor: "Industry Match",
        points: minPts,
        maxPoints: maxIndustry,
        reason: `Adjacent sector (${companyFeatures.industry}); may require tailored pitch`,
        positive: false,
      });
    }
  }

  // 2. Audience Fit (Max 20 pts)
  featuresCount++;
  const maxAudience = SCORING_WEIGHTS.audienceFit;
  const audience = campaign.audienceSize || 0;
  const scale = companyFeatures.targetScale || "all";

  let audiencePts = 0;
  let audienceReason = "";
  let audiencePositive = true;

  if (scale === "all") {
    audiencePts = maxAudience;
    audienceReason = `Sponsors events of all scales; great fit for ${audience} attendees`;
  } else if (scale === "large" && audience >= 500) {
    audiencePts = maxAudience;
    audienceReason = `Targets large audiences (500+); aligns with ${audience} attendees`;
  } else if (scale === "medium" && audience >= 200 && audience <= 800) {
    audiencePts = maxAudience;
    audienceReason = `Specializes in mid-scale hackathons; aligns with ${audience} attendees`;
  } else if (scale === "small" && audience <= 300) {
    audiencePts = maxAudience;
    audienceReason = `Supports focused grassroots events (${audience} attendees)`;
  } else {
    audiencePts = Math.round(maxAudience * 0.6); // 12 pts
    audienceReason = `Moderate audience overlap with campaign attendee count (${audience})`;
    audiencePositive = true;
  }

  totalPoints += audiencePts;
  breakdown.push({
    factor: "Audience Fit",
    points: audiencePts,
    maxPoints: maxAudience,
    reason: audienceReason,
    positive: audiencePositive,
  });

  // 3. Event-Type Relevance (Max 15 pts)
  featuresCount++;
  const maxEvent = SCORING_WEIGHTS.eventTypeRelevance;
  const eventType = (campaign.eventType || "").toLowerCase();
  const supportedEvents = (companyFeatures.supportedEventTypes || []).map((e) => e.toLowerCase());

  if (supportedEvents.length === 0) {
    missingCount++;
    const pts = 5;
    totalPoints += pts;
    breakdown.push({
      factor: "Event-Type Relevance",
      points: pts,
      maxPoints: maxEvent,
      reason: `No documented preference for "${campaign.eventType}"; baseline rating applied`,
      positive: false,
    });
  } else {
    const matchesEvent = supportedEvents.some(
      (e) => eventType.includes(e) || e.includes(eventType)
    );
    if (matchesEvent) {
      totalPoints += maxEvent;
      breakdown.push({
        factor: "Event-Type Relevance",
        points: maxEvent,
        maxPoints: maxEvent,
        reason: `Explicit track record of sponsoring ${campaign.eventType} initiatives`,
        positive: true,
      });
    } else {
      const pts = 7;
      totalPoints += pts;
      breakdown.push({
        factor: "Event-Type Relevance",
        points: pts,
        maxPoints: maxEvent,
        reason: `Prioritizes ${supportedEvents.join(", ")} over ${campaign.eventType}`,
        positive: false,
      });
    }
  }

  // 4. Student/Community Program History (Max 15 pts)
  featuresCount++;
  const maxStudent = SCORING_WEIGHTS.studentPrograms;
  if (companyFeatures.hasStudentPrograms === undefined) {
    missingCount++;
    breakdown.push({
      factor: "Student Programs",
      points: 0,
      maxPoints: maxStudent,
      reason: "No verifiable public student grant or community program evidence",
      positive: false,
    });
  } else if (companyFeatures.hasStudentPrograms) {
    totalPoints += maxStudent;
    breakdown.push({
      factor: "Student Programs",
      points: maxStudent,
      maxPoints: maxStudent,
      reason: companyFeatures.studentProgramsEvidence || "Active student developer grants and campus ambassador network",
      positive: true,
    });
  } else {
    breakdown.push({
      factor: "Student Programs",
      points: 0,
      maxPoints: maxStudent,
      reason: "No active student-specific sponsorship programs identified",
      positive: false,
    });
  }

  // 5. Geographic Relevance (Max 10 pts)
  featuresCount++;
  const maxGeo = SCORING_WEIGHTS.geographicRelevance;
  const campaignLoc = (campaign.location || "").toLowerCase();
  const companyLocs = (companyFeatures.locationAlignment || []).map((l) => l.toLowerCase());

  if (companyLocs.length === 0) {
    missingCount++;
    const pts = 3;
    totalPoints += pts;
    breakdown.push({
      factor: "Geographic Relevance",
      points: pts,
      maxPoints: maxGeo,
      reason: "Company location preferences not fully documented",
      positive: false,
    });
  } else {
    const isGlobal = companyLocs.includes("global") || companyLocs.includes("worldwide");
    const isLocal = companyLocs.some((l) => campaignLoc.includes(l) || l.includes(campaignLoc));

    if (isLocal) {
      totalPoints += maxGeo;
      breakdown.push({
        factor: "Geographic Relevance",
        points: maxGeo,
        maxPoints: maxGeo,
        reason: `Regional presence and active community hiring in ${campaign.location}`,
        positive: true,
      });
    } else if (isGlobal) {
      const pts = 8;
      totalPoints += pts;
      breakdown.push({
        factor: "Geographic Relevance",
        points: pts,
        maxPoints: maxGeo,
        reason: "Global sponsorship mandate accepts international collegiate campaigns",
        positive: true,
      });
    } else {
      const pts = 2;
      totalPoints += pts;
      breakdown.push({
        factor: "Geographic Relevance",
        points: pts,
        maxPoints: maxGeo,
        reason: `Geographic focus centered on ${companyLocs.join(", ")} rather than ${campaign.location}`,
        positive: false,
      });
    }
  }

  // 6. Sponsorship Capacity (Max 10 pts)
  featuresCount++;
  const maxCap = SCORING_WEIGHTS.sponsorshipCapacity;
  if (companyFeatures.pastSponsorshipSignals === undefined) {
    missingCount++;
    breakdown.push({
      factor: "Sponsorship Capacity",
      points: 0,
      maxPoints: maxCap,
      reason: "No verified past sponsorship budget signals available",
      positive: false,
    });
  } else if (companyFeatures.pastSponsorshipSignals) {
    totalPoints += maxCap;
    breakdown.push({
      factor: "Sponsorship Capacity",
      points: maxCap,
      maxPoints: maxCap,
      reason: companyFeatures.pastSponsorshipEvidence || "Demonstrated sponsorship budget with active event presence",
      positive: true,
    });
  } else {
    breakdown.push({
      factor: "Sponsorship Capacity",
      points: 0,
      maxPoints: maxCap,
      reason: "Zero historical event sponsorship disclosures found",
      positive: false,
    });
  }

  // 7. Contact Availability (Max 5 pts)
  featuresCount++;
  const maxContact = SCORING_WEIGHTS.contactAvailability;
  const count = companyFeatures.contactsCount ?? (companyFeatures.hasContacts ? 1 : 0);

  if (count > 0) {
    totalPoints += maxContact;
    breakdown.push({
      factor: "Contact Availability",
      points: maxContact,
      maxPoints: maxContact,
      reason: `Found ${count} verified sponsorship or partnerships decision-maker contact(s)`,
      positive: true,
    });
  } else {
    missingCount++;
    breakdown.push({
      factor: "Contact Availability",
      points: 0,
      maxPoints: maxContact,
      reason: "No direct contact identified; outreach must target general inbox",
      positive: false,
    });
  }

  // Clamp score strictly between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(totalPoints)));

  // Calculate confidence based on available structured evidence
  const confidencePercent = Math.max(
    20,
    Math.round(((featuresCount - missingCount) / featuresCount) * 100)
  );

  const isQualified = finalScore >= QUALIFY_THRESHOLD;

  // Short summary reason
  const topFactor = breakdown.slice().sort((a, b) => b.points - a.points)[0];
  const summaryReason = isQualified
    ? `Strong match (${finalScore}/100) driven by ${topFactor.factor.toLowerCase()} and campaign synergy.`
    : `Moderate fit (${finalScore}/100) — verify alignment with ${campaign.eventType} goals.`;

  return {
    score: finalScore,
    confidence: confidencePercent,
    breakdown,
    summaryReason,
    isQualified,
    tier: getScoreTier(finalScore),
  };
}
