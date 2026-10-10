"use client";

import React from "react";
import { EmailQuality } from "@/types";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const QualityScorePanel: React.FC<{ quality: EmailQuality }> = ({ quality }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-green-dark/12 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-3">
        <span className="font-bold uppercase tracking-wider text-text-muted text-[11px]">
          AI Quality Evaluation
        </span>
        <span className="stat-font text-2xl font-black text-green-800">
          {quality.overall}%
        </span>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between font-bold text-green-dark mb-1">
            <span>Personalization</span>
            <span>{quality.personalization}%</span>
          </div>
          <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: `${quality.personalization}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-bold text-green-dark mb-1">
            <span>Relevance to Student Cohort</span>
            <span>{quality.relevance}%</span>
          </div>
          <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: `${quality.relevance}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-bold text-green-dark mb-1">
            <span>Clarity & Tone</span>
            <span>{quality.clarity}%</span>
          </div>
          <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: `${quality.clarity}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-bold text-green-dark mb-1">
            <span>Call to Action Precision</span>
            <span>{quality.cta}%</span>
          </div>
          <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: `${quality.cta}%` }} />
          </div>
        </div>
      </div>

      {quality.suggestions && quality.suggestions.length > 0 && (
        <div className="p-3 bg-butter-panel rounded-xl border border-green-dark/8 space-y-1 mt-4">
          <span className="font-bold text-green-dark block text-[11px] uppercase">
            Improvement Suggestions:
          </span>
          {quality.suggestions.map((sug, idx) => (
            <p key={idx} className="text-text-dim text-[11px]">
              • {sug}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
