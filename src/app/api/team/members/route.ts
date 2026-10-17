import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { requireCampaignAccess } from "@/lib/security/campaign-access";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      // Find campaigns the viewer owns or is active ORGANISER in
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
        select: {
          id: true,
          name: true,
          userId: true,
          organisationId: true,
        },
      });

      const campaignIds = viewerCampaigns.map((c: any) => c.id);
      const ownerByCampaign = new Map<string, string>();
      viewerCampaigns.forEach((c: any) => {
        ownerByCampaign.set(c.id, c.userId);
      });

      if (campaignIds.length === 0) {
        return NextResponse.json({ success: true, members: [] });
      }

      // Fetch active members
      const campaignMembers = await (prisma as any).campaignMember.findMany({
        where: {
          campaignId: { in: campaignIds },
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              designation: true,
              collegeOrCompany: true,
              image: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      const mapped = campaignMembers.map((m: any) => {
        const isOwner = m.campaign.userId === m.userId;
        return {
          id: m.id,
          userId: m.userId,
          name: m.user.name || "Team Member",
          email: m.user.email,
          designation: m.user.designation || (isOwner ? "Campaign Owner" : "Organiser"),
          collegeOrCompany: m.user.collegeOrCompany || "Organization",
          role: m.role,
          status: m.status,
          joinedAt: m.createdAt.toISOString(),
          campaignId: m.campaignId,
          campaignName: m.campaign.name,
          isOwner,
        };
      });

      return NextResponse.json({ success: true, members: mapped });
    }

    // Demo Mode fallback
    const mockMembers = [
      {
        id: "mem-1",
        userId: viewerId,
        name: authRes.context.user.name || "Subrato Ghosh",
        email: authRes.context.user.email || "organiser@sponfy.dev",
        designation: "Head of Partnerships",
        collegeOrCompany: "TechFest Committee",
        role: "ORGANISER",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        campaignId: "cmp_demo_org_1",
        campaignName: "InnovateX National Hackathon 2026",
        isOwner: true,
      },
      {
        id: "mem-2",
        userId: "usr-demo-lead",
        name: "Sneha Roy",
        email: "sneha@sponfy.dev",
        designation: "Sponsorship Convenor",
        collegeOrCompany: "SVNIT Surat",
        role: "ORGANISER",
        status: "ACTIVE",
        joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        campaignId: "cmp_demo_org_1",
        campaignName: "InnovateX National Hackathon 2026",
        isOwner: false,
      },
    ];

    return NextResponse.json({ success: true, members: mockMembers });
  } catch (error) {
    console.error("[Team Members API] Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to load team members." },
      { status: 500 }
    );
  }
}

const removeMemberSchema = z.object({
  campaignMemberId: z.string().min(1, "Campaign member ID is required"),
});

export async function DELETE(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;

  try {
    const json = await req.json();
    const result = removeMemberSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid member removal request.", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { campaignMemberId } = result.data;

    if (isDatabaseConfigured()) {
      const member = await (prisma as any).campaignMember.findUnique({
        where: { id: campaignMemberId },
        include: {
          campaign: { select: { id: true, userId: true, name: true } },
        },
      });

      if (!member) {
        return NextResponse.json({ error: "Member record not found." }, { status: 404 });
      }

      // Check: the campaign owner cannot be removed!
      if (member.userId === member.campaign.userId) {
        return NextResponse.json(
          { error: "The campaign owner cannot be removed." },
          { status: 400 }
        );
      }

      // Authorise: caller must be an active ORGANISER or OWNER of this campaign
      const accessCheck = await requireCampaignAccess(viewerId, member.campaignId, "ORGANISER");
      if (!accessCheck.allowed) {
        return accessCheck.response || NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }

      // Soft delete: status REMOVED
      await (prisma as any).campaignMember.update({
        where: { id: campaignMemberId },
        data: { status: "REMOVED" },
      });

      return NextResponse.json({
        success: true,
        message: "Team member has been removed.",
      });
    }

    // Demo Mode
    return NextResponse.json({
      success: true,
      message: "Team member removed (demo mode).",
    });
  } catch (error) {
    console.error("[Team Members API] Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member." },
      { status: 500 }
    );
  }
}
