"use client";

import React, { useEffect } from "react";
import { Meeting } from "@/types";
import { Calendar, X, Plus } from "lucide-react";
import { MeetingCard } from "./MeetingCard";
import { Button } from "@/components/ui/button";
import { formatMeetingDate } from "@/lib/meetings/calendar-helpers";

interface DayMeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  meetings: Meeting[];
  onReschedule: (meeting: Meeting) => void;
  onMarkCompleted: (meetingId: string) => Promise<void>;
  onCancel: (meetingId: string) => Promise<void>;
  onScheduleNew?: () => void;
}

export const DayMeetingsModal: React.FC<DayMeetingsModalProps> = ({
  isOpen,
  onClose,
  date,
  meetings,
  onReschedule,
  onMarkCompleted,
  onCancel,
  onScheduleNew,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-green-hero/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-modal-title"
        className="relative w-full max-w-2xl bg-[#FFFDF6] rounded-3xl shadow-2xl border border-green-dark/15 z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-green-dark/10 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-green-dark text-butter-cream flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="day-modal-title" className="font-heading font-extrabold text-lg text-green-dark">
                {formatMeetingDate(date.toISOString())}
              </h2>
              <p className="text-xs text-text-dim">
                {meetings.length} scheduled sync{meetings.length === 1 ? "" : "s"} on this date
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onScheduleNew && (
              <Button
                variant="green"
                size="sm"
                onClick={() => {
                  onClose();
                  onScheduleNew();
                }}
                className="text-xs font-bold gap-1.5 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule New</span>
              </Button>
            )}

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-xl text-text-muted hover:text-green-dark hover:bg-butter-warm/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {meetings.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-green-dark/10 space-y-2">
              <Calendar className="w-8 h-8 text-green-mid mx-auto opacity-50" />
              <p className="text-sm font-bold text-green-dark">No syncs scheduled for this date</p>
              <p className="text-xs text-text-muted">
                Pick another date or schedule a discussion with an interested sponsor.
              </p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onReschedule={(m) => {
                  onClose();
                  onReschedule(m);
                }}
                onMarkCompleted={onMarkCompleted}
                onCancel={onCancel}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
