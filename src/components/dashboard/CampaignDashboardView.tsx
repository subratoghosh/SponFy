"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { KPIRow } from "./KPIRow";
import { TodayActionQueue } from "./TodayActionQueue";
import { PipelineSummary } from "./PipelineSummary";
import { ActivityFeed } from "./ActivityFeed";
import { AIInsightCard } from "./AIInsightCard";
import { SenderHealthCard } from "./SenderHealthCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  analytics: {
    summary: any;
    pipelineValueByStage: any[];
  };
  campaignName?: string;
  activities: any[];
  insights: string[];
  actionQueue?: any[];
}

export function CampaignDashboardView({
  analytics,
  campaignName,
  activities,
  insights,
  actionQueue,
}: Props) {
  const [showKpis, setShowKpis] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

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
    </div>
  );
}
