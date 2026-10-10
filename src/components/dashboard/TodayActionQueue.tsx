"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Send,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const TodayActionQueue: React.FC = () => {
  const actions = [
    {
      id: "act-1",
      type: "meeting",
      badge: "Meeting Requested",
      badgeColor: "bg-green-100 text-green-800 border-green-300",
      company: "Postman (Ali Mustufa)",
      text: "Requested Google Meet for Thursday 4 PM IST to confirm Gold Tier sponsorship & workshop.",
      cta: "Reply & Confirm Meet",
      href: "/app/replies",
      icon: Calendar,
    },
    {
      id: "act-2",
      type: "negotiation",
      badge: "Counter-Offer",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      company: "Razorpay (Vikram R.)",
      text: "Offered ₹60,000 for Gold Tier + requested GST details and invoice.",
      cta: "Review & Send Invoice",
      href: "/app/replies",
      icon: CheckCircle2,
    },
    {
      id: "act-3",
      type: "draft",
      badge: "Draft Ready",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      company: "Polygon (DevRel Grants)",
      text: "Personalized pitch ready with 90% quality score. Safety checks passed.",
      cta: "Approve & Send",
      href: "/app/outreach",
      icon: Send,
    },
    {
      id: "act-4",
      type: "followup",
      badge: "Follow-up Due",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
      company: "MongoDB (Raghav M.)",
      text: "Day 4 gentle follow-up ready. Recommended angle: Highlight 150+ teams building Vector Search AI apps.",
      cta: "Send Follow-up",
      href: "/app/followups",
      icon: Clock,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-butter-cream flex items-center justify-center text-green-dark font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-green-dark">
              Today's High-Priority Action Queue
            </h3>
            <p className="text-xs text-text-dim">
              4 critical items requiring your 1-click review or response today
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
          All safety gates active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-4 rounded-2xl bg-butter-panel border border-green-dark/10 hover:border-green-dark/30 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-bold text-sm text-green-dark truncate">
                  {act.company}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>
              <p className="text-xs text-text-dim leading-relaxed">
                {act.text}
              </p>
            </div>

            <div className="pt-2 border-t border-green-dark/8 flex justify-end">
              <Link href={act.href}>
                <Button variant="green" size="sm" className="text-xs font-bold shadow-sm">
                  {act.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
