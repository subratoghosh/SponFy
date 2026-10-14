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

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const where: any = { userId };
    if (campaignId) {
      where.campaignId = campaignId;
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        contacts: true,
        report: true,
        sources: true,
      },
      orderBy: { createdAt: "desc" },
    });

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
      researchReport: c.report
        ? {
            sections: (c.report.sections as any) || {},
            recommendedAngle: c.report.recommendedAngle || "",
          }
        : undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/sponsors error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}
