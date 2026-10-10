import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-green-hero text-text-onDark relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-butter-cream/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-butter-cream/15 border border-butter-cream/30 text-butter-cream text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 fill-butter-cream" />
          Ready to supercharge your college fest sponsorship?
        </div>

        <h2 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-butter-cream mb-6 tracking-tight max-w-3xl leading-[1.12]">
          Start your campaign today and reach sponsors in minutes.
        </h2>

        <p className="text-base sm:text-lg text-text-onDarkSub max-w-xl mb-10 leading-relaxed">
          Zero credit card required. Experience cited sponsor research, explainable fit scoring, and human-approved outreach right now.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Link href="/app">
            <Button variant="butter" size="lg" className="text-base font-bold shadow-2xl">
              Launch SponFy Workspace
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="hero-ghost" size="lg" className="text-base font-semibold">
              Explore Demo Mode
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-onDarkSub font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-butter-cream" /> 100% Human Approval Gate
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-butter-cream" /> Verified Public Sources
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-butter-cream" /> Daily Send Cap Protection
          </span>
        </div>
      </div>
    </section>
  );
};
