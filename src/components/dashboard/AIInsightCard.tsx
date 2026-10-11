"use client";

import React from "react";
import { ArrowRight, Zap, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const AIInsightCard: React.FC<{ insights: string[] }> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-green-dark text-butter-cream rounded-3xl p-6 sm:p-7 border border-green-mid shadow-lg relative overflow-hidden space-y-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-light/20 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between border-b border-green-mid/50 pb-3 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-butter-gold">
          <Target className="w-4 h-4 text-butter-gold" />
          Campaign Tactical Recommendations
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-butter-cream text-green-dark">
          AI Intelligence
        </span>
      </div>

      <div className="space-y-3 text-xs text-text-onDarkSub relative z-10">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-butter-cream shrink-0 mt-0.5" />
            <p className="leading-relaxed">{ins}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-end relative z-10">
        <Link href="/app/discover">
          <Button variant="butter" size="sm" className="text-xs font-bold shadow-md">
            Discover More Sponsors <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
