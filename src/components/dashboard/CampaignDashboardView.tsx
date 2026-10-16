"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Rocket,
  Sparkles,
} from "lucide-react";
import { KPIRow } from "./KPIRow";
import { TodayActionQueue } from "./TodayActionQueue";
import { PipelineSummary } from "./PipelineSummary";
import { ActivityFeed } from "./ActivityFeed";
import { AIInsightCard } from "./AIInsightCard";
import { SenderHealthCard } from "./SenderHealthCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StartFirstCampaignModal } from "@/components/campaigns/StartFirstCampaignModal";
import { Campaign } from "@/types";

interface Props {
  analytics: {
    summary: any;
    pipelineValueByStage: any[];
  };
  campaignName?: string;
  activities: any[];
  insights: string[];
  actionQueue?: any[];
  hasCampaigns?: boolean;
}

export function CampaignDashboardView({
  analytics,
  campaignName,
  activities,
  insights,
  actionQueue,
  hasCampaigns = true,
}: Props) {
  const router = useRouter();
  const [showKpis, setShowKpis] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(!hasCampaigns);
  const [localHasCampaigns, setLocalHasCampaigns] = useState(hasCampaigns);

  useEffect(() => {
    setLocalHasCampaigns(hasCampaigns);
    if (!hasCampaigns) {
      setStartModalOpen(true);
    }
  }, [hasCampaigns]);

  useEffect(() => {
    const handleCampaignsUpdated = () => {
      router.refresh();
      setLocalHasCampaigns(true);
    };
    window.addEventListener("sponfy:campaigns-updated", handleCampaignsUpdated);
    return () => {
      window.removeEventListener("sponfy:campaigns-updated", handleCampaignsUpdated);
    };
  }, [router]);

  const handleCampaignCreated = (campaign: Campaign) => {
    setLocalHasCampaigns(true);
    setStartModalOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Campaign Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Realtime metrics and action queue for <strong>{campaignName || "Active Workspace"}</strong>
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKpis(!showKpis)}
            className="text-xs font-semibold text-text-dim hover:text-green-dark hover:bg-butter-warm/80 rounded-xl"
            title={showKpis ? "Hide KPI row to save space" : "Show KPI row"}
          >
            {showKpis ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1.5 text-text-muted" /> Hide KPIs
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1.5 text-green-mid" /> Show KPIs
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={cn(
              "text-xs font-semibold rounded-xl transition-colors",
              isFocusMode
                ? "bg-green-dark text-butter-cream hover:bg-green-dark/90"
                : "text-text-dim hover:text-green-dark hover:bg-butter-warm/80"
            )}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Normal Mode
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Focus View
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 0. Onboarding Hero for New Users without Campaigns */}
      {!localHasCampaigns && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-butter-panel to-butter-warm border border-green-dark/15 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-fade-in">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-dark/10 text-green-dark text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-green-mid" />
              <span>Workspace Setup</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-green-dark">
              Launch your first sponsorship campaign
            </h2>
            <p className="text-xs sm:text-sm text-text-dim max-w-xl leading-relaxed">
              Define your event to automatically discover verified sponsor contacts, generate high-converting personalized pitches, and track meetings.
            </p>
          </div>
          <Button
            variant="butter"
            size="md"
            onClick={() => setStartModalOpen(true)}
            className="font-bold shadow-md cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Rocket className="w-4 h-4 text-green-dark" />
            <span>Start Your First Campaign</span>
          </Button>
        </div>
      )}

      {/* 1. Optional / Toggleable KPI Row */}
      {showKpis && (
        <div className="animate-fade-in">
          <KPIRow summary={analytics.summary} />
        </div>
      )}

      {/* 2. Action Queue, Pipeline, Insights & Activity */}
      <div className="space-y-6 animate-fade-in">
        {/* Action Queue */}
        <TodayActionQueue items={actionQueue} />

        {/* Pipeline Distribution + AI Insights in side-by-side grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <PipelineSummary stagesData={analytics.pipelineValueByStage} />
            {!isFocusMode && <ActivityFeed activities={activities} />}
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SenderHealthCard />
            <AIInsightCard insights={insights} />
          </div>
        </div>
      </div>

      {/* 3. Onboarding Campaign Launch Modal */}
      <StartFirstCampaignModal
        open={startModalOpen}
        onClose={() => setStartModalOpen(false)}
        onCreated={handleCampaignCreated}
      />
    </div>
  );
}
