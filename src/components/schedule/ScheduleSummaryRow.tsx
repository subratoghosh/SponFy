"use client";

import React from "react";
import { Meeting } from "@/types";
import { Calendar, Clock, CheckCircle2, CalendarDays } from "lucide-react";
import { getCountdownText, formatMeetingDateShort, formatMeetingTimeRange } from "@/lib/meetings/calendar-helpers";

interface ScheduleSummaryRowProps {
  meetings: Meeting[];
}

export const ScheduleSummaryRow: React.FC<ScheduleSummaryRowProps> = ({ meetings }) => {
  const now = new Date();

  // 1. Meetings this week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const meetingsThisWeek = meetings.filter((m) => {
    if (m.status === "cancelled") return false;
    const d = new Date(m.startsAt);
    return d >= startOfWeek && d < endOfWeek;
  }).length;

  // 2. Next meeting
  const upcomingMeetings = meetings
    .filter((m) => m.status === "scheduled" && new Date(m.startsAt).getTime() > now.getTime())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const nextMeeting = upcomingMeetings[0] || null;

  // 3. Completed total
  const completedCount = meetings.filter((m) => m.status === "completed").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Metric 1: Meetings This Week */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-green-dark/12 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-butter-bg text-green-dark border border-green-dark/10 flex items-center justify-center shrink-0 shadow-2xs">
          <CalendarDays className="w-5 h-5 text-green-mid" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
            This Week's Syncs
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading font-black text-2xl text-green-dark">
              {meetingsThisWeek}
            </span>
            <span className="text-xs text-text-dim">scheduled</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Next Meeting */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-green-dark/12 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
          <Clock className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
            Next Sponsor Meeting
          </span>
          {nextMeeting ? (
            <div className="mt-0.5 truncate">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-base text-green-dark truncate">
                  {nextMeeting.companyName}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">
                  {getCountdownText(nextMeeting.startsAt)}
                </span>
              </div>
              <span className="text-[11px] text-text-dim block truncate">
                {formatMeetingDateShort(nextMeeting.startsAt)} • {formatMeetingTimeRange(nextMeeting.startsAt, nextMeeting.durationMins).split(" (")[0]}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-text-muted block mt-1">
              None upcoming
            </span>
          )}
        </div>
      </div>

      {/* Metric 3: Total Completed */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-green-dark/12 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
            Completed Syncs
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading font-black text-2xl text-green-dark">
              {completedCount}
            </span>
            <span className="text-xs text-text-dim">sponsorship discussions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
