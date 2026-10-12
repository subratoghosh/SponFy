import { NextResponse } from "next/server";
import { getDraftById, saveDraft } from "@/lib/data/repositories/outreach";

export async function POST(req: Request) {
  try {
    const { id, subject, body } = await req.json();
    if (!id || typeof subject !== "string" || typeof body !== "string") {
      return NextResponse.json({ error: "id, subject and body are required" }, { status: 400 });
    }
    const existing = await getDraftById(id);
    if (!existing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    // Only subject/body can change here. Status/approval stay server-controlled.
    const saved = await saveDraft({ id, companyId: existing.companyId, subject, body });
    return NextResponse.json({ success: true, draft: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Save failed" }, { status: 409 });
  }
}
