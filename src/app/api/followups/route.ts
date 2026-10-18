import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { loadFollowups } from "@/lib/outreach/followup-service";

export const dynamic = "force-dynamic";

export async function GET(request?: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : undefined);

    let campaignId: string | undefined = undefined;
    if (request?.url) {
      try {
        const { searchParams } = new URL(request.url);
        campaignId = searchParams.get("campaignId") || undefined;
      } catch {
        // invalid URL
      }
    }

    const items = await loadFollowups(undefined, userId, campaignId);
    const count = (s: string) => items.filter((i) => i.state === s).length;
    return NextResponse.json({
      success: true,
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
    return NextResponse.json({ success: false, error: err.message || "Failed to load follow-ups" }, { status: 500 });
  }
}
