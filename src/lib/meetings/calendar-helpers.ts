import { Meeting } from "@/types";

/**
 * Formats a Date to YYYYMMDDTHHmmssZ in UTC for calendar templates (.ics and Google Calendar)
 */
export function formatToUtcCalendarDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Generates an 'Add to Google Calendar' template link (no OAuth required)
 */
export function generateGoogleCalendarUrl(meeting: Meeting): string {
  const start = new Date(meeting.startsAt);
  const end = new Date(start.getTime() + meeting.durationMins * 60 * 1000);

  const startUtc = formatToUtcCalendarDate(start);
  const endUtc = formatToUtcCalendarDate(end);

  const details = [
    `Sponsor: ${meeting.companyName}`,
    meeting.contactName ? `Contact: ${meeting.contactName} (${meeting.contactEmail || "N/A"})` : "",
    meeting.notes ? `\nNotes:\n${meeting.notes}` : "",
    `\nLocation / Link: ${meeting.location}`,
    `\nScheduled via SponFy — Sponsor Outreach Platform`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${startUtc}/${endUtc}`,
    details,
    location: meeting.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a standard RFC 5545 iCalendar (.ics) string
 */
export function generateIcsContent(meeting: Meeting): string {
  const start = new Date(meeting.startsAt);
  const end = new Date(start.getTime() + meeting.durationMins * 60 * 1000);
  const now = new Date();

  const startUtc = formatToUtcCalendarDate(start);
  const endUtc = formatToUtcCalendarDate(end);
  const nowUtc = formatToUtcCalendarDate(now);

  const escapeIcs = (text: string) =>
    text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const description = escapeIcs(
    `Sponsor: ${meeting.companyName}\n` +
      (meeting.contactName ? `Contact: ${meeting.contactName} (${meeting.contactEmail || "N/A"})\n` : "") +
      (meeting.notes ? `Notes: ${meeting.notes}\n` : "") +
      `Location: ${meeting.location}\nScheduled via SponFy`
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SponFy//Sponsorship Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${meeting.id}@sponfy.dev`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcs(meeting.title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeIcs(meeting.location)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers a client-side .ics file download
 */
export function downloadIcsFile(meeting: Meeting): void {
  if (typeof window === "undefined") return;

  const icsData = generateIcsContent(meeting);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const sanitizedTitle = meeting.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  link.setAttribute("download", `meeting-${sanitizedTitle}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
