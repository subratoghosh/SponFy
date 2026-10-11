"use client";

import React, { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const ShowcaseCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const showcaseSponsors = [
    {
      name: "Acme Cloud",
      industry: "Developer Tools",
      description: "API and cloud platform with active student developer grants and workshops.",
      fitScore: 94,
      targetTier: "Gold Tier",
      angle: "Cloud API Challenge Track + campus student ambassador onboarding.",
      contact: "Campus DevRel Lead",
      signals: ["API Hackathon Fund", "Campus DevRel Team"],
    },
    {
      name: "Nimbus APIs",
      industry: "Developer Platform",
      description: "Developer tooling ecosystem and community platform supporting student builders.",
      fitScore: 98,
      targetTier: "Title Partner",
      angle: "Official hackathon challenge platform + grant prize pool partner.",
      contact: "Community Program Manager",
      signals: ["Active Campus Grants", "Developer Bounties"],
    },
    {
      name: "Orbit Payments",
      industry: "Fintech & Payments",
      description: "Full-stack payment infrastructure with startup and campus hackathon grants.",
      fitScore: 88,
      targetTier: "Gold Tier",
      angle: "Fintech & Payment Gateway Innovation Challenge + jury seat.",
      contact: "Campus Outreach Lead",
      signals: ["Innovation Sandbox", "Fintech Track"],
    },
    {
      name: "DevStack Labs",
      industry: "Developer Tools",
      description: "Developer platform empowering student builders with cloud packs and tools.",
      fitScore: 96,
      targetTier: "Title Partner",
      angle: "AI developer challenge track + merchandise perks for participants.",
      contact: "Education Program Lead",
      signals: ["Student Developer Pack", "Event Swag Kit"],
    },
    {
      name: "Vortex Data",
      industry: "Cloud & Data",
      description: "Database and cloud analytics platform offering student developer tier benefits.",
      fitScore: 91,
      targetTier: "Silver Tier",
      angle: "Vector database challenge track with category prize bounty.",
      contact: "DevRel Coordinator",
      signals: ["Database Developer Grant", "Campus Partner"],
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? showcaseSponsors.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === showcaseSponsors.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="showcase" className="py-24 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Header with Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-butter-warm px-3.5 py-1.5 rounded-full border border-green-dark/10">
              Example Sponsor Showcase
            </span>
            <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mt-3">
              Curated Sponsor Intelligence Dossiers
            </h2>
            <p className="text-sm text-text-dim mt-1">
              Every company is scored across 7 factors with cited sources and personalized pitch angles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous showcase sponsor"
              className="w-11 h-11 rounded-full bg-white border border-green-dark/15 flex items-center justify-center text-green-dark hover:bg-butter-cream hover:scale-110 hover:border-green-dark/30 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next showcase sponsor"
              className="w-11 h-11 rounded-full bg-white border border-green-dark/15 flex items-center justify-center text-green-dark hover:bg-butter-cream hover:scale-110 hover:border-green-dark/30 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Showcase Grid of White Rounded Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const item = showcaseSponsors[(currentIndex + offset) % showcaseSponsors.length];
            return (
              <div
                key={item.name}
                className="bg-white rounded-2xl p-6 border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between group/card"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark border border-green-dark/10 group-hover/card:scale-110 group-hover/card:rotate-6 group-hover/card:bg-butter-gold group-hover/card:shadow-[0_0_14px_rgba(254,231,144,0.6)] transition-all duration-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300 hover:scale-105 hover:bg-green-200 transition-all cursor-default">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {item.fitScore}% Fit
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-green-dark mb-1 group-hover/card:text-green-mid transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-text-dim mb-4 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="p-3.5 bg-butter-panel rounded-xl text-xs space-y-2 border border-green-dark/8 mb-4 hover:border-green-dark/20 transition-colors">
                    <div>
                      <span className="font-bold text-green-dark block mb-0.5">Target Tier:</span>
                      <span className="font-mono text-green-800 font-bold">{item.targetTier}</span>
                    </div>
                    <div>
                      <span className="font-bold text-green-dark block mb-0.5">Recommended Pitch Angle:</span>
                      <span className="text-text-dim leading-snug">{item.angle}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-text-dim">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="truncate max-w-[140px]">{item.contact}</span>
                  </div>
                  <Link href="/app/sponsors">
                    <span className="font-bold text-green-dark group-hover/card:text-green-mid inline-flex items-center gap-1 transition-colors">
                      View Dossier <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
