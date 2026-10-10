import { NextResponse } from "next/server";
import { getDraftById, recordSentMessage } from "@/lib/data/repositories/outreach";
import { executeApprovedSend } from "@/lib/workflows/outreach-graph";
import { isSuppressed } from "@/lib/data/repositories/settings";

export async function POST(req: Request) {
  try {
    const { draftId, toEmail } = await req.json();

    if (!draftId || !toEmail) {
      return NextResponse.json({ error: "Draft ID and recipient email required" }, { status: 400 });
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Safety Gate Check: Suppression
    const suppressed = await isSuppressed(toEmail);
    if (suppressed) {
      return NextResponse.json(
        { error: "Recipient is on the Suppression list. Sending blocked." },
        { status: 403 }
      );
    }

    // Execute send via Gmail adapter / Mock
    const sendResult = await executeApprovedSend(draft, toEmail);

    // Record outbound message & advance company stage to Contacted
    const msg = await recordSentMessage(draftId, toEmail, sendResult.messageId, sendResult.threadId);

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Send failed" }, { status: 500 });
  }
}
