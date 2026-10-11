"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Send,
  Mail,
  TrendingUp,
  Calendar,
  Scale,
  DollarSign,
  Target,
  Sliders,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Edit3
} from "lucide-react";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

const PRESET_GOALS = [
  { label: "₹1.5L", amount: 150000, desc: "Mini Fest / 24h Hackathon" },
  { label: "₹3.0L", amount: 300000, desc: "Departmental Tech Symposium" },
  { label: "₹5.0L", amount: 500000, desc: "Annual College Cultural Fest" },
  { label: "₹10.0L", amount: 1000000, desc: "National Level Inter-College Fest" },
  { label: "₹25.0L", amount: 2500000, desc: "Flagship Multi-Campus Mega Fest" },
];

function formatProgressLabel(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(1) : lakhs.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₹${amount}`;
}

export const KPIRow: React.FC<KPIRowProps> = ({ summary }) => {
  const [targetAmount, setTargetAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sponfy_user_campaign_target");
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return summary.targetAmount || 500000;
  });

  const [hasChosenGoal, setHasChosenGoal] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sponfy_user_campaign_goal_configured") === "true";
    }
    return true; // default true for initial render if server
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<number>(targetAmount);

  // Sync from localStorage if updated in another tab/component
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem("sponfy_user_campaign_target");
        if (saved && !isNaN(Number(saved))) {
          setTargetAmount(Number(saved));
          setHasChosenGoal(true);
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener("sponfy_campaign_target_changed", handleStorageUpdate);
    return () => {
      window.removeEventListener("sponfy_campaign_target_changed", handleStorageUpdate);
    };
  }, []);

  const handleOpenModal = () => {
    setSelectedPreset(targetAmount);
    setCustomInput(String(targetAmount));
    setModalOpen(true);
  };

  const handleSaveGoal = (amount: number) => {
    if (amount <= 0) return;
    setTargetAmount(amount);
    setHasChosenGoal(true);
    setModalOpen(false);

    try {
      localStorage.setItem("sponfy_user_campaign_target", String(amount));
      localStorage.setItem("sponfy_user_campaign_goal_configured", "true");
      window.dispatchEvent(new Event("sponfy_campaign_target_changed"));
    } catch {
      // Ignore
    }
  };

  const currentTarget = targetAmount > 0 ? targetAmount : 500000;
  const progressPercent = Math.min(
    100,
    Math.round((summary.committedAmount / currentTarget) * 100)
  );

  const halfwayAmount = Math.round(currentTarget / 2);

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
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
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
              of {formatCurrencyINR(currentTarget)} target
            </span>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-mid hover:text-green-dark hover:underline transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Choose / Change Target Amount</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Exactly as Second Image */}
        <div className="w-full md:flex-1 max-w-lg">
          <div className="w-full bg-[#E5ECE7] border border-green-dark/15 rounded-full h-3.5 sm:h-4 p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#21493A] via-[#2F6149] to-[#50965C] transition-all duration-700 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] sm:text-xs font-semibold text-text-dim mt-2 px-0.5">
            <span>₹0 Start</span>
            <span>{formatProgressLabel(halfwayAmount)} (Halfway)</span>
            <span>{formatProgressLabel(currentTarget)} Target</span>
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

      {/* Interactive Choose Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-green-dark/15 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-6 animate-scale-up text-green-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-butter-cream flex items-center justify-center text-green-dark">
                  <Target className="w-5 h-5 text-green-mid" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-green-dark">
                    Set Expected Campaign Target
                  </h3>
                  <p className="text-xs text-text-dim">
                    Every progress visual will calculate against this funding goal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-green-dark p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-dim block">
                Choose a Preset Funding Target
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_GOALS.map((preset) => {
                  const isSelected = selectedPreset === preset.amount;
                  return (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset.amount);
                        setCustomInput(String(preset.amount));
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-butter-panel border-green-mid ring-2 ring-butter-gold shadow-xs"
                          : "bg-white border-green-dark/12 hover:bg-butter-bg"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-green-dark flex items-center gap-2">
                          <span>{preset.label}</span>
                          <span className="text-[11px] font-normal text-text-dim font-mono">
                            ({formatCurrencyINR(preset.amount)})
                          </span>
                        </div>
                        <div className="text-[11px] text-text-dim/80">{preset.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-green-mid text-butter-cream flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5 pt-2 border-t border-green-dark/10">
              <label className="text-xs font-bold uppercase tracking-wider text-text-dim block">
                Or Enter Custom Amount (in ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-text-muted">
                  ₹
                </span>
                <input
                  type="number"
                  min="1000"
                  step="10000"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    const val = Number(e.target.value);
                    if (!isNaN(val)) setSelectedPreset(val);
                  }}
                  placeholder="e.g. 750000"
                  className="w-full pl-8 pr-4 py-2.5 bg-white text-green-dark font-bold text-sm rounded-xl border border-green-dark/20 focus:border-green-dark focus:ring-2 focus:ring-butter-cream outline-none transition-all"
                />
              </div>
              {Number(customInput) > 0 && (
                <p className="text-[11px] text-text-dim">
                  Preview: <span className="font-bold text-green-dark">{formatCurrencyINR(Number(customInput))}</span>
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setModalOpen(false)}
                className="w-1/2 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="green"
                size="md"
                onClick={() => handleSaveGoal(Number(customInput) || selectedPreset)}
                className="w-1/2 text-xs font-bold"
              >
                Save & Display Visuals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
