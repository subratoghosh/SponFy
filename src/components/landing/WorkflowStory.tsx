"use client";

import React, { useState } from "react";
import {
  Compass,
  Search,
  CheckCircle2,
  Send,
  Inbox,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const WorkflowStory: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      title: "Natural Sponsor Discovery",
      shortDesc: "Tell SponFy about your event in plain English. AI hunts companies with active developer or campus budgets.",
      details: "No generic scrapers. SponFy looks for tech brands currently funding hackathon challenge tracks and developer communities.",
      icon: Search,
      uiType: "discover",
    },
    {
      step: "02",
      title: "Cited Multi-Source Research",
      shortDesc: "Gathers company products, campus programs, past hackathon sponsorships, and verified contact pages.",
      details: "Every fact extracted by Tavily + Gemini stores its source URL so your team never pitches based on hallucinated data.",
      icon: Compass,
      uiType: "research",
    },
    {
      step: "03",
      title: "Explainable 7-Factor Fit Scoring",
      shortDesc: "Calculates an honest 0–100 relevance score with exact positive and negative factor breakdowns.",
      details: "Shows you 'Why 86' with weighted points for audience overlap, student programs, and tier capability.",
      icon: TrendingUp,
      uiType: "score",
    },
    {
      step: "04",
      title: "Human-Approved Personalization",
      shortDesc: "Drafts high-converting, non-cliché emails with safety checks. Waits for your click before sending via Gmail.",
      details: "Enforces 4 safety gates: verified contact status, explicit sponsorship ask, suppression list check, and daily send cap.",
      icon: Send,
      uiType: "outreach",
    },
    {
      step: "05",
      title: "Reply Intelligence & Follow-ups",
      shortDesc: "Monitors Gmail threads, classifies sponsor intent (Interested, Negotiating, etc.), and runs smart follow-ups.",
      details: "Extracts questions asked by sponsors, recommends your exact next reply action, and halts follow-ups if not interested.",
      icon: Inbox,
      uiType: "replies",
    },
  ];

  return (
    <section id="workflow" className="py-24 bg-butter-bg relative">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="heading-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-dark mb-4">
            How SponFy closes your sponsorship target in 5 steps
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Automating the repetitive manual work while putting student leaders firmly in control of every critical decision.
          </p>
        </div>

        {/* Step Selector Pills & Live Interactive Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Step Cards */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-4 group",
                  activeStep === idx
                    ? "bg-white border-green-dark shadow-md scale-[1.02]"
                    : "bg-white/60 border-green-dark/10 hover:bg-white hover:border-green-dark/30 hover:translate-x-1.5 hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm transition-all group-hover:scale-105",
                    activeStep === idx
                      ? "bg-green-dark text-butter-cream"
                      : "bg-butter-warm text-text-dim group-hover:bg-butter-gold"
                  )}
                >
                  {s.step}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-green-dark mb-1 group-hover:text-green-mid transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-text-dim leading-relaxed">
                    {s.shortDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Live Step Simulation Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-green-dark/15 shadow-xl min-h-[420px] flex flex-col justify-between hover:shadow-2xl hover:border-green-dark/30 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-green-dark uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-green-mid" />
                  Step {steps[activeStep].step} — {steps[activeStep].title}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-butter-cream text-green-dark hover:scale-105 transition-transform cursor-default">
                  Interactive preview
                </span>
              </div>

              {/* Dynamic Step Previews */}
              {activeStep === 0 && (
                <div className="space-y-4 text-xs animate-fade-in">
                  <div className="p-4 bg-butter-panel rounded-xl border border-green-dark/15 font-mono text-green-dark hover:border-green-dark/30 transition-colors">
                    "Find cloud and developer-tool companies sponsoring hackathons and tech events"
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between border border-green-200 hover:bg-green-100 hover:scale-[1.01] transition-all cursor-pointer">
                      <span className="font-bold text-green-900">Acme Cloud — Cloud & DevTools</span>
                      <span className="font-mono text-green-700 font-bold">Fit: 94%</span>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between border border-green-200 hover:bg-green-100 hover:scale-[1.01] transition-all cursor-pointer">
                      <span className="font-bold text-green-900">Nimbus APIs — Developer Platform</span>
                      <span className="font-mono text-green-700 font-bold">Fit: 98%</span>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between border border-green-200 hover:bg-green-100 hover:scale-[1.01] transition-all cursor-pointer">
                      <span className="font-bold text-green-900">Orbit Payments — Payment Infrastructure</span>
                      <span className="font-mono text-green-700 font-bold">Fit: 88%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-3 text-xs animate-fade-in">
                  <div className="p-4 bg-butter-warm/60 rounded-xl border border-green-dark/10 space-y-2">
                    <p className="font-bold text-green-dark">Extracted Cited Facts:</p>
                    <ul className="space-y-1.5 text-text-dim">
                      <li>• <strong>Programs:</strong> Campus Developer Grants and Student Workshops</li>
                      <li>• <strong>Track Budget:</strong> Gold Tier challenge sponsor history</li>
                      <li>• <strong>Contact:</strong> DevRel Lead (Campus Partnerships)</li>
                      <li>• <strong>Source:</strong> <span className="text-blue-700 underline">https://example.com/developer-program</span></li>
                    </ul>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 text-xs animate-fade-in">
                  <div className="p-4 bg-white rounded-xl border border-green-dark/15 space-y-2.5">
                    <div className="flex items-center justify-between font-bold text-green-dark text-sm">
                      <span>Overall Match Score:</span>
                      <span className="text-green-700 text-lg">88 / 100</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-green-800">
                        <span>+20 Industry Relevance</span>
                        <span className="font-bold">20/20</span>
                      </div>
                      <div className="flex justify-between text-green-800">
                        <span>+18 Audience Overlap</span>
                        <span className="font-bold">18/20</span>
                      </div>
                      <div className="flex justify-between text-green-800">
                        <span>+15 Product Track Synergy</span>
                        <span className="font-bold">15/15</span>
                      </div>
                      <div className="flex justify-between text-amber-700">
                        <span>-5 Regional Hub alignment</span>
                        <span className="font-bold">0/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3 text-xs animate-fade-in">
                  <div className="p-4 bg-butter-panel rounded-xl border border-green-dark/15 space-y-2">
                    <div className="flex items-center justify-between border-b border-green-dark/10 pb-2">
                      <span className="font-bold text-green-dark">Subject: Partnering with Acme Cloud for our upcoming hackathon</span>
                      <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">95% Quality</span>
                    </div>
                    <p className="text-text-dim italic leading-relaxed">
                      "Hi there, following Acme Cloud's recent campus developer initiatives, we would love to invite your team as a challenge track partner for our upcoming student hackathon..."
                    </p>
                    <div className="p-2 bg-green-dark/5 rounded border border-green-dark/10 text-[11px] font-semibold text-green-dark flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      Safety Checklist Passed: Recipient Verified • Not Suppressed • Within Daily Limit
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-3 text-xs animate-fade-in">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-900">Inbound Reply from Acme Cloud (Campus DevRel)</span>
                      <span className="px-2 py-0.5 rounded bg-green-600 text-white font-bold text-[10px]">Interested</span>
                    </div>
                    <p className="text-green-800 text-[11px]">
                      "We are definitely interested in discussing the Gold Tier track partnership. Let's set up a quick call this week to review the deck..."
                    </p>
                    <div className="pt-2 border-t border-green-200 flex items-center justify-between text-green-950 font-semibold">
                      <span>Recommended Action:</span>
                      <span className="bg-green-dark text-butter-cream px-3 py-1 rounded-md text-[11px]">
                        Schedule Meet & Attach Brochure
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-green-dark/10 flex items-center justify-between">
              <p className="text-xs text-text-muted">
                {steps[activeStep].details}
              </p>
              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark hover:text-green-mid hover:translate-x-1 transition-all group/btn"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
