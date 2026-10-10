import React from "react";
import { UserCheck, ShieldCheck, MessageSquareReply } from "lucide-react";

export const TrustStrip: React.FC = () => {
  const pillars = [
    {
      icon: UserCheck,
      title: "Human approves every email",
      description: "No rogue autonomous spamming. You review tone, recipient, and ask before send.",
    },
    {
      icon: ShieldCheck,
      title: "Every claim has a source",
      description: "AI extracts data with verified web URLs so you can audit every fact with one click.",
    },
    {
      icon: MessageSquareReply,
      title: "Replies, not vanity opens",
      description: "Zero pixel-tracker guesswork. We measure authentic thread replies and committed funds.",
    },
  ];

  return (
    <section className="py-14 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white/70 border border-green-dark/8 shadow-sm hover:bg-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-butter-cream shrink-0 flex items-center justify-center text-green-dark shadow-sm">
                <p.icon className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-green-dark mb-1">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
