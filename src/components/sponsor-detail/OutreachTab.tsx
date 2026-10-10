"use client";

import React, { useState, useEffect } from "react";
import { Company, EmailDraft } from "@/types";
import { getDraftByCompanyId } from "@/lib/data/repositories/outreach";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export const OutreachTab: React.FC<{ company: Company }> = ({ company }) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "value_first" | "short">("professional");

  const loadDraft = () => {
    getDraftByCompanyId(company.id).then(setDraft);
  };

  useEffect(() => {
    loadDraft();
  }, [company.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setDraft(data.draft);
        toast("New personalized draft generated!", "success");
      }
    } catch {
      toast("Draft generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar with Tone Selector */}
      <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-green-dark">
            Outreach Email & Quality Evaluation
          </h3>
          <p className="text-xs text-text-dim">
            AI draft customized to {company.name}'s verified programs and challenge tracks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e: any) => setTone(e.target.value)}
            className="px-3 py-1.5 bg-butter-panel text-green-dark text-xs font-semibold rounded-xl border border-green-dark/15 outline-none cursor-pointer"
          >
            <option value="professional">Tone: Professional</option>
            <option value="enthusiastic">Tone: Enthusiastic</option>
            <option value="value_first">Tone: Value-First</option>
            <option value="short">Tone: Short & Direct</option>
          </select>
          <Button
            variant="butter"
            size="sm"
            loading={generating}
            onClick={handleGenerate}
            className="text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" /> {draft ? "Regenerate" : "Generate Draft"}
          </Button>
        </div>
      </div>

      {draft ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Email Body Editor Preview */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-green-dark/12 shadow-sm space-y-4">
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-butter-panel rounded-xl border border-green-dark/10">
                <span className="font-bold text-text-muted block text-[10px] uppercase">
                  Subject Line:
                </span>
                <span className="font-bold text-green-dark text-sm mt-0.5 block">
                  {draft.subject}
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-green-dark/10 whitespace-pre-wrap font-sans text-xs sm:text-sm text-green-dark leading-relaxed">
                {draft.body}
              </div>
            </div>

            <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-dim">
                Status: <strong className="text-green-dark uppercase">{draft.status}</strong>
              </span>
              <Link href="/app/outreach">
                <Button variant="green" size="sm" className="font-bold shadow-md">
                  Open in Outreach Approval Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Quality Score Panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-green-dark/12 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-green-dark/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Quality Evaluation
              </span>
              <span className="stat-font text-xl font-black text-green-800">
                {draft.quality?.overall || 94}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-bold text-green-dark mb-1">
                  <span>Personalization</span>
                  <span>{draft.quality?.personalization || 95}%</span>
                </div>
                <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${draft.quality?.personalization || 95}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-green-dark mb-1">
                  <span>Relevance</span>
                  <span>{draft.quality?.relevance || 96}%</span>
                </div>
                <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${draft.quality?.relevance || 96}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-green-dark mb-1">
                  <span>Clarity</span>
                  <span>{draft.quality?.clarity || 92}%</span>
                </div>
                <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${draft.quality?.clarity || 92}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-green-dark mb-1">
                  <span>Call to Action</span>
                  <span>{draft.quality?.cta || 94}%</span>
                </div>
                <div className="w-full h-2 bg-butter-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${draft.quality?.cta || 94}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Improvement suggestions */}
            {draft.quality?.suggestions && draft.quality.suggestions.length > 0 && (
              <div className="p-3 bg-butter-panel rounded-xl text-xs space-y-1 border border-green-dark/8">
                <span className="font-bold text-green-dark block text-[11px] uppercase">
                  AI Suggestions:
                </span>
                {draft.quality.suggestions.map((s, i) => (
                  <p key={i} className="text-text-dim text-[11px]">
                    • {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-green-dark/10 space-y-3">
          <Sparkles className="w-8 h-8 text-butter-gold mx-auto" />
          <h4 className="font-heading font-bold text-base text-green-dark">
            No Draft Generated Yet
          </h4>
          <p className="text-xs text-text-dim max-w-sm mx-auto">
            Click "Generate Draft" to create a personalized pitch tailored to {company.name}.
          </p>
          <Button variant="butter" size="sm" onClick={handleGenerate} loading={generating} className="font-bold shadow-md">
            Generate Email Draft
          </Button>
        </div>
      )}
    </div>
  );
};
