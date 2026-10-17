"use client";

import React, { useState } from "react";
import { Meeting } from "@/types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScheduleCalendarProps {
  meetings: Meeting[];
  onSelectDay: (date: Date, dayMeetings: Meeting[]) => void;
  onAddNewMeeting: (date: Date) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  meetings,
  onSelectDay,
  onAddNewMeeting,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build grid days
  const calendarDays: Array<{
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    dayNum: number;
    meetings: Meeting[];
  }> = [];

  // 1. Days from previous month to fill the first row
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayNum);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      dayNum,
      meetings: getMeetingsForDate(date, meetings),
    });
  }

  // 2. Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isToday =
      isCurrentMonth &&
      today.getDate() === d &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday,
      dayNum: d,
      meetings: getMeetingsForDate(date, meetings),
    });
  }

  // 3. Days from next month to complete the grid (up to 35 or 42 cells)
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const date = new Date(year, month + 1, d);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      dayNum: d,
      meetings: getMeetingsForDate(date, meetings),
    });
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-3xl border border-green-dark/12 shadow-sm overflow-hidden flex flex-col">
      {/* Calendar Header Controls */}
      <div className="p-4 sm:p-6 border-b border-green-dark/10 flex flex-wrap items-center justify-between gap-3 bg-butter-bg/40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-dark text-butter-cream flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-black text-xl text-green-dark">
              {monthName}
            </h2>
            <p className="text-xs text-text-dim">
              Monthly overview of scheduled sponsor syncs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="green"
            size="sm"
            onClick={() => onAddNewMeeting(new Date())}
            className="text-xs font-bold h-8 gap-1.5 shadow-2xs mr-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Meeting</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs font-bold h-8 border-green-dark/15 text-green-dark"
          >
            Today
          </Button>

          <div className="flex items-center rounded-xl border border-green-dark/15 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 hover:bg-butter-warm/60 text-green-dark transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-green-dark/10" />
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 hover:bg-butter-warm/60 text-green-dark transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-green-dark/8 bg-[#FAF6EC] text-center text-xs font-bold text-green-dark/70 py-2.5">
        {weekdays.map((day) => (
          <div key={day} className="tracking-wide uppercase text-[11px]">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-green-dark/8 bg-green-dark/4">
        {calendarDays.map((cell, idx) => {
          const hasMeetings = cell.meetings.length > 0;
          const cellDateFormatted = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
          }).format(cell.date);

          const ariaLabel = `${cellDateFormatted}${
            hasMeetings
              ? `, ${cell.meetings.length} meeting${cell.meetings.length > 1 ? "s" : ""}`
              : ", click to schedule meeting"
          }`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (hasMeetings) {
                  onSelectDay(cell.date, cell.meetings);
                } else {
                  onAddNewMeeting(cell.date);
                }
              }}
              aria-label={ariaLabel}
              className={cn(
                "min-h-[90px] sm:min-h-[120px] md:min-h-[135px] lg:min-h-[150px] p-2 text-left flex flex-col justify-between transition-all group relative cursor-pointer",
                cell.isCurrentMonth ? "bg-white" : "bg-[#FAF8F2]/60 opacity-60",
                cell.isToday && "ring-2 ring-inset ring-green-mid bg-butter-bg/30",
                "hover:bg-butter-warm/40 focus:outline-hidden focus:ring-2 focus:ring-green-dark"
              )}
            >
              {/* Day Header Row */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    "text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full",
                    cell.isToday
                      ? "bg-green-dark text-butter-cream shadow-2xs font-black"
                      : cell.isCurrentMonth
                      ? "text-green-dark"
                      : "text-text-muted"
                  )}
                >
                  {cell.dayNum}
                </span>

                <div className="flex items-center gap-1">
                  {/* Quick Add Button on Hover/Focus */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNewMeeting(cell.date);
                    }}
                    title={`Schedule meeting on ${cellDateFormatted}`}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md hover:bg-green-dark hover:text-butter-cream text-green-dark/70 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </span>

                  {/* Mobile Dot Indicator */}
                  {hasMeetings && (
                    <div className="md:hidden flex items-center gap-0.5">
                      {cell.meetings.slice(0, 3).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            m.status === "completed"
                              ? "bg-sky-500"
                              : m.status === "cancelled"
                              ? "bg-stone-400"
                              : "bg-emerald-600"
                          )}
                        />
                      ))}
                      {cell.meetings.length > 3 && (
                        <span className="text-[9px] font-bold text-green-dark">+</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Meeting Chips (Supports multiple meetings per day) */}
              <div className="hidden md:flex flex-col gap-1 w-full mt-1.5 overflow-hidden">
                {cell.meetings.slice(0, 3).map((m) => {
                  const startTime = new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }).format(new Date(m.startsAt));

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate border shadow-2xs flex items-center gap-1",
                        m.status === "completed"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : m.status === "cancelled"
                          ? "bg-stone-100 text-stone-600 border-stone-200 line-through"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      )}
                      title={`${m.companyName} at ${startTime} - ${m.title}`}
                    >
                      <Clock className="w-2.5 h-2.5 shrink-0 text-green-mid" />
                      <span className="font-bold shrink-0">{startTime}</span>
                      <span className="truncate">{m.companyName}</span>
                    </div>
                  );
                })}

                {cell.meetings.length > 3 && (
                  <span className="text-[10px] font-bold text-green-mid px-1">
                    +{cell.meetings.length - 3} more syncs
                  </span>
                )}
              </div>

              {/* Bottom Subtle Status */}
              <div className="hidden sm:flex items-center justify-between text-[9px] text-text-muted mt-auto pt-1 w-full">
                {cell.isToday && <span className="font-bold text-green-dark">Today</span>}
                {!cell.isToday && cell.isCurrentMonth && !hasMeetings && (
                  <span className="text-text-muted/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to add
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

function getMeetingsForDate(date: Date, allMeetings: Meeting[]): Meeting[] {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  return allMeetings.filter((meeting) => {
    const meetDate = new Date(meeting.startsAt);
    return (
      meetDate.getFullYear() === y &&
      meetDate.getMonth() === m &&
      meetDate.getDate() === d
    );
  });
}
