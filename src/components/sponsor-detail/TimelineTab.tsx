"use client";

import React from "react";
import { Company, Activity } from "@/types";
import { formatTimeAgo } from "@/lib/utils";
import { CheckCircle2, TrendingUp, Mail, Send } from "lucide-react";

export const TimelineTab: React.FC<{ company: Company }> = ({ company }) => {
  const events = [
    {
      title: `Moved to "${company.stage}" stage`,
      desc: `Pipeline status updated to ${company.stage}`,
      time: company.updatedAt,
      icon: TrendingUp,
    },
    {
      title: "AI 7-Factor Fit Scoring Completed",
      desc: `Scored ${company.fitScore}% match with 94% confidence`,
      time: company.createdAt,
      icon: CheckCircle2,
    },
    {
      title: "Company Discovered & Profile Sourced",
      desc: "Initial dossier scraped and indexed via Tavily",
      time: company.createdAt,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-green-dark/10 pb-4">
        <h3 className="font-heading font-extrabold text-lg text-green-dark">
          Sponsor Relationship Timeline
        </h3>
        <p className="text-xs text-text-dim">
          Full audit history of discoveries, research updates, emails, and replies
        </p>
      </div>

      <div className="space-y-6 pl-4 border-l-2 border-green-dark/15 ml-3">
        {events.map((ev, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute -left-[31px] top-0 w-8 h-8 rounded-full bg-butter-cream border-2 border-green-dark flex items-center justify-center text-green-dark shadow-sm">
              <ev.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-green-dark">{ev.title}</h4>
                <span className="text-[11px] text-text-muted">{formatTimeAgo(ev.time)}</span>
              </div>
              <p className="text-xs text-text-dim mt-0.5">{ev.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
