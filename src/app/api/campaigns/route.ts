import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  const isDemo = session?.user?.email === "demo@sponfy.dev";

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const userId = session?.user?.id;
    const where: any = {};
    if (userId && !isDemo) {
      where.userId = userId;
    }

    const records = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const data = records.map((r) => ({
      id: r.id,
      name: r.name,
      eventType: r.eventType,
      audienceSize: r.audienceSize,
      location: r.location,
      targetAmount: r.targetAmount,
      preferredIndustries: r.preferredIndustries,
      tiers: (r.tiers as any) || [],
      deckUrl: r.deckUrl || undefined,
      description: r.description || "",
      status: r.archived ? "archived" : "active",
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/campaigns error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}
