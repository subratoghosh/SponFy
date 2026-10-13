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
  const [targetAmount, setTargetAmount] = React.useState<number>(
    summary.targetAmount > 0 ? summary.targetAmount : 500000
  );

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("sponfy_target_amount");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTargetAmount(parsed);
        }
      }
    } catch {
      // localStorage unavailable or blocked
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [customAmount, setCustomAmount] = React.useState<string>("");

  const handleSelectAmount = (amount: number) => {
    setTargetAmount(amount);
    if (typeof window !== "undefined") {
      localStorage.setItem("sponfy_target_amount", amount.toString());
    }
    setIsModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(val) && val > 0) {
      handleSelectAmount(val);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((summary.committedAmount / (targetAmount || 1)) * 100)
  );

  const halfwayAmount = Math.round(targetAmount / 2);

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
              of {formatCurrencyINR(targetAmount)} target
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCustomAmount(targetAmount.toString());
              setIsModalOpen(true);
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-green-accent hover:text-green-dark hover:underline cursor-pointer"
          >
            <span>Choose / Change Target Amount</span>
          </button>
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
            <span>{formatCurrencyINR(halfwayAmount)} (Halfway)</span>
            <span>{formatCurrencyINR(targetAmount)} Target</span>
          </div>
        </div>
      </div>

      {/* Choose Target Amount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-xl text-green-dark">
                  Set Campaign Target Goal
                </h3>
                <p className="text-xs text-text-dim mt-0.5">
                  Choose your expected sponsorship budget for this campaign.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-green-dark font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Popular Targets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "₹1 Lakh", value: 100000 },
                  { label: "₹2.5 Lakhs", value: 250000 },
                  { label: "₹5 Lakhs", value: 500000 },
                  { label: "₹10 Lakhs", value: 1000000 },
                  { label: "₹25 Lakhs", value: 2500000 },
                  { label: "₹50 Lakhs", value: 5000000 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectAmount(preset.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      targetAmount === preset.value
                        ? "bg-green-dark text-butter-cream border-green-dark shadow-sm"
                        : "bg-butter-panel text-green-dark border-green-dark/10 hover:border-green-dark/30 hover:bg-butter-cream/60"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 border-t border-green-dark/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                Or Enter Custom Amount (₹ INR)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 750000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-green-dark/20 text-sm font-bold text-green-dark focus:outline-none focus:border-green-dark focus:ring-1 focus:ring-green-dark"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-green-dark text-butter-cream text-xs font-bold hover:bg-green-mid transition-colors cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpiItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl border border-green-dark/10 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-hover flex flex-col justify-between min-w-0 h-full"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-2 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-wider leading-tight line-clamp-1">
                  {item.label}
                </span>
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-dark opacity-75 shrink-0 mt-0.5" />
              </div>
              <p className="stat-font text-base sm:text-xl lg:text-2xl font-black text-green-dark mb-0.5 truncate tracking-tight">
                {item.value}
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-text-dim truncate font-medium pt-1 border-t border-green-dark/5 mt-1">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
