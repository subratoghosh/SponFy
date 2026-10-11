"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { Company } from "@/types";
import { ResearchTab } from "@/components/sponsor-detail/ResearchTab";
import { FitScoreTab } from "@/components/sponsor-detail/FitScoreTab";
import { ContactsTab } from "@/components/sponsor-detail/ContactsTab";
import { OutreachTab } from "@/components/sponsor-detail/OutreachTab";
import { TimelineTab } from "@/components/sponsor-detail/TimelineTab";
import { NextActionCard } from "@/components/sponsor-detail/NextActionCard";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  FileText,
  UserCheck,
  Send,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SponsorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [sponsor, setSponsor] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<
    "research" | "fit_score" | "contacts" | "outreach" | "timeline"
  >("research");

  const loadData = () => {
    if (id) {
      getSponsorById(id).then(setSponsor);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!sponsor) {
    return (
      <div className="p-12 text-center text-text-dim animate-fade-in">
        <p>Loading sponsor dossier...</p>
      </div>
    );
  }

  const tabs = [
    { id: "research", label: "Research & Sources", icon: FileText },
    { id: "fit_score", label: "Fit Score Breakdown", icon: TrendingUp },
    { id: "contacts", label: "Contacts", icon: UserCheck },
    { id: "outreach", label: "Outreach Draft", icon: Send },
    { id: "timeline", label: "Timeline Log", icon: Clock },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation Back Link */}
      <div>
        <Link
          href="/app/sponsors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-dim hover:text-green-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sponsors Pipeline
        </Link>
      </div>

      {/* Hero Dossier Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark font-bold text-xl border border-green-dark/10 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
                {sponsor.name}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                {sponsor.stage}
              </span>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-green-dark"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs sm:text-sm text-text-dim mt-1 max-w-xl">
              {sponsor.description}
            </p>
          </div>
        </div>

        {/* Right Quick Metrics */}
        <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-green-dark/10 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Match Fit
            </span>
            <span className="stat-font text-2xl font-black text-green-800">
              {sponsor.fitScore}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Target Value
            </span>
            <span className="stat-font text-2xl font-black text-green-dark">
              {formatCurrencyINR(sponsor.pipelineValue || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* AI Next Action Card */}
      <NextActionCard company={sponsor} />

      {/* Navigation Tabs Bar */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-green-dark/10 shadow-sm overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-butter-cream text-green-dark shadow-sm"
                : "text-text-dim hover:text-green-dark hover:bg-butter-warm/40"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "research" && (
          <ResearchTab company={sponsor} onRefresh={loadData} />
        )}
        {activeTab === "fit_score" && <FitScoreTab company={sponsor} />}
        {activeTab === "contacts" && (
          <ContactsTab company={sponsor} onUpdate={loadData} />
        )}
        {activeTab === "outreach" && <OutreachTab company={sponsor} />}
        {activeTab === "timeline" && <TimelineTab company={sponsor} />}
      </div>
    </div>
  );
}
