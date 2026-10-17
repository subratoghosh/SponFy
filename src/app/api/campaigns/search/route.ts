import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/auth-guard";

export async function GET(req: Request) {
  const clientIp = getClientIp(req);
  const rl = await checkRateLimit("read", `campaign-search:${clientIp}`);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many search requests. Please slow down.", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  try {
    if (isDatabaseConfigured()) {
      const campaigns = await (prisma as any).campaign.findMany({
        where: {
          archived: false,
          organisationId: { not: null },
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { organisation: { name: { contains: q, mode: "insensitive" } } },
                  { location: { contains: q, mode: "insensitive" } },
                  { eventType: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          eventType: true,
          location: true,
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      });

      const sanitized = campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        eventType: c.eventType,
        city: c.location,
        organisation: c.organisation
          ? {
              id: c.organisation.id,
              name: c.organisation.name,
              type: c.organisation.type,
              city: c.organisation.city,
            }
          : null,
        authorName: c.user?.name || "Organiser",
      }));

      return NextResponse.json({
        success: true,
        campaigns: sanitized,
      });
    }

    // Demo in-memory fallback
    const mockOrgCampaigns = [
      {
        id: "cmp_demo_org_1",
        name: "InnovateX National Hackathon 2026",
        eventType: "Innovation Challenge",
        city: "Bengaluru, India",
        organisation: {
          id: "org-demo-1",
          name: "TechFest Committee",
          type: "College Club",
          city: "Bengaluru",
        },
        authorName: "Subrato Ghosh",
      },
      {
        id: "cmp_demo_org_2",
        name: "E-Summit Global 2026",
        eventType: "Startup Summit",
        city: "Mumbai, India",
        organisation: {
          id: "org-demo-2",
          name: "Entrepreneurship Cell",
          type: "College Club",
          city: "Mumbai",
        },
        authorName: "Sneha Roy",
      },
    ].filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.organisation.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });

    return NextResponse.json({
      success: true,
      campaigns: mockOrgCampaigns,
    });
  } catch (error) {
    console.error("[Campaigns Search API] Error searching organisation campaigns:", error);
    return NextResponse.json(
      { error: "Failed to search campaigns." },
      { status: 500 }
    );
  }
}
