import { describe, it, expect } from "vitest";
import { computeFitScore, CompanyFeatures } from "@/lib/services/scoring";
import { SCORING_WEIGHTS, QUALIFY_THRESHOLD } from "@/lib/config/scoring";

describe("D1 Pure Deterministic Fit Score Engine", () => {
  const baseCampaign = {
    name: "HackIndia 2026",
    eventType: "Hackathon",
    audienceSize: 600,
    location: "Bengaluru, India",
    preferredIndustries: ["Developer Tools", "AI", "Cloud"],
  };

  it("weights sum exactly to 100", () => {
    const totalWeight = Object.values(SCORING_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(totalWeight).toBe(100);
  });

  it("gives 0 score and 0 confidence when company features are null or undefined", () => {
    const res = computeFitScore(baseCampaign, null);
    expect(res.score).toBe(0);
    expect(res.confidence).toBe(0);
    expect(res.isQualified).toBe(false);
    expect(res.summaryReason).toContain("Not scored");
  });

  it("computes maximum 100 score for a perfectly aligned sponsor", () => {
    const perfectFeatures: CompanyFeatures = {
      industry: "Developer Tools",
      targetScale: "large",
      supportedEventTypes: ["Hackathon", "Conference"],
      hasStudentPrograms: true,
      studentProgramsEvidence: "Active $50K campus developer grant program",
      locationAlignment: ["India", "Bengaluru"],
      pastSponsorshipSignals: true,
      pastSponsorshipEvidence: "Sponsored HackIndia 2025 and ETHIndia 2024",
      hasContacts: true,
      contactsCount: 2,
    };

    const res = computeFitScore(baseCampaign, perfectFeatures);
    expect(res.score).toBe(100);
    expect(res.confidence).toBe(100);
    expect(res.isQualified).toBe(true);
    expect(res.breakdown).toHaveLength(7);

    // Verify all factors are positive and awarded max points
    res.breakdown.forEach((f) => {
      expect(f.points).toBe(f.maxPoints);
      expect(f.positive).toBe(true);
    });
  });

  it("automatically qualifies companies at or above threshold 70", () => {
    const qualifiedFeatures: CompanyFeatures = {
      industry: "Cloud Infrastructure", // 19 pts (tech match)
      targetScale: "all", // 20 pts
      supportedEventTypes: ["Hackathon"], // 15 pts
      hasStudentPrograms: true, // 15 pts
      locationAlignment: ["Global"], // 8 pts
      pastSponsorshipSignals: false, // 0 pts
      hasContacts: false, // 0 pts
    };
    // Expected: 19 + 20 + 15 + 15 + 8 = 77 >= 70

    const res = computeFitScore(baseCampaign, qualifiedFeatures);
    expect(res.score).toBe(83);
    expect(res.score).toBeGreaterThanOrEqual(QUALIFY_THRESHOLD);
    expect(res.isQualified).toBe(true);
  });

  it("does not qualify companies below threshold 70", () => {
    const lowFeatures: CompanyFeatures = {
      industry: "Agriculture", // 5 pts
      targetScale: "small", // 12 pts (moderate fit for 600 attendees)
      supportedEventTypes: ["Trade Show"], // 7 pts
      hasStudentPrograms: false, // 0 pts
      locationAlignment: ["US"], // 2 pts
      pastSponsorshipSignals: false, // 0 pts
      hasContacts: false, // 0 pts
    };
    // Expected: 5 + 12 + 7 + 0 + 2 + 0 + 0 = 26 < 70

    const res = computeFitScore(baseCampaign, lowFeatures);
    expect(res.score).toBe(26);
    expect(res.isQualified).toBe(false);
    expect(res.tier.label).toBe("Low Fit");
  });

  it("lowers confidence when multiple features are missing or unverified", () => {
    const partialFeatures: CompanyFeatures = {
      industry: "Developer Tools", // provided
      // targetScale missing
      // supportedEventTypes missing
      hasStudentPrograms: undefined, // missing
      // locationAlignment missing
      pastSponsorshipSignals: undefined, // missing
      hasContacts: false,
    };

    const res = computeFitScore(baseCampaign, partialFeatures);
    expect(res.confidence).toBeLessThan(60);
  });
});
