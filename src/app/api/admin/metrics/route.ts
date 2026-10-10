import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getAdminOverviewMetrics, getAdminAnalytics } from "@/lib/data/repositories/admin";

export async function GET(request: NextRequest) {
  const adminAuth = await verifyAdminSession();
  if (!adminAuth.authorized || !adminAuth.user) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "30d";
  const type = searchParams.get("type") || "overview";

  if (type === "analytics") {
    const analytics = await getAdminAnalytics(range);
    return NextResponse.json({ success: true, data: analytics });
  }

  const metrics = await getAdminOverviewMetrics(range);
  return NextResponse.json({ success: true, data: metrics });
}
