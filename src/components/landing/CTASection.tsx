import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-green-hero text-text-onDark relative overflow-hidden rounded-t-[36px]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-butter-cream/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Decorative Vector Motifs with Hover Glow */}
      <div className="absolute left-[3%] top-1/2 -translate-y-1/2 hidden lg:block opacity-35 hover:opacity-100 vector-motif-interactive float-motif-1">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#FFF0B3" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
          <path d="M50 20 C56 30 60 44 58 60 L42 60 C40 44 44 30 50 20 Z" stroke="#FFF0B3" strokeWidth="1.75" fill="rgba(255,240,179,0.1)" />
          <circle cx="50" cy="38" r="4" fill="#FFF0B3" />
          <path d="M42 50 L34 60 L42 58 Z" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(255,240,179,0.15)" />
          <path d="M58 50 L66 60 L58 58 Z" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(255,240,179,0.15)" />
          <path d="M46 60 C48 70 50 78 50 78 C50 78 52 70 54 60 Z" fill="#FEE790" />
        </svg>
      </div>

      <div className="absolute right-[3%] top-1/2 -translate-y-1/2 hidden lg:block opacity-35 hover:opacity-100 vector-motif-interactive float-motif-2">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#FFF0B3" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
          <path d="M35 28 L65 28 C65 46 56 56 50 58 C44 56 35 46 35 28 Z" stroke="#FFF0B3" strokeWidth="1.75" fill="rgba(255,240,179,0.1)" />
          <line x1="50" y1="58" x2="50" y2="70" stroke="#FFF0B3" strokeWidth="2" />
          <path d="M40 70 L60 70 L64 80 L36 80 Z" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(255,240,179,0.15)" />
          <polygon points="50,36 51.5,40 56,40 52.5,43 54,47 50,44.5 46,47 47.5,43 44,40 48.5,40" fill="#FEE790" />
        </svg>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        <h2 className="display-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-butter-cream mb-6 tracking-tight max-w-3xl leading-[1.12]">
          Start your campaign today and reach sponsors in minutes.
        </h2>

        <p className="text-base sm:text-lg text-text-onDarkSub max-w-xl mb-10 leading-relaxed">
          Zero credit card required. Experience cited sponsor research, explainable fit scoring, and human-approved outreach right now.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 z-10">
          <Link href="/app">
            <Button
              variant="butter"
              size="lg"
              className="text-base font-bold shadow-2xl hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,240,179,0.45)] transition-all duration-300 group"
            >
              Launch SponFy Workspace
              <ArrowRight className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-onDarkSub font-medium">
          <span className="flex items-center gap-1.5 hover:text-butter-cream hover:scale-105 transition-all cursor-default">
            <ShieldCheck className="w-4 h-4 text-butter-cream" /> 100% Human Approval Gate
          </span>
          <span className="flex items-center gap-1.5 hover:text-butter-cream hover:scale-105 transition-all cursor-default">
            <ShieldCheck className="w-4 h-4 text-butter-cream" /> Verified Public Sources
          </span>
          <span className="flex items-center gap-1.5 hover:text-butter-cream hover:scale-105 transition-all cursor-default">
            <ShieldCheck className="w-4 h-4 text-butter-cream" /> Daily Send Cap Protection
          </span>
        </div>
      </div>
    </section>
  );
};
