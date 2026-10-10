"use client";

import React from "react";
import Link from "next/link";
import { formatCurrencyINR } from "@/lib/utils";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PipelineSummaryProps {
  stagesData: Array<{
    stage: string;
    value: number;
    count: number;
    color: string;
  }>;
}

export const PipelineSummary: React.FC<PipelineSummaryProps> = ({ stagesData }) => {
  const totalCount = stagesData.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-green-dark">
            Pipeline Stage Distribution
          </h3>
          <p className="text-xs text-text-dim">
            {totalCount === 0
              ? "No sponsors currently in pipeline"
              : `${totalCount} active sponsors across key negotiation milestones`}
          </p>
        </div>
        <Link href="/app/sponsors">
          <Button variant="glass" size="sm" className="text-xs font-bold">
            Kanban Board <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {stagesData.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-butter-bg/50 border border-green-dark/8 space-y-3">
          <div className="w-10 h-10 rounded-full bg-white border border-green-dark/10 mx-auto flex items-center justify-center text-green-dark">
            <Building2 className="w-5 h-5 text-green-mid" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-green-dark">No Pipeline Stages Active</h4>
            <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
              As you discover companies and advance them from Qualified to Outreach and Negotiation, stage valuations will calculate here in real time.
            </p>
          </div>
          <Link href="/app/discover" className="inline-block pt-1">
            <Button variant="green" size="sm" className="text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Start Discovering Sponsors
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {stagesData.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-butter-bg/60 border border-green-dark/8 hover:bg-butter-panel transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-green-dark truncate">
                  {item.stage}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-green-dark border border-green-dark/10">
                  {item.count}
                </span>
              </div>
              <p className="stat-font text-sm font-extrabold text-green-800">
                {formatCurrencyINR(item.value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
