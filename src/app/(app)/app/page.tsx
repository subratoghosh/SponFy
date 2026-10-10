import React from "react";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { DEMO_ACTIVITIES } from "@/lib/data/seed-data";
import { KPIRow } from "@/components/dashboard/KPIRow";
import { TodayActionQueue } from "@/components/dashboard/TodayActionQueue";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";

export default async function OverviewPage() {
  const analytics = await getAnalyticsData();

  const insights = [
    "Developer Tools and Cloud companies in your pipeline have an 82% positive reply rate — 2.4x higher than FMCG brands.",
    "Outreach pitches sent between 10:00 AM and 11:30 AM IST showed a 40% faster reply turnaround from DevRel managers.",
    "Postman and Razorpay have active negotiations totaling ₹1.6 Lakhs; closing both achieves 52% of your ₹5,00,000 target.",
  ];

  return (
    <div className="space-y-8 animate-fade-in">
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
      </div>

      {/* 1. KPI Row + Progress Goal */}
      <KPIRow summary={analytics.summary} />

      {/* 2. Today High-Priority Action Queue */}
      <TodayActionQueue />

      {/* 3. Pipeline Distribution + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <PipelineSummary stagesData={analytics.pipelineValueByStage} />
          <ActivityFeed activities={DEMO_ACTIVITIES} />
        </div>
        <div className="lg:col-span-4">
          <AIInsightCard insights={insights} />
        </div>
      </div>
    </div>
  );
}
