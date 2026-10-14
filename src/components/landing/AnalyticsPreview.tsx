import React from "react";
import { BarChart3, TrendingUp, DollarSign, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

export const AnalyticsPreview = async () => {
  // Query real data from repository/database layer.
  // When DATABASE_URL is connected, this queries Prisma PostgreSQL live.
  // When no database is configured yet, it reads from the seed/in-memory store.
  let analyticsData: Awaited<ReturnType<typeof getAnalyticsData>> | null = null;
  let activeCampaign = null;

  try {
    const [analytics, campaigns] = await Promise.all([
      getAnalyticsData(),
      getCampaigns(),
    ]);
    analyticsData = analytics;
    activeCampaign = campaigns && campaigns.length > 0 ? campaigns[0] : null;
  } catch (err) {
    console.error("Error loading database analytics in AnalyticsPreview:", err);
  }

  const summary = analyticsData?.summary;
  const targetGoalVal = activeCampaign?.targetAmount ?? summary?.targetAmount ?? 0;
  const committedVal = summary?.committedAmount ?? 0;
  const pipelineVal = summary?.pipelineAmount ?? 0;
  const replyRateVal = summary?.positiveReplyRate ?? 0;
  const totalSponsors = summary?.totalSponsors ?? 0;
  const audienceCount = activeCampaign?.audienceSize ?? 0;

  const committedPercent = targetGoalVal > 0 
    ? Math.min(100, Math.round((committedVal / targetGoalVal) * 100))
    : 0;

  const metrics = [
    {
      label: "Target Goal",
      value: targetGoalVal > 0 ? formatCurrencyINR(targetGoalVal) : "₹0",
      change: audienceCount > 0 ? `${formatNumber(audienceCount)} Participants` : "0 Participants",
      icon: DollarSign,
    },
    {
      label: "Total Committed",
      value: formatCurrencyINR(committedVal),
      change: `${committedPercent}% of Target Achieved`,
      icon: TrendingUp,
    },
    {
      label: "Target Sponsorship",
      value: formatCurrencyINR(pipelineVal),
      change: `${totalSponsors} Scored Sponsors`,
      icon: BarChart3,
    },
    {
      label: "Positive Reply Rate",
      value: `${replyRateVal}%`,
      change: replyRateVal > 0 ? "Industry Avg: 18%" : "No replies yet",
      icon: Mail,
    },
  ];

  // Dynamic funnel stages from database
  const totalBase = totalSponsors > 0 ? totalSponsors : 1;

  const stageDisplayMap: Record<string, { label: string; color: string }> = {
    Discovered: { label: "Discovered", color: "bg-green-dark" },
    Qualified: { label: "Qualified (Fit >= 70)", color: "bg-green-mid" },
    Contacted: { label: "Contacted via Gmail", color: "bg-green-light" },
    Replied: { label: "Replied", color: "bg-sky-600" },
    Interested: { label: "Interested & Negotiating", color: "bg-amber-600" },
    Committed: { label: "Committed Sponsors", color: "bg-green-600" },
  };

  const rawFunnel = analyticsData?.funnel && analyticsData.funnel.length > 0
    ? analyticsData.funnel
    : [
        { stage: "Discovered", count: totalSponsors },
        { stage: "Qualified", count: summary?.qualifiedCount ?? 0 },
        { stage: "Contacted", count: summary?.sentEmails ?? 0 },
        { stage: "Replied", count: summary?.repliesCount ?? 0 },
        { stage: "Interested", count: summary?.negotiationsCount ?? 0 },
        { stage: "Committed", count: summary?.committedCount ?? 0 },
      ];

  const funnelStages = rawFunnel.map((f: any) => {
    const meta = stageDisplayMap[f.stage] || { label: f.stage, color: "bg-green-dark" };
    const pct = Math.min(100, Math.round((f.count / totalBase) * 100));
    return {
      stage: meta.label,
      count: f.count,
      percent: `${pct}%`,
      color: meta.color,
    };
  });

  return (
    <section id="analytics" className="py-24 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-butter-warm px-3.5 py-1.5 rounded-full border border-green-dark/10">
            Realtime Campaign Visibility
          </span>
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mt-3 mb-4">
            Campaign analytics that answer questions, not show vanity charts
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Track stage conversions, pipeline monetary value, industry response lift, and follow-up efficiency.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-green-dark/12 shadow-sm feature-card-interactive group/stat hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted tracking-wider">
                  {m.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark group-hover/stat:scale-110 group-hover/stat:rotate-6 group-hover/stat:bg-butter-gold group-hover/stat:shadow-[0_0_14px_rgba(254,231,144,0.6)] transition-all duration-300">
                  <m.icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="stat-font text-3xl font-extrabold text-green-dark mb-1 group-hover/stat:text-green-mid transition-colors">
                {m.value}
              </h3>
              <p className="text-xs font-medium text-green-700 flex items-center gap-1 group-hover/stat:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-3.5 h-3.5" /> {m.change}
              </p>
            </div>
          ))}
        </div>

        {/* Funnel Visual */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/15 shadow-md hover:shadow-2xl hover:border-green-dark/25 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-green-dark">
                Where are sponsors dropping off in the funnel?
              </h3>
              <p className="text-xs text-text-dim">Conversion stages from Discovered to Closed Deals</p>
            </div>
            <Link href="/app/analytics">
              <Button variant="glass" size="sm" className="text-xs font-bold hover:scale-105 hover:bg-butter-cream hover:border-green-dark transition-all duration-200">
                View Full Analytics
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {funnelStages.map((f: any, i: number) => (
              <div key={i} className="space-y-1 p-2 -mx-2 rounded-xl hover:bg-butter-warm/40 hover:scale-[1.01] transition-all cursor-pointer group/row">
                <div className="flex justify-between text-xs font-bold text-green-dark group-hover/row:text-green-mid transition-colors">
                  <span>{f.stage}</span>
                  <span className="font-mono">{f.count} companies ({f.percent})</span>
                </div>
                <div className="w-full h-3 bg-butter-warm rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full transition-all duration-700 group-hover/row:brightness-110 group-hover/row:shadow-[0_0_8px_rgba(12,56,46,0.3)]`}
                    style={{ width: f.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
