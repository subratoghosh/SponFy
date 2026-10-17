import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoAccessRequestsRef } from "@/lib/security/campaign-access";

export async function GET() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      // 1. Find all organisations the viewer is an active ORGANISER or creator of
      const viewerOrgs = await (prisma as any).organisation.findMany({
        where: {
          OR: [
            { createdById: viewerId },
            {
              members: {
                some: {
                  userId: viewerId,
                  role: "ORGANISER",
                  status: "ACTIVE",
                },
              },
            },
          ],
        },
        select: { id: true },
      });
      const orgIds = viewerOrgs.map((o: any) => o.id);

      // 2. Find all campaigns the viewer owns, or in viewer's orgs, or is an active ORGANISER of
      const viewerCampaigns = await (prisma as any).campaign.findMany({
        where: {
          OR: [
            { userId: viewerId },
            { organisationId: { in: orgIds } },
            {
              members: {
                some: {
                  userId: viewerId,
                  role: "ORGANISER",
                  status: "ACTIVE",
                },
              },
            },
          ],
        },
        select: { id: true },
      });
      const campaignIds = viewerCampaigns.map((c: any) => c.id);

      if (orgIds.length === 0 && campaignIds.length === 0) {
        return NextResponse.json({ success: true, requests: [] });
      }

      // 3. Fetch pending access requests for those organisations or campaigns
      const pendingRequests = await (prisma as any).accessRequest.findMany({
        where: {
          status: "PENDING",
          OR: [
            ...(orgIds.length > 0 ? [{ organisationId: { in: orgIds } }] : []),
            ...(campaignIds.length > 0 ? [{ campaignId: { in: campaignIds } }] : []),
          ],
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              designation: true,
              collegeOrCompany: true,
              department: true,
              image: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              organisation: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const mapped = pendingRequests.map((r: any) => ({
        id: r.id,
        requesterId: r.requester.id,
        requesterName: r.requester.name || "Anonymous Member",
        requesterEmail: r.requester.email,
        designation: r.requester.designation || (r.details as any)?.roleInTeam || "Team Member",
        collegeOrCompany: r.requester.collegeOrCompany || "University / Organization",
        department: r.requester.department || "General",
        requestedRole: r.requestedRole,
        message: r.message,
        details: r.details,
        campaignId: r.campaignId || null,
        campaignName: r.campaign?.name || null,
        organisationId: r.organisationId || r.campaign?.organisationId || null,
        organisationName: r.organisation?.name || r.campaign?.organisation?.name || "Organisation",
        createdAt: r.createdAt.toISOString(),
      }));

      return NextResponse.json({ success: true, requests: mapped });
    }

    // Demo Mode fallback
    const mock = demoAccessRequestsRef.value.filter((r) => r.status === "PENDING").map((r) => ({
      id: r.id,
      requesterId: r.requesterId,
      requesterName: "Ayush Dhaked",
      requesterEmail: "ayush@svnit.ac.in",
      designation: (r.details as any)?.roleInTeam || "Sponsorship Convenor",
      collegeOrCompany: "SVNIT Surat",
      department: "Corporate Relations",
      requestedRole: r.requestedRole,
      message: r.message || "Excited to bring title sponsors on board.",
      details: r.details,
      campaignId: r.campaignId,
      campaignName: "InnovateX National Hackathon 2026",
      organisationName: "TechFest Committee",
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ success: true, requests: mock });
  } catch (error) {
    console.error("[Team Requests API] Error fetching access requests:", error);
    return NextResponse.json(
      { error: "Failed to load access requests." },
      { status: 500 }
    );
  }
}
