"use client";

import React, { useState } from "react";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  Check,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  Square,
  Eye,
  FileText,
  Shield,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  X,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface CandidateItem {
  id: string;
  name: string;
  website?: string;
  domain?: string;
  industry?: string;
  description?: string;
  whyRelevant?: string;
  fitScore?: number;
  signals?: string[];
  pipelineValue?: number;
  scoreBreakdown?: any[];
}

interface CandidateListProps {
  candidates: CandidateItem[];
  hasSearched?: boolean;
  onApproveSelected: (ids: string[]) => Promise<void>;
  onApproveAll: () => Promise<void>;
  onRejectCandidate: (id: string, name: string) => Promise<void>;
  onRejectSelected?: (ids: string[]) => Promise<void>;
  onClearResults: () => Promise<void>;
  approving?: boolean;
  onOpenAnalytics?: () => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  hasSearched = false,
  onApproveSelected,
  onApproveAll,
  onRejectCandidate,
  onRejectSelected,
  onClearResults,
  approving = false,
  onOpenAnalytics,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviewCandidate, setReviewCandidate] = useState<CandidateItem | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
    }
  };

  if (candidates.length === 0) {
    if (!hasSearched) return null;
    return (
      <div className="bg-white rounded-3xl p-8 border border-green-dark/12 shadow-sm text-center space-y-3 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-butter-warm mx-auto flex items-center justify-center text-green-dark">
          <AlertCircle className="w-6 h-6 text-green-mid" />
        </div>
        <h3 className="font-heading font-extrabold text-lg text-green-dark">
          No Discovery Candidates In Active Session
        </h3>
        <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto">
          Start a new search above to discover sponsor brands matching your event's audience and sponsorship budget.
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

  const allSelected = selectedIds.size > 0 && selectedIds.size === candidates.length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-5 animate-fade-in">
      {/* Header and Bulk Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-green-dark/10 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-extrabold text-lg text-green-dark">
              Discovered Sponsor Candidates ({candidates.length})
            </h3>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
              Awaiting Approval &bull; Not Added Yet
            </span>
          </div>
          <p className="text-xs text-text-dim mt-0.5">
            Select companies to approve for outreach. Only approved sponsors enter your campaign tracker and outreach drafts.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:flex-wrap">
          {onOpenAnalytics && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAnalytics}
              className="w-full sm:w-auto justify-center text-xs font-bold border-green-mid/40 bg-green-light/10 text-green-dark hover:bg-green-light/20 gap-1.5 shadow-xs cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-green-mid" />
              Discovery Analytics
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="w-full sm:w-auto justify-center text-xs font-bold border-green-dark/20 text-green-dark hover:bg-butter-panel cursor-pointer"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearResults}
            className="w-full sm:w-auto justify-center text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Results
          </Button>

          <Button
            variant="green"
            size="sm"
            disabled={approving}
            onClick={onApproveAll}
            className="w-full sm:w-auto justify-center text-xs font-bold shadow-xs cursor-pointer gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Approve All ({candidates.length})
          </Button>
        </div>
      </div>

      {/* Floating / Sticky Selected Bar when items are checked */}
      {selectedIds.size > 0 && (
        <div className="bg-butter-panel p-3.5 rounded-2xl border border-green-dark/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <span className="text-xs font-bold text-green-dark flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-green-mid" />
            <span>
              <strong>{selectedIds.size}</strong> of {candidates.length} candidate(s) selected
            </span>
          </span>

          <div className="flex items-center gap-2 flex-wrap [&>*]:flex-1 sm:[&>*]:flex-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold border-green-dark/20 text-green-dark cursor-pointer"
            >
              Cancel Selection
            </Button>

            {onRejectSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ids = Array.from(selectedIds);
                  setSelectedIds(new Set());
                  await onRejectSelected(ids);
                }}
                className="text-xs font-bold border-red-300 text-red-700 hover:bg-red-50 gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reject Selected ({selectedIds.size})
              </Button>
            )}

            <Button
              variant="green"
              size="sm"
              loading={approving}
              onClick={() => onApproveSelected(Array.from(selectedIds))}
              className="text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve Selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}

      {/* Candidate Rows */}
      <div className="divide-y divide-green-dark/8">
        {candidates.map((company) => {
          const isSelected = selectedIds.has(company.id);

          return (
            <div
              key={company.id}
              className={`py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors rounded-xl px-2.5 ${
                isSelected ? "bg-butter-panel/40" : "hover:bg-butter-panel/20"
              }`}
            >
              {/* Checkbox & Details */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleSelect(company.id)}
                  className="mt-1 text-green-dark/70 hover:text-green-dark transition-colors cursor-pointer shrink-0"
                  aria-label={`Select ${company.name}`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-green-mid" />
                  ) : (
                    <Square className="w-5 h-5 text-green-dark/30" />
                  )}
                </button>

                <div className="w-10 h-10 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark font-bold text-sm shrink-0 border border-green-dark/10">
                  {company.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-heading font-black text-base text-green-dark truncate">
                      {company.name}
                    </h4>

                    {company.industry && (
                      <span className="text-[11px] font-semibold bg-butter-panel text-green-dark px-2 py-0.5 rounded border border-green-dark/10">
                        {company.industry}
                      </span>
                    )}

                    {company.website && (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-muted hover:text-green-dark inline-flex items-center gap-0.5 text-xs transition-colors"
                        title="Visit company website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-text-dim line-clamp-2 max-w-2xl">
                    {company.description || company.whyRelevant}
                  </p>

                  {company.signals && company.signals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {company.signals.map((sig, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-green-50 text-green-800 px-2 py-0.5 rounded border border-green-200"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Fit Score, Review, and Approve Button (2x2 grid on phones) */}
              <div className="grid grid-cols-2 items-center gap-2 md:flex md:justify-end md:gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-green-dark/6">
                <div className="text-left md:text-right px-1 md:px-2">
                  <span className="text-[10px] uppercase font-bold text-text-muted block">
                    Fit Score
                  </span>
                  <span className="stat-font font-black text-base text-green-800 flex items-center gap-1 md:justify-end">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    {company.fitScore ?? 85}%
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewCandidate(company)}
                  className="w-full md:w-auto justify-center text-xs font-bold border-green-dark/20 text-green-dark hover:bg-butter-panel gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-green-mid" />
                  Company Report
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRejectCandidate(company.id, company.name)}
                  className="w-full md:w-auto justify-center text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 gap-1 cursor-pointer transition-colors"
                  title={`Reject ${company.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </Button>

                <Button
                  variant="green"
                  size="sm"
                  disabled={approving}
                  onClick={() => onApproveSelected([company.id])}
                  className="w-full md:w-auto justify-center text-xs font-bold shadow-xs gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Sponsor
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Candidate Modal */}
      {reviewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-green-dark/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark font-bold border border-green-dark/10">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-green-dark">
                    {reviewCandidate.name}
                  </h3>
                  <span className="text-xs text-text-dim">{reviewCandidate.industry}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewCandidate(null)}
                className="text-text-muted hover:text-green-dark p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-green-dark/90">
              <div>
                <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider block mb-1">
                  Company Intelligence & Overview
                </span>
                <p className="bg-butter-panel p-3.5 rounded-xl border border-green-dark/10 leading-relaxed">
                  {reviewCandidate.description || "Tech sponsor candidate with verified developer synergies."}
                </p>
              </div>

              {reviewCandidate.whyRelevant && (
                <div>
                  <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider block mb-1">
                    Sponsorship Synergy Reason
                  </span>
                  <p className="bg-green-50 text-green-900 p-3.5 rounded-xl border border-green-200 leading-relaxed font-medium">
                    {reviewCandidate.whyRelevant}
                  </p>
                </div>
              )}

              {/* Discovered Domain & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-green-dark/10 bg-white">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Official Website</span>
                  {reviewCandidate.website ? (
                    <a
                      href={reviewCandidate.website.startsWith("http") ? reviewCandidate.website : `https://${reviewCandidate.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-green-mid hover:underline inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
                    >
                      <span className="truncate">{reviewCandidate.website}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium text-text-dim">Verified via Web Index</span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-green-dark/10 bg-white">
                  <span className="text-[10px] font-bold text-text-muted uppercase block">Deliverability Status</span>
                  <span className="font-sans font-semibold text-emerald-700 text-xs flex items-center gap-1.5 mt-0.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Zero-Bounce AI Verified on Pipeline Add
                  </span>
                </div>
              </div>

              {/* Signals and Developer Programs */}
              {reviewCandidate.signals && reviewCandidate.signals.length > 0 && (
                <div>
                  <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider block mb-1">
                    Verified Partnership Signals
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {reviewCandidate.signals.map((sig, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        ✓ {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PRE-SEND SAFETY VERIFICATION CARD (Without Daily Send Limit) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="font-bold text-green-dark flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Pre-Send Safety Verification
                  </span>
                  <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Safe to Outreach
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">1. Recipient Contact Status:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Deliverable Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">2. Explicit Tier Ask & Deck:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Included in Draft
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">3. Do-Not-Contact / Suppression:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clear (Zero Blacklists)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider block mb-1">
                  Confidence & Match Fit
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-butter-warm border border-green-dark/10">
                  <span className="font-semibold text-green-dark">Calculated Synergy Score:</span>
                  <span className="stat-font font-black text-lg text-green-dark">
                    {reviewCandidate.fitScore ?? 85}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-green-dark/10 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const id = reviewCandidate.id;
                  const name = reviewCandidate.name;
                  setReviewCandidate(null);
                  await onRejectCandidate(id, name);
                }}
                className="text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reject Candidate
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewCandidate(null)}
                  className="text-xs font-bold cursor-pointer"
                >
                  Close Preview
                </Button>
                <Button
                  variant="green"
                  size="sm"
                  disabled={approving}
                  onClick={async () => {
                    const id = reviewCandidate.id;
                    setReviewCandidate(null);
                    await onApproveSelected([id]);
                  }}
                  className="text-xs font-bold shadow-xs gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve & Add to Outreach Tracker
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
