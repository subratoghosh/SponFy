"use client";

import React from "react";
import { EmailDraft, Company } from "@/types";
import { Send, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftQueueListProps {
  drafts: EmailDraft[];
  companies: Company[];
  selectedDraftId: string | null;
  onSelectDraft: (id: string) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
}

export const DraftQueueList: React.FC<DraftQueueListProps> = ({
  drafts,
  companies,
  selectedDraftId,
  onSelectDraft,
  statusFilter,
  onStatusFilterChange,
}) => {
  const filtered = drafts.filter((d) =>
    statusFilter === "all" ? true : d.status === statusFilter
  );

  return (
    <div className="bg-white rounded-3xl p-5 border border-green-dark/12 shadow-sm space-y-4 flex flex-col h-full">
      {/* Header with Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-extrabold text-base text-green-dark">
            Outreach Queue ({filtered.length})
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Human-in-Loop
          </span>
        </div>

        <div className="flex rounded-xl bg-butter-warm/80 p-1 border border-green-dark/10 text-[11px] font-bold">
          {["all", "draft", "approved", "sent"].map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={cn(
                "flex-1 py-1 rounded-lg capitalize transition-colors",
                statusFilter === st
                  ? "bg-white text-green-dark shadow-sm"
                  : "text-text-dim hover:text-green-dark"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
        {filtered.map((d) => {
          const comp = companies.find((c) => c.id === d.companyId);
          const isSelected = selectedDraftId === d.id;

          return (
            <div
              key={d.id}
              onClick={() => onSelectDraft(d.id)}
              className={cn(
                "p-3.5 rounded-2xl border text-xs transition-all cursor-pointer space-y-1.5",
                isSelected
                  ? "bg-butter-panel border-green-dark ring-2 ring-butter-cream shadow-sm"
                  : "bg-white border-green-dark/10 hover:border-green-dark/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-dark truncate max-w-[140px]">
                  {comp?.name || "Company"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border",
                    d.status === "sent" && "bg-green-100 text-green-800 border-green-300",
                    d.status === "approved" && "bg-amber-100 text-amber-800 border-amber-300",
                    d.status === "draft" && "bg-purple-100 text-purple-800 border-purple-300"
                  )}
                >
                  {d.status}
                </span>
              </div>
              <p className="text-text-dim text-[11px] truncate font-medium">
                {d.subject}
              </p>
              <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-green-dark/6">
                <span>Quality: {d.quality?.overall || 94}%</span>
                <span>{comp?.contacts?.[0]?.name || "Verified Contact"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
