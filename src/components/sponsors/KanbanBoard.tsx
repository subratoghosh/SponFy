"use client";

import React from "react";
import Link from "next/link";
import { Company, PipelineStage } from "@/types";
import { PIPELINE_STAGES } from "@/lib/config/pipeline";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Building2,
  ExternalLink,
  ArrowRight,
  UserCheck,
  Tag,
  Trash2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  sponsors: Company[];
  onStageChange: (sponsorId: string, targetStage: PipelineStage) => void;
  onRemoveSponsor?: (sponsor: Company) => void;
  selectedSponsorIds?: string[];
  onToggleSelectSponsor?: (id: string) => void;
  onDraftEmail?: (sponsor: Company) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  sponsors,
  onStageChange,
  onRemoveSponsor,
  selectedSponsorIds,
  onToggleSelectSponsor,
  onDraftEmail,
}) => {
  return (
    <div className="space-y-4 pt-1">
      {/* Header bar showing total count */}
      <div className="flex items-center justify-between text-xs text-text-dim px-1">
        <span className="font-semibold text-green-dark">
          Prospective Sponsors ({sponsors.length})
        </span>
        <span className="font-mono text-xs">
          Showing <strong className="text-green-dark">{sponsors.length}</strong> companies
        </span>
      </div>

      {/* Vertical Company List */}
      {sponsors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-green-dark/10 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-butter-panel text-green-dark/40 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-green-dark">No sponsors found</h4>
          <p className="text-xs text-text-dim max-w-md mx-auto">
            You haven&apos;t discovered or added any prospective sponsors yet. Use AI discovery to find and approve new sponsors.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/app/discover">
              <Button variant="green" size="sm" className="text-xs font-bold shadow-xs">
                Discover Sponsors
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sponsors.map((sponsor) => {
            const stageConfig = PIPELINE_STAGES.find((s) => s.id === sponsor.stage);
            const primaryContact = sponsor.contacts?.[0];

            return (
              <div
                key={sponsor.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-green-dark/12 shadow-xs hover:shadow-card-hover hover:border-green-dark/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                  {/* Left Section: Info & Identification */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {onToggleSelectSponsor && (
                    <div className="flex items-center pt-3 shrink-0">
                      <input
                        type="checkbox"
                        aria-label={`Select ${sponsor.name}`}
                        checked={selectedSponsorIds?.includes(sponsor.id) || false}
                        onChange={() => onToggleSelectSponsor(sponsor.id)}
                        className="w-4 h-4 rounded border-green-dark/30 text-green-dark focus:ring-green-dark/20 cursor-pointer accent-green-dark"
                      />
                    </div>
                  )}
                  <div className="w-11 h-11 rounded-xl bg-butter-panel text-green-dark font-extrabold text-sm flex items-center justify-center shrink-0 border border-green-dark/10 shadow-xs">
                    {sponsor.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/app/sponsors/${sponsor.id}`}
                        className="font-heading font-black text-base text-green-dark hover:text-green-mid hover:underline transition-colors truncate"
                      >
                        {sponsor.name}
                      </Link>

                      {sponsor.website && (
                        <a
                          href={
                            sponsor.website.startsWith("http")
                              ? sponsor.website
                              : `https://${sponsor.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-green-dark transition-colors inline-flex items-center gap-0.5 text-[11px]"
                          title="Visit website"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                        {sponsor.fitScore}% Fit
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-dim">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-text-muted" />
                        {sponsor.industry}
                      </span>

                      {primaryContact && (
                        <span className="inline-flex items-center gap-1 text-green-dark/80">
                          <UserCheck className="w-3 h-3 text-green-600" />
                          <span>{primaryContact.name}</span>
                          {primaryContact.role && (
                            <span className="text-text-muted">({primaryContact.role})</span>
                          )}
                        </span>
                      )}
                    </div>

                    {sponsor.description && (
                      <p className="text-xs text-text-muted line-clamp-1 max-w-2xl pt-0.5">
                        {sponsor.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Section: Stage Selector, Funding, and Action */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-green-dark/6 shrink-0">
                  {/* Funds Value */}
                  <div className="text-left sm:text-right px-2 min-w-[110px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                      Secured / Fund
                    </span>
                    <span className="stat-font font-bold text-sm text-green-dark">
                      {formatCurrencyINR(sponsor.pipelineValue || 0)}
                    </span>
                  </div>

                  {/* Canonical Single Status Badge */}
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shrink-0"
                    style={{
                      backgroundColor: stageConfig?.bgColor || "rgba(74, 111, 98, 0.12)",
                      color: stageConfig?.color || "#164E3E",
                      borderColor: `${stageConfig?.color || "#164E3E"}40`,
                    }}
                  >
                    {sponsor.stage}
                  </span>

                  {/* Direct Draft Email Action Button */}
                  {onDraftEmail && (
                    <Button
                      type="button"
                      variant="butter"
                      size="sm"
                      onClick={() => onDraftEmail(sponsor)}
                      className="text-xs font-bold gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                      title={`Draft email to ${sponsor.name}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-green-dark" />
                      <span>Draft Email</span>
                    </Button>
                  )}

                  {/* View Details Button */}
                  <Link href={`/app/sponsors/${sponsor.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold border-green-dark/20 text-green-dark hover:bg-butter-panel gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  {/* Remove Sponsor Action Button */}
                  {onRemoveSponsor && (
                    <button
                      onClick={() => onRemoveSponsor(sponsor)}
                      className="p-1.5 rounded-xl text-text-dim hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors shrink-0"
                      title="Remove sponsor from campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
