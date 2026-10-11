import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Send,
  Inbox,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const ApprovalPreview: React.FC = () => {
  return (
    <section id="intelligence" className="py-24 bg-butter-panel border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted bg-butter-warm px-3.5 py-1.5 rounded-full border border-green-dark/10">
            Human-in-the-Loop Safeguards
          </span>
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mt-3 mb-4">
            AI that drafts with perfection, but never sends without your say
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Compare the Outreach Approval Gate and the Inbound Reply Intelligence panel side-by-side.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Outreach Approval Gate */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/15 shadow-md flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl hover:border-green-dark/30 transition-all duration-300 group/gate">
            <div>
              <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-butter-cream flex items-center justify-center text-green-dark group-hover/gate:scale-110 group-hover/gate:rotate-6 group-hover/gate:bg-butter-gold group-hover/gate:shadow-[0_0_12px_rgba(254,231,144,0.6)] transition-all duration-300">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-green-dark group-hover/gate:text-green-mid transition-colors">
                      Outreach Approval Gate
                    </h3>
                    <p className="text-xs text-text-dim">Company: Acme Cloud (Campus DevRel)</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:scale-105 transition-transform cursor-default">
                  Awaiting Approval
                </span>
              </div>

              {/* Safety Checklist */}
              <div className="bg-butter-bg p-4 rounded-xl border border-green-dark/10 space-y-2 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-dim block mb-1">
                  Automated Safety Checklist:
                </span>
                <div className="flex items-center gap-2 text-xs text-green-900 p-1 rounded hover:bg-white/80 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Public contact email verified on official website</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-900 p-1 rounded hover:bg-white/80 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Explicit sponsorship ask & deck link included</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-900 p-1 rounded hover:bg-white/80 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Suppression check passed (Zero previous unsubscribes)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-900 p-1 rounded hover:bg-white/80 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Daily send limit status: 12 / 30 sends remaining</span>
                </div>
              </div>

              {/* Email Body Snippet */}
              <div className="p-4 bg-white rounded-xl border border-green-dark/12 text-xs text-text-dim space-y-2 italic hover:border-green-dark/25 transition-colors">
                <p>
                  "Given Acme Cloud's active commitment to student developers, we would love to invite your team as a Gold Tier track partner for our upcoming hackathon..."
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-green-dark/10 mt-6 flex items-center justify-between">
              <span className="text-xs text-text-muted">Requires 1-click organizer confirmation</span>
              <Link href="/app/outreach">
                <Button variant="butter" size="sm" className="font-bold shadow-md hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,240,179,0.4)] transition-all duration-200 group/btn">
                  Review & Approve Send <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Reply Intelligence View */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/15 shadow-md flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl hover:border-green-dark/30 transition-all duration-300 group/reply">
            <div>
              <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 group-hover/reply:scale-110 group-hover/reply:rotate-6 group-hover/reply:bg-green-200 transition-all duration-300">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-green-dark group-hover/reply:text-green-mid transition-colors">
                      Gemini Reply Intelligence
                    </h3>
                    <p className="text-xs text-text-dim">Thread: Orbit Payments Track Sponsorship Counter-Offer</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:scale-105 transition-transform cursor-default">
                  Negotiating
                </span>
              </div>

              {/* Analysis Summary */}
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-butter-panel rounded-xl border border-green-dark/10 space-y-2 hover:border-green-dark/25 transition-colors">
                  <span className="font-bold text-green-dark block">AI Summary & Intent Extraction:</span>
                  <p className="text-text-dim leading-relaxed">
                    Sponsor agreed to challenge track and mentor jury seat with adjusted tier allocation. Requested event invoice and registration details for processing.
                  </p>
                </div>

                <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 text-green-950 font-medium space-y-1 hover:border-green-400 hover:shadow-xs transition-all">
                  <span className="font-bold text-green-900 block text-[11px] uppercase tracking-wider">
                    Recommended Next Action:
                  </span>
                  <p className="text-xs">
                    Confirm track terms, send organizer invoice details, and schedule an onboarding touchpoint.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-green-dark/10 mt-6 flex items-center justify-between">
              <span className="text-xs text-text-muted">94% Intent Confidence</span>
              <Link href="/app/replies">
                <Button variant="green" size="sm" className="font-bold shadow-md hover:scale-105 hover:shadow-[0_8px_20px_rgba(12,56,46,0.25)] transition-all duration-200 group/btn">
                  Open Inbound Thread <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
