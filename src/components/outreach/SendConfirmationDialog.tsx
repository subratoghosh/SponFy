"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmailDraft } from "@/types";
import { Send, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, UserCheck, Edit3 } from "lucide-react";

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
  onConfirmSend: (email: string, isCustomEmail?: boolean) => void;
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
  const [selectedSource, setSelectedSource] = useState<"discovered" | "custom">(toEmail ? "discovered" : "custom");
  const [customEmail, setCustomEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifResult, setVerifResult] = useState<VerificationDetails | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedSource(toEmail ? "discovered" : "custom");
      setCustomEmail("");
      setVerifResult(null);
    }
  }, [open, draft.id]);

  const activeEmail = (selectedSource === "discovered" && toEmail ? toEmail : customEmail).trim();
  const isValidSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activeEmail);

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

  // Auto-verify on open or email selection change
  useEffect(() => {
    if (open && isValidSyntax && !verifying) {
      handleRunVerification(activeEmail);
    }
  }, [open, activeEmail, isValidSyntax]);

  const hasAlert =
    verifResult &&
    (!verifResult.isDeliverable ||
      verifResult.status === "NO_MX" ||
      verifResult.status === "INVALID" ||
      verifResult.status === "BOUNCED" ||
      verifResult.status === "DISPOSABLE" ||
      verifResult.status === "RISKY");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Confirm Email Outreach Send"
      description="Select your target recipient and review deliverability safety before dispatching via Gmail."
    >
      <div className="space-y-4 text-xs">
        {/* Recipient Source Decision: Discovered vs Custom */}
        <div className="space-y-2">
          <label className="font-bold text-text-muted uppercase text-[10px] block">
            Choose Recipient Email:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {toEmail ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedSource("discovered");
                  setVerifResult(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedSource === "discovered"
                    ? "bg-[#2D6A4F]/10 border-[#2D6A4F] text-[#0C382E] shadow-xs"
                    : "bg-white border-green-dark/15 text-text-dim hover:bg-butter-warm/40"
                }`}
              >
                <div className="truncate min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-green-mid">
                    Discovered Email
                  </span>
                  <span className="font-mono font-bold text-xs truncate block text-green-dark">
                    {toEmail}
                  </span>
                </div>
                <UserCheck className={`w-4 h-4 shrink-0 ${selectedSource === "discovered" ? "text-[#2D6A4F]" : "text-text-muted"}`} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setSelectedSource("custom");
                setVerifResult(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedSource === "custom"
                  ? "bg-[#2D6A4F]/10 border-[#2D6A4F] text-[#0C382E] shadow-xs"
                  : "bg-white border-green-dark/15 text-text-dim hover:bg-butter-warm/40"
              }`}
            >
              <div className="truncate min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-green-mid">
                  Custom / Typed Email
                </span>
                <span className="font-mono text-xs truncate block text-text-dim">
                  {customEmail ? customEmail : "Input your own email address"}
                </span>
              </div>
              <Edit3 className={`w-4 h-4 shrink-0 ${selectedSource === "custom" ? "text-[#2D6A4F]" : "text-text-muted"}`} />
            </button>
          </div>

          {/* Custom Input Field when selected */}
          {selectedSource === "custom" && (
            <div className="mt-2 animate-fade-in">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setVerifResult(null);
                }}
                placeholder="Enter verified direct email (e.g. contact@sponsor.com)"
                className="w-full px-3 py-2 bg-white rounded-xl border border-green-dark/20 text-green-dark font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                autoFocus
              />
              {!isValidSyntax && customEmail.length > 0 && (
                <span className="text-[11px] text-red-600 mt-1 block">Please enter a valid email address.</span>
              )}
            </div>
          )}
        </div>

        {/* Deliverability Risk Alert or Verified Safety Banner */}
        {hasAlert ? (
          <div className="p-3.5 rounded-2xl border bg-amber-50 border-amber-300 text-amber-950 space-y-1.5 animate-fade-in shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-[13px] text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Deliverability Warning: Potential Risk Detected</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              {verifResult.reason}. MX or DNS mail checks flagged potential deliverability issues. If you know this email is genuine, you can take the risk and send anyway.
            </p>
          </div>
        ) : verifResult?.status === "VALID" ? (
          <div className="p-3.5 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-950 space-y-1 animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-[13px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Deliverability Verified Safe ({verifResult.score}/100)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              Active MX mail servers verified ({verifResult.checks.mxHosts[0] || "verified host"}). SPF/DMARC protocols confirmed.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-butter-panel rounded-xl border border-green-dark/10 text-green-dark flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-mid shrink-0" />
              <span className="text-[11px] font-medium text-text-dim">
                {verifying ? "Checking MX & DNS records..." : "Verify deliverability before dispatching."}
              </span>
            </div>
            {isValidSyntax && (
              <button
                type="button"
                onClick={() => handleRunVerification(activeEmail)}
                disabled={verifying}
                className="text-[11px] font-bold text-green-mid hover:text-green-dark flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${verifying ? "animate-spin" : ""}`} />
                {verifying ? "Auditing..." : "Re-Check"}
              </button>
            )}
          </div>
        )}

        {/* Message Summary Card */}
        <div className="p-4 bg-butter-panel rounded-2xl border border-green-dark/12 space-y-3">
          {verifResult && (
            <div className="p-2.5 bg-white/80 rounded-xl border border-green-dark/10 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-text-muted">DNS MX Mail Exchanger:</span>
                <span className={verifResult.checks.hasMx ? "text-emerald-700 font-mono" : "text-amber-800 font-bold"}>
                  {verifResult.checks.hasMx ? `Active (${verifResult.checks.mxHosts[0] || "Found"})` : "None Found (Warning)"}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-text-muted">Authentication (SPF / DMARC):</span>
                <span className="text-text-dim">
                  SPF: {verifResult.checks.hasSpf ? "Yes" : "No"} • DMARC: {verifResult.checks.hasDmarc ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}

          <div>
            <span className="font-bold text-text-muted uppercase text-[10px] block">
              Sending To (Recipient Email):
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-green-dark text-sm break-all">
                {activeEmail || "No recipient selected"}
              </span>
              {isValidSyntax && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    selectedSource === "custom"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {selectedSource === "custom" ? "Custom / Typed Email" : "Discovered Contact"}
                </span>
              )}
            </div>
          </div>

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

        {/* Action Buttons: Never block user from sending! */}
        <div className="pt-2 border-t border-green-dark/10 flex items-center justify-end gap-3">
          <Button variant="glass" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="butter"
            size="sm"
            loading={loading || verifying}
            disabled={!isValidSyntax || loading}
            onClick={() => onConfirmSend(activeEmail, selectedSource === "custom")}
            className="font-bold shadow-md cursor-pointer disabled:opacity-50"
            title={hasAlert ? "Alert detected: you may choose to take the risk and send" : undefined}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            {selectedSource === "custom"
              ? "Send to Custom Email via Gmail"
              : hasAlert
              ? "Send Anyway (Take Risk)"
              : "Approve & Dispatch Email"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
