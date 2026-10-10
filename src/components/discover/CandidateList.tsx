"use client";

import React from "react";
import { Company } from "@/types";
import { formatCurrencyINR } from "@/lib/utils";
import { Building2, TrendingUp, Check, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CandidateListProps {
  candidates: Company[];
}

export const CandidateList: React.FC<CandidateListProps> = ({ candidates }) => {
  if (candidates.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-5 animate-fade-in">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-green-dark">
            Discovered Candidates ({candidates.length})
          </h3>
          <p className="text-xs text-text-dim">
            Ranked by AI relevance fit score and student developer program history
          </p>
        </div>
        <Link href="/app/sponsors">
          <Button variant="glass" size="sm" className="text-xs font-bold">
            View in Kanban Pipeline <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-green-dark">
                    {company.name}
                  </h4>
                  <span className="text-[11px] font-semibold bg-butter-bg text-green-dark px-2 py-0.5 rounded border border-green-dark/10">
                    {company.industry}
                  </span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-muted hover:text-green-dark"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-text-dim mt-0.5 max-w-xl line-clamp-2">
                  {company.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {company.signals.map((sig, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-green-50 text-green-800 px-2 py-0.5 rounded border border-green-200"
                    >
                      {sig}
                    </span>
                  ))}
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
                  View Dossier <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
