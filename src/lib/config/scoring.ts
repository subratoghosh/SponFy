export interface FitScoreTier {
  min: number;
  max: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const SCORE_TIERS = {
  HIGH: {
    min: 70,
    max: 100,
    label: "High Fit",
    badgeBg: "bg-[#16A34A]/15",
    badgeText: "text-[#16A34A]",
    badgeBorder: "border-[#16A34A]/30",
  },
  MEDIUM: {
    min: 50,
    max: 69,
    label: "Medium Fit",
    badgeBg: "bg-[#D97706]/15",
    badgeText: "text-[#D97706]",
    badgeBorder: "border-[#D97706]/30",
  },
  LOW: {
    min: 0,
    max: 49,
    label: "Low Fit",
    badgeBg: "bg-[#0C382E]/10",
    badgeText: "text-[#0C382E]",
    badgeBorder: "border-[#0C382E]/20",
  },
};

export const QUALIFY_THRESHOLD = 70;

export function getScoreTier(score: number): (typeof SCORE_TIERS)[keyof typeof SCORE_TIERS] {
  if (score >= SCORE_TIERS.HIGH.min) return SCORE_TIERS.HIGH;
  if (score >= SCORE_TIERS.MEDIUM.min) return SCORE_TIERS.MEDIUM;
  return SCORE_TIERS.LOW;
}

export interface ScoringFactorWeight {
  key: string;
  label: string;
  weight: number; // Max points
  description: string;
}

/**
 * Weights sum strictly to 100 per Group D requirements:
 * 1. Industry Match: 25
 * 2. Audience Fit: 20
 * 3. Event-Type Relevance: 15
 * 4. Student/Community Program History: 15
 * 5. Geographic Relevance: 10
 * 6. Sponsorship Capacity / Signals: 10
 * 7. Contact Availability: 5
 * Total: 25 + 20 + 15 + 15 + 10 + 10 + 5 = 100
 */
export const SCORING_WEIGHTS: Record<string, number> = {
  industryMatch: 25,
  audienceFit: 20,
  eventTypeRelevance: 15,
  studentPrograms: 15,
  geographicRelevance: 10,
  sponsorshipCapacity: 10,
  contactAvailability: 5,
};

export const SCORING_FACTORS: ScoringFactorWeight[] = [
  {
    key: "industryMatch",
    label: "Industry Match",
    weight: SCORING_WEIGHTS.industryMatch,
    description: "Match with campaign preferred industries (e.g. Developer Tools, AI, Fintech)",
  },
  {
    key: "audienceFit",
    label: "Audience Fit",
    weight: SCORING_WEIGHTS.audienceFit,
    description: "Audience size and student developer scale vs apparent company sponsorship tier",
  },
  {
    key: "eventTypeRelevance",
    label: "Event-Type Relevance",
    weight: SCORING_WEIGHTS.eventTypeRelevance,
    description: "Relevance of event or campaign format (conference, summit, festival, campaign) to company mission",
  },
  {
    key: "studentPrograms",
    label: "Student/Community Program History",
    weight: SCORING_WEIGHTS.studentPrograms,
    description: "Documented history of student grants, campus ambassadors, or university outreach",
  },
  {
    key: "geographicRelevance",
    label: "Geographic Relevance",
    weight: SCORING_WEIGHTS.geographicRelevance,
    description: "Regional alignment with campaign location or active hiring/offices in the region",
  },
  {
    key: "sponsorshipCapacity",
    label: "Sponsorship Capacity",
    weight: SCORING_WEIGHTS.sponsorshipCapacity,
    description: "Signals of past event sponsorship, developer relations team, or budget capacity",
  },
  {
    key: "contactAvailability",
    label: "Contact Availability",
    weight: SCORING_WEIGHTS.contactAvailability,
    description: "Identified sponsorship or DevRel decision-makers with verifiable email addresses",
  },
];

// Backward-compatible alias for existing tests referencing SCORING_DIMENSIONS
export const SCORING_DIMENSIONS = SCORING_FACTORS;
