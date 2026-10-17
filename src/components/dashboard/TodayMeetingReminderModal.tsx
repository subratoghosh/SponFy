"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Meeting } from "@/types";
import {
  Calendar,
  Clock,
  Video,
  X,
  ExternalLink,
  CalendarDays,
  Bell,
  ArrowRight,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMeetingTimeRange } from "@/lib/meetings/calendar-helpers";

export function TodayMeetingReminderModal() {
  const [todayMeetings, setTodayMeetings] = useState<Meeting[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [todayDateString, setTodayDateString] = useState("");

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    setTodayDateString(todayStr);

    const storageKey = `sponfy_meeting_reminder_${todayStr}`;
    const alreadySeen = localStorage.getItem(storageKey);

    // If already dismissed today, skip showing popup
    if (alreadySeen === "true") {
      return;
    }

    // Fetch user's meetings
    const checkTodayMeetings = async () => {
      try {
        const res = await fetch("/api/meetings");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const matched = json.data.filter((meet: Meeting) => {
            if (meet.status === "cancelled") return false;
            const meetDate = new Date(meet.startsAt);
            const meetY = meetDate.getFullYear();
            const meetM = String(meetDate.getMonth() + 1).padStart(2, "0");
            const meetD = String(meetDate.getDate()).padStart(2, "0");
            return `${meetY}-${meetM}-${meetD}` === todayStr;
          });

          if (matched.length > 0) {
            // Sort by start time ascending
            matched.sort(
              (a: Meeting, b: Meeting) =>
                new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
            );
            setTodayMeetings(matched);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn("Failed to check today meetings:", err);
      }
    };

    checkTodayMeetings();
  }, []);

  const handleDismiss = () => {
    if (todayDateString) {
      localStorage.setItem(`sponfy_meeting_reminder_${todayDateString}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen || todayMeetings.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] bg-white rounded-3xl shadow-2xl border-2 border-green-dark/20 overflow-hidden animate-slide-up"
    >
      {/* Top Banner Accent */}
      <div className="bg-green-dark text-butter-cream px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-butter-cream text-green-dark flex items-center justify-center shadow-xs">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-butter-cream/80 block">
              Daily Reminder
            </span>
            <h4 id="reminder-title" className="font-heading font-black text-sm text-butter-cream">
              You have {todayMeetings.length} meeting{todayMeetings.length === 1 ? "" : "s"} today!
            </h4>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss reminder"
          className="p-1 rounded-lg text-butter-cream/70 hover:text-butter-cream hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meeting Cards List */}
      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto bg-[#FAF8F2]/60">
        {todayMeetings.map((meeting) => {
          const startTime = new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(new Date(meeting.startsAt));

          const isUrl =
            meeting.location?.startsWith("http://") ||
            meeting.location?.startsWith("https://");

          return (
            <div
              key={meeting.id}
              className="p-3 bg-white rounded-2xl border border-green-dark/10 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-700" />
                    {startTime} ({meeting.durationMins}m)
                  </span>
                  <h5 className="font-heading font-bold text-xs text-green-dark mt-1 line-clamp-1">
                    {meeting.title}
                  </h5>
                  <p className="text-[11px] text-text-dim">
                    Partner: <strong className="text-green-dark">{meeting.companyName}</strong>
                  </p>
                </div>

                <div className="w-7 h-7 rounded-lg bg-butter-warm/80 text-green-dark flex items-center justify-center shrink-0">
                  {meeting.mode === "video" ? (
                    <Video className="w-3.5 h-3.5" />
                  ) : meeting.mode === "phone" ? (
                    <Phone className="w-3.5 h-3.5" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {/* Quick Join Video Call Button if link exists */}
              {isUrl && (
                <a
                  href={meeting.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Video className="w-3 h-3" />
                  <span>Join Call ({meeting.companyName})</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-white border-t border-green-dark/10 flex items-center justify-between gap-2">
        <Link href="/app/schedule" onClick={handleDismiss} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-bold h-8 gap-1 border-green-dark/20 text-green-dark cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-green-mid" />
            <span>Open Schedule</span>
            <ArrowRight className="w-3 h-3 ml-auto text-text-muted" />
          </Button>
        </Link>

        <Button
          variant="green"
          size="sm"
          onClick={handleDismiss}
          className="text-xs font-bold h-8 px-4 cursor-pointer"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
