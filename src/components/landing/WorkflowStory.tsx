"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Compass,
  TrendingUp,
  FileEdit,
  Send,
  Inbox,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Check,
  Building2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowNode {
  step: string;
  title: string;
  shortDesc: string;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
  previewType: "discover" | "research" | "fitScore" | "personalise" | "approve" | "replies";
}

const WORKFLOW_STEPS: WorkflowNode[] = [
  {
    step: "01",
    title: "Discover",
    shortDesc: "Natural Sponsor Discovery",
    details: "Describe your event in plain English. SponFy hunts tech and developer companies with active campus budgets.",
    icon: Search,
    previewType: "discover",
  },
  {
    step: "02",
    title: "Research",
    shortDesc: "Cited Multi-Source Research",
    details: "Extracts company developer tracks, campus initiatives, and public decision-maker contact pages with cited sources.",
    icon: Compass,
    previewType: "research",
  },
  {
    step: "03",
    title: "Fit Score",
    shortDesc: "Explainable 7-Factor Fit Scoring",
    details: "Calculates an honest 0–100 relevance score with exact positive and negative factor breakdowns.",
    icon: TrendingUp,
    previewType: "fitScore",
  },
  {
    step: "04",
    title: "Personalise",
    shortDesc: "Contextual Email Personalization",
    details: "Drafts high-converting, non-cliché emails referencing the company's actual sponsorship and partner initiatives.",
    icon: FileEdit,
    previewType: "personalise",
  },
  {
    step: "05",
    title: "Approve & Send",
    shortDesc: "Human Approval & Safe Sending",
    details: "Enforces 4 strict safety gates. No emails leave without your explicit click via your connected Gmail account.",
    icon: Send,
    previewType: "approve",
  },
  {
    step: "06",
    title: "Understand Replies",
    shortDesc: "Reply Intelligence & Smart Follow-ups",
    details: "Monitors Gmail threads, classifies sponsor intent (Interested, Negotiating, etc.), and runs smart follow-ups.",
    icon: Inbox,
    previewType: "replies",
  },
];

export const WorkflowStory: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="workflow"
      ref={containerRef}
      className="py-24 bg-butter-bg border-b border-green-dark/10 relative overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-butter-warm px-3.5 py-1.5 rounded-full border border-green-dark/10">
            Disciplined Sponsorship Workflow
          </span>
          <h2 className="heading-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-dark mt-3 mb-4 tracking-tight">
            Steps to find sponsorship — from prospectus to closed partner
          </h2>
          <p className="text-sm sm:text-base text-text-dim leading-relaxed">
            A single, continuous visual flow designed for organizers and campaign leaders. Every action is verified, cited, and human-approved.
          </p>
        </div>


        {/* Connected Visual Flow (Nodes joined by SVG connector line) */}
        <div className="relative">
          {/* Desktop Curved Connector SVG Path */}
          <div className="hidden lg:block absolute left-0 right-0 top-[48px] h-1 pointer-events-none z-0">
            <svg
              className="w-full h-8 overflow-visible"
              viewBox="0 0 1200 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Background static connecting line */}
              <path
                d="M 60 16 C 250 16, 350 16, 540 16 C 730 16, 830 16, 1140 16"
                stroke="rgba(12, 56, 46, 0.15)"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              {/* Highlight line based on activeStep */}
              <path
                d="M 60 16 C 250 16, 350 16, 540 16 C 730 16, 830 16, 1140 16"
                stroke="#0C382E"
                strokeWidth="3"
                strokeDasharray="1200"
                strokeDashoffset={1200 * (1 - (activeStep + 1) / WORKFLOW_STEPS.length)}
                className="transition-all duration-300"
              />
            </svg>
          </div>

          {/* Mobile & Tablet Vertical Connecting Line */}
          <div className="lg:hidden absolute left-7 sm:left-8 top-8 bottom-8 w-1 pointer-events-none z-0">
            <div className="w-0.5 h-full bg-green-dark/15 border-l-2 border-dashed border-green-dark/20 relative">
              <div
                className="w-1 bg-green-dark absolute top-0 left-[-1px] transition-all duration-300 rounded-full"
                style={{ height: `${((activeStep + 1) / WORKFLOW_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* The 6 Flow Nodes Grid / Vertical List */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 relative z-10">
            {WORKFLOW_STEPS.map((node, idx) => {
              const Icon = node.icon;
              const isPassed = activeStep >= idx;
              const isSelected = activeStep === idx;

              return (
                <div
                  key={node.step}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "flex lg:flex-col items-start gap-4 lg:gap-3 p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-300 cursor-pointer min-w-0 group",
                    isSelected
                      ? "border-green-dark shadow-hover ring-2 ring-green-dark/15 -translate-y-1"
                      : "border-green-dark/12 shadow-xs hover:border-green-dark/30 hover:shadow-sm"
                  )}
                >
                  {/* Numbered Node Pill & Icon with SVG joint */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-xs",
                        isSelected
                          ? "bg-green-dark text-butter-cream scale-110 rotate-3 shadow-md"
                          : isPassed
                          ? "bg-green-mid/20 text-green-dark border border-green-dark/20"
                          : "bg-butter-warm text-green-dark/60 border border-green-dark/10"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Node Header Content */}
                  <div className="min-w-0 flex-1 w-full">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-mono">
                        Step {node.step}
                      </span>
                      {isPassed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      )}
                    </div>
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-green-dark leading-snug group-hover:text-green-mid transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-text-dim mt-1 leading-relaxed line-clamp-2 lg:line-clamp-3">
                      {node.shortDesc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Mini-UI Component Previews (Built with real demo data, not screenshots) */}
        <div className="mt-12 bg-white rounded-3xl border border-green-dark/15 shadow-xl p-6 sm:p-8 lg:p-10 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-green-dark/10 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-text-muted uppercase">
                  ACTIVE PREVIEW · STEP {WORKFLOW_STEPS[activeStep].step}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-green-100 text-green-900 border border-green-300">
                  Live Component
                </span>
              </div>
              <h3 className="heading-font text-xl sm:text-2xl font-black text-green-dark mt-1">
                {WORKFLOW_STEPS[activeStep].shortDesc}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-dim max-w-md leading-relaxed">
              {WORKFLOW_STEPS[activeStep].details}
            </p>
          </div>

          {/* Dynamic Component Mini-UI Rendering */}
          <div className="min-w-0 animate-fade-in">
            {/* 1. DISCOVER MINI-UI */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-butter-warm/60 rounded-2xl border border-green-dark/10 flex items-center gap-3">
                  <Search className="w-4 h-4 text-green-dark shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-green-dark italic truncate">
                    &quot;Find cloud, developer tools, and fintech companies sponsoring tech events and campaigns in India&quot;
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: "Acme Cloud", track: "DevTools & APIs", fit: "94% Fit", badge: "Gold Tier" },
                    { name: "Nimbus APIs", track: "Developer Platform", fit: "98% Fit", badge: "Title Partner" },
                    { name: "Orbit Payments", track: "Fintech Sandbox", fit: "88% Fit", badge: "Track Sponsor" },
                  ].map((s) => (
                    <div key={s.name} className="p-3.5 rounded-xl border border-green-dark/10 bg-butter-panel flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-green-dark">{s.name}</div>
                        <div className="text-[10px] text-text-dim">{s.track}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800">
                          {s.fit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. RESEARCH MINI-UI */}
            {activeStep === 1 && (
              <div className="p-5 bg-butter-panel rounded-2xl border border-green-dark/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-dark">
                    <Building2 className="w-4 h-4 text-green-mid" />
                    <span>Nimbus APIs — Cited Research Evidence</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    2 Sources Verified
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-green-dark/10 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                    <ExternalLink className="w-3 h-3 text-green-mid" />
                    <span className="font-mono text-text-dim truncate">https://nimbus.dev/community/campus-grants-2026</span>
                  </div>
                  <blockquote className="text-text-main italic border-l-2 border-green-mid pl-2.5 my-1">
                    &quot;Nimbus APIs sponsors ₹75,000 for tech event partner tracks with API credits and mentorship.&quot;
                  </blockquote>
                </div>
              </div>
            )}

            {/* 3. FIT SCORE MINI-UI */}
            {activeStep === 2 && (
              <div className="p-5 bg-butter-panel rounded-2xl border border-green-dark/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-green-dark">Nimbus APIs Fit Score Breakdown</span>
                  <span className="stat-font font-black text-lg text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                    98 / 100
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-green-dark/8">
                    <span className="text-text-dim">Audience Overlap (CS Builders)</span>
                    <span className="font-bold text-emerald-700 font-mono">+25 / 25</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-green-dark/8">
                    <span className="text-text-dim">Active Campus Grant History</span>
                    <span className="font-bold text-emerald-700 font-mono">+25 / 25</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-green-dark/8">
                    <span className="text-text-dim">Regional Presence (India Devs)</span>
                    <span className="font-bold text-emerald-700 font-mono">+18 / 20</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-green-dark/8">
                    <span className="text-text-dim">Verified DevRel Contact Page</span>
                    <span className="font-bold text-emerald-700 font-mono">+15 / 15</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PERSONALISE MINI-UI */}
            {activeStep === 3 && (
              <div className="p-5 bg-butter-panel rounded-2xl border border-green-dark/10 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-green-dark/10 pb-2">
                  <span className="font-bold text-green-dark">Subject: Partnership: Nimbus APIs Developer Track at SponFy 2026</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-butter-cream text-green-dark border border-green-dark/15">
                    DevRel Technical Tone
                  </span>
                </div>
                <p className="text-xs text-text-dim leading-relaxed p-3 bg-white rounded-xl border border-green-dark/8 font-sans">
                  &quot;Hi Alex, I loved Nimbus APIs recent launch of developer partner programs. We are convening 600+ builders for SponFy Flagship Campaign 2026, and would love to propose a dedicated <strong>Nimbus Cloud Partner Track</strong> with sponsorship bounties...&quot;
                </p>
              </div>
            )}

            {/* 5. APPROVE & SEND MINI-UI */}
            {activeStep === 4 && (
              <div className="p-5 bg-butter-panel rounded-2xl border border-green-dark/10 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs sm:text-sm text-green-dark">4 of 4 Safety Gates Passed</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Awaiting Organizer Click
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-green-dark/8 flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Recipient Verified
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-green-dark/8 flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Explicit Ask Checked
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-green-dark/8 flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Blocklist Clear
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-green-dark/8 flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Send Cap OK
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF0B3] text-[#0C382E] font-bold text-xs border border-[#0C382E]/20 shadow-xs">
                    <Send className="w-3.5 h-3.5" /> Approve & Send via Gmail
                  </div>
                </div>
              </div>
            )}

            {/* 6. REPLIES MINI-UI */}
            {activeStep === 5 && (
              <div className="p-5 bg-butter-panel rounded-2xl border border-green-dark/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-green-mid" />
                    <span className="font-bold text-xs sm:text-sm text-green-dark">Inbound Reply: Nimbus APIs DevRel Team</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Interested (96% Confidence)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-green-dark/8 text-xs text-text-dim">
                  &quot;Thanks for reaching out! We are interested in funding the API track. Could you send over the attendee prospectus and invoice guidelines?&quot;
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">Suggested Action: Send prospectus & offer meeting link</span>
                  <span className="font-bold text-green-dark hover:underline cursor-pointer">Draft Reply →</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
