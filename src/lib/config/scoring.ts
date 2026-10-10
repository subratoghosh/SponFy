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

export function getScoreTier(score: number): (typeof SCORE_TIERS)[keyof typeof SCORE_TIERS] {
  if (score >= SCORE_TIERS.HIGH.min) return SCORE_TIERS.HIGH;
  if (score >= SCORE_TIERS.MEDIUM.min) return SCORE_TIERS.MEDIUM;
  return SCORE_TIERS.LOW;
}

export interface ScoringDimension {
  key: string;
  label: string;
  weight: number;
  description: string;
}

export const SCORING_DIMENSIONS: ScoringDimension[] = [
  {
    key: "developerAlignment",
    label: "Developer & Tech Alignment",
    weight: 25,
    description: "Relevance of developer tools, APIs, SDKs, or cloud services to attendee demographic",
  },
  {
    key: "previousSponsorships",
    label: "Campus & Hackathon Track Record",
    weight: 25,
    description: "History of sponsoring collegiate hackathons, developer fests, and student clubs in India",
  },
  {
    key: "audienceFit",
    label: "Audience & Domain Synergy",
    weight: 20,
    description: "Match between attendee profile (e.g., CS students, AI builders) and company talent/product target",
  },
  {
    key: "indiaPresence",
    label: "India Presence & Hiring Focus",
    weight: 15,
    description: "Active hiring for internships/new-grads or regional community outreach initiatives in India",
  },
  {
    key: "communityPrograms",
    label: "Official Community & Grant Programs",
    weight: 15,
    description: "Public developer grant programs, student ambassador networks, or event sponsorship request forms",
  },
];
