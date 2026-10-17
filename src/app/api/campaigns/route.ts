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
    let where: any = {};
    if (userId && !isDemo) {
      where = {
        OR: [
          { userId },
          {
            members: {
              some: {
                userId,
                status: "ACTIVE",
              },
            },
          },
        ],
      };
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

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = session.user.role;
  const accountMode = (session.user as any).accountMode;

  if (userRole === "EXECUTIVE" || accountMode === "EXECUTIVE") {
    return NextResponse.json(
      {
        success: false,
        error: "Executives cannot create campaigns. You can only work on campaigns assigned to you by an organiser.",
      },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim() || "New Sponsorship Campaign";
  const eventType = body.eventType || "Tech Conference & Summit";
  const audienceSize = Number(body.audienceSize) || 500;
  const location = body.location || "India";
  const targetAmount = Number(body.targetAmount) || 100000;
  const preferredIndustries = Array.isArray(body.preferredIndustries) ? body.preferredIndustries : [];
  const tiers = Array.isArray(body.tiers) ? body.tiers : [];
  const deckUrl = body.deckUrl || null;
  const description = body.description || "";

  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.campaign.create({
        data: {
          userId,
          name,
          eventType,
          audienceSize,
          location,
          targetAmount,
          preferredIndustries,
          tiers,
          deckUrl,
          description,
          archived: false,
        },
      });

      const formatted = {
        id: record.id,
        name: record.name,
        eventType: record.eventType,
        audienceSize: record.audienceSize,
        location: record.location,
        targetAmount: record.targetAmount,
        preferredIndustries: record.preferredIndustries,
        tiers: (record.tiers as any) || [],
        deckUrl: record.deckUrl || undefined,
        description: record.description || "",
        status: record.archived ? "archived" : "active",
        createdAt: record.createdAt.toISOString(),
      };

      return NextResponse.json({ success: true, data: formatted });
    } catch (err: any) {
      console.error("POST /api/campaigns prisma error:", err);
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  // In-memory fallback
  const newCamp = {
    id: `camp-${Date.now()}`,
    name,
    eventType,
    audienceSize,
    location,
    targetAmount,
    preferredIndustries,
    tiers,
    deckUrl: deckUrl || undefined,
    description,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    userId,
  };

  return NextResponse.json({ success: true, data: newCamp });
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
