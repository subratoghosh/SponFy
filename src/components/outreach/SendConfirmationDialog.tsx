"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmailDraft } from "@/types";
import { Send, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, XCircle, Search } from "lucide-react";

interface VerificationDetails {
  status: "VALID" | "RISKY" | "INVALID" | "NO_MX" | "BOUNCED" | "DISPOSABLE";
  score: number;
  isDeliverable: boolean;
  recommendation: "send" | "review" | "block";
  reason: string;
  checks: {
    syntax: boolean;
    domainExists: boolean;
    hasMx: boolean;
    mxHosts: string[];
    hasSpf: boolean;
    hasDmarc: boolean;
    isDisposable: boolean;
    isRoleAccount: boolean;
    isSuppressed: boolean;
    aiConfidence?: number;
    aiReasoning?: string;
  };
}

interface SendConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  draft: EmailDraft;
  toEmail: string;
  companyName: string;
  onConfirmSend: (email: string) => void;
  loading: boolean;
  isPatternGuess?: boolean;
  remainingDailyCap?: number;
  dailyCapLimit?: number;
}

export const SendConfirmationDialog: React.FC<SendConfirmationDialogProps> = ({
  open,
  onClose,
  draft,
  toEmail,
  companyName,
  onConfirmSend,
  loading,
  isPatternGuess = false,
  remainingDailyCap,
  dailyCapLimit,
}) => {
  const [recipient, setRecipient] = useState(toEmail);
  const [verifying, setVerifying] = useState(false);
  const [verifResult, setVerifResult] = useState<VerificationDetails | null>(null);

  useEffect(() => {
    setRecipient(toEmail);
    setVerifResult(null);
  }, [toEmail, open]);

  const isValidSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim());

  const handleRunVerification = async (emailToCheck: string) => {
    const clean = emailToCheck.trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/verification/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, companyName }),
      });
      const data = await res.json();
      if (data.success && data.verification) {
        setVerifResult(data.verification);
      }
    } catch {
      // Gracefully continue
    } finally {
      setVerifying(false);
    }
  };

  // Auto-verify on open if valid
  useEffect(() => {
    if (open && isValidSyntax && !verifResult && !verifying) {
      handleRunVerification(recipient);
    }
  }, [open, recipient, isValidSyntax]);

  const isBlockedByShield =
    verifResult &&
    (!verifResult.isDeliverable ||
      verifResult.status === "NO_MX" ||
      verifResult.status === "INVALID" ||
      verifResult.status === "BOUNCED" ||
      verifResult.status === "DISPOSABLE");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Confirm Email Outreach Send"
      description="Zero-Bounce Deliverability Shield & Human Authorization before dispatching via Gmail API."
    >
      <div className="space-y-4 text-xs">
        {/* Zero-Bounce Deliverability Shield Banner */}
        {isBlockedByShield ? (
          <div className="p-3.5 rounded-2xl border bg-rose-50 border-rose-300 text-rose-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[13px] text-rose-800">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Zero-Bounce Shield: Dispatch Blocked</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-900">
              {verifResult.reason}. Sending this email will cause a bounce and hurt your domain reputation. Please enter a valid, working contact email.
            </p>
          </div>
        ) : verifResult?.status === "VALID" ? (
          <div className="p-3.5 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[13px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-Bounce Shield: Verified Safe to Send ({verifResult.score}/100)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              Active MX mail servers verified ({verifResult.checks.mxHosts[0] || "verified host"}). SPF/DMARC protocols confirmed.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl border bg-amber-50 border-amber-300 text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[13px]">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Deliverability Notice: Verify Before Sending</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Confirm the recipient address below. Sending to non-existent inboxes will bounce.
            </p>
          </div>
        )}

        {/* Message Summary & Editable Recipient Input */}
        <div className="p-4 bg-butter-panel rounded-2xl border border-green-dark/12 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-text-muted uppercase text-[10px] block">
                Target Recipient Email:
              </label>
              <button
                type="button"
                onClick={() => handleRunVerification(recipient)}
                disabled={verifying || !isValidSyntax}
                className="text-[11px] font-bold text-green-mid hover:text-green-dark flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${verifying ? "animate-spin" : ""}`} />
                {verifying ? "Auditing MX & DNS..." : "Re-Check Deliverability"}
              </button>
            </div>

            <input
              type="email"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setVerifResult(null);
              }}
              placeholder="lead@company.com"
              className="w-full px-3 py-2 bg-white rounded-xl border border-green-dark/15 text-green-dark font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-dark/20"
            />
            {!isValidSyntax && (
              <span className="text-[11px] text-red-600 mt-1 block">Please enter a valid email address.</span>
            )}
          </div>

          {/* Real-time Technical Deliverability Badges */}
          {verifResult && (
            <div className="p-2.5 bg-white/80 rounded-xl border border-green-dark/10 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-text-muted">DNS MX Mail Exchanger:</span>
                <span className={verifResult.checks.hasMx ? "text-emerald-700 font-mono" : "text-rose-700 font-bold"}>
                  {verifResult.checks.hasMx ? `Active (${verifResult.checks.mxHosts[0] || "Found"})` : "None Found (Will Bounce)"}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-text-muted">Authentication (SPF / DMARC):</span>
                <span className="text-text-dim">
                  SPF: {verifResult.checks.hasSpf ? "Yes" : "No"} • DMARC: {verifResult.checks.hasDmarc ? "Yes" : "No"}
                </span>
              </div>
              {verifResult.checks.aiReasoning && (
                <div className="text-[10px] text-text-dim border-t border-green-dark/8 pt-1">
                  AI Assessment: {verifResult.checks.aiReasoning}
                </div>
              )}
            </div>
          )}

          <div>
            <span className="font-bold text-text-muted uppercase text-[10px] block">
              Company Name:
            </span>
            <span className="font-bold text-green-dark text-sm">{companyName}</span>
          </div>

          <div>
            <span className="font-bold text-text-muted uppercase text-[10px] block">
              Subject Line:
            </span>
            <span className="font-bold text-green-dark text-sm">{draft.subject}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-green-dark/8">
            <span className="font-bold text-text-muted uppercase text-[10px]">
              Daily Send Quota:
            </span>
            <span className="font-semibold text-green-dark">
              {remainingDailyCap !== undefined ? `${remainingDailyCap} sends remaining today` : "Active"}
              <span className="text-[10px] text-text-dim ml-1">(resets at 12:00 AM)</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-green-dark/10 flex items-center justify-end gap-3">
          <Button variant="glass" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="butter"
            size="sm"
            loading={loading || verifying}
            disabled={!isValidSyntax || loading || Boolean(isBlockedByShield)}
            onClick={() => onConfirmSend(recipient.trim())}
            className="font-bold shadow-md disabled:opacity-50"
            title={isBlockedByShield ? "Fix undeliverable email before sending" : undefined}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            {isBlockedByShield ? "Blocked by Shield" : "Approve & Dispatch Email"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
