"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { Company } from "@/types";
import { ResearchTab } from "@/components/sponsor-detail/ResearchTab";
import { FitScoreTab } from "@/components/sponsor-detail/FitScoreTab";
import { ContactsTab } from "@/components/sponsor-detail/ContactsTab";
import { OutreachTab } from "@/components/sponsor-detail/OutreachTab";
import { TimelineTab } from "@/components/sponsor-detail/TimelineTab";
import { NextActionCard } from "@/components/sponsor-detail/NextActionCard";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  FileText,
  UserCheck,
  Send,
  Clock,
  Loader2,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function SponsorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [sponsor, setSponsor] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundingInput, setFundingInput] = useState<string>("");
  const [savingFunding, setSavingFunding] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "research" | "fit_score" | "contacts" | "outreach" | "timeline"
  >("research");

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getSponsorById(id);
      setSponsor(data);
      if (data) {
        setFundingInput(data.pipelineValue ? data.pipelineValue.toString() : "0");
      }
    } catch (e) {
      console.error("Failed to load sponsor:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveFunding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sponsor) return;
    setSavingFunding(true);
    try {
      const numVal = parseInt(fundingInput.replace(/[^0-9]/g, ""), 10) || 0;
      const targetStage = numVal > 0 ? "Committed" : sponsor.stage;

      const res = await fetch(`/api/sponsors/${sponsor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineValue: numVal,
          stage: targetStage,
        }),
      });

      if (res.ok) {
        setSponsor((prev) =>
          prev
            ? {
                ...prev,
                pipelineValue: numVal,
                stage: targetStage as any,
              }
            : null
        );
        toast(`Secured funds updated to ${formatCurrencyINR(numVal)}! Dashboard synchronized.`, "success");
      } else {
        toast("Failed to update funding", "error");
      }
    } catch {
      toast("Error updating funding", "error");
    } finally {
      setSavingFunding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-text-dim flex flex-col items-center justify-center space-y-3 min-h-[300px]">
        <Loader2 className="w-8 h-8 text-green-dark animate-spin" />
        <p className="text-sm font-semibold text-green-dark">Loading sponsor details...</p>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="p-12 text-center text-text-dim max-w-md mx-auto space-y-4 min-h-[300px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark font-bold">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-bold text-lg text-green-dark">Sponsor Profile Not Found</h3>
        <p className="text-xs text-text-dim">
          This sponsor may have been removed or has not yet been saved to your tracker.
        </p>
        <Link href="/app/sponsors">
          <Button variant="green" size="sm" className="text-xs font-bold">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Sponsors Tracker
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "research", label: "Research & Sources", icon: FileText },
    { id: "fit_score", label: "Fit Score Breakdown", icon: TrendingUp },
    { id: "contacts", label: "Contacts", icon: UserCheck },
    { id: "outreach", label: "Outreach Draft", icon: Send },
    { id: "timeline", label: "Timeline Log", icon: Clock },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation Back Link */}
      <div>
        <Link
          href="/app/sponsors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-dim hover:text-green-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sponsors
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark font-bold text-xl border border-green-dark/10 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
                  {sponsor.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                  {sponsor.stage}
                </span>
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-muted hover:text-green-dark"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs sm:text-sm text-text-dim mt-1 max-w-xl">
                {sponsor.description}
              </p>
            </div>
          </div>

          {/* Right Quick Metrics */}
          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-green-dark/10 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Match Fit
              </span>
              <span className="stat-font text-2xl font-black text-green-800">
                {sponsor.fitScore}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Fund Value
              </span>
              <span className="stat-font text-2xl font-black text-green-dark">
                {formatCurrencyINR(sponsor.pipelineValue || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* User Funding Amount Input Field */}
        <div className="pt-4 border-t border-green-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-butter-panel/60 p-4 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-green-dark flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-mid" />
              Sponsorship Funds Secured from this Company:
            </span>
            <p className="text-[11px] text-text-dim mt-0.5">
              Enter the actual amount this sponsor has committed to update your campaign dashboard.
            </p>
          </div>

          <form onSubmit={handleSaveFunding} className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-green-dark">
                ₹
              </span>
              <input
                type="text"
                value={fundingInput}
                onChange={(e) => setFundingInput(e.target.value)}
                placeholder="0"
                className="pl-7 pr-3 py-1.5 w-36 text-xs font-mono font-bold text-green-dark bg-white rounded-xl border border-green-dark/20 focus:outline-none focus:ring-1 focus:ring-green-dark"
              />
            </div>
            <Button
              type="submit"
              variant="green"
              size="sm"
              loading={savingFunding}
              className="text-xs font-bold gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Funds
            </Button>
          </form>
        </div>
      </div>

      {/* AI Next Action Card */}
      <NextActionCard company={sponsor} />

      {/* Navigation Tabs Bar */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-green-dark/10 shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-butter-cream text-green-dark shadow-sm"
                : "text-text-dim hover:text-green-dark hover:bg-butter-warm/40"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "research" && (
          <ResearchTab company={sponsor} onRefresh={loadData} />
        )}
        {activeTab === "fit_score" && <FitScoreTab company={sponsor} />}
        {activeTab === "contacts" && (
          <ContactsTab company={sponsor} onUpdate={loadData} />
        )}
        {activeTab === "outreach" && <OutreachTab company={sponsor} />}
        {activeTab === "timeline" && <TimelineTab company={sponsor} />}
      </div>
    </div>
  );
}
