import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  variant?: "dark" | "butter" | "white" | "emerald";
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  showTrustBadges?: boolean;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  variant = "dark",
  badge = "Ready to supercharge your fest sponsorship?",
  title = "Start your campaign today and reach sponsors in minutes.",
  subtitle = "Zero credit card required. Experience cited sponsor research, explainable fit scoring, and human-approved outreach.",
  primaryCtaText = "Launch SponFy Workspace",
  primaryCtaHref = "/app",
  secondaryCtaText = "Explore Demo Mode",
  secondaryCtaHref = "/login",
  showTrustBadges = true,
  className,
}) => {
  const isDark = variant === "dark";
  const isButter = variant === "butter";
  const isWhite = variant === "white";
  const isEmerald = variant === "emerald";

  const containerStyles = {
    dark: "bg-green-hero text-text-onDark border border-butter-cream/20 shadow-xl",
    butter: "bg-[#FFF0B3] text-green-dark border-2 border-green-dark/15 shadow-md",
    white: "bg-white text-green-dark border border-green-dark/12 shadow-sm",
    emerald: "bg-gradient-to-br from-green-deep via-green-dark to-green-mid text-text-onDark border border-green-accent/30 shadow-xl",
  }[variant];

  const badgeStyles = {
    dark: "bg-butter-cream/15 border-butter-cream/30 text-butter-cream",
    butter: "bg-green-dark/10 border-green-dark/20 text-green-dark",
    white: "bg-butter-cream/70 border-green-dark/10 text-green-dark",
    emerald: "bg-butter-cream/15 border-butter-cream/30 text-butter-cream",
  }[variant];

  const titleColor = {
    dark: "text-butter-cream",
    butter: "text-green-dark",
    white: "text-green-dark",
    emerald: "text-butter-cream",
  }[variant];

  const subtitleColor = {
    dark: "text-text-onDarkSub",
    butter: "text-text-dim",
    white: "text-text-dim",
    emerald: "text-text-onDarkSub",
  }[variant];

  const trustColor = {
    dark: "text-text-onDarkSub/90",
    butter: "text-text-dim/90",
    white: "text-text-muted",
    emerald: "text-text-onDarkSub/90",
  }[variant];

  return (
    <section className={cn("max-w-[1240px] mx-auto px-6 my-10 md:my-14", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-8 sm:p-10 md:p-12 text-center flex flex-col items-center",
          containerStyles
        )}
      >
        {/* Subtle Ambient Radial Light (darker modes only) */}
        {(isDark || isEmerald) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-butter-cream/10 blur-[90px] pointer-events-none rounded-full" />
        )}

        {/* Compact Pill Badge */}
        {badge && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-4 cursor-default",
              badgeStyles
            )}
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            {badge}
          </div>
        )}

        {/* Compact Display Headline */}
        <h2
          className={cn(
            "display-font text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight max-w-2xl leading-[1.18]",
            titleColor
          )}
        >
          {title}
        </h2>

        {/* Compact Subline */}
        <p className={cn("text-xs sm:text-sm md:text-base max-w-xl mb-6 leading-relaxed", subtitleColor)}>
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 z-10">
          <Link href={primaryCtaHref}>
            <Button
              variant={isButter ? "green" : "butter"}
              size="md"
              className="text-sm font-bold shadow-md hover:scale-105 transition-all group"
            >
              {primaryCtaText}
              <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href={secondaryCtaHref}>
            <Button
              variant={isButter || isWhite ? "glass" : "hero-ghost"}
              size="md"
              className="text-sm font-semibold hover:scale-105 transition-all"
            >
              {secondaryCtaText}
            </Button>
          </Link>
        </div>

        {/* Compact Trust Badges */}
        {showTrustBadges && (
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] font-medium border-t pt-4",
              isDark || isEmerald ? "border-butter-cream/15" : "border-green-dark/10",
              trustColor
            )}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Human Approval Gate
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Public Sources
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Daily Send Cap Protection
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
