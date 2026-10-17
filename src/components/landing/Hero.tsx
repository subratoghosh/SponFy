"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Send,
  Zap,
  Target,
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

    const rotateX = -((y - centerY) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;
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
    <section
      id="hero"
      className="relative min-h-[100svh] lg:h-[100vh] flex flex-col justify-start lg:justify-center items-center pt-28 pb-12 sm:pt-32 sm:pb-14 lg:pt-28 lg:pb-12 bg-green-hero text-text-onDark overflow-hidden rounded-b-[28px] sm:rounded-b-[36px] shadow-2xl px-4 sm:px-8"
    >
      {/* Background Organic Butter Blobs from origin/main */}
      <div className="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-butter-cream/10 blur-3xl pointer-events-none blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-green-light/20 blur-3xl pointer-events-none" />

      {/* Interactive Background Vector Images (Hover-to-glow, floating motifs from origin/main) */}
      <HeroVectorMotifs />

      {/* Main Container: 2-column layout (Text on the left, Sleek Interactive Card on the right) */}
      <div className="relative max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center z-10 lg:flex-1 lg:my-auto">

        {/* LEFT COLUMN: Left-Aligned Editorial Typography + Paper Plane + 2 Buttons */}
        <div className="lg:col-span-7 flex flex-col items-start text-left pr-0 lg:pr-6">

          {/* Headline in exact slab-serif font style from video reference */}
          <div className="relative mb-5 sm:mb-8 w-full">
            <h1 className="font-slab text-[2.75rem] sm:text-7xl lg:text-[88px] leading-[1.04] font-light text-butter-cream tracking-tight">
              <span>Outreach</span>
              <br />
              <span className="relative inline-block text-butter-cream font-light">
                worth sending

                {/* 
                  Paper Plane flight path from hero_design.mp4 & origami styling from plan_anm.mp4
                */}
                <span className="absolute top-1 left-[140px] sm:left-[215px] pointer-events-none select-none animate-plane-hero-loop z-20">
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 68 68"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
                  >
                    {/* Top Main Wing */}
                    <path
                      d="M6 32 L58 7 L28 60 L24 40 Z"
                      fill="#FFFBF0"
                      stroke="#0C382E"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Right Wing fold */}
                    <path
                      d="M58 7 L24 40 L28 60 Z"
                      fill="#FEE790"
                      stroke="#0C382E"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Bottom body crease shadow */}
                    <path
                      d="M24 40 L34 46 L28 60 Z"
                      fill="#D4BC74"
                    />
                    {/* Wing fold center crease */}
                    <path
                      d="M6 32 L58 7 L24 40 Z"
                      fill="#FFFFFF"
                      fillOpacity="0.4"
                    />
                  </svg>
                </span>
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-text-onDarkSub/90 max-w-xl font-normal leading-relaxed mb-6 sm:mb-8">
            Find, research and win sponsors for campaigns, conferences, and student events — with AI that asks before it sends.
          </p>

          {/* Action Buttons: 2 buttons beneath */}
          <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full sm:w-auto">
            <Link href="/app" className="w-full sm:w-auto">
              <Button
                variant="butter"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base font-bold shadow-xl hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,240,179,0.45)] transition-all duration-300 group justify-center rounded-full px-8 py-6"
              >
                Start a campaign free
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/workflow" className="w-full sm:w-auto">
              <Button
                variant="hero-ghost"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base font-semibold hover:scale-105 hover:bg-butter-cream/20 hover:border-butter-cream hover:shadow-md transition-all duration-300 justify-center rounded-full px-8 py-6 border border-butter-cream/40"
              >
                See how it works
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Sleek Glass 3D Live Pipeline Radar Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full pt-2 lg:pt-0">

          {/* Subtle Ambient Backing Glow */}
          <div className="absolute inset-0 bg-gradient-to-l from-butter-cream/15 via-butter-gold/10 to-transparent blur-[100px] pointer-events-none rounded-3xl" />

          {/* 3D Tilt Card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: tilt.active
                ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
                : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
              transition: tilt.active
                ? "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)"
                : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
              transformStyle: "preserve-3d",
            }}
            className="w-full max-w-lg bg-butter-panel text-green-dark rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-2 border-butter-cream/70 relative z-20 text-left cursor-default group"
          >
            {/* Dynamic Glare Light Reflection following cursor */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 z-30 overflow-hidden"
              style={{
                opacity: tilt.active ? 0.35 : 0,
                background: `radial-gradient(circle 400px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 240, 179, 0.6) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 65%)`,
              }}
            />

            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-green-dark/10 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-dim ml-2">Core Outreach Safeguards</span>
              </div>

            </div>

            {/* Core Features Showcase Rows */}
            <div className="space-y-3">
              {/* Feature 1: Reduced Spam Protection */}
              <div className="p-3 bg-butter-bg/60 hover:bg-butter-bg rounded-xl border border-green-dark/8 transition-colors space-y-1.5">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-green-dark">Reduced Spam Protection</span>
                      </div>
                      <p className="text-[11px] text-text-dim">Domain hygiene, SPF/DKIM verification & warm-up pacing</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
                    Inbox Safe
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-dim pt-1 border-t border-green-dark/5">
                  <span className="flex items-center gap-1 text-green-dark font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Spam Trap Avoidance: 100% Clean
                  </span>

                </div>
              </div>

              {/* Feature 2: Precision Relevance Scoring */}
              <div className="p-3 bg-butter-bg/60 hover:bg-butter-bg rounded-xl border border-green-dark/8 transition-colors space-y-1.5">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-green-dark">Precision Relevance Scoring</span>
                      </div>
                      <p className="text-[11px] text-text-dim">Multi-signal sponsor matching & audience affinity indexing</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                    High Affinity
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-dim pt-1 border-t border-green-dark/5">
                  <span className="flex items-center gap-1 text-green-dark font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> Live Brand Budget Cycle Detected
                  </span>
                </div>
              </div>

              {/* Feature 3: Human Approval Gate */}
              <div className="p-3 bg-butter-bg/60 hover:bg-butter-bg rounded-xl border border-green-dark/8 transition-colors space-y-1.5">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-green-dark">Human Approval Gate</span>
                      </div>
                      <p className="text-[11px] text-text-dim">AI drafts tailored tier proposals — sent only after your 1-click review</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
                    You Control
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-dim pt-1 border-t border-green-dark/5">
                  <span className="flex items-center gap-1 text-green-dark font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Always In Control: Zero Unapproved Sends
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
