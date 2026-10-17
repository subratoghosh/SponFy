import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import {
  getMeetingById,
  getMeetings,
  updateMeeting,
  cancelMeeting,
} from "@/lib/data/repositories/meetings";
import { formatMeetingTimeRange, formatMeetingDate } from "@/lib/meetings/calendar-helpers";

export const runtime = "nodejs";

const UpdateMeetingSchema = z.object({
  title: z.string().min(3).optional(),
  startsAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .optional(),
  durationMins: z.number().int().min(10).max(240).optional(),
  mode: z.enum(["video", "phone", "in_person"]).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;
    const { id } = await params;

    const existing = await getMeetingById(id, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Meeting not found or access denied", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = UpdateMeetingSchema.safeParse(body);
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

    const patch = parsed.data;

    // If rescheduling, check for conflicts with other active meetings
    const newStartsAt = patch.startsAt || existing.startsAt;
    const newDuration = patch.durationMins || existing.durationMins;

    if (patch.startsAt || patch.durationMins) {
      const startTimeMs = new Date(newStartsAt).getTime();
      const endTimeMs = startTimeMs + newDuration * 60 * 1000;

      const userMeetings = await getMeetings(userId);
      const conflict = userMeetings.find((m) => {
        if (m.id === id || m.status === "cancelled") return false;
        const mStart = new Date(m.startsAt).getTime();
        const mEnd = mStart + m.durationMins * 60 * 1000;
        return startTimeMs < mEnd && endTimeMs > mStart;
      });

      if (conflict) {
        const conflictDate = formatMeetingDate(conflict.startsAt);
        const conflictRange = formatMeetingTimeRange(conflict.startsAt, conflict.durationMins);
        return NextResponse.json(
          {
            error: `Reschedule conflict: You already have "${conflict.title}" scheduled on ${conflictDate} (${conflictRange}). Please select an alternate slot.`,
            code: "MEETING_CONFLICT",
          },
          { status: 409 }
        );
      }
    }

    const updated = await updateMeeting(id, userId, patch as any);
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update meeting", code: "UPDATE_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Meeting updated successfully",
    });
  } catch (err: any) {
    console.error("PATCH /api/meetings/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error while updating meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;
    const { id } = await params;

    const existing = await getMeetingById(id, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Meeting not found or access denied", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const cancelled = await cancelMeeting(id, userId);
    return NextResponse.json({
      success: true,
      data: cancelled,
      message: "Meeting cancelled successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/meetings/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error while cancelling meeting", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
