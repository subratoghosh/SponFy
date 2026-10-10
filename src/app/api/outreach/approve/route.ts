import { NextResponse } from "next/server";
import { approveDraft } from "@/lib/data/repositories/outreach";

export async function POST(req: Request) {
  try {
    const { draftId } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
    }

    let approved;
    try {
      approved = await approveDraft(draftId);
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
