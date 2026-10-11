import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadFollowups } from "@/lib/outreach/followup-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await loadFollowups();
    const count = (s: string) => items.filter((i) => i.state === s).length;
    return NextResponse.json({
      items,
      summary: {
        due: count("due"),
        draftReady: count("draft_ready"),
        waiting: count("waiting"),
        replied: count("replied"),
        complete: count("complete"),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load follow-ups" }, { status: 500 });
  }
}
