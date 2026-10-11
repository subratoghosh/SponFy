"use client";

import React from "react";
import { Activity } from "@/types";
import { formatTimeAgo } from "@/lib/utils";
import {
  CheckCircle2,
  Mail,
  Send,
  TrendingUp,
  Clock,
  Activity as ActivityIcon,
} from "lucide-react";

export const ActivityFeed: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "stage_changed":
        return <TrendingUp className="w-4 h-4 text-green-700" />;
      case "reply_received":
        return <Mail className="w-4 h-4 text-blue-700" />;
      case "intent_classified":
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case "draft_approved":
        return <Send className="w-4 h-4 text-amber-700" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-purple-700" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-green-dark/10 pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-green-dark">
            Recent Campaign Activity
          </h3>
          <p className="text-xs text-text-dim">
            Live chronological event log
          </p>
        </div>
        <span className="text-xs font-bold text-text-muted">Live audit</span>
      </div>

      {activities.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-butter-bg/50 border border-green-dark/8 space-y-2">
          <div className="w-9 h-9 rounded-full bg-white border border-green-dark/10 mx-auto flex items-center justify-center text-text-muted">
            <ActivityIcon className="w-4 h-4 text-green-mid" />
          </div>
          <p className="text-xs font-bold text-green-dark">No events recorded yet</p>
          <p className="text-[11px] text-text-muted max-w-xs mx-auto">
            Discovered sponsors, draft approvals, outbound pitches, and replies will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-butter-bg/50 border border-green-dark/6 text-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-green-dark/10 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-green-dark truncate">
                    {act.companyName || "Sponsor"}
                  </span>
                  <span className="text-[10px] text-text-muted shrink-0 font-medium">
                    {formatTimeAgo(act.createdAt)}
                  </span>
                </div>
                <p className="text-text-dim mt-0.5">
                  {act.type === "stage_changed" &&
                    `Moved to ${act.payload.to} (₹${act.payload.amount?.toLocaleString("en-IN")})`}
                  {act.type === "intent_classified" &&
                    `Reply classified as "${act.payload.intent}" (${act.payload.confidence}% confidence)`}
                  {act.type === "reply_received" &&
                    `Inbound reply logged: ${act.payload.subject || "Message"}`}
                  {act.type === "draft_approved" &&
                    `Outreach draft approved: ${act.payload.subject}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
