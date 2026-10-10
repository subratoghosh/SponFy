"use client";

import React from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

interface SafetyChecklistProps {
  checks: {
    recipientVerified: boolean;
    hasSponsorshipAsk: boolean;
    notSuppressed: boolean;
    withinDailyCap: boolean;
  };
}

export const SafetyChecklist: React.FC<SafetyChecklistProps> = ({ checks }) => {
  const allPassed =
    checks.recipientVerified &&
    checks.hasSponsorshipAsk &&
    checks.notSuppressed &&
    checks.withinDailyCap;

  return (
    <div className="p-4 rounded-2xl bg-butter-panel border border-green-dark/12 space-y-2.5 text-xs">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-2">
        <span className="font-bold text-green-dark flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
          <ShieldCheck className="w-4 h-4 text-green-700" />
          Pre-Send Safety Verification
        </span>
        <span
          className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
            allPassed
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {allPassed ? "All Checks Passed" : "Action Required"}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-text-dim">1. Recipient Contact Status:</span>
          {checks.recipientVerified ? (
            <span className="font-bold text-green-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Verified
            </span>
          ) : (
            <span className="font-bold text-amber-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-amber-600" /> Unverified
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-dim">2. Explicit Tier Ask & Deck:</span>
          {checks.hasSponsorshipAsk ? (
            <span className="font-bold text-green-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Included
            </span>
          ) : (
            <span className="font-bold text-amber-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-amber-600" /> Missing Ask
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-dim">3. Do-Not-Contact / Suppression:</span>
          {checks.notSuppressed ? (
            <span className="font-bold text-green-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Clear
            </span>
          ) : (
            <span className="font-bold text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600" /> Suppressed
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-dim">4. Daily Send Limit:</span>
          {checks.withinDailyCap ? (
            <span className="font-bold text-green-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 18 / 30 Left
            </span>
          ) : (
            <span className="font-bold text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600" /> Cap Exceeded
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
