"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Meeting } from "@/types";
import {
  Video,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Download,
  Calendar,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  MoreVertical,
  CalendarClock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatMeetingTimeRange,
  formatMeetingDate,
  generateGoogleCalendarUrl,
  downloadIcsFile,
} from "@/lib/meetings/calendar-helpers";

interface MeetingCardProps {
  meeting: Meeting;
  onReschedule: (meeting: Meeting) => void;
  onMarkCompleted: (meetingId: string) => Promise<void>;
  onCancel: (meetingId: string) => Promise<void>;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onReschedule,
  onMarkCompleted,
  onCancel,
}) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getModeIcon = () => {
    switch (meeting.mode) {
      case "video":
        return <Video className="w-4 h-4 text-emerald-700" />;
      case "phone":
        return <Phone className="w-4 h-4 text-sky-700" />;
      case "in_person":
        return <MapPin className="w-4 h-4 text-amber-700" />;
      default:
        return <Video className="w-4 h-4 text-emerald-700" />;
    }
  };

  const getModeLabel = () => {
    switch (meeting.mode) {
      case "video":
        return "Video Call";
      case "phone":
        return "Phone Call";
      case "in_person":
        return "In Person";
      default:
        return "Meeting";
    }
  };

  const getStatusBadge = () => {
    switch (meeting.status) {
      case "scheduled":
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      await onMarkCompleted(meeting.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    try {
      await onCancel(meeting.id);
      setIsConfirmingCancel(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLink = meeting.location.startsWith("http://") || meeting.location.startsWith("https://");

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-green-dark/12 shadow-sm space-y-4 hover:border-green-dark/25 transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-extrabold text-base text-green-dark">
              {meeting.title}
            </h3>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-3 text-xs text-text-dim flex-wrap">
            <span className="font-bold text-green-dark flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-green-mid" />
              {meeting.companyName}
            </span>

            {meeting.contactName && (
              <span className="flex items-center gap-1 text-text-muted">
                <User className="w-3.5 h-3.5" />
                {meeting.contactName}
                {meeting.contactEmail && ` (${meeting.contactEmail})`}
              </span>
            )}
          </div>
        </div>

        {/* Calendar Export & Quick Links */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={generateGoogleCalendarUrl(meeting)}
            target="_blank"
            rel="noopener noreferrer"
            title="Add to Google Calendar"
            className="p-1.5 rounded-xl border border-green-dark/10 bg-butter-bg/60 text-green-dark hover:bg-butter-warm transition-colors text-xs font-semibold flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-green-mid" />
            <span className="hidden sm:inline text-[11px]">Google Cal</span>
          </a>

          <button
            type="button"
            onClick={() => downloadIcsFile(meeting)}
            title="Download .ics file"
            className="p-1.5 rounded-xl border border-green-dark/10 bg-butter-bg/60 text-green-dark hover:bg-butter-warm transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-green-mid" />
            <span className="hidden sm:inline text-[11px]">.ics</span>
          </button>
        </div>
      </div>

      {/* Date, Time & Location Pill Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Date & Time Range */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-butter-bg border border-green-dark/8 font-medium text-green-dark">
          <Clock className="w-3.5 h-3.5 text-green-mid shrink-0" />
          <span>{formatMeetingDate(meeting.startsAt)}</span>
          <span className="text-text-muted">•</span>
          <span className="font-bold">
            {formatMeetingTimeRange(meeting.startsAt, meeting.durationMins)}
          </span>
        </div>

        {/* Mode Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-green-dark/10 text-text-dim">
          {getModeIcon()}
          <span>{getModeLabel()}</span>
        </div>

        {/* Location / Meeting Link */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-green-dark/10 max-w-full truncate">
          {isLink ? (
            <a
              href={meeting.location}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-mid font-semibold hover:underline flex items-center gap-1 truncate"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{meeting.location}</span>
            </a>
          ) : (
            <span className="text-text-dim truncate flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-green-mid shrink-0" />
              <span className="truncate">{meeting.location}</span>
            </span>
          )}
        </div>
      </div>

      {/* Meeting Notes */}
      {meeting.notes && (
        <div className="bg-butter-bg/40 border border-green-dark/6 rounded-xl p-3 text-xs text-text-dim leading-relaxed">
          <span className="font-bold text-green-dark block mb-0.5 text-[11px] uppercase tracking-wider">
            Discussion Agenda:
          </span>
          {meeting.notes}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="pt-3 border-t border-green-dark/10 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Links: Open Sponsor & Open Reply */}
        <div className="flex items-center gap-2">
          <Link
            href="/app/sponsors"
            className="text-xs font-bold text-green-dark hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-butter-warm/40 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-green-mid" />
            <span>Open Sponsor</span>
          </Link>

          <Link
            href="/app/replies"
            className="text-xs font-bold text-green-dark hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-butter-warm/40 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-green-mid" />
            <span>Open Reply Thread</span>
          </Link>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {isConfirmingCancel ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-50 border border-red-200">
              <span className="text-xs text-red-700 font-bold px-2">Cancel meeting?</span>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUpdating}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(false)}
                className="px-2 py-1 text-xs text-text-dim hover:text-green-dark cursor-pointer"
              >
                Keep
              </button>
            </div>
          ) : (
            <>
              {meeting.status === "scheduled" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReschedule(meeting)}
                    className="text-xs font-bold h-8 gap-1.5"
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </Button>

                  <Button
                    variant="green"
                    size="sm"
                    disabled={isUpdating}
                    onClick={handleComplete}
                    className="text-xs font-bold h-8 gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(true)}
                    className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}

              {meeting.status === "completed" && (
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 px-2 py-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Discussion Concluded</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
