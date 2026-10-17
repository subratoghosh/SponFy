"use client";

import React from "react";
import { Message, ReplyAnalysis, Company, Meeting } from "@/types";
import { INTENT_CONFIG } from "@/lib/config/constants";
import { formatTimeAgo } from "@/lib/utils";
import { formatMeetingDateShort } from "@/lib/meetings/calendar-helpers";
import { Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadListProps {
  threads: Array<{ message: Message; analysis?: ReplyAnalysis }>;
  companies: Company[];
  selectedMessageId: string | null;
  onSelectThread: (msgId: string) => void;
  meetings?: Meeting[];
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  companies,
  selectedMessageId,
  onSelectThread,
  meetings = [],
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-green-dark/12 shadow-sm space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-3">
        <h3 className="font-heading font-extrabold text-base text-green-dark">
          Inbound Replies ({threads.length})
        </h3>
        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          Auto-Classified
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
        {threads.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-butter-bg/50 border border-green-dark/8 space-y-2 my-auto">
            <Mail className="w-6 h-6 text-green-mid mx-auto opacity-70" />
            <p className="text-xs font-bold text-green-dark">Inbox is clear</p>
            <p className="text-[11px] text-text-muted">
              Inbound emails and replies from sponsor reps will appear here.
            </p>
          </div>
        ) : (
          threads.map(({ message, analysis }) => {
          const comp = companies.find((c) => c.id === message.companyId);
          const isSelected = selectedMessageId === message.id;
          const intentConfig = analysis
            ? INTENT_CONFIG[analysis.intent]
            : INTENT_CONFIG["Interested"];

          return (
            <div
              key={message.id}
              onClick={() => onSelectThread(message.id)}
              className={cn(
                "p-3.5 rounded-2xl border text-xs transition-all cursor-pointer space-y-2",
                isSelected
                  ? "bg-butter-panel border-green-dark ring-2 ring-butter-cream shadow-sm"
                  : "bg-white border-green-dark/10 hover:border-green-dark/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-green-dark text-sm block">
                    {comp?.name || message.fromEmail.split("@")[0]}
                  </span>
                  <span className="text-[11px] text-text-dim block truncate max-w-[150px]">
                    {message.fromEmail}
                  </span>
                </div>
                {analysis && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                    style={{
                      backgroundColor: intentConfig.bg,
                      color: intentConfig.text,
                      borderColor: intentConfig.border,
                    }}
                  >
                    {analysis.intent}
                  </span>
                )}
              </div>

              <p className="text-text-dim text-xs line-clamp-2 leading-relaxed">
                "{message.body}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-text-muted pt-1.5 border-t border-green-dark/6">
                <span>{formatTimeAgo(message.sentAt)}</span>
                {(() => {
                  const m = meetings.find(
                    (item) =>
                      (item.replyMessageId === message.id || item.companyId === message.companyId) &&
                      item.status !== "cancelled"
                  );
                  if (m) {
                    return (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Calendar className="w-3 h-3 text-emerald-600" /> Meeting: {formatMeetingDateShort(m.startsAt)}
                      </span>
                    );
                  }
                  if (analysis?.meetingRequested) {
                    return (
                      <span className="text-green-700 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Meeting Asked
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
