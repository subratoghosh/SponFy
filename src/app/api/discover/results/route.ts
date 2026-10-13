import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDiscoveryResults,
  clearDiscoveryResults,
  deleteDiscoveryResult,
} from "@/lib/data/repositories/discovery-results";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const campaignId = searchParams.get("campaignId") || undefined;

    if (id) {
      const deleted = await deleteDiscoveryResult(id, userId);
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
