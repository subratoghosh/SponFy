"use client";

import React from "react";
import { CheckCircle2, Loader2, Sparkles, Globe, Search, BrainCircuit, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveJobProgressProps {
  active: boolean;
  step: number; // 0, 1, 2, 3, 4
}

export const LiveJobProgress: React.FC<LiveJobProgressProps> = ({ active, step }) => {
  if (!active) return null;

  const steps = [
    { label: "Querying Tavily Web Index for active sponsorship programs", icon: Search },
    { label: "Extracting official student and developer track initiatives", icon: Globe },
    { label: "Filtering non-public contacts and suppressing blacklisted domains", icon: ShieldCheck },
    { label: "Calculating 7-factor explainable relevance fit scores", icon: BrainCircuit },
    { label: "Persisting cited sponsor dossiers to campaign pipeline", icon: Sparkles },
  ];

  return (
    <div className="bg-green-dark text-butter-cream rounded-3xl p-6 sm:p-7 border border-green-mid shadow-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-green-mid/50 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-butter-gold">
          <Sparkles className="w-4 h-4 fill-butter-gold animate-spin" />
          Live AI Discovery Job Stream
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-butter-cream text-green-dark">
          {Math.min(100, (step + 1) * 20)}% Complete
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((s, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all",
                isCurrent && "bg-green-mid/60 text-white font-bold border border-green-mid",
                isDone && "text-butter-cream/80",
                idx > step && "text-text-onDarkSub/40"
              )}
            >
              {isDone && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
              {isCurrent && <Loader2 className="w-4 h-4 text-butter-gold animate-spin shrink-0" />}
              {idx > step && <s.icon className="w-4 h-4 opacity-40 shrink-0" />}
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
