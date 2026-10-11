import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDraftById, saveDraft } from "@/lib/data/repositories/outreach";

const saveDraftRequestSchema = z.object({
  id: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
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

    const parsed = saveDraftRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, subject, body } = parsed.data;

    const existing = await getDraftById(id, userId);
    if (!existing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Only subject/body can change here. Status/approval stay server-controlled.
    const saved = await saveDraft({
      id,
      userId,
      companyId: existing.companyId,
      subject,
      body,
    });

    return NextResponse.json({ success: true, draft: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Save failed" }, { status: 409 });
  }
}
