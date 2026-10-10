"use client";

import React from "react";
import Link from "next/link";
import { Company } from "@/types";
import { formatCurrencyINR } from "@/lib/utils";
import { Building2, TrendingUp, UserCheck, ExternalLink, ArrowRight } from "lucide-react";

interface SponsorCardProps {
  sponsor: Company;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}

export const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, sponsor.id)}
      className="bg-white rounded-2xl p-4 border border-green-dark/12 shadow-sm hover:shadow-card-hover hover:border-green-dark/40 transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between space-y-3"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-butter-warm flex items-center justify-center text-green-dark font-bold text-xs shrink-0 border border-green-dark/10">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-green-dark truncate max-w-[130px]">
                {sponsor.name}
              </h4>
              <span className="text-[10px] text-text-dim block truncate max-w-[130px]">
                {sponsor.industry}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
            {sponsor.fitScore}%
          </span>
        </div>

        {/* Pipeline Value & Contact */}
        <div className="pt-2 border-t border-green-dark/6 flex items-center justify-between text-xs">
          <span className="text-[11px] text-text-muted font-medium">Pipeline:</span>
          <span className="stat-font font-bold text-green-dark">
            {formatCurrencyINR(sponsor.pipelineValue || 0)}
          </span>
        </div>

        {sponsor.contacts && sponsor.contacts.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-text-dim mt-1.5 truncate">
            <UserCheck className="w-3 h-3 text-green-600 shrink-0" />
            <span className="truncate">{sponsor.contacts[0].name}</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-green-dark/6 flex justify-end">
        <Link
          href={`/app/sponsors/${sponsor.id}`}
          className="text-[11px] font-bold text-green-dark hover:text-green-mid inline-flex items-center gap-1"
        >
          View Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
