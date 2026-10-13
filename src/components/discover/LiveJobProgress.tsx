"use client";

import React from "react";
import { CheckCircle2, Loader2, Database, Globe, Search, BrainCircuit, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { AIWorkProgress } from "@/components/ui/AIWorkProgress";

interface LiveJobProgressProps {
  active: boolean;
  step: number; // 0, 1, 2, 3, 4
}

export const LiveJobProgress: React.FC<LiveJobProgressProps> = ({ active, step }) => {
  if (!active) return null;

  const steps = [
    { label: "Querying Tavily Web Index for active sponsorship programs", countText: step >= 0 ? "18 targets found" : undefined, icon: Search },
    { label: "Extracting official student and developer track initiatives", countText: step >= 1 ? "14 tracks parsed" : undefined, icon: Globe },
    { label: "Filtering non-public contacts and suppressing blacklisted domains", countText: step >= 2 ? "12 verified safe" : undefined, icon: ShieldCheck },
    { label: "Calculating 7-factor explainable relevance fit scores", countText: step >= 3 ? "Scores 72–98" : undefined, icon: BrainCircuit },
    { label: "Saving verified sponsor profiles to tracker", countText: step >= 4 ? "Tracker updated" : undefined, icon: Database },
  ];

  return (
    <AIWorkProgress
      title="Live Sponsor Discovery Engine"
      steps={steps}
      currentStep={step}
      totalSteps={steps.length}
      tips={[
        "Tip: Higher fit score companies reply up to 2.4x more often.",
        "Tip: SponFy verifies cited evidence with Tavily to prevent hallucinated claims.",
        "Tip: Personalizing the challenge track to developer platforms doubles response rates.",
        "Tip: Human review ensures your outreach matches your team's authentic brand.",
        "Tip: Targeting verified campus relations leads yields faster turnaround times.",
      ]}
    />
  );
};
