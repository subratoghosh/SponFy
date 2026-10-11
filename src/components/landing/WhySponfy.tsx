import React from "react";
import { ShieldCheck, CheckCircle2, EyeOff, FileText, Ban, Zap } from "lucide-react";

export const WhySponfy: React.FC = () => {
  const differentiators = [
    {
      icon: Ban,
      title: "Never Invents or Guesses Emails",
      description:
        "Generic AI tools hallucinate broken contact emails. SponFy only links publicly listed partnership addresses and labels unknown contacts honestly.",
    },
    {
      icon: ShieldCheck,
      title: "Hard Human Approval Gate",
      description:
        "SponFy will never send an email on autopilot. Every generated draft pauses for your manual review, quality check, and modal confirmation.",
    },
    {
      icon: FileText,
      title: "Every Claim Has a Clickable Source",
      description:
        "When SponFy highlights a sponsor's student program or past grant, it attaches the exact web source URL so you can verify before pitching.",
    },
    {
      icon: EyeOff,
      title: "Zero Pixel-Tracker Vanity Metrics",
      description:
        "Open rates are distorted by Apple Mail privacy and corporate spam filters. We focus exclusively on real thread replies, meetings booked, and signed checks.",
    },
  ];

  return (
    <section className="py-24 bg-butter-panel border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mb-4">
            Why campus organizers choose SponFy over generic cold email bots
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Built with strict guardrails to protect your college's reputation and foster authentic sponsor partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {differentiators.map((d, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-8 bg-white rounded-3xl border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col sm:flex-row items-start gap-4 sm:gap-5 group cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-butter-cream shrink-0 flex items-center justify-center text-green-dark shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:bg-butter-gold group-hover:shadow-[0_0_18px_rgba(254,231,144,0.7)] transition-all duration-300">
                <d.icon className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-green-dark mb-2 group-hover:text-green-mid transition-colors">
                  {d.title}
                </h3>
                <p className="text-sm text-text-dim leading-relaxed">
                  {d.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
