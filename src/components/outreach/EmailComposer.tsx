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
  Trash2,
  AlertCircle,
  Search,
  Sparkles,
  Edit3,
  Check,
  X,
  User,
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
  onSave: (subject: string, body: string, customToEmail?: string) => void;
  onApprove: () => void;
  onRejectDraft?: () => void;
  onOpenSendDialog: () => void;
  onContactUpdated?: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  draft,
  company,
  onSave,
  onApprove,
  onRejectDraft,
  onOpenSendDialog,
  onContactUpdated,
}) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "value_first" | "short">("professional");
  const [regenerating, setRegenerating] = useState(false);
  const [discoveringContact, setDiscoveringContact] = useState(false);

  // Recipient Contact State
  const initialContact = draft.contactId
    ? company?.contacts?.find((c) => c.id === draft.contactId)
    : company?.contacts?.find((c) => c.email && c.email.trim() !== "") || company?.contacts?.[0];
  const [recipientEmailInput, setRecipientEmailInput] = useState(initialContact?.email || "");
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);

  useEffect(() => {
    const contact = draft.contactId
      ? company?.contacts?.find((c) => c.id === draft.contactId)
      : company?.contacts?.find((c) => c.email && c.email.trim() !== "") || company?.contacts?.[0];
    setRecipientEmailInput(contact?.email || "");
    setIsEditingRecipient(false);
  }, [draft.id, draft.contactId, company?.contacts]);

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
      eventName: "Our Annual Flagship Campaign",
      audienceSize: "1,200",
      organizerName: session?.user?.name || "Event Convener",
      industry: company?.industry,
      fitScore: company?.fitScore,
    });

    const interpolatedBody = interpolateTemplate(tmpl.body, {
      companyName: company?.name,
      contactName: company?.contacts?.[0]?.name,
      eventName: "Our Annual Flagship Campaign",
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
    onSave(subject, body, recipientEmailInput.trim() || undefined);
    setIsEditingRecipient(false);
    toast("Draft changes saved", "success");
  };

  const handleRegenerate = async () => {
    if (!company) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, tone, regenerate: true }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        onSave(data.draft.subject, data.draft.body);
        onContactUpdated?.();
        toast(`Draft regenerated with ${tone} tone & re-evaluated with AI!`, "success");
      } else {
        toast(data.error || "Regeneration failed. Check company permissions.", "error");
      }
    } catch (err: any) {
      toast(err?.message || "Regeneration failed", "error");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDiscoverContact = async () => {
    if (!company?.id) return;
    setDiscoveringContact(true);
    try {
      const res = await fetch("/api/sponsors/discover-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });
      const data = await res.json();
      if (data.success && data.contact?.email) {
        toast(`Discovered verified contact: ${data.contact.email}`, "success");
        onContactUpdated?.();
      } else {
        toast(data.reason || "No verified public contact found. Please add manually.", "info");
      }
    } catch {
      toast("Contact discovery failed. Try adding manually.", "error");
    } finally {
      setDiscoveringContact(false);
    }
  };

  const activeTargetContact = draft.contactId
    ? company?.contacts?.find((c) => c.id === draft.contactId)
    : company?.contacts?.find((c) => c.email && c.email.trim() !== "") || company?.contacts?.[0];
  const activeRecipientEmail = recipientEmailInput || activeTargetContact?.email || "";

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-8 border border-green-dark/12 shadow-sm space-y-5">
      {/* Top Stepper Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-green-dark/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Outreach Stepper:
          </span>
          <span className="text-xs font-extrabold text-green-dark bg-butter-warm px-3 py-1 rounded-full border border-green-dark/10">
            {draft.status === "draft" && "1. Draft & Review"}
            {draft.status === "approved" && "2. Approved & Ready to Send"}
            {draft.status === "sent" && "3. Sent & Monitored"}
          </span>
          {draft.status === "sent" && (
            <span
              title={`Dispatched by ${draft.sentByName || draft.sentByUsername || "Team Member"}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
            >
              <User className="w-3 h-3 text-blue-600" />
              <span>Sent by @{draft.sentByUsername || draft.sentByName || "executive"}</span>
            </span>
          )}
        </div>

        {/* Tone Switcher */}
        <div className="flex items-center gap-2 [&>select]:flex-1 sm:[&>select]:flex-none">
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
      {isEditingRecipient ? (
        <div className="p-3 bg-[#FAF4E6] rounded-2xl border border-green-dark/20 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-dark uppercase text-[10px] tracking-wider">
              Set Recipient Email for {company?.name || "Company"}:
            </span>
            <button
              type="button"
              onClick={() => setIsEditingRecipient(false)}
              className="text-text-muted hover:text-green-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={recipientEmailInput}
              onChange={(e) => setRecipientEmailInput(e.target.value)}
              placeholder="Enter custom recipient email (e.g. partner@company.com)"
              className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-green-dark/20 font-mono text-xs font-bold text-green-dark focus:outline-none focus:ring-2 focus:ring-green-mid/30"
              autoFocus
            />
            <Button
              variant="butter"
              size="sm"
              onClick={handleSave}
              className="font-bold text-xs shrink-0"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Save Email
            </Button>
          </div>
          {company?.contacts && company.contacts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-text-dim font-bold">Existing Contacts:</span>
              {company.contacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setRecipientEmailInput(c.email);
                    onSave(subject, body, c.email);
                    setIsEditingRecipient(false);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-green-dark/15 font-mono text-[11px] text-green-dark hover:bg-butter-warm cursor-pointer"
                >
                  {c.name ? `${c.name} (${c.email})` : c.email}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : !activeRecipientEmail ? (
        <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold block">No recipient contact email on file for {company?.name || "this company"}</span>
              <span className="text-[11px] text-amber-800">Type a custom contact email or auto-discover a verified public contact.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingRecipient(true)}
              className="text-xs font-bold border-amber-300 text-amber-950 hover:bg-amber-100/70"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Type Custom Email
            </Button>
            <Button
              variant="butter"
              size="sm"
              loading={discoveringContact}
              onClick={handleDiscoverContact}
              className="text-xs font-bold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {discoveringContact ? "Searching Web..." : "Find with AI"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-butter-panel rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-green-dark/8">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <span className="text-text-muted font-bold">To:</span>
            <span className="font-mono font-bold text-green-dark break-all sm:truncate">
              {activeTargetContact?.name && activeTargetContact.email === activeRecipientEmail
                ? `${activeTargetContact.name} • `
                : ""}
              <span className="text-green-mid">{company?.name || "Company"}</span>
              {" "}&lt;{activeRecipientEmail}&gt;
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                activeTargetContact?.status === "verified" && activeTargetContact.email === activeRecipientEmail
                  ? "text-emerald-800 bg-emerald-100 border border-emerald-300"
                  : "text-amber-800 bg-amber-100 border border-amber-300"
              }`}
            >
              {activeTargetContact?.email === activeRecipientEmail ? "Verified Contact" : "Custom Recipient"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingRecipient(true)}
            className="text-[11px] font-bold text-green-mid hover:text-green-dark flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-butter-warm border border-green-dark/10 transition-colors self-start sm:self-auto cursor-pointer"
            title="Change or type custom recipient email"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit / Custom Email</span>
          </button>
        </div>
      )}

      {/* Pitch Source & Custom Template Selector */}
      <div className="p-3.5 bg-butter-panel/80 rounded-2xl border border-green-dark/12 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
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
            <span>AI Pitch Generator</span>
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
      <div className="pt-4 border-t border-green-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          <Button variant="glass" size="sm" onClick={handleSave} className="text-xs font-bold">
            <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
          </Button>

          {onRejectDraft && draft.status !== "sent" && draft.status !== "sending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRejectDraft}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              title="Discard and reject this draft"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" /> Reject Draft
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end [&>*]:flex-1 sm:[&>*]:flex-none">
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
