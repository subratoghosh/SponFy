"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  HelpCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface BulkSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkSendModal: React.FC<BulkSendModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"ready" | "needs_review" | "blocked">("ready");

  const [data, setData] = useState<{
    readyCount: number;
    needsReviewCount: number;
    blockedCount: number;
    totalCount: number;
    ready: Array<{ draftId: string; companyName: string; toEmail: string; subject: string; reason: string }>;
    needsReview: Array<{ draftId: string; companyName: string; toEmail: string; subject: string; reason: string; nextAction: string }>;
    blocked: Array<{ draftId: string; companyName: string; toEmail: string; reason: string; nextAction: string }>;
    dailyCap: number;
    sentInWindow: number;
    remainingCap: number;
  } | null>(null);

  const [result, setResult] = useState<{
    sentCount: number;
    failedCount: number;
    sent: any[];
    failed: any[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setResult(null);
      fetch("/api/outreach/eligibility")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setData(json);
            if (json.readyCount > 0) {
              setActiveTab("ready");
            } else if (json.needsReviewCount > 0) {
              setActiveTab("needs_review");
            } else {
              setActiveTab("blocked");
            }
          } else {
            toast(json.error || "Failed to inspect send eligibility", "error");
          }
        })
        .catch(() => toast("Failed to inspect send eligibility", "error"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, toast]);

  if (!isOpen) return null;

  const handleExecuteSend = async () => {
    if (!data || data.readyCount === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/outreach/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftIds: data.ready.map((e) => e.draftId),
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Bulk send failed");
      }

      setResult(resJson);
      toast(
        `Successfully dispatched ${resJson.sentCount} email(s) via Gmail!`,
        "success"
      );
      onSuccess();
    } catch (err: any) {
      toast(err.message || "Bulk send execution encountered an error", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-light flex items-center justify-center text-green-dark shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-dark" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-green-dark">
                Check Eligibility & Review
              </h3>
              <p className="text-xs text-text-dim mt-0.5">
                Every recipient is verified for deliverability, suppression, and approval safety before dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-text-dim hover:text-green-dark transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-dark" />
            <p className="text-xs text-text-dim">Verifying email deliverability and safety gates...</p>
          </div>
        ) : result ? (
          /* Execution Result View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-butter-panel border border-green-dark/15 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-700 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-green-900">
                  Bulk Dispatch Completed
                </h4>
                <p className="text-xs text-text-dim mt-0.5">
                  {result.sentCount} message(s) sent successfully.
                  {result.failedCount > 0 && ` ${result.failedCount} message(s) encountered errors.`}
                </p>
              </div>
            </div>

            {result.sent.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-900 mb-2">
                  Successfully Sent ({result.sent.length}):
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {result.sent.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-green-200 bg-green-50 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-green-900">{s.companyName}</span>
                      <span className="text-text-dim">{s.toEmail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.failed.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2">
                  Failed ({result.failed.length}):
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {result.failed.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-red-900">{f.companyName}</span>
                      <span className="text-red-700">{f.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button variant="green" size="sm" onClick={onClose} className="text-xs font-bold">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Inspection & Confirmation View */
          <div className="space-y-5">
            {/* Daily Send Limit Status Bar */}
            <div className="p-3.5 bg-butter-panel rounded-2xl border border-green-dark/12 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-dark" />
                <span className="font-semibold text-green-dark">Daily Cap:</span>
                <span className="text-text-dim">
                  {data?.sentInWindow} / {data?.dailyCap} sent in last 24h
                </span>
              </div>
              <span className="font-mono font-bold text-green-dark bg-white px-2.5 py-0.5 rounded-full border border-green-dark/10">
                {data?.remainingCap} remaining
              </span>
            </div>

            {/* 3 Categories Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-butter-warm rounded-2xl border border-green-dark/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("ready")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "ready"
                    ? "bg-white text-green-900 shadow-xs border border-green-dark/10"
                    : "text-green-900/70 hover:text-green-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Ready ({data?.readyCount ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("needs_review")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "needs_review"
                    ? "bg-white text-amber-900 shadow-xs border border-amber-300"
                    : "text-amber-900/70 hover:text-amber-900"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Needs Review ({data?.needsReviewCount ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("blocked")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "blocked"
                    ? "bg-white text-red-900 shadow-xs border border-red-300"
                    : "text-red-900/70 hover:text-red-900"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Blocked ({data?.blockedCount ?? 0})</span>
              </button>
            </div>

            {/* Active Category Display */}
            {activeTab === "ready" && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-dark mb-2 flex items-center justify-between">
                  <span>Eligible Emails Ready to Send ({data?.readyCount})</span>
                  <span className="text-[11px] font-normal text-text-dim">Passes all deliverability & safety checks</span>
                </h4>

                {data && data.ready.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-green-dark/20 rounded-2xl text-xs text-text-dim">
                    No approved drafts currently meet all send criteria. Approve drafts or add verified corporate contacts first.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {data?.ready.map((item) => (
                      <div
                        key={item.draftId}
                        className="p-3 rounded-xl border border-green-200 bg-white flex items-center justify-between text-xs hover:border-green-dark/30 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-green-dark block truncate">
                            {item.companyName}
                          </span>
                          <span className="text-[11px] text-text-dim truncate block">
                            {item.subject}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-green-900 shrink-0 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">
                          {item.toEmail}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "needs_review" && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center justify-between">
                  <span>Needs Human Review ({data?.needsReviewCount})</span>
                  <span className="text-[11px] font-normal text-amber-800">Uncertain mailbox or catch-all domain</span>
                </h4>

                {data && data.needsReview.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-amber-200 rounded-2xl text-xs text-text-dim">
                    No drafts currently require manual review.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {data?.needsReview.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 truncate">
                            {item.companyName}
                          </span>
                          <span className="font-mono text-[11px] text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded">
                            {item.toEmail}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900">{item.reason}</p>
                        <p className="text-[10px] text-amber-700 font-semibold">Action: {item.nextAction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "blocked" && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 mb-2 flex items-center justify-between">
                  <span>Blocked Drafts ({data?.blockedCount})</span>
                  <span className="text-[11px] font-normal text-red-800">Cannot be sent</span>
                </h4>

                {data && data.blocked.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-red-200 rounded-2xl text-xs text-text-dim">
                    Zero drafts blocked.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {data?.blocked.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-red-200 bg-red-50/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-950 truncate">
                            {item.companyName}
                          </span>
                          {item.toEmail && (
                            <span className="font-mono text-[11px] text-red-900 bg-red-100 px-2 py-0.5 rounded">
                              {item.toEmail}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-red-800">{item.reason}</p>
                        <p className="text-[10px] text-red-700 font-semibold">Next step: {item.nextAction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-green-dark/10 flex items-center justify-between">
              <div className="text-xs text-text-dim">
                {data?.readyCount ? (
                  <span className="text-green-800 font-semibold">
                    {data.readyCount} email(s) ready to send
                  </span>
                ) : (
                  <span>No emails ready to send</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={sending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="green"
                  size="sm"
                  onClick={handleExecuteSend}
                  disabled={sending || !data || data.readyCount === 0}
                  className="text-xs font-bold flex items-center gap-1.5"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending via Gmail...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send {data?.readyCount || 0} Eligible Emails
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
