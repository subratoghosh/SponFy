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
    { label: "Scanning verified public web and company portals for active sponsorship programs", countText: step >= 0 ? "Targets identified" : undefined, icon: Search },
    { label: "Extracting official student and developer track initiatives", countText: step >= 1 ? "Initiatives parsed" : undefined, icon: Globe },
    { label: "Filtering non-public contacts and suppressing inactive domains", countText: step >= 2 ? "Verified active" : undefined, icon: ShieldCheck },
    { label: "Calculating explainable relevance and synergy match scores", countText: step >= 3 ? "Scores calculated" : undefined, icon: BrainCircuit },
    { label: "Organizing verified sponsor candidates for review", countText: step >= 4 ? "Candidates ready" : undefined, icon: Database },
  ];

  return (
    <AIWorkProgress
      title="Sponsor Discovery Search"
      steps={steps}
      currentStep={step}
      totalSteps={steps.length}
      tips={[
        "Tip: Higher fit score companies reply up to 2.4x more often.",
        "Tip: SponFy cross-verifies live company signals to ensure authentic sponsorship fit.",
        "Tip: Personalizing the challenge track to developer platforms doubles response rates.",
        "Tip: Human review ensures your outreach matches your team's authentic brand.",
        "Tip: Targeting verified campus relations leads yields faster turnaround times.",
      ]}
    />
  );
};
