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
  const [data, setData] = useState<{
    eligibleCount: number;
    excludedCount: number;
    eligible: Array<{ draftId: string; companyName: string; toEmail: string; subject: string }>;
    excluded: Array<{ draftId: string; companyName: string; reason: string }>;
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
      fetch("/api/outreach/bulk-send")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setData(json);
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
    if (!data || data.eligibleCount === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/outreach/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftIds: data.eligible.map((e) => e.draftId),
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
        <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark border border-green-dark/10">
              <ShieldCheck className="w-6 h-6 text-green-mid" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-green-dark">
                Bulk Dispatch Confirmation
              </h3>
              <p className="text-xs text-text-dim">
                Server-side safety verification and daily send capacity check.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-green-dark p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-dim flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-green-dark animate-spin" />
            <p className="text-xs font-semibold text-green-dark">
              Verifying recipient contacts, suppression lists, and daily caps...
            </p>
          </div>
        ) : result ? (
          /* Execution Result View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-butter-panel border border-green-dark/10 flex items-center justify-between">
              <div>
                <span className="font-heading font-extrabold text-green-dark text-base block">
                  Bulk Send Complete
                </span>
                <span className="text-xs text-text-dim">
                  {result.sentCount} sent successfully &bull; {result.failedCount} failed
                </span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-mid" />
            </div>

            {result.sent.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-dark mb-2">
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

            {/* Eligible List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-green-dark mb-2 flex items-center justify-between">
                <span>Eligible Approved Emails ({data?.eligibleCount})</span>
                <span className="text-[11px] font-normal text-text-dim">Ready for dispatch</span>
              </h4>

              {data && data.eligible.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-green-dark/20 rounded-2xl text-xs text-text-dim">
                  No approved drafts currently meet all send criteria. Approve drafts or add verified contacts first.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {data?.eligible.map((item) => (
                    <div
                      key={item.draftId}
                      className="p-3 rounded-xl border border-green-dark/12 bg-white flex items-center justify-between text-xs hover:border-green-dark/30 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-green-dark block truncate">
                          {item.companyName}
                        </span>
                        <span className="text-[11px] text-text-dim truncate block">
                          {item.subject}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-green-dark/80 shrink-0 bg-butter-warm px-2 py-0.5 rounded-md">
                        {item.toEmail}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Excluded List with Reasons */}
            {data && data.excluded.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center justify-between">
                  <span>Excluded Drafts ({data.excludedCount})</span>
                  <span className="text-[11px] font-normal text-amber-800">Will not be sent</span>
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {data.excluded.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start justify-between text-xs gap-3"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-amber-950 block truncate">
                          {item.companyName}
                        </span>
                        <span className="text-[11px] text-amber-800 block">
                          {item.reason}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 shrink-0">
                        Excluded
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-green-dark/10">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
                Cancel
              </Button>

              <Button
                variant="green"
                size="sm"
                disabled={sending || !data || data.eligibleCount === 0}
                loading={sending}
                onClick={handleExecuteSend}
                className="text-xs font-bold shadow-xs gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Confirm & Send ({data?.eligibleCount ?? 0}) Emails
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
