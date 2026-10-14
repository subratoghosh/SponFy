"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, CheckCircle2, ShieldCheck, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

interface GuidedStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}

export const GuidedSetupBanner: React.FC = () => {
  const [step, setStep] = useState<GuidedStep | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if dismissed in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("sponfy_guided_dismissed") === "true") {
      setDismissed(true);
      setLoading(false);
      return;
    }

    // Determine current contextual setup progress based on real environment & database status
    fetch("/api/counts")
      .then((res) => res.json())
      .then((data) => {
        // If no drafts created yet:
        if (data.totalSponsors === 0) {
          setStep({
            id: "discover",
            title: "Discover prospective sponsors",
            description: "Start by searching active companies that sponsor campaigns in your domain.",
            actionText: "Search Sponsors",
            actionHref: "/app/discover",
          });
        } else if (data.draftsPendingApproval > 0) {
          setStep({
            id: "eligibility",
            title: "Run Check Eligibility on your drafts",
            description: "Verify recipient addresses and send limits before dispatching via Gmail.",
            actionText: "Check Eligibility",
            actionHref: "/app/outreach",
          });
        } else if (data.emailsSent === 0) {
          setStep({
            id: "connect_gmail",
            title: "Connect your Gmail account",
            description: "Authorize Gmail to safely send outreach and track sponsor replies.",
            actionText: "Configure in Settings",
            actionHref: "/app/settings",
          });
        } else {
          // If already actively sending
          setStep(null);
        }
      })
      .catch((err) => console.warn("Guided setup check skipped:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sponfy_guided_dismissed", "true");
    }
  };

  if (loading || dismissed || !step) return null;

  return (
    <div className="rounded-2xl border border-green-dark/15 bg-gradient-to-r from-butter-warm to-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-green-light flex items-center justify-center text-green-dark shrink-0">
          <Sparkles className="w-4 h-4 text-green-dark" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-mid">Next Step</span>
            <span className="font-serif font-bold text-sm text-green-dark truncate">{step.title}</span>
          </div>
          <p className="text-xs text-text-dim truncate mt-0.5">{step.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={step.actionHref}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-dark text-butter-cream rounded-xl text-xs font-bold hover:bg-green-dark/90 transition-colors shadow-xs"
        >
          <span>{step.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-text-dim hover:text-green-dark rounded-lg transition-colors"
          title="Dismiss guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
