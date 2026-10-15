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
      select: {
        id: true,
        name: true,
        eventType: true,
        audienceSize: true,
        location: true,
        targetAmount: true,
        preferredIndustries: true,
        tiers: true,
        deckUrl: true,
        description: true,
        archived: true,
        createdAt: true,
      },
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

export async function DELETE(request: NextRequest) {
  const session = await auth();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing campaign id" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, message: "Campaign deleted" });
  }

  try {
    const userId = session?.user?.id;
    const where: any = { id };
    if (userId && session?.user?.email !== "demo@sponfy.dev") {
      where.userId = userId;
    }

    if ((prisma as any).campaign) {
      await (prisma as any).campaign.deleteMany({
        where,
      });
    }

    return NextResponse.json({ success: true, message: "Campaign deleted" });
  } catch (err: any) {
    console.error("DELETE /api/campaigns error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
