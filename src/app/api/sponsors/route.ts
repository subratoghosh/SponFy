import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting: 60 reads/minute/user
  const { checkRateLimit, createRateLimitResponse } = await import("@/lib/security/rate-limit");
  const rateLimit = await checkRateLimit("read", userId);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId") || undefined;
  const search = searchParams.get("search")?.trim() || "";
  const stage = searchParams.get("stage")?.trim() || "";
  const industry = searchParams.get("industry")?.trim() || "";
  
  // Pagination parameters
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0, hasMore: false },
    });
  }

  try {
    const { getCampaignAccess } = await import("@/lib/security/campaign-access");

    let where: any = {};
    if (campaignId) {
      const access = await getCampaignAccess(userId, campaignId);
      if (!access.allowed) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit, totalPages: 0, hasMore: false },
        });
      }
      where.campaignId = campaignId;
    } else {
      const userCampaigns = await prisma.campaign.findMany({
        where: {
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
        },
        select: { id: true },
      });
      const accessibleCampaignIds = userCampaigns.map((c) => c.id);

      where.OR = [
        { userId },
        { campaignId: { in: accessibleCampaignIds } },
      ];
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (industry && industry !== "all") {
      where.industry = industry;
    }

    if (stage && stage !== "all") {
      where.stage = stage.toUpperCase().replace(/\s+/g, "_");
    }

    // Run count and paged query in parallel with Prisma field projection
    const [total, companies] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          website: true,
          industry: true,
          description: true,
          campaignId: true,
          stage: true,
          fitScore: true,
          scoreBreakdown: true,
          pipelineValue: true,
          signals: true,
          confidence: true,
          researchStatus: true,
          createdAt: true,
          updatedAt: true,
          contacts: {
            select: {
              id: true,
              companyId: true,
              name: true,
              role: true,
              email: true,
              status: true,
              sourceUrl: true,
              createdAt: true,
            },
          },
          sources: {
            select: {
              url: true,
              title: true,
              snippet: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    const data = companies.map((c) => ({
      id: c.id,
      name: c.name,
      website: c.website || "",
      industry: c.industry || "",
      description: c.description || "",
      campaignId: c.campaignId,
      stage: (c.stage.charAt(0) + c.stage.slice(1).toLowerCase().replace(/_/g, " ")) as any,
      fitScore: c.fitScore ?? 0,
      scoreBreakdown: (c.scoreBreakdown as any) || [],
      pipelineValue: c.pipelineValue,
      signals: (c.signals as any) || [],
      confidence: c.confidence ?? 0,
      researchStatus: (c.researchStatus === "DONE" ? "completed" : c.researchStatus === "FAILED" ? "failed" : "pending") as any,
      contacts: c.contacts.map((con) => ({
        id: con.id,
        companyId: con.companyId,
        name: con.name || "",
        role: con.role || "",
        email: con.email || "",
        status: (con.status === "VERIFIED" ? "verified" : con.status === "PUBLIC" ? "public" : "unknown") as any,
        sourceUrl: con.sourceUrl || undefined,
        createdAt: con.createdAt.toISOString(),
      })),
      sources: c.sources.map((s) => ({
        url: s.url,
        title: s.title || "",
        snippet: s.snippet || "",
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    });
  } catch (err: any) {
    console.error("GET /api/sponsors error:", err);
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0, hasMore: false },
    });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { companyIds } = body;

    if (!Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "companyIds must be a non-empty array of company IDs" },
        { status: 400 }
      );
    }

    const { removeSponsors } = await import("@/lib/data/repositories/sponsors");
    const count = await removeSponsors(companyIds, userId);

    return NextResponse.json({
      success: true,
      count,
      message: `Successfully deleted ${count} sponsor(s)`,
    });
  } catch (err: any) {
    console.error("DELETE /api/sponsors error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete sponsors" },
      { status: 500 }
    );
  }
}
