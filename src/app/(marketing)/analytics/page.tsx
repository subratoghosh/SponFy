import React from "react";
import { AnalyticsPreview } from "@/components/landing/AnalyticsPreview";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Funnel Analytics | SponFy",
  description: "Track conversion rates, reply speeds, confirmed funds, and tier progress across your campaign pipeline.",
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col pt-16 md:pt-20">
      {/* Main Interactive Analytics Component */}
      <AnalyticsPreview />

      {/* Organizer Benchmarks & Insights */}
      <section className="py-20 bg-butter-bg border-t border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-dark/5 border border-green-dark/15 text-green-dark text-xs font-bold uppercase tracking-wider mb-3">
              <BarChart3 className="w-3.5 h-3.5 text-green-accent" />
              CAMPUS SPONSORSHIP BENCHMARKS
            </div>
            <h2 className="display-font text-3xl sm:text-4xl font-extrabold text-green-dark tracking-tight mb-4">
              Campus Sponsorship Performance
            </h2>
            <p className="text-text-dim text-sm sm:text-base leading-relaxed">
              Performance benchmarks will be calculated and declared directly from live campaigns and outreach activity on the platform. All baselines start at zero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted">Reply Conversion</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-dark/5 text-green-dark/60 font-bold text-xs">+0%</span>
              </div>
              <div className="text-4xl font-black stat-font text-green-dark mb-2">0%</div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                Verified reply rate across outreach campaigns. Will be calculated and declared once campaigns conduct outreach.
              </p>
              <div className="text-xs text-text-muted border-t border-green-dark/8 pt-3">
                Awaiting initial campaign outreach data.
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted">Pipeline Velocity</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-dark/5 text-green-dark/60 font-bold text-xs">0 Days</span>
              </div>
              <div className="text-4xl font-black stat-font text-green-dark mb-2">0 Days</div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                Median days from initial outreach to confirmed prospectus meeting. Will be tracked automatically from live thread chains.
              </p>
              <div className="text-xs text-text-muted border-t border-green-dark/8 pt-3">
                Awaiting initial meeting scheduling data.
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted">Fund Realization</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-dark/5 text-green-dark/60 font-bold text-xs">₹0 Avg</span>
              </div>
              <div className="text-4xl font-black stat-font text-green-dark mb-2">0%</div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                Sponsor retention and funded realization percentage. Measured and updated as campus campaigns close deals.
              </p>
              <div className="text-xs text-text-muted border-t border-green-dark/8 pt-3">
                Awaiting confirmed sponsorship closures.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
