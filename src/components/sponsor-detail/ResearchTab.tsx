"use client";

import React, { useState } from "react";
import { Company } from "@/types";
import { Globe, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const ResearchTab: React.FC<{ company: Company; onRefresh: () => void }> = ({
  company,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [researching, setResearching] = useState(false);

  const handleRerunResearch = async () => {
    setResearching(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Research re-run completed with cited sources!", "success");
        onRefresh();
      }
    } catch {
      toast("Research failed", "error");
    } finally {
      setResearching(false);
    }
  };

  const report = company.researchReport?.sections;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-green-dark">
            Company Research & Web Citations
          </h3>
          <p className="text-xs text-text-dim">
            Multi-source intelligence verified and analyzed for sponsorship outreach
          </p>
        </div>
        <Button
          variant="glass"
          size="sm"
          loading={researching}
          onClick={handleRerunResearch}
          className="text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-run Deep Research
        </Button>
      </div>

      {/* Recommended Pitch Angle Banner */}
      <div className="bg-green-dark text-butter-cream rounded-2xl p-5 border border-green-mid shadow-md space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-butter-gold">
          <CheckCircle2 className="w-4 h-4 text-butter-gold" />
          Recommended Pitch Angle
        </div>
        <p className="text-sm font-medium text-text-onDark leading-relaxed">
          {company.researchReport?.recommendedAngle ||
            `Propose a dedicated ${company.name} developer track with student credits and workshop rights.`}
        </p>
      </div>

      {/* Detailed Research Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products & Target Audience */}
        <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-green-dark border-b border-green-dark/8 pb-2">
            Products, Services & Audience
          </h4>
          <div className="space-y-2 text-xs">
            <span className="font-bold text-text-muted block uppercase tracking-wider">
              Core Products:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(report?.productsAndServices ?? []).map((p, i) => (
                <span
                  key={i}
                  className="bg-butter-bg text-green-dark px-2.5 py-1 rounded-md border border-green-dark/8 font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-bold text-text-muted block uppercase tracking-wider">
              Target Audience:
            </span>
            <p className="text-text-dim leading-relaxed">
              {report?.targetAudience || "Not verified yet: run research to fill this in."}
            </p>
          </div>
        </div>

        {/* Student & Campus Initiatives */}
        <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-green-dark border-b border-green-dark/8 pb-2">
            Student & Developer Community Programs
          </h4>
          <ul className="space-y-2 text-xs text-text-dim">
            {(report?.studentDeveloperPrograms ?? []).map((prog, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>{prog}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cited Sources List */}
      <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-green-dark border-b border-green-dark/8 pb-2">
          Verified Web Source Citations ({company.sources?.length || 0})
        </h4>
        <div className="space-y-3">
          {(company.sources || []).map((src, i) => (
            <div
              key={src.id || i}
              className="p-3.5 bg-butter-panel rounded-xl border border-green-dark/8 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-dark">{src.title}</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline font-semibold flex items-center gap-1 hover:text-blue-900"
                >
                  Visit Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-text-dim text-[11px] leading-relaxed">
                "{src.snippet}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
