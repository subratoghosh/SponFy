"use client";

import React from "react";
import Link from "next/link";
import { Company } from "@/types";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Building2, TrendingUp, ExternalLink, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SponsorTableViewProps {
  sponsors: Company[];
}

export const SponsorTableView: React.FC<SponsorTableViewProps> = ({ sponsors }) => {
  return (
    <div className="bg-white rounded-3xl border border-green-dark/12 shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-butter-panel border-b border-green-dark/10 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <th className="py-3.5 px-6">Company</th>
              <th className="py-3.5 px-4">Industry</th>
              <th className="py-3.5 px-4">Stage</th>
              <th className="py-3.5 px-4 text-center">Fit Score</th>
              <th className="py-3.5 px-4 text-right">Pipeline Value</th>
              <th className="py-3.5 px-4">Verified Contact</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-dark/6">
            {sponsors.map((spon) => (
              <tr
                key={spon.id}
                className="hover:bg-butter-panel/60 transition-colors group"
              >
                {/* Company Name & Link */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-butter-warm flex items-center justify-center font-bold text-green-dark text-xs border border-green-dark/8 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-green-dark">
                        <span>{spon.name}</span>
                        <a
                          href={spon.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text-muted hover:text-green-dark"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <span className="text-[11px] text-text-dim line-clamp-1 max-w-[200px]">
                        {spon.description}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="py-4 px-4 font-semibold text-text-dim">
                  {spon.industry}
                </td>

                {/* Stage Badge */}
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-800 border border-green-200">
                    {spon.stage}
                  </span>
                </td>

                {/* Fit Score */}
                <td className="py-4 px-4 text-center">
                  <span className="stat-font font-black text-sm text-green-800 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    {spon.fitScore}%
                  </span>
                </td>

                {/* Pipeline Value (Tabular Right-Aligned) */}
                <td className="py-4 px-4 text-right stat-font font-bold text-sm text-green-dark">
                  {formatCurrencyINR(spon.pipelineValue || 0)}
                </td>

                {/* Contact */}
                <td className="py-4 px-4">
                  {spon.contacts && spon.contacts.length > 0 ? (
                    <div className="flex items-center gap-1 text-text-dim font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="truncate max-w-[140px]">{spon.contacts[0].name}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted italic">Needs Discovery</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <Link href={`/app/sponsors/${spon.id}`}>
                    <Button variant="green" size="sm" className="text-xs font-bold shadow-sm">
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
