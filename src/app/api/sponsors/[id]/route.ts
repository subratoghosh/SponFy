import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DEMO_COMPANIES } from "@/lib/data/seed-data";

const STAGE_MAP: Record<string, string> = {
  Discovered: "DISCOVERED",
  Researched: "RESEARCHED",
  Qualified: "QUALIFIED",
  "Contact Found": "CONTACT_FOUND",
  "Draft Ready": "DRAFT_READY",
  Approved: "APPROVED",
  Contacted: "CONTACTED",
  Replied: "REPLIED",
  Interested: "INTERESTED",
  Negotiation: "NEGOTIATION",
  Committed: "COMMITTED",
  Lost: "LOST",
};

const PIPELINE_STAGE_MAP: Record<string, string> = {
  DISCOVERED: "Discovered",
  RESEARCHED: "Researched",
  QUALIFIED: "Qualified",
  CONTACT_FOUND: "Contact Found",
  DRAFT_READY: "Draft Ready",
  APPROVED: "Approved",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  INTERESTED: "Interested",
  NEGOTIATION: "Negotiation",
  COMMITTED: "Committed",
  LOST: "Lost",
};

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
  }

  if (isDatabaseConfigured()) {
    try {
      const c = await prisma.company.findUnique({
        where: { id },
        include: {
          contacts: true,
          report: true,
          sources: true,
        },
      });

      if (c) {
        const stageMapped = (PIPELINE_STAGE_MAP as any)[c.stage] || c.stage;
        const data = {
          id: c.id,
          name: c.name,
          website: c.website || "",
          industry: c.industry || "",
          description: c.description || "",
          campaignId: c.campaignId,
          stage: stageMapped,
          fitScore: c.fitScore ?? 0,
          scoreBreakdown: (c.scoreBreakdown as any) || [],
          pipelineValue: c.pipelineValue ?? 0,
          securedFunds: (c as any).securedFunds ?? (stageMapped === "Committed" ? c.pipelineValue : 0),
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
        };

        return NextResponse.json({ success: true, data });
      }
    } catch (err: any) {
      console.error("GET /api/sponsors/[id] error:", err);
    }
  }

  // Fallback to seed demo list if database has no record
  const demoFound = DEMO_COMPANIES.find((d) => d.id === id);
  if (demoFound) {
    return NextResponse.json({ success: true, data: demoFound });
  }

  return NextResponse.json({ success: false, error: "Sponsor not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { stage, pipelineValue, securedFunds } = body;

    if (isDatabaseConfigured()) {
      const updateData: any = {};
      if (stage) {
        updateData.stage = (STAGE_MAP as any)[stage] || stage.toUpperCase().replace(/\s+/g, "_");
      }
      if (typeof pipelineValue === "number") {
        updateData.pipelineValue = pipelineValue;
      }

      const updated = await prisma.company.update({
        where: { id },
        data: updateData,
        include: { contacts: true, report: true, sources: true },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true, data: { id, ...body } });
  } catch (err: any) {
    console.error("PATCH /api/sponsors/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
  }

  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { removeSponsor } = await import("@/lib/data/repositories/sponsors");
    const ok = await removeSponsor(id);

    return NextResponse.json({ success: true, removed: ok, id });
  } catch (err: any) {
    console.error("DELETE /api/sponsors/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

