"use client";

import React from "react";
import { Company } from "@/types";
import { ArrowRight, Calendar, Send, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const NextActionCard: React.FC<{ company: Company }> = ({ company }) => {
  const getNextAction = () => {
    if (company.stage === "Interested" || company.stage === "Negotiation") {
      return {
        title: "Schedule Google Meet & Send Invoicing Terms",
        reason: "Sponsor confirmed interest in partnership tier. Fast follow-through ensures commitment.",
        href: "/app/replies",
        cta: "Go to Reply Thread",
      };
    }
    if (company.stage === "Draft Ready" || company.stage === "Approved") {
      return {
        title: "Review Pitch Draft & Execute Send",
        reason: "94% quality score draft is ready with verified recipient and zero suppression blocks.",
        href: "/app/outreach",
        cta: "Review & Send",
      };
    }
    if (company.stage === "Contacted") {
      return {
        title: "Monitor Thread & Prepare Day 4 Follow-up",
        reason: "Email successfully delivered via Gmail API. Automatic reminder will trigger in 3 days.",
        href: "/app/followups",
        cta: "View Cadence",
      };
    }
    return {
      title: "Generate Personalized Outreach Draft",
      reason: "Research and 7-factor fit scoring are complete. Ready for customized pitch generation.",
      href: `/app/sponsors/${company.id}`,
      cta: "Generate Draft",
    };
  };

  const action = getNextAction();

  return (
    <div className="bg-butter-panel rounded-3xl p-5 sm:p-6 border border-butter-gold/60 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-green-dark flex items-center gap-1.5">
          <ArrowRight className="w-4 h-4 text-green-mid" /> Next Best Action
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
          Recommended
        </span>
      </div>

      <div>
        <h4 className="font-heading font-extrabold text-base text-green-dark">
          {action.title}
        </h4>
        <p className="text-xs text-text-dim mt-1 leading-relaxed">
          {action.reason}
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <Link href={action.href}>
          <Button variant="green" size="sm" className="text-xs font-bold shadow-sm">
            {action.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
