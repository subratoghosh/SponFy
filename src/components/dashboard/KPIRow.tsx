"use client";

import React from "react";
import {
  Users,
  CheckCircle2,
  Send,
  Mail,
  TrendingUp,
  Calendar,
  Scale,
  DollarSign,
} from "lucide-react";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

interface KPIRowProps {
  summary: {
    totalSponsors: number;
    qualifiedCount: number;
    sentEmails: number;
    repliesCount: number;
    overallReplyRate: number;
    positiveReplyRate: number;
    meetingCount: number;
    negotiationsCount: number;
    committedCount: number;
    committedAmount: number;
    pipelineAmount: number;
    targetAmount: number;
  };
}

export const KPIRow: React.FC<KPIRowProps> = ({ summary }) => {
  const progressPercent = Math.min(
    100,
    Math.round((summary.committedAmount / summary.targetAmount) * 100)
  );

  const kpiItems = [
    {
      label: "Prospects",
      value: formatNumber(summary.totalSponsors),
      subtext: `${summary.qualifiedCount} Qualified (>=70)`,
      icon: Users,
    },
    {
      label: "Emails Sent",
      value: formatNumber(summary.sentEmails),
      subtext: `${summary.repliesCount} Thread Replies`,
      icon: Send,
    },
    {
      label: "Reply Rate",
      value: `${summary.overallReplyRate}%`,
      subtext: `${summary.positiveReplyRate}% Positive Intent`,
      icon: Mail,
    },
    {
      label: "Meetings Booked",
      value: formatNumber(summary.meetingCount),
      subtext: `${summary.negotiationsCount} In Negotiation`,
      icon: Calendar,
    },
    {
      label: "Active Pipeline",
      value: formatCurrencyINR(summary.pipelineAmount),
      subtext: "Total Value in Funnel",
      icon: Scale,
    },
    {
      label: "Committed Funds",
      value: formatCurrencyINR(summary.committedAmount),
      subtext: `${summary.committedCount} Closed Sponsors`,
      icon: DollarSign,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Target Progress Bar Banner */}
      <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Campaign Goal Progress
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-green-100 text-green-800 border border-green-300">
              {progressPercent}% Achieved
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="stat-font text-2xl sm:text-3xl font-black text-green-dark">
              {formatCurrencyINR(summary.committedAmount)}
            </h3>
            <span className="text-sm font-semibold text-text-muted">
              of {formatCurrencyINR(summary.targetAmount)} target
            </span>
          </div>
        </div>

        <div className="w-full md:flex-1 max-w-lg">
          <div className="w-full h-4 bg-butter-warm rounded-full overflow-hidden p-0.5 border border-green-dark/10">
            <div
              className="h-full bg-gradient-to-r from-green-mid to-green-600 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-text-dim mt-1.5">
            <span>₹0 Start</span>
            <span>₹2.5L (Halfway)</span>
            <span>₹5.0L Target</span>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border shadow-sm transition-all hover:translate-y-[-2px] ${
              item.highlight
                ? "bg-butter-panel border-green-mid/40 ring-2 ring-butter-gold/50"
                : "bg-white border-green-dark/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                {item.label}
              </span>
              <item.icon className="w-4 h-4 text-green-dark opacity-75" />
            </div>
            <p className="stat-font text-xl sm:text-2xl font-black text-green-dark mb-0.5">
              {item.value}
            </p>
            <p className="text-[11px] text-text-dim truncate font-medium">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
