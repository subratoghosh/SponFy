"use client";

import React from "react";
import { Meeting } from "@/types";
import { MeetingCard } from "./MeetingCard";
import { Calendar, Clock } from "lucide-react";
import { formatMeetingDate } from "@/lib/meetings/calendar-helpers";

interface UpcomingListViewProps {
  meetings: Meeting[];
  onReschedule: (meeting: Meeting) => void;
  onMarkCompleted: (meetingId: string) => Promise<void>;
  onCancel: (meetingId: string) => Promise<void>;
}

export const UpcomingListView: React.FC<UpcomingListViewProps> = ({
  meetings,
  onReschedule,
  onMarkCompleted,
  onCancel,
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Group meetings by local day string (YYYY-MM-DD)
  const grouped: Record<string, Meeting[]> = {};

  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  sortedMeetings.forEach((m) => {
    const d = new Date(m.startsAt);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    grouped[dayKey].push(m);
  });

  const dayKeys = Object.keys(grouped);

  const getDayHeading = (dayKey: string, sampleDateStr: string) => {
    if (dayKey === todayStr) {
      return "Today";
    }
    if (dayKey === tomorrowStr) {
      return "Tomorrow";
    }
    return formatMeetingDate(sampleDateStr);
  };

  return (
    <div className="space-y-6">
      {dayKeys.map((dayKey) => {
        const dayMeetings = grouped[dayKey];
        const heading = getDayHeading(dayKey, dayMeetings[0].startsAt);
        const isToday = dayKey === todayStr;

        return (
          <div key={dayKey} className="space-y-3">
            {/* Day Header */}
            <div className="flex items-center gap-2 px-1">
              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
                  isToday
                    ? "bg-green-dark text-butter-cream border-green-dark"
                    : "bg-white text-green-dark border-green-dark/15"
                }`}
              >
                {heading}
              </span>
              <span className="text-xs text-text-muted font-medium">
                {dayMeetings.length} sync{dayMeetings.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Meetings Cards for Day */}
            <div className="space-y-3">
              {dayMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onReschedule={onReschedule}
                  onMarkCompleted={onMarkCompleted}
                  onCancel={onCancel}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
