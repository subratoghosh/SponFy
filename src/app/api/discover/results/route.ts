import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDiscoveryResults,
  clearDiscoveryResults,
  deleteDiscoveryResult,
  deleteDiscoveryResults,
} from "@/lib/data/repositories/discovery-results";

export async function GET(req: Request) {
  try {
    const session = await auth().catch(() => null);
    const userId = session?.user?.id || "usr-demo-lead";

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId") || undefined;

    const results = await getDiscoveryResults(userId, campaignId);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load discovery results" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr-demo-lead";

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const campaignId = searchParams.get("campaignId") || undefined;

    // Check if JSON body with { ids: [...] } or { id: "..." } was sent
    let bodyIds: string[] | null = null;
    let bodyId: string | null = null;
    try {
      const body = await req.json();
      if (Array.isArray(body?.ids)) bodyIds = body.ids;
      if (typeof body?.id === "string") bodyId = body.id;
    } catch {
      // not JSON body
    }

    const targetId = id || bodyId;
    if (bodyIds && bodyIds.length > 0) {
      const count = await deleteDiscoveryResults(bodyIds, userId);
      return NextResponse.json({
        success: true,
        deletedCount: count,
      });
    }

    if (targetId) {
      const deleted = await deleteDiscoveryResult(targetId, userId);
      return NextResponse.json({
        success: true,
        deleted,
      });
    }

    const count = await clearDiscoveryResults(userId, campaignId);

    return NextResponse.json({
      success: true,
      clearedCount: count,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to clear discovery results" }, { status: 500 });
  }
}
