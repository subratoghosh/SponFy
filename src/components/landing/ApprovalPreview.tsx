import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Send,
  Sparkles,
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-butter-cream flex items-center justify-center text-green-dark">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-green-dark">
                      Outreach Approval Gate
                    </h3>
                    <p className="text-xs text-text-dim">Company: Postman (Ali Mustufa)</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Awaiting Approval
                </span>
              </div>

              {/* Safety Checklist */}
              <div className="bg-butter-bg p-4 rounded-xl border border-green-dark/10 space-y-2 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-dim block mb-1">
                  Automated Safety Checklist:
                </span>
                <div className="flex items-center gap-2 text-xs text-green-900">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Public contact email verified on official website</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-900">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Explicit sponsorship ask & deck link included</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-900">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Suppression check passed (Zero previous unsubscribes)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-900">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Daily send limit status: 12 / 30 sends remaining</span>
                </div>
              </div>

              {/* Email Body Snippet */}
              <div className="p-4 bg-white rounded-xl border border-green-dark/12 text-xs text-text-dim space-y-2 italic">
                <p>
                  "Given Postman's commitment to campus developer education, we would love to invite Postman as our Official API Partner (Gold Tier: ₹75,000)..."
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-green-dark/10 mt-6 flex items-center justify-between">
              <span className="text-xs text-text-muted">Requires 1-click organizer confirmation</span>
              <Link href="/app/outreach">
                <Button variant="butter" size="sm" className="font-bold shadow-md">
                  Review & Approve Send <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Reply Intelligence View */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-green-dark/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-green-dark">
                      Gemini Reply Intelligence
                    </h3>
                    <p className="text-xs text-text-dim">Thread: Razorpay DevRel Counter-Offer</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Negotiating
                </span>
              </div>

              {/* Analysis Summary */}
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-butter-panel rounded-xl border border-green-dark/10 space-y-2">
                  <span className="font-bold text-green-dark block">AI Summary & Intent Extraction:</span>
                  <p className="text-text-dim leading-relaxed">
                    Razorpay offered ₹60,000 for Gold Tier (counter-offer from ₹75,000 ask). Agreed to judge seat. Requested GST details and invoice for processing.
                  </p>
                </div>

                <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 text-green-950 font-medium space-y-1">
                  <span className="font-bold text-green-900 block text-[11px] uppercase tracking-wider">
                    Recommended Next Action:
                  </span>
                  <p className="text-xs">
                    Accept ₹60,000 counter-offer, send GST details, and generate formal sponsorship invoice.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-green-dark/10 mt-6 flex items-center justify-between">
              <span className="text-xs text-text-muted">94% Intent Confidence</span>
              <Link href="/app/replies">
                <Button variant="green" size="sm" className="font-bold shadow-md">
                  Open Inbound Thread <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
