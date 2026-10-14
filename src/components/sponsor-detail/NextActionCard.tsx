"use client";

import React, { useState } from "react";
import { Company } from "@/types";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export const NextActionCard: React.FC<{ company: Company }> = ({ company }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const getNextAction = () => {
    if (company.stage === "Interested" || company.stage === "Negotiation") {
      return {
        title: "Schedule Google Meet & Send Invoicing Terms",
        reason: "Sponsor confirmed interest in partnership tier. Fast follow-through ensures commitment.",
        href: "/app/replies",
        cta: "Go to Reply Thread",
        isGenerate: false,
      };
    }
    if (company.stage === "Draft Ready" || company.stage === "Approved") {
      return {
        title: "Review Pitch Draft & Execute Send",
        reason: "Personalized pitch draft is prepared and ready in Outreach Approval Hub.",
        href: `/app/outreach?companyId=${company.id}`,
        cta: "Review & Send",
        isGenerate: false,
      };
    }
    if (company.stage === "Contacted") {
      return {
        title: "Monitor Thread & Prepare Follow-up",
        reason: "Email successfully delivered via Gmail API. Automatic reminder cadence is active.",
        href: "/app/followups",
        cta: "View Cadence",
        isGenerate: false,
      };
    }
    return {
      title: "Generate Personalized Outreach Draft",
      reason: "Research and 7-factor fit scoring are complete. Ready for customized pitch generation.",
      href: `/app/outreach?companyId=${company.id}`,
      cta: "Generate Draft",
      isGenerate: true,
    };
  };

  const action = getNextAction();

  const handleAction = async () => {
    if (action.isGenerate) {
      setGenerating(true);
      try {
        const res = await fetch("/api/outreach/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: company.id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Draft generation failed");
        }
        toast("Draft ready! Redirecting to Outreach...", "success");
        const draftId = data.draft?.id;
        if (draftId) {
          router.push(`/app/outreach?draftId=${encodeURIComponent(draftId)}&companyId=${encodeURIComponent(company.id)}`);
        } else {
          router.push(`/app/outreach?companyId=${encodeURIComponent(company.id)}`);
        }
      } catch (err: any) {
        toast(err.message || "Failed to generate draft", "error");
      } finally {
        setGenerating(false);
      }
    } else {
      router.push(action.href);
    }
  };

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
        <Button
          variant="green"
          size="sm"
          loading={generating}
          onClick={handleAction}
          className="text-xs font-bold shadow-sm"
        >
          {generating ? "Generating..." : action.cta}{" "}
          {!generating && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
        </Button>
      </div>
    </div>
  );
};
