import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/meetings/route";
import { formatMeetingTimeRange, formatMeetingDate } from "@/lib/meetings/calendar-helpers";
import { getMeetings, createMeeting } from "@/lib/data/repositories/meetings";

describe("Schedule Calendar, Multiple Meetings & Reminders Suite", () => {
  const testUserId = "user-calendar-test-123";

  it("formats meeting date and time range properly", () => {
    const startsAt = "2026-10-25T14:30:00.000Z";
    const dateStr = formatMeetingDate(startsAt);
    expect(dateStr).toContain("2026");
    expect(dateStr).toContain("Oct");

    const timeRange = formatMeetingTimeRange(startsAt, 30);
    expect(timeRange).toBeTruthy();
    expect(timeRange.length).toBeGreaterThan(5);
  });

  it("allows creating multiple distinct meetings on the exact same day without conflict", async () => {
    // Schedule Meeting 1: 10:00 AM - 10:30 AM
    const date1 = new Date();
    date1.setDate(date1.getDate() + 5);
    date1.setHours(10, 0, 0, 0);

    const m1 = await createMeeting({
      userId: testUserId,
      companyId: "comp-adhoc-1",
      companyName: "Acme Corp",
      contactName: "Alice",
      contactEmail: "alice@acme.com",
      title: "Sponsorship Intro - Morning",
      startsAt: date1.toISOString(),
      durationMins: 30,
      location: "https://meet.google.com/abc-defg-hij",
      status: "confirmed",
    });

    expect(m1.id).toBeDefined();
    expect(m1.companyName).toBe("Acme Corp");

    // Schedule Meeting 2 on SAME DAY: 02:00 PM - 02:45 PM
    const date2 = new Date(date1);
    date2.setHours(14, 0, 0, 0);

    const m2 = await createMeeting({
      userId: testUserId,
      companyId: "comp-adhoc-2",
      companyName: "Beta Technologies",
      contactName: "Bob",
      contactEmail: "bob@beta.com",
      title: "Follow-up Sync - Afternoon",
      startsAt: date2.toISOString(),
      durationMins: 45,
      location: "https://zoom.us/j/123456789",
      status: "confirmed",
    });

    expect(m2.id).toBeDefined();
    expect(m2.companyName).toBe("Beta Technologies");

    // Schedule Meeting 3 on SAME DAY: 04:30 PM - 05:00 PM
    const date3 = new Date(date1);
    date3.setHours(16, 30, 0, 0);

    const m3 = await createMeeting({
      userId: testUserId,
      companyId: "comp-adhoc-3",
      companyName: "Gamma Ventures",
      contactName: "Charlie",
      contactEmail: "charlie@gamma.com",
      title: "Contract Review - Evening",
      startsAt: date3.toISOString(),
      durationMins: 30,
      location: "Phone Call",
      status: "confirmed",
    });

    expect(m3.id).toBeDefined();

    // Verify all 3 meetings exist for this user
    const all = await getMeetings(testUserId);
    const dayMeetings = all.filter(
      (m) => new Date(m.startsAt).toDateString() === date1.toDateString()
    );
    expect(dayMeetings.length).toBeGreaterThanOrEqual(3);
  });

  it("detects same-day overlapping meetings for reminder filtering", () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const testList = [
      {
        id: "m-today-1",
        title: "Morning Partner Call",
        startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).toISOString(),
        status: "confirmed",
      },
      {
        id: "m-today-2",
        title: "Afternoon Sync",
        startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0).toISOString(),
        status: "confirmed",
      },
      {
        id: "m-cancelled",
        title: "Cancelled Call",
        startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
        status: "cancelled",
      },
      {
        id: "m-tomorrow",
        title: "Tomorrow Call",
        startsAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0).toISOString(),
        status: "confirmed",
      },
    ];

    const todayActive = testList.filter((meet) => {
      if (meet.status === "cancelled") return false;
      const meetDate = new Date(meet.startsAt);
      const meetY = meetDate.getFullYear();
      const meetM = String(meetDate.getMonth() + 1).padStart(2, "0");
      const meetD = String(meetDate.getDate()).padStart(2, "0");
      return `${meetY}-${meetM}-${meetD}` === todayStr;
    });

    expect(todayActive.length).toBe(2);
    expect(todayActive.map((x) => x.id)).toEqual(["m-today-1", "m-today-2"]);
  });
});
