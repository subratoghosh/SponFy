import React from "react";
import { AnalyticsPreview } from "@/components/landing/AnalyticsPreview";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Funnel Analytics | SponFy",
  description: "Track conversion rates, reply speeds, confirmed funds, and tier progress across your festival pipeline.",
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
              Real metrics from top collegiate events
            </h2>
            <p className="text-text-dim text-sm sm:text-base leading-relaxed">
              Based on campaigns run across Indian hackathons and fests, here is how structured pipeline analytics changes organizer outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted">Reply Conversion</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-mid/10 text-green-mid font-bold text-xs">+340%</span>
              </div>
              <div className="text-4xl font-black stat-font text-green-dark mb-2">31.4%</div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                Average reply rate when using SponFy cited dossiers vs standard 7.2% with generic cold email blasts.
              </p>
              <div className="text-xs text-text-muted border-t border-green-dark/8 pt-3">
                Cited evidence gives busy VPs a reason to respond.
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted">Pipeline Velocity</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-mid/10 text-green-mid font-bold text-xs">-65% Time</span>
              </div>
              <div className="text-4xl font-black stat-font text-green-dark mb-2">4.2 Days</div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                Median days from initial outreach to confirmed prospectus meeting with corporate sponsorships teams.
              </p>
              <div className="text-xs text-text-muted border-t border-green-dark/8 pt-3">
                No more two-week email silence or lost thread chains.
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-text-muted">Fund Realization</span>
                <span className="px-2.5 py-0.5 rounded-full bg-green-mid/10 text-green-mid font-bold text-xs">₹4.8L Avg</span>
              </div>
              <div className="text-4xl font-black stat-font text-green-dark mb-2">89%</div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                Sponsor retention rate into year 2 when organizers use transparent SponFy dossier post-event summaries.
              </p>
              <div className="text-xs text-text-muted border-t border-green-dark/8 pt-3">
                Build institutional memory for future student teams.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
