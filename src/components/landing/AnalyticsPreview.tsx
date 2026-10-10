import React from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const AnalyticsPreview: React.FC = () => {
  const metrics = [
    { label: "Target Goal", value: "₹5,00,000", change: "800 Students", icon: DollarSign },
    { label: "Total Committed", value: "₹2,50,000", change: "50% of Target Achieved", icon: TrendingUp },
    { label: "Active Pipeline", value: "₹9,85,000", change: "24 Scored Sponsors", icon: BarChart3 },
    { label: "Positive Reply Rate", value: "86%", change: "Industry Avg: 18%", icon: Mail },
  ];

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
              className="bg-white rounded-2xl p-6 border border-green-dark/12 shadow-sm feature-card-interactive"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted tracking-wider">
                  {m.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark">
                  <m.icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="stat-font text-3xl font-extrabold text-green-dark mb-1">
                {m.value}
              </h3>
              <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> {m.change}
              </p>
            </div>
          ))}
        </div>

        {/* Funnel Visual Mock */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/15 shadow-md">
          <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-green-dark">
                Where are sponsors dropping off in the funnel?
              </h3>
              <p className="text-xs text-text-dim">Conversion stages from Discovered to Closed Deals</p>
            </div>
            <Link href="/app/analytics">
              <Button variant="glass" size="sm" className="text-xs font-bold">
                View Full Analytics
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { stage: "Discovered", count: 24, percent: "100%", color: "bg-green-dark" },
              { stage: "Qualified (Fit >= 70)", count: 21, percent: "87.5%", color: "bg-green-mid" },
              { stage: "Contacted via Gmail", count: 18, percent: "75.0%", color: "bg-green-light" },
              { stage: "Replied", count: 12, percent: "50.0%", color: "bg-sky-600" },
              { stage: "Interested & Negotiating", count: 8, percent: "33.3%", color: "bg-amber-600" },
              { stage: "Committed Sponsors 🎉", count: 3, percent: "12.5%", color: "bg-green-600" },
            ].map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-green-dark">
                  <span>{f.stage}</span>
                  <span className="font-mono">{f.count} companies ({f.percent})</span>
                </div>
                <div className="w-full h-3 bg-butter-warm rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full transition-all duration-700`}
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
