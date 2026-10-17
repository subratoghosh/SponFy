"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  X,
  ExternalLink,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { Meeting, MeetingMode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  generateGoogleCalendarUrl,
  downloadIcsFile,
  getUserTimezone,
  formatMeetingTimeRange,
  formatMeetingDate,
} from "@/lib/meetings/calendar-helpers";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  companyId?: string;
  campaignId?: string;
  contactName?: string;
  contactEmail?: string;
  replyMessageId?: string;
  initialMeeting?: Meeting | null;
  initialDate?: Date | string | null;
  initialTime?: string | null;
  onSuccess?: (meeting: Meeting) => void;
  onDraftConfirmationReply?: (meeting: Meeting) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  companyName = "Sponsor",
  companyId = "",
  campaignId,
  contactName,
  contactEmail,
  replyMessageId,
  initialMeeting,
  initialDate,
  initialTime,
  onSuccess,
  onDraftConfirmationReply,
}) => {
  const isEditing = Boolean(initialMeeting);
  const modalRef = useRef<HTMLDivElement>(null);

  // Form states
  const [targetCompanyName, setTargetCompanyName] = useState(companyName);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [mode, setMode] = useState<MeetingMode>("video");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<Meeting | null>(null);

  const userTimezone = getUserTimezone();

  // Compute minimum date (today) in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      setScheduledMeeting(null);
      setErrors({});

      const effectiveCompany = initialMeeting?.companyName || (companyName !== "Sponsor" ? companyName : "");
      setTargetCompanyName(effectiveCompany);

      if (initialMeeting) {
        setTitle(initialMeeting.title);
        const startDate = new Date(initialMeeting.startsAt);
        const localDate = startDate.toISOString().split("T")[0];
        const hours = String(startDate.getHours()).padStart(2, "0");
        const minutes = String(startDate.getMinutes()).padStart(2, "0");
        setDate(localDate);
        setTime(`${hours}:${minutes}`);
        setDuration(initialMeeting.durationMins);
        setMode(initialMeeting.mode);
        setLocation(initialMeeting.location);
        setNotes(initialMeeting.notes || "");
      } else {
        const displayComp = effectiveCompany || "Sponsor";
        setTitle(`SponFy x ${displayComp} sponsorship discussion`);
        
        // Resolve initial date if passed from calendar click
        let resolvedDateStr = "";
        if (initialDate instanceof Date) {
          const y = initialDate.getFullYear();
          const m = String(initialDate.getMonth() + 1).padStart(2, "0");
          const d = String(initialDate.getDate()).padStart(2, "0");
          resolvedDateStr = `${y}-${m}-${d}`;
        } else if (typeof initialDate === "string" && initialDate) {
          resolvedDateStr = initialDate.includes("T") ? initialDate.split("T")[0] : initialDate;
        }

        if (resolvedDateStr) {
          setDate(resolvedDateStr);
        } else {
          // Default to tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setDate(tomorrow.toISOString().split("T")[0]);
        }

        setTime(initialTime || "16:00");
        setDuration(30);
        setMode("video");
        setLocation("https://meet.google.com/new");
        setNotes(`Sync to discuss deliverables, partnership tiers, and timeline for ${displayComp}.`);
      }
    }
  }, [isOpen, initialMeeting, companyName, initialDate, initialTime]);

  // Trap focus and close on Escape
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

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!targetCompanyName.trim() && !companyName) {
      errs.companyName = "Sponsor or company name is required";
    }

    if (!title.trim()) {
      errs.title = "Meeting title is required";
    }

    if (!date) {
      errs.date = "Please select a meeting date";
    }

    if (!time) {
      errs.time = "Please select a start time";
    }

    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const meetingStart = new Date(date);
      meetingStart.setHours(hours, minutes, 0, 0);

      // Only reject past times if scheduling for today
      const today = new Date();
      const isDateToday =
        meetingStart.getFullYear() === today.getFullYear() &&
        meetingStart.getMonth() === today.getMonth() &&
        meetingStart.getDate() === today.getDate();

      if (isDateToday && meetingStart.getTime() <= Date.now() - 60000 && !isEditing) {
        errs.time = "Meeting start time must be in the future";
      }
    }

    if ((mode === "video" || mode === "in_person") && !location.trim()) {
      errs.location =
        mode === "video"
          ? "Video meeting link is required (e.g. Google Meet or Zoom)"
          : "Physical location address is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const effectiveCompany = targetCompanyName.trim() || companyName || "Sponsor";

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const meetingStart = new Date(date);
      meetingStart.setHours(hours, minutes, 0, 0);
      const startsAt = meetingStart.toISOString();

      if (isEditing && initialMeeting) {
        const res = await fetch(`/api/meetings/${initialMeeting.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            startsAt,
            durationMins: duration,
            mode,
            location,
            notes,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrors({ submit: data.error || "Failed to reschedule meeting" });
          toast(data.error || "Rescheduling conflict", "error");
          return;
        }

        toast("Meeting rescheduled successfully", "success");
        if (onSuccess) onSuccess(data.data);
        setScheduledMeeting(data.data);
      } else {
        const res = await fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: companyId || "",
            companyName: effectiveCompany,
            campaignId,
            contactName,
            contactEmail,
            replyMessageId,
            title,
            startsAt,
            durationMins: duration,
            mode,
            location,
            notes,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrors({ submit: data.error || "Failed to schedule meeting" });
          toast(data.error || "Meeting conflict", "error");
          return;
        }

        toast(`Meeting arranged with ${effectiveCompany}!`, "success");
        if (onSuccess) onSuccess(data.data);
        setScheduledMeeting(data.data);
      }
    } catch {
      setErrors({ submit: "A network error occurred while scheduling the meeting" });
      toast("Failed to schedule meeting", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-green-dark/15 z-10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-green-dark/10 flex items-center justify-between bg-butter-bg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-dark text-butter-cream flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-headline" className="font-heading font-extrabold text-lg text-green-dark">
                {isEditing ? "Reschedule Meeting" : "Arrange Meeting with Sponsor"}
              </h2>
              <p className="text-xs text-text-dim">
                Sync discussion with <span className="font-bold text-green-dark">{companyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-text-muted hover:text-green-dark hover:bg-butter-warm/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {scheduledMeeting ? (
            /* Success confirmation state with calendar helpers */
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-heading font-black text-xl text-green-dark">
                  Meeting Confirmed!
                </h3>
                <p className="text-xs text-text-dim mt-1">
                  Scheduled with {scheduledMeeting.companyName}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-butter-bg/60 border border-green-dark/10 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="font-bold text-green-dark text-sm">
                  {scheduledMeeting.title}
                </div>
                <div className="flex items-center gap-2 text-text-dim">
                  <Calendar className="w-3.5 h-3.5 text-green-mid" />
                  <span>{formatMeetingDate(scheduledMeeting.startsAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-text-dim">
                  <Clock className="w-3.5 h-3.5 text-green-mid" />
                  <span>
                    {formatMeetingTimeRange(scheduledMeeting.startsAt, scheduledMeeting.durationMins)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-dim">
                  <Globe className="w-3.5 h-3.5 text-green-mid" />
                  <span className="truncate">{scheduledMeeting.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={generateGoogleCalendarUrl(scheduledMeeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-green-dark/20 bg-white text-green-dark text-xs font-bold hover:bg-butter-warm/50 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-green-mid" />
                    <span>Add to Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadIcsFile(scheduledMeeting)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-green-dark/20 bg-white text-green-dark text-xs font-bold hover:bg-butter-warm/50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-green-mid" />
                    <span>Download .ics file</span>
                  </button>
                </div>

                {onDraftConfirmationReply && (
                  <Button
                    variant="green"
                    className="w-full text-xs font-bold gap-2 py-2.5"
                    onClick={() => {
                      onDraftConfirmationReply(scheduledMeeting);
                      onClose();
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Draft Confirmation Reply</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full text-xs font-bold"
                  onClick={onClose}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Meeting Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Sponsor & Title Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-green-dark mb-1">
                    Sponsor / Company Name
                  </label>
                  <Input
                    value={targetCompanyName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetCompanyName(val);
                      if (!isEditing && (!title || title.startsWith("SponFy x"))) {
                        setTitle(`SponFy x ${val.trim() || "Sponsor"} sponsorship discussion`);
                      }
                    }}
                    placeholder="e.g. Google Cloud, Razorpay"
                    className="bg-white text-xs"
                  />
                  {errors.companyName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-green-dark mb-1">
                    Meeting Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. SponFy x Postman sponsorship discussion"
                    className="bg-white text-xs"
                  />
                  {errors.title && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-green-dark mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white text-xs"
                  />
                  {errors.date && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-green-dark">
                      Start Time
                    </label>
                    <span className="text-[10px] text-text-muted font-mono">
                      {userTimezone}
                    </span>
                  </div>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-white text-xs"
                  />
                  {/* Quick-Pick Times */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["09:30", "11:00", "14:00", "16:00", "17:30"].map((t) => {
                      const [h, m] = t.split(":");
                      const hNum = parseInt(h, 10);
                      const display = `${hNum > 12 ? hNum - 12 : hNum}:${m} ${hNum >= 12 ? "PM" : "AM"}`;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTime(t)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            time === t
                              ? "bg-green-dark text-butter-cream border-green-dark shadow-2xs"
                              : "bg-butter-warm/40 text-green-dark border-green-dark/15 hover:bg-butter-warm"
                          }`}
                        >
                          {display}
                        </button>
                      );
                    })}
                  </div>
                  {errors.time && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Duration Pills */}
              <div>
                <label className="block text-xs font-bold text-green-dark mb-1.5">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        duration === mins
                          ? "bg-green-dark text-butter-cream border-green-dark shadow-2xs"
                          : "bg-white text-green-dark border-green-dark/15 hover:bg-butter-warm/40"
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-green-dark mb-1.5">
                  Meeting Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("video")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mode === "video"
                        ? "bg-green-dark text-butter-cream border-green-dark shadow-2xs"
                        : "bg-white text-green-dark border-green-dark/15 hover:bg-butter-warm/40"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("phone")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mode === "phone"
                        ? "bg-green-dark text-butter-cream border-green-dark shadow-2xs"
                        : "bg-white text-green-dark border-green-dark/15 hover:bg-butter-warm/40"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("in_person")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mode === "in_person"
                        ? "bg-green-dark text-butter-cream border-green-dark shadow-2xs"
                        : "bg-white text-green-dark border-green-dark/15 hover:bg-butter-warm/40"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>In Person</span>
                  </button>
                </div>
              </div>

              {/* Location or Meeting Link */}
              <div>
                <label className="block text-xs font-bold text-green-dark mb-1">
                  {mode === "video"
                    ? "Video Call Link (Google Meet / Zoom)"
                    : mode === "phone"
                    ? "Phone Number or Dial-In"
                    : "Location Address / Room"}
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    mode === "video"
                      ? "https://meet.google.com/xyz-abcd-efg"
                      : mode === "phone"
                      ? "+91 98765 43210"
                      : "Campus Hall B, Meeting Room 204"
                  }
                  className="bg-white text-xs"
                />
                {errors.location && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.location}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-green-dark mb-1">
                  Agenda & Notes (Optional)
                </label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agenda items, topics to cover, or expectations..."
                  className="bg-white text-xs leading-relaxed"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-green-dark/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="green"
                  size="sm"
                  disabled={isSubmitting}
                  className="font-bold gap-2 min-w-[120px]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? "Scheduling..."
                      : isEditing
                      ? "Confirm Reschedule"
                      : "Confirm Meeting"}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
