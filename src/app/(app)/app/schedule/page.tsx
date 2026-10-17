"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Meeting } from "@/types";
import {
  CalendarDays,
  ListFilter,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { ScheduleSummaryRow } from "@/components/schedule/ScheduleSummaryRow";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { UpcomingListView } from "@/components/schedule/UpcomingListView";
import { DayMeetingsModal } from "@/components/schedule/DayMeetingsModal";
import { ScheduleMeetingModal } from "@/components/replies/ScheduleMeetingModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "upcoming">("upcoming");

  // Selected date modal state
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [selectedDayMeetings, setSelectedDayMeetings] = useState<Meeting[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Reschedule / Create modal state
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default to Month Calendar on tablet/desktop, Upcoming on phones
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setViewMode("calendar");
    }
  }, []);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMeetings(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch meetings:", err);
      toast("Failed to load meetings", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleSelectDay = (date: Date, dayMeetings: Meeting[]) => {
    setSelectedDayDate(date);
    setSelectedDayMeetings(dayMeetings);
    setIsDayModalOpen(true);
  };

  const handleReschedule = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleMarkCompleted = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to mark meeting completed", "error");
        return;
      }

      toast("Meeting marked as completed!", "success");
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, status: "completed" } : m))
      );
    } catch {
      toast("Error updating meeting status", "error");
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to cancel meeting", "error");
        return;
      }

      toast("Meeting cancelled successfully", "success");
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, status: "cancelled" } : m))
      );
    } catch {
      toast("Error cancelling meeting", "error");
    }
  };

  const activeMeetings = meetings.filter((m) => m.status !== "cancelled");

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)] bg-[#FAF4E6]">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-green-dark text-butter-cream flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
                Schedule & Meetings
              </h1>
              <p className="text-xs text-text-dim">
                Confirmed sponsor partner discussions and sync calendar
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-green-dark/15 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "calendar"
                  ? "bg-green-dark text-butter-cream shadow-xs"
                  : "text-green-dark hover:bg-butter-warm/40"
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("upcoming")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "upcoming"
                  ? "bg-green-dark text-butter-cream shadow-xs"
                  : "text-green-dark hover:bg-butter-warm/40"
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Upcoming List</span>
            </button>
          </div>

          <Link href="/app/replies">
            <Button variant="outline" size="sm" className="text-xs font-bold h-9 gap-1.5 border-green-dark/15">
              <span>View Inbound Replies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Row */}
      <ScheduleSummaryRow meetings={meetings} />

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-green-dark/10">
          <RefreshCw className="w-6 h-6 animate-spin text-green-mid mx-auto mb-2" />
          <p className="text-xs font-bold text-green-dark">Loading your schedule...</p>
        </div>
      ) : activeMeetings.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-green-dark/12 shadow-sm text-center max-w-xl mx-auto space-y-4 my-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-butter-bg text-green-dark flex items-center justify-center mx-auto border border-green-dark/10 shadow-xs">
            <CalendarDays className="w-8 h-8 text-green-mid" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-heading font-black text-xl text-green-dark">
              No meetings yet
            </h3>
            <p className="text-xs sm:text-sm text-text-dim leading-relaxed max-w-md mx-auto">
              When a sponsor replies with interest, arrange a meeting from Replies.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link href="/app/replies">
              <Button variant="green" className="text-xs font-bold gap-2">
                <span>Go to Replies</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Active View: Month Calendar or Upcoming List */
        <div className="animate-fade-in">
          {viewMode === "calendar" ? (
            <ScheduleCalendar
              meetings={meetings}
              onSelectDay={handleSelectDay}
            />
          ) : (
            <UpcomingListView
              meetings={activeMeetings}
              onReschedule={handleReschedule}
              onMarkCompleted={handleMarkCompleted}
              onCancel={handleCancelMeeting}
            />
          )}
        </div>
      )}

      {/* Day Details Modal */}
      <DayMeetingsModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={selectedDayDate}
        meetings={selectedDayMeetings}
        onReschedule={handleReschedule}
        onMarkCompleted={handleMarkCompleted}
        onCancel={handleCancelMeeting}
      />

      {/* Reschedule Modal */}
      {editingMeeting && (
        <ScheduleMeetingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMeeting(null);
          }}
          initialMeeting={editingMeeting}
          companyName={editingMeeting.companyName}
          companyId={editingMeeting.companyId}
          onSuccess={(updated) => {
            setMeetings((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m))
            );
            setIsModalOpen(false);
            setEditingMeeting(null);
          }}
        />
      )}
    </div>
  );
}
