"use client";

import React from "react";
import { Company } from "@/types";
import { formatCurrencyINR } from "@/lib/utils";
import { Building2, TrendingUp, Check, ExternalLink, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CandidateListProps {
  candidates: Company[];
  hasSearched?: boolean;
  isExistingOnly?: boolean;
  skippedCount?: number;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  hasSearched = false,
  isExistingOnly = false,
  skippedCount = 0,
}) => {
  if (candidates.length === 0) {
    if (!hasSearched) return null;
    return (
      <div className="bg-white rounded-3xl p-8 border border-green-dark/12 shadow-sm text-center space-y-3 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-butter-warm mx-auto flex items-center justify-center text-green-dark">
          <AlertCircle className="w-6 h-6 text-green-mid" />
        </div>
        <h3 className="font-heading font-extrabold text-lg text-green-dark">
          All Searched Companies Are Already Tracked
        </h3>
        <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto">
          We scanned candidate targets, but matching companies are already in your sponsor tracker. Try searching for a different tech niche, programming language, or cloud service.
        </p>
        <div className="pt-2">
          <Link href="/app/sponsors">
            <Button variant="green" size="sm" className="text-xs font-bold shadow-sm">
              Open Sponsors Tracker <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-green-dark/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-lg text-green-dark">
              {isExistingOnly ? "Matching Tracked Sponsors" : "Discovered Sponsors"} ({candidates.length})
            </h3>
            {isExistingOnly && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                Already Tracked
              </span>
            )}
            {!isExistingOnly && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Newly Added
              </span>
            )}
          </div>
          <p className="text-xs text-text-dim mt-0.5">
            {isExistingOnly
              ? "These high-fit sponsors match your query and are already active in your campaign."
              : "Ranked by fit score, student developer program history, and event sponsorship synergy."}
          </p>
        </div>
        <Link href="/app/sponsors">
          <Button variant="glass" size="sm" className="text-xs font-bold shrink-0">
            View in Sponsors Tracker <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-green-dark/8">
        {candidates.map((company) => (
          <div
            key={company.id}
            className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark font-bold shrink-0 border border-green-dark/10 mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base text-green-dark">
                    {company.name}
                  </h4>
                  <span className="text-[11px] font-semibold bg-butter-bg text-green-dark px-2 py-0.5 rounded border border-green-dark/10">
                    {company.industry}
                  </span>
                  {company.stage && (
                    <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                      Stage: {company.stage}
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-muted hover:text-green-dark inline-flex items-center gap-0.5 text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-text-dim mt-0.5 max-w-xl line-clamp-2">
                  {company.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(company.signals || []).map((sig, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-green-50 text-green-800 px-2 py-0.5 rounded border border-green-200"
                    >
                      {sig}
                    </span>
                  ))}
                  {company.pipelineValue ? (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      Target: {formatCurrencyINR(company.pipelineValue)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-green-dark/6">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-text-muted block">
                  Fit Score
                </span>
                <span className="stat-font font-black text-lg text-green-800 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  {company.fitScore}%
                </span>
              </div>

              <Link href={`/app/sponsors/${company.id}`}>
                <Button variant="green" size="sm" className="text-xs font-bold shadow-sm">
                  View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
