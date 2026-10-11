"use client";

import React, { useState } from "react";
import { EmailDraft, Company } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, CheckCircle2, ShieldCheck, Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface EmailComposerProps {
  draft: EmailDraft;
  company?: Company;
  onSave: (subject: string, body: string) => void;
  onApprove: () => void;
  onOpenSendDialog: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  draft,
  company,
  onSave,
  onApprove,
  onOpenSendDialog,
}) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "value_first" | "short">("professional");
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = () => {
    onSave(subject, body);
    toast("Draft changes saved", "success");
  };

  const handleRegenerate = async () => {
    if (!company) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        toast(`Draft regenerated with ${tone} tone!`, "success");
      }
    } catch {
      toast("Regeneration failed", "error");
    } finally {
      setRegenerating(false);
    }
  };

  const recipientEmail = company?.contacts?.[0]?.email || "contact@company.com";

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm space-y-5">
      {/* Top Stepper Indicator */}
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Outreach Stepper:
          </span>
          <span className="text-xs font-extrabold text-green-dark bg-butter-warm px-3 py-1 rounded-full border border-green-dark/10">
            {draft.status === "draft" && "1. Draft & Review"}
            {draft.status === "approved" && "2. Approved & Ready to Send"}
            {draft.status === "sent" && "3. Sent & Monitored"}
          </span>
        </div>

        {/* Tone Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e: any) => setTone(e.target.value)}
            className="px-2.5 py-1 bg-butter-panel text-green-dark text-xs font-semibold rounded-lg border border-green-dark/15 outline-none cursor-pointer"
          >
            <option value="professional">Tone: Professional</option>
            <option value="enthusiastic">Tone: Enthusiastic</option>
            <option value="value_first">Tone: Value-First</option>
            <option value="short">Tone: Short</option>
          </select>
          <Button
            variant="glass"
            size="sm"
            loading={regenerating}
            onClick={handleRegenerate}
            className="text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${regenerating ? 'animate-spin' : ''}`} /> Regenerate
          </Button>
        </div>
      </div>

      {/* Recipient Bar */}
      <div className="p-3 bg-butter-panel rounded-xl text-xs flex items-center justify-between border border-green-dark/8">
        <div>
          <span className="text-text-muted font-bold mr-2">To:</span>
          <span className="font-mono font-bold text-green-dark">{company?.name || "Company"} &lt;{recipientEmail}&gt;</span>
        </div>
        <span className="text-[10px] font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
          Public Contact
        </span>
      </div>

      {/* Subject Line */}
      <Input
        label="Subject Line"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="font-bold text-green-dark text-sm"
      />

      {/* Email Body */}
      <Textarea
        label="Email Message Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={12}
        className="font-sans text-xs sm:text-sm text-green-dark leading-relaxed min-h-[220px]"
      />

      {/* Action Footer */}
      <div className="pt-4 border-t border-green-dark/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="glass" size="sm" onClick={handleSave} className="text-xs font-bold">
          <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {draft.status === "draft" && (
            <Button
              variant="green"
              size="sm"
              onClick={onApprove}
              className="text-xs font-bold shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Draft
            </Button>
          )}

          <Button
            variant="butter"
            size="sm"
            disabled={draft.status !== "approved"}
            onClick={onOpenSendDialog}
            className="text-xs font-bold shadow-md"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Send via Gmail
          </Button>
        </div>
      </div>
    </div>
  );
};
