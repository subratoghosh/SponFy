"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Sparkles,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { KPIRow } from "./KPIRow";
import { TodayActionQueue } from "./TodayActionQueue";
import { PipelineSummary } from "./PipelineSummary";
import { ActivityFeed } from "./ActivityFeed";
import { AIInsightCard } from "./AIInsightCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  analytics: {
    summary: any;
    pipelineValueByStage: any[];
  };
  activities: any[];
  insights: string[];
  actionQueue?: any[];
}

type TabType = "all" | "queue" | "pipeline" | "insights";

export function CampaignDashboardView({
  analytics,
  activities,
  insights,
  actionQueue,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showKpis, setShowKpis] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const tabs: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: "all", label: "Overview", icon: LayoutDashboard },
    { id: "queue", label: "Action Queue", icon: CheckSquare, count: 3 },
    { id: "pipeline", label: "Pipeline & Stages", icon: BarChart3 },
    { id: "insights", label: "Live Intel & Feed", icon: Sparkles, count: insights.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Campaign Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Realtime metrics and action queue for <strong>SponFy Hackathon 2026</strong>
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

      {/* Interactive Navigation Controller Bar */}
      <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-green-dark/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap w-full sm:w-auto pb-1 sm:pb-0 touch-pan-x">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-green-dark text-butter-cream shadow-sm"
                    : "text-text-dim hover:text-green-dark hover:bg-butter-warm/60"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-butter-cream" : "text-text-muted")} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-black",
                      isActive
                        ? "bg-butter-cream/20 text-butter-cream"
                        : "bg-green-dark/5 text-green-dark"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick hint on current view */}
        <div className="hidden lg:flex items-center text-xs text-text-muted px-3 font-medium">
          {activeTab === "all" && "Showing complete overview with all metrics"}
          {activeTab === "queue" && "Filtered to today's urgent actions & approvals"}
          {activeTab === "pipeline" && "Showing deal value progression & stage breakdown"}
          {activeTab === "insights" && "Showing AI recommendations & live audit activities"}
        </div>
      </div>

      {/* 1. Optional / Toggleable KPI Row */}
      {showKpis && (
        <div className="animate-fade-in">
          <KPIRow summary={analytics.summary} />
        </div>
      )}

      {/* 2. Dynamic View Content Based On Selected Button/Tab */}
      {activeTab === "all" && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Queue */}
          <TodayActionQueue items={actionQueue} />

          {/* Pipeline Distribution + AI Insights in side-by-side grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <PipelineSummary stagesData={analytics.pipelineValueByStage} />
              {!isFocusMode && <ActivityFeed activities={activities} />}
            </div>
            <div className="lg:col-span-4">
              <AIInsightCard insights={insights} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          <TodayActionQueue items={actionQueue} />
          
          <div className="p-4 rounded-2xl bg-butter-warm/60 border border-green-dark/10 flex items-center justify-between">
            <p className="text-xs text-text-dim">
              Want to see all pending sponsor responses and threads?
            </p>
            <a
              href="/app/replies"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark hover:text-green-mid"
            >
              Open Replies Inbox <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <PipelineSummary stagesData={analytics.pipelineValueByStage} />
            </div>
            <div className="lg:col-span-4">
              <AIInsightCard insights={insights} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <AIInsightCard insights={insights} />
            </div>
            <div className="lg:col-span-7">
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
