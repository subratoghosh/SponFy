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
        select: {
          id: true,
          name: true,
          createdById: true,
        },
      });

      const orgIds = viewerOrgs.map((o: any) => o.id);

      // 2. Find campaigns the viewer owns or is active ORGANISER in
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
        select: {
          id: true,
          name: true,
          userId: true,
          organisationId: true,
        },
      });

      const campaignIds = viewerCampaigns.map((c: any) => c.id);

      // Fetch active organisation members
      const orgMembers = await (prisma as any).organisationMember.findMany({
        where: {
          organisationId: { in: orgIds },
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
          organisation: {
            select: {
              id: true,
              name: true,
              createdById: true,
            },
          },
        },
      });

      // Count active organisers per organisation to know who is the last active organizer
      const activeOrgCounts = new Map<string, number>();
      orgMembers.forEach((m: any) => {
        if (m.role === "ORGANISER") {
          activeOrgCounts.set(m.organisationId, (activeOrgCounts.get(m.organisationId) || 0) + 1);
        }
      });

      // Fetch campaign member assignments
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
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              userId: true,
              organisationId: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Map campaign members
      const mappedCampaignMembers = campaignMembers.map((m: any) => {
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
          organisationId: m.campaign.organisationId,
          isOwner,
        };
      });

      // Also map organisation-level members (including those with no campaign assignments yet)
      const mappedOrgMembers = orgMembers.map((m: any) => {
        const isCreator = m.organisation.createdById === m.userId;
        const activeCount = activeOrgCounts.get(m.organisationId) || 0;
        const isLastOrganizer = m.role === "ORGANISER" && activeCount <= 1;
        const assignedCamps = campaignMembers
          .filter((cm: any) => cm.userId === m.userId && cm.campaign.organisationId === m.organisationId)
          .map((cm: any) => ({
            campaignId: cm.campaignId,
            campaignName: cm.campaign.name,
          }));

        return {
          id: m.id,
          organisationMemberId: m.id,
          userId: m.userId,
          name: m.user.name || "Team Member",
          email: m.user.email,
          designation: m.user.designation || (isCreator ? "Organisation Creator" : m.role === "ORGANISER" ? "Organiser" : "Executive"),
          collegeOrCompany: m.user.collegeOrCompany || "Organization",
          role: m.role,
          status: m.status,
          joinedAt: m.createdAt.toISOString(),
          organisationId: m.organisationId,
          organisationName: m.organisation.name,
          isCreator,
          isLastOrganizer,
          assignedCampaigns: assignedCamps,
        };
      });

      return NextResponse.json({
        success: true,
        members: mappedCampaignMembers,
        organisationMembers: mappedOrgMembers,
      });
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

const removeMemberSchema = z
  .object({
    campaignMemberId: z.string().optional(),
    organisationMemberId: z.string().optional(),
  })
  .refine((data) => data.campaignMemberId || data.organisationMemberId, {
    message: "Either campaignMemberId or organisationMemberId is required",
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

    const { campaignMemberId, organisationMemberId } = result.data;

    if (isDatabaseConfigured()) {
      // Case 1: Removing from Organisation
      if (organisationMemberId) {
        const orgMember = await (prisma as any).organisationMember.findUnique({
          where: { id: organisationMemberId },
          include: {
            organisation: {
              select: { id: true, createdById: true },
            },
          },
        });

        if (!orgMember) {
          return NextResponse.json({ error: "Organisation member record not found." }, { status: 404 });
        }

        // Verify caller is an active Organiser in this organisation
        const isViewerOrganiser = await (prisma as any).organisationMember.findFirst({
          where: {
            organisationId: orgMember.organisationId,
            userId: viewerId,
            role: "ORGANISER",
            status: "ACTIVE",
          },
        });

        if (!isViewerOrganiser && orgMember.organisation.createdById !== viewerId) {
          return NextResponse.json(
            { error: "Forbidden. You must be an active Organiser to remove members." },
            { status: 403 }
          );
        }

        // Non-negotiable rule: Never allow removing the last active Organizer!
        if (orgMember.role === "ORGANISER") {
          const activeOrganizersCount = await (prisma as any).organisationMember.count({
            where: {
              organisationId: orgMember.organisationId,
              role: "ORGANISER",
              status: "ACTIVE",
            },
          });

          if (activeOrganizersCount <= 1) {
            return NextResponse.json(
              {
                error: "Forbidden. Cannot remove the last active Organizer of this organisation.",
                code: "CANNOT_REMOVE_LAST_ORGANIZER",
              },
              { status: 400 }
            );
          }
        }

        // Soft delete / revoke organisation membership and their campaign assignments
        await prisma.$transaction(async (tx: any) => {
          await tx.organisationMember.update({
            where: { id: organisationMemberId },
            data: { status: "REMOVED" },
          });

          // Also revoke all campaign assignments for this user in this organization's campaigns
          const orgCampaigns = await tx.campaign.findMany({
            where: { organisationId: orgMember.organisationId },
            select: { id: true },
          });
          const campIds = orgCampaigns.map((c: any) => c.id);

          if (campIds.length > 0) {
            await tx.campaignMember.updateMany({
              where: {
                campaignId: { in: campIds },
                userId: orgMember.userId,
              },
              data: {
                status: "REMOVED",
                revokedAt: new Date(),
              },
            });
          }
        });

        return NextResponse.json({
          success: true,
          message: "Organisation member and their campaign assignments have been removed.",
        });
      }

      // Case 2: Removing from a specific Campaign
      if (campaignMemberId) {
        const member = await (prisma as any).campaignMember.findUnique({
          where: { id: campaignMemberId },
          include: {
            campaign: { select: { id: true, userId: true, name: true, organisationId: true } },
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
          data: {
            status: "REMOVED",
            revokedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Team member has been removed from the campaign.",
        });
      }
    }

    // Demo Mode
    return NextResponse.json({
      success: true,
      message: "Team member removed (demo mode).",
    });
  } catch (error: any) {
    console.error("[Team Members API] Error removing member:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove team member." },
      { status: 500 }
    );
  }
}
