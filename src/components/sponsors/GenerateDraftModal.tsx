"use client";

import React, { useState } from "react";
import { Company, Campaign } from "@/types";
import { getCustomTemplates, CustomEmailTemplate, interpolateTemplate } from "@/lib/data/repositories/templates";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import {
  Zap,
  FileText,
  X,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface GenerateDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: Company;
  campaign?: Campaign | null;
}

export function GenerateDraftModal({
  isOpen,
  onClose,
  sponsor,
  campaign,
}: GenerateDraftModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: session } = useSession();

  const [mode, setMode] = useState<"ai" | "template">("ai");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "value_first" | "short">("professional");
  const [templates] = useState<CustomEmailTemplate[]>(() => getCustomTemplates(session?.user?.email || undefined));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "tmpl-executive-pitch");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiError, setIsAiError] = useState(false);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const previewContext = {
    companyName: sponsor.name,
    contactName: sponsor.contacts?.[0]?.name || "Partnerships Team",
    eventName: campaign?.name || "Our Event",
    audienceSize: campaign?.audienceSize || "5000",
    organizerName: session?.user?.name || "Event Organizer",
    organizerTitle: "Head of Sponsorships",
    industry: sponsor.industry,
    fitScore: sponsor.fitScore,
  };

  const previewSubject = selectedTemplate ? interpolateTemplate(selectedTemplate.subject, previewContext) : "";
  const previewBody = selectedTemplate ? interpolateTemplate(selectedTemplate.body, previewContext) : "";

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMsg(null);
    setIsAiError(false);

    try {
      const payload: any = {
        companyId: sponsor.id,
        campaignId: campaign?.id || sponsor.campaignId,
        regenerate: true,
      };

      if (mode === "template") {
        payload.templateId = selectedTemplateId;
      } else {
        payload.tone = tone;
      }

      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.error || "Draft generation failed";
        setErrorMsg(msg);
        setIsAiError(!!data.isAiError || msg.includes("Gemini") || msg.includes("demand") || msg.includes("quota"));
        return;
      }

      // Draft generated successfully
      toast(`Draft created for ${sponsor.name}! Redirecting to Outreach...`, "success");

      // Invalidate outreach SWR caches
      const userId = session?.user?.id || "demo";
      mutate(["/api/outreach/state", userId]);
      mutate("/api/outreach/state");

      onClose();

      // Navigate directly to Outreach with the newly created draft selected
      const draftId = data.draft?.id;
      const targetUrl = draftId
        ? `/app/outreach?draftId=${encodeURIComponent(draftId)}&companyId=${encodeURIComponent(sponsor.id)}`
        : `/app/outreach?companyId=${encodeURIComponent(sponsor.id)}`;

      router.push(targetUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate draft. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-dark/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-green-dark/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-green-dark/10 bg-butter-panel/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-butter-warm text-green-dark flex items-center justify-center border border-green-dark/10 shadow-xs">
              <Mail className="w-5 h-5 text-green-dark" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg text-green-dark">
                Draft Sponsorship Email
              </h2>
              <p className="text-xs text-text-dim">
                For <span className="font-bold text-green-dark">{sponsor.name}</span> • {sponsor.fitScore}% Fit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={generating}
            className="p-1.5 rounded-xl text-text-dim hover:text-green-dark hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-butter-panel rounded-2xl border border-green-dark/10">
            <button
              type="button"
              onClick={() => {
                setMode("ai");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading text-xs font-bold transition-all ${
                mode === "ai"
                  ? "bg-white text-green-dark shadow-xs border border-green-dark/10"
                  : "text-text-dim hover:text-green-dark"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-butter-gold" />
              <span>AI Pitch Generator</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("template");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading text-xs font-bold transition-all ${
                mode === "template"
                  ? "bg-white text-green-dark shadow-xs border border-green-dark/10"
                  : "text-text-dim hover:text-green-dark"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-green-mid" />
              <span>Saved Template</span>
            </button>
          </div>

          {/* AI Mode Options */}
          {mode === "ai" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-green-dark block">
                  Select Email Tone
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "professional", label: "Professional" },
                    { id: "enthusiastic", label: "Enthusiastic" },
                    { id: "value_first", label: "Value-First" },
                    { id: "short", label: "Short & Direct" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        tone === t.id
                          ? "bg-green-dark text-white border-green-dark shadow-xs"
                          : "bg-white text-text-dim border-green-dark/15 hover:border-green-dark/30 hover:text-green-dark"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-green-50/70 border border-green-200/60 rounded-2xl text-xs text-green-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-green-800">
                  <Zap className="w-3.5 h-3.5 text-green-700" />
                  Hyper-Personalized Generation
                </span>
                <p className="text-[11px] text-green-800/80 leading-relaxed">
                  Our proprietary AI intelligence analyzes {sponsor.name}&apos;s verified developer programs, tech stack, and audience alignment to craft a high-converting sponsorship pitch.
                </p>
              </div>
            </div>
          )}

          {/* Saved Template Options */}
          {mode === "template" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-green-dark block">
                  Choose Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white text-green-dark text-xs font-medium rounded-xl border border-green-dark/20 focus:outline-none focus:ring-2 focus:ring-green-dark/20"
                >
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Personalized Live Preview
                </span>
                <div className="p-3.5 bg-butter-panel/60 rounded-2xl border border-green-dark/10 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-text-muted text-[10px] block">SUBJECT:</span>
                    <p className="font-bold text-green-dark text-xs mt-0.5">{previewSubject}</p>
                  </div>
                  <div className="pt-2 border-t border-green-dark/10">
                    <span className="font-bold text-text-muted text-[10px] block mb-1">BODY:</span>
                    <p className="text-text-dim text-[11px] leading-relaxed line-clamp-4 whitespace-pre-line">
                      {previewBody}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner with Graceful Fallback */}
          {errorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 animate-fade-in">
              <div className="flex items-start gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-xs text-amber-950">{errorMsg}</p>
                  {isAiError && (
                    <p className="text-[11px] text-amber-800">
                      You can instantly generate this draft using a saved template, which requires zero AI credits and never fails.
                    </p>
                  )}
                </div>
              </div>

              {isAiError && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMode("template");
                      setErrorMsg(null);
                    }}
                    className="text-xs font-bold border-amber-300 text-amber-900 bg-white hover:bg-amber-100/50"
                  >
                    Switch to Saved Template
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleGenerate}
                    className="text-xs font-bold text-amber-900"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Retry AI
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-green-dark/10 bg-butter-panel/40 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={generating}
            className="text-xs font-bold border-green-dark/20 text-green-dark"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="butter"
            size="sm"
            loading={generating}
            onClick={handleGenerate}
            className="text-xs font-black shadow-sm gap-1.5"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Draft...</span>
              </>
            ) : (
              <>
                <span>Generate & View Draft</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
