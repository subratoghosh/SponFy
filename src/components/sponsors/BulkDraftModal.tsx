"use client";

import React, { useState } from "react";
import { Company, Campaign } from "@/types";
import { getCustomTemplates, CustomEmailTemplate } from "@/lib/data/repositories/templates";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  FileText,
  X,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Layers,
  RotateCcw,
} from "lucide-react";

interface BulkDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSponsors: Company[];
  campaign?: Campaign | null;
  onSuccess?: () => void;
}

interface ItemStatus {
  id: string;
  name: string;
  status: "idle" | "processing" | "success" | "error";
  error?: string;
  draftId?: string;
}

export function BulkDraftModal({
  isOpen,
  onClose,
  selectedSponsors,
  campaign,
  onSuccess,
}: BulkDraftModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: session } = useSession();

  const [mode, setMode] = useState<"ai" | "template">("ai");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "value_first" | "short">("professional");
  const [templates] = useState<CustomEmailTemplate[]>(() => getCustomTemplates(session?.user?.email || undefined));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "tmpl-executive-pitch");

  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressList, setProgressList] = useState<ItemStatus[]>([]);

  if (!isOpen) return null;

  const handleStartBulk = async (retryOnlyFailures = false) => {
    setProcessing(true);
    setCompleted(false);

    const initialList: ItemStatus[] = retryOnlyFailures && progressList.length > 0
      ? progressList.map((item) => (item.status === "error" ? { ...item, status: "idle", error: undefined } : item))
      : selectedSponsors.map((s) => ({
          id: s.id,
          name: s.name,
          status: "idle",
        }));

    setProgressList(initialList);

    const itemsToProcess = initialList.filter((item) => item.status !== "success");
    const concurrency = 2; // Bounded concurrency of 2 to stay well within rate limits
    let currentIndex = 0;

    const processItem = async (item: ItemStatus) => {
      setProgressList((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "processing" } : p))
      );

      try {
        const payload: any = {
          companyId: item.id,
          campaignId: campaign?.id,
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

        if (res.ok && data.success && data.draft) {
          setProgressList((prev) =>
            prev.map((p) =>
              p.id === item.id ? { ...p, status: "success", draftId: data.draft.id } : p
            )
          );
        } else {
          setProgressList((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: "error", error: data.error || "Generation error" }
                : p
            )
          );
        }
      } catch (err: any) {
        setProgressList((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: "error", error: err.message || "Network error" }
              : p
          )
        );
      }
    };

    // Worker pool
    const workers = Array.from({ length: Math.min(concurrency, itemsToProcess.length) }, async () => {
      while (currentIndex < itemsToProcess.length) {
        const item = itemsToProcess[currentIndex++];
        if (item) {
          await processItem(item);
        }
      }
    });

    await Promise.all(workers);

    // Invalidate caches
    const userId = session?.user?.id || "demo";
    mutate(["/api/outreach/state", userId]);
    mutate("/api/outreach/state");

    setProcessing(false);
    setCompleted(true);
    if (onSuccess) onSuccess();
    toast("Bulk draft generation completed!", "success");
  };

  const successCount = progressList.filter((p) => p.status === "success").length;
  const errorCount = progressList.filter((p) => p.status === "error").length;
  const totalCount = selectedSponsors.length;
  const progressPercent = totalCount > 0 ? Math.round(((successCount + errorCount) / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-dark/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-green-dark/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-green-dark/10 bg-butter-panel/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-butter-warm text-green-dark flex items-center justify-center border border-green-dark/10 shadow-xs">
              <Layers className="w-5 h-5 text-green-dark" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg text-green-dark">
                Bulk Email Outreach
              </h2>
              <p className="text-xs text-text-dim">
                Generate personalized pitches for <span className="font-bold text-green-dark">{selectedSponsors.length} selected sponsors</span>
              </p>
            </div>
          </div>
          {!processing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-dim hover:text-green-dark hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {!processing && !completed ? (
            <>
              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-butter-panel rounded-2xl border border-green-dark/10">
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading text-xs font-bold transition-all ${
                    mode === "ai"
                      ? "bg-white text-green-dark shadow-xs border border-green-dark/10"
                      : "text-text-dim hover:text-green-dark"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-butter-gold" />
                  <span>Individual Gemini AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("template")}
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

              {/* Mode Options */}
              {mode === "ai" ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-green-dark block">
                    Select Pitch Tone
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
                  <p className="text-[11px] text-text-dim">
                    Each company receives an independently personalized pitch referencing their industry, fit criteria, and developer programs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-green-dark block">
                    Choose Template to Personalize
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
                  <p className="text-[11px] text-text-dim">
                    Variables like company name, contact, fit score, and event details will be automatically merged for each company.
                  </p>
                </div>
              )}

              {/* Selected Companies Preview Badge List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Sponsors In Queue ({selectedSponsors.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-butter-panel/40 rounded-2xl border border-green-dark/10">
                  {selectedSponsors.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 bg-white text-green-dark font-semibold text-[11px] rounded-lg border border-green-dark/10 shadow-xs"
                    >
                      {s.name} ({s.fitScore}%)
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Progress & Live Results View */
            <div className="space-y-4">
              {/* Progress Summary Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-green-dark">
                  <span>
                    {processing ? "Generating drafts..." : "Processing complete!"}
                  </span>
                  <span>
                    {successCount} of {totalCount} successful {errorCount > 0 ? `(${errorCount} failed)` : ""}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-butter-panel rounded-full overflow-hidden border border-green-dark/10">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      errorCount > 0 ? "bg-amber-500" : "bg-green-600"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Status List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {progressList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-green-dark/10 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-green-dark truncate max-w-[220px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.status === "idle" && (
                        <span className="text-text-muted text-[11px]">Queued</span>
                      )}
                      {item.status === "processing" && (
                        <span className="inline-flex items-center gap-1 text-green-700 text-[11px] font-semibold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting...
                        </span>
                      )}
                      {item.status === "success" && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Draft Ready
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="inline-flex items-center gap-1 text-rose-700 text-[11px] font-semibold" title={item.error}>
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-green-dark/10 bg-butter-panel/40 flex items-center justify-between gap-3">
          {!completed ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={processing}
                className="text-xs font-bold border-green-dark/20 text-green-dark"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="butter"
                size="sm"
                loading={processing}
                onClick={() => handleStartBulk(false)}
                className="text-xs font-black shadow-sm gap-1.5"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing {selectedSponsors.length} Sponsors...</span>
                  </>
                ) : (
                  <>
                    <span>Start Bulk Generation ({selectedSponsors.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {errorCount > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartBulk(true)}
                  className="text-xs font-bold border-amber-300 text-amber-900 bg-amber-50 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry {errorCount} Failed Items</span>
                </Button>
              ) : (
                <div />
              )}
              <Button
                type="button"
                variant="green"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push("/app/outreach");
                }}
                className="text-xs font-bold shadow-sm gap-1.5 ml-auto"
              >
                <span>View Drafts in Outreach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
