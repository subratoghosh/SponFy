"use client";

import React, { useState } from "react";
import { Company } from "@/types";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const FitScoreTab: React.FC<{
  company: Company;
  onScoreUpdated?: (updated: Company) => void;
}> = ({ company, onScoreUpdated }) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);
      setSuccessNote(null);
      const res = await fetch(`/api/sponsors/${company.id}/recalculate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to recalculate score");
      const json = await res.json();
      if (json.success && json.data?.sponsor) {
        onScoreUpdated?.(json.data.sponsor);
        setSuccessNote("Fit score recomputed with pure deterministic algorithm (₹0 AI cost)");
        setTimeout(() => setSuccessNote(null), 4000);
      }
    } catch (err: any) {
      console.error("Recalculate error:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const isScored = typeof company.fitScore === "number" && company.fitScore > 0;
  const breakdown = company.scoreBreakdown || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Fit Score Engine
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-butter-warm text-green-dark border border-green-dark/10">
              Deterministic (Zero AI Cost)
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-green-dark mt-1">
            {isScored
              ? `Why ${company.name} scored ${company.fitScore} / 100`
              : `${company.name} — Not Scored`}
          </h3>
          <p className="text-xs sm:text-sm text-text-dim mt-1 max-w-xl">
            {isScored
              ? "Calculated deterministically across 7 criteria: industry match, audience fit, event type relevance, student programs, geography, capacity, and contacts."
              : "Company has not yet been evaluated against your campaign needs. Click recalculate to run the scoring engine."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              variant="outline"
              size="sm"
              className="text-xs font-bold border-green-dark/20 text-green-dark hover:bg-butter-warm"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${isRecalculating ? "animate-spin" : ""}`}
              />
              {isRecalculating ? "Recalculating..." : "Recalculate Scores"}
            </Button>

            {successNote && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {successNote}
              </span>
            )}
          </div>
        </div>

        <div className="w-24 h-24 rounded-2xl bg-butter-cream border-2 border-butter-gold flex flex-col items-center justify-center text-green-dark shrink-0 shadow-md">
          <span className="stat-font text-3xl font-black">
            {isScored ? company.fitScore : "—"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-dark/70">
            {isScored ? "Fit Score" : "Not Scored"}
          </span>
        </div>
      </div>

      {/* 7-Factor Weighted Breakdown Lines */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-green-dark/10 pb-3">
          <h4 className="font-bold text-sm text-green-dark">
            Why {company.name} scored {company.fitScore || 0}? — Factor Breakdown
          </h4>
          <span className="text-xs text-text-muted">
            Confidence: {company.confidence || 0}%
          </span>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-8 text-center text-text-dim text-xs">
            <Info className="w-5 h-5 mx-auto mb-2 text-text-muted" />
            No factor breakdown available. Click &quot;Recalculate Scores&quot; above to generate explainable criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {breakdown.map((factor, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  factor.positive
                    ? "bg-green-50/50 border-green-200"
                    : "bg-amber-50/50 border-amber-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {factor.positive ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-dark text-sm">
                        {factor.factor}
                      </span>
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          factor.positive
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {factor.points >= 0 ? `+${factor.points}` : factor.points} / {factor.maxPoints} pts
                      </span>
                    </div>
                    <p className="text-text-dim text-xs mt-1 leading-relaxed">
                      {factor.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
