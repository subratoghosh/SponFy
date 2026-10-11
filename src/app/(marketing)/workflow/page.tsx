import React from "react";
import { WorkflowStory } from "@/components/landing/WorkflowStory";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
  title: "Workflow Engine | SponFy",
  description: "From campus pitch to signed check in 5 disciplined steps with AI that asks before it sends.",
};

export default function WorkflowPage() {
  return (
    <div className="flex flex-col pt-16 md:pt-20">
      {/* Main Interactive Workflow Story Component */}
      <WorkflowStory />

      {/* Deep-Dive Architectural Highlights */}
      <section className="py-20 bg-butter-bg border-t border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="display-font text-3xl sm:text-4xl font-extrabold text-green-dark tracking-tight mb-4">
              Why student organizers raise 3x more with SponFy
            </h2>
            <p className="text-text-dim text-sm sm:text-base leading-relaxed">
              Traditional fest sponsorship is messy spreadsheets, unverified contact emails, and awkward cold follow-ups. SponFy brings institutional rigor to student fests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card-interactive p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-butter-cream/60 flex items-center justify-center text-green-dark mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark mb-3">
                  Zero Cold Email Blank Pages
                </h3>
                <p className="text-text-dim text-sm leading-relaxed mb-6">
                  SponFy cross-references your fest prospectus with real company CSR initiatives, student hiring goals, and developer relations programs to draft hyper-relevant pitches.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-text-muted border-t border-green-dark/8 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                  <span>Cited web evidence for every fit claim</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                  <span>Custom tones from formal CSR to devrel casual</span>
                </li>
              </ul>
            </div>

            <div className="feature-card-interactive p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-hero/10 flex items-center justify-center text-green-hero mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark mb-3">
                  Human Sign-Off Gate
                </h3>
                <p className="text-text-dim text-sm leading-relaxed mb-6">
                  Unlike reckless spam bots, SponFy puts the convener in full command. No email leaves your college club's domain without an organizer explicitly pressing &ldquo;Approve&rdquo;.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-text-muted border-t border-green-dark/8 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                  <span>Full one-click edit before dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                  <span>Strict Do Not Contact (DNC) safeguard list</span>
                </li>
              </ul>
            </div>

            <div className="feature-card-interactive p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-butter-gold/40 flex items-center justify-center text-green-dark mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark mb-3">
                  Intent-Aware Replies
                </h3>
                <p className="text-text-dim text-sm leading-relaxed mb-6">
                  When a brand VP replies &ldquo;Can you share past footfall numbers?&rdquo;, SponFy highlights the objection and suggests verified prospectus replies in seconds.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-text-muted border-t border-green-dark/8 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                  <span>Automatic sentiment & objection breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-accent shrink-0" />
                  <span>Meeting link & term sheet tracker</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
