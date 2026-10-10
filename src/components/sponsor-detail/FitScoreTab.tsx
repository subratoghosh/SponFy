"use client";

import React from "react";
import { Company } from "@/types";
import { TrendingUp, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export const FitScoreTab: React.FC<{ company: Company }> = ({ company }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            AI Explainability Engine
          </span>
          <h3 className="font-heading font-extrabold text-2xl text-green-dark mt-1">
            Why {company.name} scored {company.fitScore} / 100
          </h3>
          <p className="text-xs sm:text-sm text-text-dim mt-1 max-w-xl">
            Calculated across 7 weighted criteria reflecting audience overlap, product synergy, and tier capability.
          </p>
        </div>

        <div className="w-24 h-24 rounded-2xl bg-butter-cream border-2 border-butter-gold flex flex-col items-center justify-center text-green-dark shrink-0 shadow-md">
          <span className="stat-font text-3xl font-black">{company.fitScore}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-dark/70">
            Fit Score
          </span>
        </div>
      </div>

      {/* 7-Factor Weighted Breakdown Lines */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-green-dark border-b border-green-dark/10 pb-3">
          Factor-by-Factor Evaluation Breakdown
        </h4>

        <div className="space-y-3">
          {(company.scoreBreakdown || []).map((factor, idx) => (
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
      </div>
    </div>
  );
};
