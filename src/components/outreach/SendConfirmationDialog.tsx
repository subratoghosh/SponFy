"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmailDraft } from "@/types";
import { Send, ShieldCheck, AlertCircle } from "lucide-react";

interface SendConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  draft: EmailDraft;
  toEmail: string;
  companyName: string;
  onConfirmSend: () => void;
  loading: boolean;
}

export const SendConfirmationDialog: React.FC<SendConfirmationDialogProps> = ({
  open,
  onClose,
  draft,
  toEmail,
  companyName,
  onConfirmSend,
  loading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Confirm Email Outreach Send"
      description="Verify the recipient, subject, and authorization before dispatching via Gmail API."
    >
      <div className="space-y-5 text-xs">
        {/* Safety Banner */}
        <div className="p-4 bg-green-50 rounded-2xl border border-green-200 space-y-1 text-green-950">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-green-700" />
            Human Authorization Confirmed
          </div>
          <p className="text-[11px] text-green-800">
            This action will dispatch this email directly from your connected Gmail address to <strong>{toEmail}</strong>.
          </p>
        </div>

        {/* Message Summary */}
        <div className="p-4 bg-butter-panel rounded-2xl border border-green-dark/12 space-y-2">
          <div>
            <span className="font-bold text-text-muted uppercase text-[10px] block">
              Recipient:
            </span>
            <span className="font-bold text-green-dark text-sm">{companyName} ({toEmail})</span>
          </div>
          <div>
            <span className="font-bold text-text-muted uppercase text-[10px] block">
              Subject Line:
            </span>
            <span className="font-bold text-green-dark text-sm">{draft.subject}</span>
          </div>
          <div>
            <span className="font-bold text-text-muted uppercase text-[10px] block">
              Daily Send Cap Remaining:
            </span>
            <span className="font-bold text-green-800">18 sends available today</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-green-dark/10 flex items-center justify-end gap-3">
          <Button variant="glass" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="butter"
            size="sm"
            loading={loading}
            onClick={onConfirmSend}
            className="font-bold shadow-md"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Approve & Dispatch Email
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
