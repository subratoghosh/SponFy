import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, verifyCompanyOwnership } from "@/lib/security/auth-guard";
import { getMeetings, createMeeting } from "@/lib/data/repositories/meetings";
import { updateSponsorStage, getSponsorById } from "@/lib/data/repositories/sponsors";
import { formatMeetingTimeRange, formatMeetingDate } from "@/lib/meetings/calendar-helpers";

export const runtime = "nodejs";

const CreateMeetingSchema = z.object({
  companyId: z.string().optional().or(z.literal("")),
  companyName: z.string().min(1, "Company or Sponsor Name is required"),
  campaignId: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid contact email").optional().or(z.literal("")),
  replyMessageId: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  startsAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date/time format",
  }),
  durationMins: z.number().int().min(10, "Minimum duration is 10 minutes").max(240, "Maximum duration is 4 hours"),
  mode: z.enum(["video", "phone", "in_person"]),
  location: z.string().min(1, "Meeting link or location address is required"),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const companyId = searchParams.get("companyId") || undefined;
    const status = searchParams.get("status") || undefined;

    let meetings = await getMeetings(userId, campaignId);

    if (companyId) {
      meetings = meetings.filter((m) => m.companyId === companyId);
    }
    if (status) {
      meetings = meetings.filter((m) => m.status === status);
    }

    return NextResponse.json({
      success: true,
      data: meetings,
    });
  } catch (err: any) {
    console.error("GET /api/meetings error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve meetings", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Require server authentication
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;

    // 2. Validate request body
    const body = await req.json();
    const parsed = CreateMeetingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      companyName,
      campaignId,
      contactName,
      contactEmail,
      replyMessageId,
      title,
      startsAt,
      durationMins,
      mode,
      location,
      notes,
    } = parsed.data;

    const resolvedCompanyId = parsed.data.companyId?.trim() || `comp-adhoc-${Date.now()}`;

    // 3. Verify company belongs to the authenticated user if referencing an existing company
    if (
      parsed.data.companyId &&
      !parsed.data.companyId.startsWith("comp-adhoc-") &&
      !parsed.data.companyId.startsWith("custom-")
    ) {
      const ownedCompany = await verifyCompanyOwnership(parsed.data.companyId, userId);
      if (!ownedCompany) {
        return NextResponse.json(
          { error: "Company not found or access denied", code: "FORBIDDEN" },
          { status: 403 }
        );
      }
    }

    // 4. Reject startsAt in the past (with 1-min grace period)
    const startTimeMs = new Date(startsAt).getTime();
    if (startTimeMs <= Date.now() - 60000) {
      return NextResponse.json(
        {
          error: "Meeting start time must be in the future. Please select an upcoming date and time.",
          code: "INVALID_START_TIME",
        },
        { status: 400 }
      );
    }

    // 5. Check for overlapping meetings for the user (status !== "cancelled")
    const endTimeMs = startTimeMs + durationMins * 60 * 1000;
    const existingMeetings = await getMeetings(userId);
    const activeMeetings = existingMeetings.filter((m) => m.status !== "cancelled");

    const conflict = activeMeetings.find((m) => {
      const mStart = new Date(m.startsAt).getTime();
      const mEnd = mStart + m.durationMins * 60 * 1000;
      return startTimeMs < mEnd && endTimeMs > mStart;
    });

    if (conflict) {
      const conflictDate = formatMeetingDate(conflict.startsAt);
      const conflictRange = formatMeetingTimeRange(conflict.startsAt, conflict.durationMins);
      return NextResponse.json(
        {
          error: `Time slot conflict: You already have "${conflict.title}" scheduled on ${conflictDate} (${conflictRange}). Please choose an alternate slot.`,
          code: "MEETING_CONFLICT",
        },
        { status: 409 }
      );
    }

    // 6. Create meeting
    const meeting = await createMeeting({
      userId,
      companyId: resolvedCompanyId,
      companyName,
      campaignId,
      contactName,
      contactEmail: contactEmail || undefined,
      replyMessageId,
      title,
      startsAt,
      durationMins,
      mode,
      location,
      notes,
      status: "scheduled",
    });

    // 7. Update sponsor pipeline stage to "Negotiation" if currently "Replied" or "Interested"
    try {
      const currentSponsor = await getSponsorById(resolvedCompanyId);
      const stageLower = (currentSponsor?.stage || "").toLowerCase();
      if (stageLower === "replied" || stageLower === "interested") {
        await updateSponsorStage(resolvedCompanyId, "Negotiation");
      }
    } catch (stageErr) {
      console.warn("Failed to advance sponsor stage to Negotiation on meeting creation:", stageErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: meeting,
        message: "Meeting scheduled successfully",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/meetings error:", err);
    return NextResponse.json(
      { error: "Failed to schedule meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
