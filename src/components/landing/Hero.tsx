"use client";

import React, { useRef, useState, useCallback } from "react";
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
import { HeroVectorMotifs } from "./HeroVectorMotifs";

export const Hero: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    active: false,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth subtle tilt angles (-6deg to +6deg)
    const rotateX = -((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      active: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      active: false,
    });
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center items-center pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-32 md:pb-24 bg-green-hero text-text-onDark overflow-hidden rounded-b-[28px] sm:rounded-b-[36px] shadow-2xl px-3 sm:px-6">
      {/* Background Organic Butter Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-butter-cream/10 blur-3xl pointer-events-none blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-green-light/20 blur-3xl pointer-events-none" />
      
      {/* Interactive Background Vector Images (Hover-to-glow, floating motifs) */}
      <HeroVectorMotifs />

      <div className="relative max-w-[1240px] mx-auto px-2 sm:px-6 text-center flex flex-col items-center z-10 w-full">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-butter-cream/15 border border-butter-cream/30 text-butter-cream text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-5 sm:mb-6 hover:bg-butter-cream/25 hover:border-butter-cream/60 hover:shadow-[0_0_20px_rgba(255,240,179,0.35)] hover:scale-105 transition-all duration-300 cursor-default max-w-full">
          <Sparkles className="w-3.5 h-3.5 fill-butter-cream animate-pulse shrink-0" />
          <span className="truncate">The AI Sponsorship OS for College Fests & Hackathons</span>
        </div>

        {/* Display Headline in Fraunces */}
        <h1 className="display-font text-3xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.12] sm:leading-[1.08] font-black text-butter-cream max-w-4xl tracking-tight mb-4 sm:mb-6">
          Find, research and win event sponsors — with AI that asks before it sends.
        </h1>

        {/* Subline */}
        <p className="text-sm sm:text-base md:text-xl text-text-onDarkSub max-w-2xl font-normal leading-relaxed mb-8 sm:mb-10 px-2">
          Built for student organizers, fest conveners, and club leads. SponFy finds high-fit companies, cites verified sources, drafts tailored pitches, and waits for your nod.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 z-10 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/app" className="w-full sm:w-auto">
            <Button
              variant="butter"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base font-bold shadow-xl hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,240,179,0.45)] transition-all duration-300 group justify-center"
            >
              Start a campaign free
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/workflow" className="w-full sm:w-auto">
            <Button
              variant="hero-ghost"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base font-semibold hover:scale-105 hover:bg-butter-cream/20 hover:border-butter-cream hover:shadow-md transition-all duration-300 justify-center"
            >
              See how it works
            </Button>
          </Link>
        </div>

        {/* Overlapping Product Preview UI Card — 3D Parallax Tilt Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: tilt.active
              ? `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.018, 1.018, 1.018)`
              : "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: tilt.active
              ? "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)"
              : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
          className="w-full max-w-5xl bg-butter-panel text-green-dark rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-hero-card border-2 border-butter-cream/65 relative z-20 text-left transition-shadow duration-300 hover:border-butter-cream hover:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.65)] will-change-transform group/parallax cursor-default"
        >
          {/* Dynamic Glare Light Reflection following cursor */}
          <div
            className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none transition-opacity duration-300 z-30 overflow-hidden"
            style={{
              opacity: tilt.active ? 0.35 : 0,
              background: `radial-gradient(circle 500px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 240, 179, 0.5) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 65%)`,
            }}
          />
          {/* Card Topbar Mock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-0 border-b border-green-dark/10 pb-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-400" />
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-400" />
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-text-dim ml-1 sm:ml-2 uppercase tracking-wider">
                Campaign Pipeline — Example Preview
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-green-dark/5 text-[11px] sm:text-xs font-semibold text-green-dark border border-green-dark/10 self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Human Approval Required
            </div>
          </div>

          {/* Inner Grid Preview: Left Kanban Card + Right "Why 86?" Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start" style={{ transformStyle: "preserve-3d" }}>
            {/* Left Sponsor Dossier Preview */}
            <div
              style={{ transform: "translateZ(20px)" }}
              className="md:col-span-7 bg-white rounded-xl p-5 border border-green-dark/12 shadow-sm space-y-4 hover:border-green-dark/30 hover:shadow-md transition-all duration-200 group/card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-butter-warm flex items-center justify-center font-bold text-green-dark text-lg border border-green-dark/10 group-hover/card:scale-105 group-hover/card:rotate-2 transition-transform duration-200">
                    <Building2 className="w-6 h-6 text-green-dark" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-green-dark group-hover/card:text-green-mid transition-colors">Acme Cloud</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300 hover:scale-105 transition-transform cursor-default">
                        Interested
                      </span>
                    </div>
                    <p className="text-xs text-text-dim">Cloud Platform & Developer APIs</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-text-muted">Target Tier</span>
                  <p className="font-mono text-base font-extrabold text-green-dark">Gold Tier</p>
                </div>
              </div>

              <div className="p-3 bg-butter-bg/80 rounded-lg text-xs space-y-1.5 border border-green-dark/5 hover:border-green-dark/15 transition-colors">
                <div className="flex items-center justify-between text-text-dim font-medium">
                  <span>Verified Contact:</span>
                  <span className="font-semibold text-green-dark flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-green-600" /> Campus DevRel Lead
                  </span>
                </div>
                <div className="flex items-center justify-between text-text-dim font-medium">
                  <span>Angle:</span>
                  <span className="text-green-dark font-semibold">Cloud API Challenge Track</span>
                </div>
                <div className="flex items-center justify-between text-text-dim font-medium">
                  <span>Cited Source:</span>
                  <a
                    href="https://example.com/student-program"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline flex items-center gap-1 hover:text-blue-900 group/link"
                  >
                    example.com/student-program <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Draft Preview Bar */}
              <div className="bg-green-dark text-butter-cream p-3 rounded-lg flex items-center justify-between text-xs font-medium hover:bg-green-mid transition-colors shadow-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-butter-gold animate-pulse" />
                  <span>Example Draft: High Quality Score</span>
                </div>
                <span className="bg-butter-cream text-green-dark px-2.5 py-0.5 rounded-full font-bold text-[11px] hover:bg-butter-gold hover:scale-105 transition-all cursor-pointer shadow-sm">
                  Review & Approve
                </span>
              </div>
            </div>

            {/* Right Fit Score Breakdown ("Why 94?") */}
            <div
              style={{ transform: "translateZ(20px)" }}
              className="md:col-span-5 bg-white rounded-xl p-5 border border-green-dark/12 shadow-sm space-y-3 hover:border-green-dark/30 hover:shadow-md transition-all duration-200 group/score"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    AI Fit Score (Example)
                  </span>
                  <h4 className="font-heading font-extrabold text-2xl text-green-dark flex items-baseline gap-1 group-hover/score:text-green-mid transition-colors">
                    94 <span className="text-xs font-semibold text-text-muted">/ 100</span>
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 group-hover/score:scale-110 group-hover/score:bg-green-200 transition-all duration-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs font-bold text-green-dark pb-1 border-b border-green-dark/10">
                Why this scored 94 (Example):
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-green-800 p-1 rounded hover:bg-green-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-bold">+20 pts:</span> High industry synergy with student builder tracks.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-green-800 p-1 rounded hover:bg-green-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-bold">+15 pts:</span> Active campus developer grants and student programs.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-green-800 p-1 rounded hover:bg-green-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-bold">+15 pts:</span> Established history of hackathon track sponsorships.
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
