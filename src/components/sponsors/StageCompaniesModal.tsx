"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Company, PipelineStage } from "@/types";
import { StageDefinition, PIPELINE_STAGES } from "@/lib/config/pipeline";
import { formatCurrencyINR } from "@/lib/utils";
import {
  X,
  Building2,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Search,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StageCompaniesModalProps {
  stage: StageDefinition | null;
  sponsors: Company[];
  isOpen: boolean;
  onClose: () => void;
  onStageChange: (sponsorId: string, targetStage: PipelineStage) => void;
}

export const StageCompaniesModal: React.FC<StageCompaniesModalProps> = ({
  stage,
  sponsors,
  isOpen,
  onClose,
  onStageChange,
}) => {
  const [search, setSearch] = useState("");

  if (!isOpen || !stage) return null;

  const filtered = sponsors.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.industry && s.industry.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 border border-green-dark/15 shadow-2xl space-y-5 max-h-[88vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-green-dark/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: stage.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-xl text-green-dark">
                  {stage.label}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-butter-warm text-green-dark border border-green-dark/10">
                  {sponsors.length} {sponsors.length === 1 ? "company" : "companies"}
                </span>
              </div>
              <p className="text-xs text-text-dim mt-0.5">
                {stage.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-text-muted hover:text-green-dark transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Filter if multiple companies */}
        {sponsors.length > 3 && (
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${stage.label} sponsors...`}
              className="w-full pl-9 pr-3 py-2 text-xs bg-butter-panel/60 rounded-xl border border-green-dark/10 text-green-dark focus:outline-none focus:ring-1 focus:ring-green-dark"
            />
          </div>
        )}

        {/* Companies List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {sponsors.length === 0 ? (
            <div className="p-10 text-center bg-butter-bg/40 rounded-2xl border border-green-dark/8 space-y-2">
              <Building2 className="w-8 h-8 text-green-dark/30 mx-auto" />
              <h4 className="text-sm font-bold text-green-dark">
                No sponsors in {stage.label} yet
              </h4>
              <p className="text-xs text-text-dim max-w-sm mx-auto">
                Move companies from other stages or discover new prospective sponsors to populate this list.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">
              No companies match &quot;{search}&quot;.
            </div>
          ) : (
            filtered.map((sponsor) => (
              <div
                key={sponsor.id}
                className="p-4 bg-white rounded-2xl border border-green-dark/10 hover:border-green-dark/30 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark font-bold text-sm shrink-0 border border-green-dark/10 mt-0.5">
                    <Building2 className="w-5 h-5 text-green-mid" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-green-dark truncate">
                        {sponsor.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sponsor.fitScore}% Fit
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-dim mt-1 flex-wrap">
                      <span>{sponsor.industry}</span>
                      <span className="text-text-muted">•</span>
                      <span className="font-mono font-bold text-green-dark">
                        {formatCurrencyINR(sponsor.pipelineValue || 0)}
                      </span>
                      {sponsor.contacts && sponsor.contacts.length > 0 && (
                        <>
                          <span className="text-text-muted">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <UserCheck className="w-3 h-3 text-green-600" />
                            {sponsor.contacts[0].name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Stage Mover Selector */}
                  <div className="flex items-center gap-1.5 bg-butter-panel px-2 py-1 rounded-xl border border-green-dark/12">
                    <ArrowRightLeft className="w-3 h-3 text-text-muted shrink-0" />
                    <select
                      value={sponsor.stage}
                      onChange={(e) => onStageChange(sponsor.id, e.target.value as PipelineStage)}
                      className="text-[11px] font-bold text-green-dark bg-transparent outline-none cursor-pointer"
                      title="Move to another stage"
                    >
                      {PIPELINE_STAGES.map((st) => (
                        <option key={st.id} value={st.id}>
                          Move to {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Link href={`/app/sponsors/${sponsor.id}`} onClick={onClose}>
                    <Button variant="green" size="sm" className="text-xs font-bold gap-1">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-green-dark/10 flex justify-between items-center text-xs text-text-muted shrink-0">
          <span>Total Sponsorship Value: {formatCurrencyINR(sponsors.reduce((acc, s) => acc + (s.pipelineValue || 0), 0))}</span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
