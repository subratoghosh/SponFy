"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
  TrendingUp,
  Building2,
  UserCheck,
  Mail,
  Check,
  Send,
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
    <section id="hero" className="relative min-h-[100dvh] flex flex-col justify-center items-center pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-32 md:pb-24 bg-green-hero text-text-onDark overflow-hidden rounded-b-[28px] sm:rounded-b-[36px] shadow-2xl px-3 sm:px-6">
      {/* Background Organic Butter Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-butter-cream/10 blur-3xl pointer-events-none blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-green-light/20 blur-3xl pointer-events-none" />
      
      {/* Interactive Background Vector Images (Hover-to-glow, floating motifs) */}
      <HeroVectorMotifs />

      <div className="relative max-w-[1240px] mx-auto px-2 sm:px-6 text-center flex flex-col items-center z-10 w-full pt-4">
        {/* Display Headline in Fraunces */}
        <h1 className="display-font text-3xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.12] sm:leading-[1.08] font-black text-butter-cream max-w-4xl tracking-tight mb-4 sm:mb-6">
          Find, research and win event sponsors — with AI that asks before it sends.
        </h1>

        {/* Subline */}
        <p className="text-sm sm:text-base md:text-xl text-text-onDarkSub max-w-2xl font-normal leading-relaxed mb-8 sm:mb-10 px-2">
          Built for organizers, campaign leaders, and team leads. SponFy finds high-fit companies, cites verified sources, drafts tailored pitches, and waits for your nod.
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
              <div className="flex items-center gap-2 ml-1 sm:ml-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-black text-green-dark uppercase tracking-wider">
                  Live Sponsor Acquisition Engine
                </span>
                <span className="text-[11px] text-text-dim hidden sm:inline">&bull; DevPulse Conclave 2026</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[11px] sm:text-xs font-bold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>₹4,50,000 / ₹6,00,000 Secured (75%)</span>
              </div>
              <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-dark/5 text-[11px] font-semibold text-green-dark border border-green-dark/10">
                <span>99.4% Inbox Placement</span>
              </div>
            </div>
          </div>

          {/* Inner Grid Preview: Left Live Sponsor Radar + Right Deliverability & Match Score */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start" style={{ transformStyle: "preserve-3d" }}>
            {/* Left Sponsor Deal Pipeline */}
            <div
              style={{ transform: "translateZ(20px)" }}
              className="md:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-green-dark/12 shadow-sm space-y-3.5 hover:border-green-dark/30 hover:shadow-md transition-all duration-200 group/card"
            >
              <div className="flex items-center justify-between pb-2 border-b border-green-dark/10">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-green-dark">
                    Active Sponsor Pipeline & Verified Contacts
                  </h4>
                  <p className="text-[11px] text-text-dim">38 verified tech brands matched to campaign tier packages</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  3 Active Deals
                </span>
              </div>

              {/* Sponsor 1: Postman */}
              <div className="p-3 bg-butter-bg/50 hover:bg-butter-bg rounded-xl border border-green-dark/8 transition-colors space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 font-black text-xs flex items-center justify-center">
                      P
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-green-dark">Postman</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          96% Fit
                        </span>
                      </div>
                      <p className="text-[11px] text-text-dim">Title Partner &bull; ₹2,00,000 Target</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Draft Ready
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-dim font-medium pt-1 border-t border-green-dark/5">
                  <span className="flex items-center gap-1 text-green-dark font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Ananya R. (Head of Campus DevRel)
                  </span>
                  <span className="text-text-muted">API Challenge Track</span>
                </div>
              </div>

              {/* Sponsor 2: Razorpay */}
              <div className="p-3 bg-butter-bg/50 hover:bg-butter-bg rounded-xl border border-green-dark/8 transition-colors space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 font-black text-xs flex items-center justify-center">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-green-dark">Razorpay</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          94% Fit
                        </span>
                      </div>
                      <p className="text-[11px] text-text-dim">Track Partner &bull; ₹1,50,000 Target</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    Dispatched via Gmail
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-dim font-medium pt-1 border-t border-green-dark/5">
                  <span className="flex items-center gap-1 text-green-dark font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Vikram S. (Campus Programs)
                  </span>
                  <span className="text-text-muted">Fintech Innovation Bounty</span>
                </div>
              </div>

              {/* Sponsor 3: GitHub */}
              <div className="p-3 bg-butter-bg/50 hover:bg-butter-bg rounded-xl border border-green-dark/8 transition-colors space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900/10 border border-slate-900/20 text-slate-900 font-black text-xs flex items-center justify-center">
                      G
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-green-dark">GitHub</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          98% Fit
                        </span>
                      </div>
                      <p className="text-[11px] text-text-dim">Challenge Sponsor &bull; ₹1,00,000 Target</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Replied: Interested
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-dim font-medium pt-1 border-t border-green-dark/5">
                  <span className="flex items-center gap-1 text-green-dark font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Global Education Partner
                  </span>
                  <span className="text-text-muted">Student Developer Pack</span>
                </div>
              </div>

              {/* Draft & Dispatch Action Ribbon */}
              <div className="bg-green-dark text-butter-cream p-3 rounded-xl flex items-center justify-between text-xs font-medium shadow-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-butter-gold shrink-0 animate-pulse" />
                  <span className="text-[11px] sm:text-xs">Human Approval Gate: Verified 0% Spam Penalty</span>
                </div>
                <span className="bg-butter-cream text-green-dark px-3 py-1 rounded-full font-bold text-[11px] hover:bg-butter-gold hover:scale-105 transition-all cursor-pointer shadow-sm shrink-0">
                  Approve & Dispatch
                </span>
              </div>
            </div>

            {/* Right Fit Score & Deliverability Shield */}
            <div
              style={{ transform: "translateZ(20px)" }}
              className="md:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-green-dark/12 shadow-sm space-y-4 hover:border-green-dark/30 hover:shadow-md transition-all duration-200 group/score"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Match Precision Score
                  </span>
                  <h4 className="font-heading font-extrabold text-3xl text-green-dark flex items-baseline gap-1 group-hover/score:text-green-mid transition-colors">
                    96 <span className="text-xs font-semibold text-text-muted">/ 100</span>
                  </h4>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover/score:scale-110 group-hover/score:bg-emerald-200 transition-all duration-200">
                  <TrendingUp className="w-6 h-6 text-emerald-700" />
                </div>
              </div>

              {/* Deliverability Health Card */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Deliverability Shield
                  </span>
                  <span className="text-emerald-700 font-extrabold">99.4% Safe</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  Corporate mailboxes audited. ZeroBounce handshake passed with 0% bounce risk.
                </p>
              </div>

              {/* Automated Safety & Fit Criteria */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-green-dark pb-1 border-b border-green-dark/10">
                  Automated Pre-Send Audit:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-green-900 p-2 rounded-lg bg-butter-bg/40">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-green-dark">Audience Affinity:</span> 1,200 student developers match hiring and API adoption profile.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-green-900 p-2 rounded-lg bg-butter-bg/40">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-green-dark">Direct Decision Maker:</span> Verified DevRel contact with authenticated public source link.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-green-900 p-2 rounded-lg bg-butter-bg/40">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-green-dark">Budget Readiness:</span> Active sponsor of 4+ hackathons in current fiscal quarter.
                    </div>
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
