"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
  TrendingUp,
  Building2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-green-hero text-text-onDark overflow-hidden rounded-b-[36px] shadow-2xl">
      {/* Background Organic Butter Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-butter-cream/10 blur-3xl pointer-events-none blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-green-light/20 blur-3xl pointer-events-none" />
      
      {/* Abstract Network/Data Line-Art Motif (Stroke Butter, Opacity ~0.2) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="network-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#FFF0B3"
              strokeWidth="0.8"
            />
            <circle cx="0" cy="0" r="2" fill="#FFF0B3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-grid)" />
      </svg>

      <div className="relative max-w-[1240px] mx-auto px-6 text-center flex flex-col items-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-butter-cream/15 border border-butter-cream/30 text-butter-cream text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 fill-butter-cream" />
          The AI Sponsorship OS for College Fests & Hackathons
        </div>

        {/* Display Headline in Fraunces */}
        <h1 className="display-font text-4xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.08] font-black text-butter-cream max-w-4xl tracking-tight mb-6">
          Find, research and win event sponsors — with AI that asks before it sends.
        </h1>

        {/* Subline */}
        <p className="text-base sm:text-lg md:text-xl text-text-onDarkSub max-w-2xl font-normal leading-relaxed mb-10">
          Built for student organizers, fest conveners, and club leads. SponFy finds high-fit companies, cites verified sources, drafts tailored pitches, and waits for your nod.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 z-10">
          <Link href="/app">
            <Button variant="butter" size="lg" className="text-base font-bold shadow-xl">
              Start a campaign free
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <a href="#workflow">
            <Button variant="hero-ghost" size="lg" className="text-base font-semibold">
              See how it works
            </Button>
          </a>
        </div>

        {/* Overlapping Product Preview UI Card */}
        <div className="w-full max-w-5xl bg-butter-panel text-green-dark rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-hero-card border-2 border-butter-cream/50 relative z-20 text-left transition-all transform hover:scale-[1.01]">
          {/* Card Topbar Mock */}
          <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs font-bold text-text-dim ml-2 uppercase tracking-wider">
                SponFy Hackathon 2026 — Live Pipeline
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-xs font-semibold text-green-dark border border-green-dark/10">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Human Approval Required
            </div>
          </div>

          {/* Inner Grid Preview: Left Kanban Card + Right "Why 86?" Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Sponsor Dossier Preview */}
            <div className="md:col-span-7 bg-white rounded-xl p-5 border border-green-dark/12 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-butter-warm flex items-center justify-center font-bold text-green-dark text-lg border border-green-dark/10">
                    <Building2 className="w-6 h-6 text-green-dark" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-green-dark">Postman</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
                        Interested
                      </span>
                    </div>
                    <p className="text-xs text-text-dim">Developer Tools & API Platform</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-text-muted">Target Tier</span>
                  <p className="font-mono text-base font-extrabold text-green-dark">₹75,000</p>
                </div>
              </div>

              <div className="p-3 bg-butter-bg/80 rounded-lg text-xs space-y-1.5 border border-green-dark/5">
                <div className="flex items-center justify-between text-text-dim font-medium">
                  <span>Verified Contact:</span>
                  <span className="font-semibold text-green-dark flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-green-600" /> Ali Mustufa (Student Lead)
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-dim font-medium">
                  <span>Angle:</span>
                  <span className="text-green-dark font-semibold">Postman Student Expert Track</span>
                </div>
                <div className="flex items-center justify-between text-text-dim font-medium">
                  <span>Cited Source:</span>
                  <a
                    href="https://postman.com/student-program"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline flex items-center gap-1 hover:text-blue-900"
                  >
                    postman.com/student-program <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Draft Preview Bar */}
              <div className="bg-green-dark text-butter-cream p-3 rounded-lg flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-butter-gold" />
                  <span>Draft Ready: 95% Quality Score</span>
                </div>
                <span className="bg-butter-cream text-green-dark px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  Review & Approve
                </span>
              </div>
            </div>

            {/* Right Fit Score Breakdown ("Why 94?") */}
            <div className="md:col-span-5 bg-white rounded-xl p-5 border border-green-dark/12 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    AI Fit Score
                  </span>
                  <h4 className="font-heading font-extrabold text-2xl text-green-dark flex items-baseline gap-1">
                    94 <span className="text-xs font-semibold text-text-muted">/ 100</span>
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs font-bold text-green-dark pb-1 border-b border-green-dark/10">
                Why this scored 94:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-bold">+20 pts:</span> High industry synergy with 800 CS student builders.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-bold">+15 pts:</span> Active Postman Student Expert program in India.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-bold">+15 pts:</span> Standard ₹75k track sponsorship history.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
