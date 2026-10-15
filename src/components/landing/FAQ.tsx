"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Does SponFy automatically send cold emails without my permission?",
    answer:
      "No, never. SponFy has a strict, non-bypassable Human Approval Gate. AI generates cited research, calculates fit scores, and crafts tailored drafts, but every single email must be reviewed, safety-checked, and approved by you before anything is dispatched.",
  },
  {
    question: "How does the Gmail integration work, and is my account safe?",
    answer:
      "SponFy connects via official Google OAuth 2.0 with minimal required scopes (send drafts and read replies in thread). Tokens are encrypted with AES-256 at rest and accessed only server-side. We never store personal emails or send beyond your configured daily limit.",
  },
  {
    question: "How are the 7-Factor Fit Scores calculated?",
    answer:
      "Our AI analyzes 7 weighted dimensions: Industry Relevance (20 pts), Audience Overlap (20 pts), Product Synergy (15 pts), Event Type Match (15 pts), Student Program History (15 pts), Financial Capability (10 pts), and Geographic Alignment (5 pts). SponFy always shows you an explainable score breakdown with positive and negative point rationales.",
  },
  {
    question: "What happens if a sponsor replies saying 'Not Interested' or asks to be removed?",
    answer:
      "Our intelligent reply classifier immediately flags the intent as 'Not Interested', stops all scheduled follow-ups, advances the stage to 'Lost', and automatically adds the contact/domain to your Suppression List to ensure they are never emailed again.",
  },
  {
    question: "Can I use SponFy for cultural events, sports meets, or organizations?",
    answer:
      "Yes! SponFy is designed for all event formats and initiatives, including tech conferences, brand campaigns, cultural festivals, sports tournaments, entrepreneurship summits, and non-profits.",
  },
  {
    question: "Can I test SponFy without configuring any API keys?",
    answer:
      "Yes. SponFy comes with built-in sandbox mock connectors and sample campaigns across all pipeline stages, allowing you to experience the complete workflow immediately.",
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-butter-bg border-b border-green-dark/10">
      <div className="max-w-[880px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-text-dim">
            Everything you need to know about safety, AI sourcing, Gmail integration, and campaign management.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-green-dark/12 overflow-hidden shadow-sm hover:border-green-dark/35 hover:shadow-md transition-all duration-200 group"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-base sm:text-lg text-green-dark hover:text-green-mid hover:bg-butter-panel/40 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-green-mid shrink-0 group-hover:scale-110 group-hover:text-green-dark group-hover:rotate-6 transition-all duration-200" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-text-muted shrink-0 transition-all duration-200 group-hover:scale-110",
                      isOpen && "rotate-180 text-green-dark"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-text-dim leading-relaxed border-t border-green-dark/5 bg-butter-panel/40 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
