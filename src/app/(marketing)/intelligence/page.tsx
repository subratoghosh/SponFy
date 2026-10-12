import React from "react";
import { ApprovalPreview } from "@/components/landing/ApprovalPreview";
import { ShieldCheck, MessageSquare, MailCheck, UserCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Reply Intelligence & Safety | SponFy",
  description: "Human-in-the-loop approval gate and automated reply classification for campaign and event organizers.",
};

export default function IntelligencePage() {
  return (
    <div className="flex flex-col pt-16 md:pt-20">
      {/* Main Interactive Approval Gate & Intelligence View */}
      <ApprovalPreview />

      {/* Safety & Ethics Principles */}
      <section className="py-20 bg-butter-bg border-t border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-dark/5 border border-green-dark/15 text-green-dark text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-green-accent" />
              OUR 4 SAFETY & ETHICS PILLARS
            </div>
            <h2 className="display-font text-3xl sm:text-4xl font-extrabold text-green-dark tracking-tight mb-4">
              Protecting your college reputation from spam
            </h2>
            <p className="text-text-dim text-sm sm:text-base leading-relaxed">
              Campus brand reputations take years to build. We designed SponFy so student organizers never look like unprompted bots or reckless mass-spammers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-hero/10 flex items-center justify-center text-green-hero">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark">
                  Strict Human Approval Gate
                </h3>
              </div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                AI assists research and composition, but zero emails can be dispatched autonomously. An organizer must review, adjust tone, and manually confirm before anything sends.
              </p>
              <div className="text-xs font-semibold text-green-mid flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                Guarantees zero rogue emails from your official domain
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-butter-cream/60 flex items-center justify-center text-green-dark">
                  <MailCheck className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark">
                  Official Google OAuth 2.0
                </h3>
              </div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                We never ask for your email password or use sketchy SMTP relays. SponFy connects through Google’s official restricted OAuth scopes with bank-grade encryption.
              </p>
              <div className="text-xs font-semibold text-green-mid flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                Emails originate cleanly from your authorized university mailbox
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-butter-gold/40 flex items-center justify-center text-green-dark">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark">
                  Intent & Objection Classification
                </h3>
              </div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                When a sponsor replies, SponFy reads the thread and tags intent: &ldquo;Interested - Send Deck&rdquo;, &ldquo;Forwarded to HR&rdquo;, &ldquo;Budget Full&rdquo;, or &ldquo;Declined&rdquo; so your team stays organized.
              </p>
              <div className="text-xs font-semibold text-green-mid flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                Never drops a warm lead in the outreach chaos
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-green-dark/10 shadow-sm feature-card-interactive">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-light/10 flex items-center justify-center text-green-light">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="heading-font text-xl font-bold text-green-dark">
                  Cross-Campus Do Not Contact (DNC)
                </h3>
              </div>
              <p className="text-text-dim text-sm leading-relaxed mb-4">
                If an executive says &ldquo;Please remove us from student event pitches&rdquo;, SponFy records the DNC flag immediately so your team never accidentally emails them again.
              </p>
              <div className="text-xs font-semibold text-green-mid flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-accent" />
                Maintains clean sender score and campus domain health
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
