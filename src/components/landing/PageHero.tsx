"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVectorMotifs } from "./HeroVectorMotifs";

interface PageHeroProps {
  breadcrumb: string;
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  breadcrumb,
  badge,
  badgeIcon = <Sparkles className="w-3.5 h-3.5 fill-butter-cream animate-pulse" />,
  title,
  subtitle,
  primaryCtaText = "Start a campaign free",
  primaryCtaHref = "/app",
  secondaryCtaText = "Explore all features",
  secondaryCtaHref = "/",
}) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-36 md:pb-28 bg-green-hero text-text-onDark overflow-hidden rounded-b-[36px] shadow-2xl">
      {/* Background Subtle Green Grid Pattern matching the design reference */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 240, 179, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 240, 179, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient Butter & Sage Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-butter-cream/10 blur-3xl pointer-events-none blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-green-light/20 blur-3xl pointer-events-none" />

      {/* Floating motifs in the background */}
      <HeroVectorMotifs />

      <div className="relative max-w-[1240px] mx-auto px-6 text-center flex flex-col items-center z-10">
        {/* Breadcrumb Navigation matching screenshot */}
        <nav
          aria-label="Breadcrumb"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-onDarkSub/80 mb-6 hover:text-butter-cream transition-colors"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-butter-cream transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-butter-cream/90" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-butter-cream/50" />
          <span className="text-butter-cream font-bold">{breadcrumb}</span>
        </nav>

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-butter-cream/15 border border-butter-cream/30 text-butter-cream text-xs font-bold uppercase tracking-wider mb-5 hover:bg-butter-cream/25 hover:border-butter-cream/60 hover:shadow-[0_0_20px_rgba(255,240,179,0.35)] hover:scale-105 transition-all duration-300 cursor-default">
          {badgeIcon}
          {badge}
        </div>

        {/* Display Headline in Fraunces */}
        <h1 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.12] font-black text-butter-cream max-w-4xl tracking-tight mb-5">
          {title}
        </h1>

        {/* Subline */}
        <p className="text-sm sm:text-base md:text-lg text-text-onDarkSub max-w-2xl font-normal leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
          <Link href={primaryCtaHref}>
            <Button
              variant="butter"
              size="md"
              className="text-sm sm:text-base font-bold shadow-xl hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,240,179,0.45)] transition-all duration-300 group"
            >
              {primaryCtaText}
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href={secondaryCtaHref}>
            <Button
              variant="hero-ghost"
              size="md"
              className="text-sm sm:text-base font-semibold hover:scale-105 hover:bg-butter-cream/20 hover:border-butter-cream hover:shadow-md transition-all duration-300"
            >
              {secondaryCtaText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
