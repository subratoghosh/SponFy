import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoAccessRequestsRef } from "@/lib/data/repositories/access-requests";

export async function GET() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      // 1. Find all campaigns the viewer owns OR is an active ORGANISER of
      const viewerCampaigns = await (prisma as any).campaign.findMany({
        where: {
          OR: [
            { userId: viewerId },
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

      if (campaignIds.length === 0) {
        return NextResponse.json({ success: true, requests: [] });
      }

      // 2. Fetch pending access requests for those campaigns
      const pendingRequests = await (prisma as any).accessRequest.findMany({
        where: {
          campaignId: { in: campaignIds },
          status: "PENDING",
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

      const mapped = pendingRequests.map((r: any) => {
        const details = (r.details as any) || {};
        const designation = details.designation || details.roleInTeam || r.requester.designation || (r.requestedRole === "EXECUTIVE" ? "Executive" : "Organiser");
        const department = details.department || r.requester.department || "General";
        const availability = details.availabilityHours ? `${details.availabilityHours} hrs/week` : null;

        return {
          id: r.id,
          requesterId: r.requester.id,
          requesterName: r.requester.name || "Anonymous Member",
          requesterEmail: r.requester.email,
          designation,
          collegeOrCompany: r.requester.collegeOrCompany || "University / Organization",
          department,
          availability,
          requestedRole: r.requestedRole,
          whyJoin: details.whyJoin || null,
          message: r.message,
          details,
          campaignId: r.campaignId,
          campaignName: r.campaign?.name || "Campaign",
          organisationName: r.campaign?.organisation?.name || "Organisation",
          createdAt: r.createdAt.toISOString(),
        };
      });

      return NextResponse.json({ success: true, requests: mapped });
    }

    // Demo Mode fallback
    const mock = demoAccessRequestsRef.value.filter((r) => r.status === "PENDING").map((r) => {
      const details = (r.details as any) || {};
      const designation = details.designation || details.roleInTeam || "Sponsorship Executive";
      const department = details.department || "Corporate Relations";
      const availability = details.availabilityHours ? `${details.availabilityHours} hrs/week` : "15 hrs/week";

      return {
        id: r.id,
        requesterId: r.requesterId,
        requesterName: "Ayush Dhaked",
        requesterEmail: "ayush@svnit.ac.in",
        designation,
        collegeOrCompany: "SVNIT Surat",
        department,
        availability,
        requestedRole: r.requestedRole || "EXECUTIVE",
        whyJoin: details.whyJoin || "Connect corporate brands and coordinate outreach deals.",
        message: r.message || "Excited to help achieve the campaign target.",
        details,
        campaignId: r.campaignId,
        campaignName: "InnovateX National Hackathon 2026",
        organisationName: "TechFest Committee",
        createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, requests: mock });
  } catch (error) {
    console.error("[Team Requests API] Error fetching access requests:", error);
    return NextResponse.json(
      { error: "Failed to load access requests." },
      { status: 500 }
    );
  }
}
