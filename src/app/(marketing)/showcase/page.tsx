import React from "react";
import { ShowcaseCarousel } from "@/components/landing/ShowcaseCarousel";
import { Target } from "lucide-react";

export const metadata = {
  title: "Sponsor Showcase | SponFy",
  description: "Explore real company dossiers prepared for college hackathons and cultural fests with live cited evidence.",
};

export default function ShowcasePage() {
  return (
    <div className="flex flex-col pt-16 md:pt-20">
      {/* Showcase Carousel Component */}
      <ShowcaseCarousel />

      {/* Anatomy of a SponFy Fit Score */}
      <section className="py-20 bg-butter-bg border-t border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="display-font text-3xl sm:text-4xl font-extrabold text-green-dark tracking-tight mb-4">
              How SponFy scores sponsors from 0 to 100
            </h2>
            <p className="text-text-dim text-sm sm:text-base leading-relaxed">
              Every score is grounded in 4 objective pillars and backed by verifiable citations from press releases, hiring portals, and public CSR registries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-green-dark/10 shadow-sm hover-lift">
              <div className="text-3xl font-extrabold stat-font text-green-dark mb-2">35%</div>
              <h3 className="heading-font text-lg font-bold text-green-dark mb-2">
                Developer & Audience Fit
              </h3>
              <p className="text-text-dim text-xs sm:text-sm leading-relaxed">
                Matches the sponsor's target developers (e.g. AI, Web3, Cloud, Fintech) with your hackathon's registered participant tracks.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-green-dark/10 shadow-sm hover-lift">
              <div className="text-3xl font-extrabold stat-font text-green-dark mb-2">25%</div>
              <h3 className="heading-font text-lg font-bold text-green-dark mb-2">
                Campus Hiring Intent
              </h3>
              <p className="text-text-dim text-xs sm:text-sm leading-relaxed">
                Checks recent college hiring drives, intern requisitions, and university relations job listings in the host region.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-green-dark/10 shadow-sm hover-lift">
              <div className="text-3xl font-extrabold stat-font text-green-dark mb-2">20%</div>
              <h3 className="heading-font text-lg font-bold text-green-dark mb-2">
                Historical Grant Patterns
              </h3>
              <p className="text-text-dim text-xs sm:text-sm leading-relaxed">
                Analyzes previous campus festival sponsorships across India, verified grant sizes, and past tier selections.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-green-dark/10 shadow-sm hover-lift">
              <div className="text-3xl font-extrabold stat-font text-green-dark mb-2">20%</div>
              <h3 className="heading-font text-lg font-bold text-green-dark mb-2">
                Fiscal Quarter Timing
              </h3>
              <p className="text-text-dim text-xs sm:text-sm leading-relaxed">
                Aligns your event date with the brand&rsquo;s annual CSR budget cycle or quarterly marketing expenditure windows.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
