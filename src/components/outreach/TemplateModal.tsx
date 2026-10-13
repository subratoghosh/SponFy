"use client";

import React, { useState } from "react";
import {
  CustomEmailTemplate,
  saveCustomTemplate,
} from "@/lib/data/repositories/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, FileText, Upload } from "lucide-react";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (template: CustomEmailTemplate) => void;
  userEmail?: string;
  initialTemplate?: CustomEmailTemplate | null;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  userEmail,
  initialTemplate,
}) => {
  const [name, setName] = useState(initialTemplate?.name || "");
  const [subject, setSubject] = useState(initialTemplate?.subject || "");
  const [body, setBody] = useState(initialTemplate?.body || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) return;

    const saved = saveCustomTemplate(
      {
        id: initialTemplate?.id,
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
      },
      userEmail
    );
    onSaved(saved);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, ""));
      }
      // Check if file has a Subject line
      const lines = content.split("\n");
      const subjectLine = lines.find((l) => /^subject:/i.test(l.trim()));
      if (subjectLine) {
        setSubject(subjectLine.replace(/^subject:\s*/i, "").trim());
        setBody(lines.filter((l) => !/^subject:/i.test(l.trim())).join("\n").trim());
      } else {
        setBody(content.trim());
      }
    };
    reader.readAsText(file);
  };

  const insertVariable = (variable: string) => {
    setBody((prev) => `${prev} ${variable}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-green-dark/15 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-green-dark/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-butter-warm text-green-dark flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-green-dark">
                {initialTemplate ? "Edit Email Template" : "Add Custom Email Template"}
              </h3>
              <p className="text-xs text-text-dim">
                Create reusable email formats with dynamic sponsor variables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-text-muted hover:text-green-dark transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Upload Option */}
        <div className="p-3 bg-butter-panel/60 rounded-xl border border-green-dark/10 flex items-center justify-between">
          <div className="text-xs text-green-dark">
            <span className="font-bold block">Upload from text/markdown file:</span>
            <span className="text-[11px] text-text-dim">
              Import existing .txt or .md email pitch templates
            </span>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-green-dark/20 text-green-dark text-xs font-bold hover:bg-butter-warm shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload File
            </span>
            <input
              type="file"
              accept=".txt,.md,.email"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-green-dark mb-1 block">Template Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="font-bold text-green-dark mb-1 block">Subject Line</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-bold"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-green-dark">Email Message Body</label>
              <span className="text-[10px] text-text-dim">Variables click-to-insert:</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {[
                "{{company_name}}",
                "{{contact_name}}",
                "{{event_name}}",
                "{{audience_size}}",
                "{{organizer_name}}",
                "{{organizer_title}}",
              ].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="px-2 py-0.5 rounded bg-butter-warm text-[10px] font-mono text-green-dark border border-green-dark/10 hover:bg-butter-gold transition-colors"
                >
                  +{v}
                </button>
              ))}
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <div className="pt-3 border-t border-green-dark/10 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="green" size="sm" className="text-xs font-bold">
              {initialTemplate ? "Save Template" : "Create Template"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
