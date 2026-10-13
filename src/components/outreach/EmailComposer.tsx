"use client";

import React, { useState, useEffect } from "react";
import { EmailDraft, Company } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Save,
  CheckCircle2,
  Send,
  FileText,
  Plus,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";
import {
  CustomEmailTemplate,
  getCustomTemplates,
  interpolateTemplate,
} from "@/lib/data/repositories/templates";
import { TemplateModal } from "./TemplateModal";

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
  const { data: session } = useSession();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "value_first" | "short">("professional");
  const [regenerating, setRegenerating] = useState(false);

  // Template State
  const [templates, setTemplates] = useState<CustomEmailTemplate[]>([]);
  const [activeSource, setActiveSource] = useState<string>("ai");
  const [aiDraftBackup, setAiDraftBackup] = useState({ subject: draft.subject, body: draft.body });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  useEffect(() => {
    setSubject(draft.subject);
    setBody(draft.body);
    setAiDraftBackup({ subject: draft.subject, body: draft.body });
    setActiveSource("ai");
  }, [draft.id, draft.subject, draft.body]);

  useEffect(() => {
    const list = getCustomTemplates(session?.user?.email ?? undefined);
    setTemplates(list);
  }, [session?.user?.email]);

  const handleSelectSource = (sourceId: string) => {
    setActiveSource(sourceId);
    if (sourceId === "ai") {
      setSubject(aiDraftBackup.subject);
      setBody(aiDraftBackup.body);
      toast("Restored AI-generated email pitch", "info");
      return;
    }

    const tmpl = templates.find((t) => t.id === sourceId);
    if (!tmpl) return;

    const interpolatedSubject = interpolateTemplate(tmpl.subject, {
      companyName: company?.name,
      contactName: company?.contacts?.[0]?.name,
      eventName: "Our Annual Hackathon & Conference",
      audienceSize: "1,200",
      organizerName: session?.user?.name || "Event Convener",
      industry: company?.industry,
      fitScore: company?.fitScore,
    });

    const interpolatedBody = interpolateTemplate(tmpl.body, {
      companyName: company?.name,
      contactName: company?.contacts?.[0]?.name,
      eventName: "Our Annual Hackathon & Conference",
      audienceSize: "1,200",
      organizerName: session?.user?.name || "Event Convener",
      industry: company?.industry,
      fitScore: company?.fitScore,
    });

    setSubject(interpolatedSubject);
    setBody(interpolatedBody);
    toast(`Loaded custom template: "${tmpl.name}"`, "success");
  };

  const handleTemplateSaved = (newTmpl: CustomEmailTemplate) => {
    const list = getCustomTemplates(session?.user?.email ?? undefined);
    setTemplates(list);
    handleSelectSource(newTmpl.id);
    toast("Custom template created and applied!", "success");
  };

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

      {/* Pitch Source & Custom Template Selector */}
      <div className="p-3.5 bg-butter-panel/80 rounded-2xl border border-green-dark/12 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-green-mid" />
            <span className="text-xs font-bold text-green-dark">Pitch Source & Email Templates</span>
          </div>
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="text-[11px] font-bold text-green-mid hover:text-green-dark flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add / Upload Custom Template
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          <button
            type="button"
            onClick={() => handleSelectSource("ai")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSource === "ai"
                ? "bg-green-dark text-butter-cream shadow-xs"
                : "bg-white text-green-dark/80 hover:bg-butter-warm border border-green-dark/10"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Pitch (Gemini)</span>
          </button>

          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelectSource(tmpl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeSource === tmpl.id
                  ? "bg-green-dark text-butter-cream shadow-xs"
                  : "bg-white text-green-dark/80 hover:bg-butter-warm border border-green-dark/10"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {draft.needsAttention && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Attention Required:</span>{" "}
            {draft.attentionReason ||
              "This draft contains unresolved template variables. Edit the subject or body to replace placeholders before approving."}
          </div>
        </div>
      )}

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
              disabled={!!draft.needsAttention}
              onClick={onApprove}
              className="text-xs font-bold shadow-sm disabled:opacity-50"
              title={draft.needsAttention ? "Resolve placeholders before approving" : undefined}
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

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSaved={handleTemplateSaved}
        userEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
};
