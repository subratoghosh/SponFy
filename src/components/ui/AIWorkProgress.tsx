"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIWorkStep {
  label: string;
  countText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface AIWorkProgressProps {
  title: string;
  steps: AIWorkStep[];
  currentStep: number;
  totalSteps?: number;
  tips?: string[];
  className?: string;
}

const DEFAULT_TIPS = [
  "Tip: Higher fit score companies reply up to 2.4x more often.",
  "Tip: Personalizing the challenge track to developer platforms doubles response rates.",
  "Tip: SponFy verifies cited evidence with Tavily to prevent hallucinated claims.",
  "Tip: Human review ensures your outreach matches your team's authentic tone.",
  "Tip: Targeting verified campus relations leads yields faster turnaround times.",
];

export const AIWorkProgress: React.FC<AIWorkProgressProps> = ({
  title,
  steps,
  currentStep,
  totalSteps = steps.length,
  tips = DEFAULT_TIPS,
  className,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!tips || tips.length <= 1) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips]);

  const percent = Math.min(100, Math.round(((currentStep + 1) / totalSteps) * 100));

  return (
    <div
      className={cn(
        "bg-green-dark text-butter-cream rounded-3xl p-6 sm:p-7 border border-green-mid shadow-xl space-y-5 animate-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Header with Title and Progress Pill */}
      <div className="flex items-center justify-between border-b border-green-mid/50 pb-3 gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-butter-gold">
          <Loader2 className="w-4 h-4 text-butter-gold animate-spin shrink-0" />
          <span>{title}</span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-butter-cream text-green-dark shrink-0">
          {percent}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-green-900/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-butter-gold h-full transition-all duration-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;
          const IconComponent = step.icon || BrainCircuit;

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between gap-3 p-2.5 rounded-xl text-xs transition-all",
                isCurrent && "bg-green-mid/70 text-white font-semibold border border-green-light/40 shadow-xs",
                isDone && "text-butter-cream/85",
                isPending && "text-butter-cream/35"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-butter-gold animate-spin shrink-0" />
                ) : (
                  <IconComponent className="w-4 h-4 opacity-40 shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </div>

              {step.countText && (
                <span className="text-[11px] font-mono text-butter-gold/90 shrink-0 font-bold">
                  {step.countText}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Rotating Tip Line (cycles every 4 seconds) */}
      <div className="pt-2 border-t border-green-mid/40 flex items-center gap-2 text-xs text-butter-cream/90 min-h-[32px]">
        <Sparkles className="w-3.5 h-3.5 text-butter-gold shrink-0 animate-pulse" />
        <p className="transition-opacity duration-300 italic">
          {tips[tipIndex]}
        </p>
      </div>
    </div>
  );
};
