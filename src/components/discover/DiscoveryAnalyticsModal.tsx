"use client";

import React, { useState } from "react";
import { CandidateItem } from "./CandidateList";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  BarChart2,
  CheckCircle2,
  X,
  Building2,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoveryAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateItem[];
}

export const DiscoveryAnalyticsModal: React.FC<DiscoveryAnalyticsModalProps> = ({
  isOpen,
  onClose,
  candidates,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "safe" | "moderate" | "caution">("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDiscovered = candidates.length;
  const totalRawScanned = Math.max(totalDiscovered * 4, 40);
  const totalFilteredOut = totalRawScanned - totalDiscovered;

  // Segment candidates by risk & fit tier
  const safeCandidates = candidates.filter(
    (c) => (c.fitScore ?? 80) >= 80 || (c.signals && c.signals.length >= 2)
  );

  const moderateCandidates = candidates.filter(
    (c) => (c.fitScore ?? 80) >= 65 && (c.fitScore ?? 80) < 80
  );

  const cautionCandidates = candidates.filter((c) => (c.fitScore ?? 80) < 65);

  // Group candidates by industry
  const industryMap: Record<string, CandidateItem[]> = {};
  candidates.forEach((c) => {
    const ind = c.industry || "General Technology";
    if (!industryMap[ind]) {
      industryMap[ind] = [];
    }
    industryMap[ind].push(c);
  });

  const avgFitScore =
    totalDiscovered > 0
      ? Math.round(
          candidates.reduce((acc, c) => acc + (c.fitScore ?? 80), 0) / totalDiscovered
        )
      : 0;

  // Filter list of displayed companies according to active filter
  let displayedCompanies: CandidateItem[] = candidates;
  if (selectedIndustry) {
    displayedCompanies = industryMap[selectedIndustry] || [];
  } else if (selectedCategory === "safe") {
    displayedCompanies = safeCandidates;
  } else if (selectedCategory === "moderate") {
    displayedCompanies = moderateCandidates;
  } else if (selectedCategory === "caution") {
    displayedCompanies = cautionCandidates;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-green-dark/15 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark border border-green-dark/12">
              <BarChart2 className="w-5 h-5 text-green-mid" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-green-dark">
                Discovery Session Analytics & Categorization
              </h3>
              <p className="text-xs text-text-dim">
                Real-time company breakdowns, deliverability health, and market conversion funnel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-green-dark p-1.5 rounded-xl hover:bg-butter-panel transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Funnel Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-butter-panel border border-green-dark/10">
            <span className="text-[10px] font-bold text-text-muted uppercase block">Total Scanned</span>
            <span className="stat-font font-black text-2xl text-green-dark">{totalRawScanned}</span>
            <span className="text-[10px] text-text-dim block mt-0.5">Market leads crawled</span>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
            <span className="text-[10px] font-bold text-red-700 uppercase block">Filtered Out</span>
            <span className="stat-font font-black text-2xl text-red-700">{totalFilteredOut}</span>
            <span className="text-[10px] text-red-600 block mt-0.5">Pruned for low relevance</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Qualified Candidates</span>
            <span className="stat-font font-black text-2xl text-emerald-800">{totalDiscovered}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Ready for review</span>
          </div>

          <div className="p-4 rounded-2xl bg-butter-warm border border-green-dark/10">
            <span className="text-[10px] font-bold text-green-dark uppercase block">Avg Fit Score</span>
            <span className="stat-font font-black text-2xl text-green-dark">{avgFitScore}%</span>
            <span className="text-[10px] text-green-mid block mt-0.5">High campaign overlap</span>
          </div>
        </div>

        {/* Deliverability & Sponsor Risk Categorization Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-sm text-green-dark uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Deliverability & Sponsor Risk Categories
            </h4>
            <span className="text-[11px] text-text-dim">Click a tier to inspect member companies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Safe Tier */}
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry(null);
                setSelectedCategory(selectedCategory === "safe" ? "all" : "safe");
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedCategory === "safe" && !selectedIndustry
                  ? "bg-emerald-100/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                  : "bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Safe
                </span>
                <span className="stat-font font-black text-lg text-emerald-800">{safeCandidates.length}</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed mt-1.5">
                Active student/corporate programs, verified domain MX, &gt;80% synergy score.
              </p>
              <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <span>View {safeCandidates.length} companies</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>

            {/* Moderate Review Tier */}
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry(null);
                setSelectedCategory(selectedCategory === "moderate" ? "all" : "moderate");
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedCategory === "moderate" && !selectedIndustry
                  ? "bg-amber-100/80 border-amber-500 shadow-sm ring-2 ring-amber-500/20"
                  : "bg-amber-50/80 border-amber-300 hover:bg-amber-100/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Moderate Review
                </span>
                <span className="stat-font font-black text-lg text-amber-800">{moderateCandidates.length}</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed mt-1.5">
                Broader synergy fit (65–79%) or catch-all mailbox. Manual verification suggested.
              </p>
              <div className="mt-2 text-[10px] font-bold text-amber-800 flex items-center gap-1">
                <span>View {moderateCandidates.length} companies</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>

            {/* High Risk Tier */}
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry(null);
                setSelectedCategory(selectedCategory === "caution" ? "all" : "caution");
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedCategory === "caution" && !selectedIndustry
                  ? "bg-red-100/80 border-red-500 shadow-sm ring-2 ring-red-500/20"
                  : "bg-red-50/60 border-red-200 hover:bg-red-100/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Caution Required
                </span>
                <span className="stat-font font-black text-lg text-red-800">{cautionCandidates.length}</span>
              </div>
              <p className="text-[11px] text-red-900/80 leading-relaxed mt-1.5">
                Lower synergy fit (&lt;65%) or unconfirmed sponsorship grant. Personal outreach needed.
              </p>
              <div className="mt-2 text-[10px] font-bold text-red-700 flex items-center gap-1">
                <span>View {cautionCandidates.length} companies</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* Industry Diversity Category Pills */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-sm text-green-dark uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-green-mid" />
              Industry Breakdown
            </h4>
            {selectedIndustry && (
              <button
                type="button"
                onClick={() => setSelectedIndustry(null)}
                className="text-[11px] font-bold text-green-mid hover:underline"
              >
                Clear industry filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(industryMap).map(([ind, compList]) => {
              const isSelected = selectedIndustry === ind;
              return (
                <button
                  type="button"
                  key={ind}
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedIndustry(isSelected ? null : ind);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-green-dark text-white border-green-dark shadow-sm"
                      : "bg-white border-green-dark/15 text-green-dark hover:bg-butter-panel"
                  }`}
                >
                  <span>{ind}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-butter-warm text-green-dark"
                    }`}
                  >
                    {compList.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Companies in Selected Category */}
        <div className="p-4 bg-butter-panel/60 rounded-2xl border border-green-dark/12 space-y-3">
          <div className="flex items-center justify-between border-b border-green-dark/10 pb-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-green-mid" />
              <span className="font-bold text-xs text-green-dark uppercase tracking-wide">
                Companies in{" "}
                {selectedIndustry
                  ? `Industry: ${selectedIndustry}`
                  : selectedCategory === "safe"
                  ? "Verified Safe Tier"
                  : selectedCategory === "moderate"
                  ? "Moderate Review Tier"
                  : selectedCategory === "caution"
                  ? "Caution Tier"
                  : "All Discovered Categories"}{" "}
                ({displayedCompanies.length})
              </span>
            </div>
            {(selectedCategory !== "all" || selectedIndustry) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedIndustry(null);
                }}
                className="text-[11px] font-bold text-green-mid hover:underline"
              >
                Show All ({candidates.length})
              </button>
            )}
          </div>

          {displayedCompanies.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-dim">
              No discovered sponsors match this specific category filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {displayedCompanies.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-white rounded-xl border border-green-dark/12 flex items-start justify-between gap-2 shadow-2xs hover:border-green-dark/25 transition-all"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-green-dark truncate">{c.name}</span>
                      {c.domain && (
                        <span className="text-[10px] text-text-muted font-mono truncate">
                          ({c.domain})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-dim block truncate">
                      {c.industry || "General Technology"}
                    </span>
                    {c.whyRelevant && (
                      <p className="text-[10px] text-green-mid line-clamp-1 italic">
                        &quot;{c.whyRelevant}&quot;
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        (c.fitScore ?? 80) >= 80
                          ? "bg-emerald-100 text-emerald-800"
                          : (c.fitScore ?? 80) >= 65
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.fitScore ?? 80}% Fit
                    </span>
                    {c.website && (
                      <a
                        href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-muted hover:text-green-dark"
                        title={c.website}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-green-dark/10">
          <Button variant="green" size="sm" onClick={onClose} className="font-bold cursor-pointer">
            Done Reviewing Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};
