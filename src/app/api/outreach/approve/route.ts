import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { approveDraft } from "@/lib/data/repositories/outreach";

const approveDraftRequestSchema = z.object({
  draftId: z.string().min(1).max(100),
}).strict();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let bodyJson: unknown;
    try {
      bodyJson = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = approveDraftRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { draftId } = parsed.data;

    let approved;
    try {
      approved = await approveDraft(draftId, userId);
    } catch (err: any) {
      // e.g. trying to re-approve an email that was already sent
      return NextResponse.json({ error: err.message || "Cannot approve this draft" }, { status: 409 });
    }
    if (!approved) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft: approved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Approval failed" }, { status: 500 });
  }
}
