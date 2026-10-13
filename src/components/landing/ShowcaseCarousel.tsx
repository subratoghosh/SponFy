"use client";

import React, { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ShowcaseCompany } from "@/types";

interface ShowcaseCarouselProps {
  companies?: ShowcaseCompany[];
}

export const ShowcaseCarousel: React.FC<ShowcaseCarouselProps> = ({ companies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!companies || companies.length === 0) {
    return (
      <section id="showcase" className="py-20 bg-butter-bg border-b border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-butter-warm px-3.5 py-1.5 rounded-full border border-green-dark/10">
            Sponsor Showcase
          </span>
          <h2 className="heading-font text-2xl sm:text-3xl font-extrabold text-green-dark mt-3 mb-2">
            Types of companies organizers approach
          </h2>
          <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto">
            No showcase entries currently configured. Add entries via the Admin Console.
          </p>
        </div>
      </section>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? companies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === companies.length - 1 ? 0 : prev + 1));
  };

  // Visible window of 3 items (or fewer if total is less than 3)
  const visibleCount = Math.min(3, companies.length);
  const displayItems = Array.from({ length: visibleCount }).map((_, offset) => {
    return companies[(currentIndex + offset) % companies.length];
  });

  return (
    <section id="showcase" className="py-24 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-butter-warm px-3.5 py-1.5 rounded-full border border-green-dark/10">
              Types of companies sponsors approach
            </span>
            <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mt-3">
              Curated Sponsor Intelligence Dossiers
            </h2>
            <p className="text-sm text-text-dim mt-1">
              Curated profiles illustrating developer, cloud, and collegiate sponsorship capacity.
            </p>
          </div>

          {companies.length > 3 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous showcase sponsor"
                className="w-11 h-11 rounded-full bg-white border border-green-dark/15 flex items-center justify-center text-green-dark hover:bg-butter-cream hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next showcase sponsor"
                className="w-11 h-11 rounded-full bg-white border border-green-dark/15 flex items-center justify-center text-green-dark hover:bg-butter-cream hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Showcase Grid of Rounded Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => {
            const initials = item.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between group/card h-full min-w-0"
              >
                <div>
                  <div className="flex items-start justify-between mb-4 gap-2">
                    {/* Safe Logo with initials fallback */}
                    <div className="w-12 h-12 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark font-black text-sm border border-green-dark/10 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-300 shrink-0">
                      {item.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.logoUrl}
                          alt={`${item.name} logo`}
                          className="w-10 h-10 object-contain rounded-lg"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="text-right">
                      {item.isPartner ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Confirmed Partner
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-butter-warm text-green-dark/80 border border-green-dark/10" title="Representative candidate company profile">
                          Industry Candidate
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-green-dark mb-1 group-hover/card:text-green-mid transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-green-accent mb-2">
                    {item.industry}
                  </div>
                  <p className="text-xs text-text-dim mb-4 leading-relaxed line-clamp-2">
                    {item.shortDescription}
                  </p>

                  <div className="p-3.5 bg-butter-panel rounded-xl text-xs space-y-1.5 border border-green-dark/8 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-green-dark">Official Domain:</span>
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-green-accent font-semibold flex items-center gap-1 hover:underline truncate max-w-[160px]"
                      >
                        <span className="truncate">{item.websiteUrl.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <div className="text-[10px] text-text-muted italic pt-1 border-t border-green-dark/5">
                      Sample score for the demo campaign: 88–98% Fit
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between text-xs gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-text-dim min-w-0 flex-1">
                    <UserCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="truncate text-xs">Public DevRel / Campus Leads</span>
                  </div>
                  <Link href="/login" className="shrink-0">
                    <span className="font-bold text-green-dark group-hover/card:text-green-mid inline-flex items-center gap-1 transition-colors whitespace-nowrap">
                      View Dossier <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        {/* Mobile Navigation Controls (Below Dossier Cards) */}
        {companies.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-4 mt-8 pb-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous showcase sponsor"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-green-dark/15 flex items-center justify-center text-green-dark hover:bg-butter-cream hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next showcase sponsor"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-green-dark/15 flex items-center justify-center text-green-dark hover:bg-butter-cream hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
