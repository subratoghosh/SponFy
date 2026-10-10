import { NextResponse } from "next/server";
import { approveDraft, getDraftById } from "@/lib/data/repositories/outreach";

export async function POST(req: Request) {
  try {
    const { draftId } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
    }

    const approved = await approveDraft(draftId);
    if (!approved) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft: approved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Approval failed" }, { status: 500 });
  }
}
