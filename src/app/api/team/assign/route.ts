import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoCampaignMembersRef } from "@/lib/security/campaign-access";
import { createNotification } from "@/lib/data/repositories/notifications";

const assignSchema = z.object({
  organisationId: z.string().min(1, "Organisation ID is required"),
  executiveUserId: z.string().min(1, "Executive user ID is required"),
  campaignIds: z.array(z.string()).optional(),
  newCampaign: z
    .object({
      name: z.string().trim().min(2, "Campaign name is required").max(120),
      eventType: z.string().trim().min(1, "Event type is required"),
      audienceSize: z.coerce.number().int().min(1),
      location: z.string().trim().min(1),
      targetAmount: z.coerce.number().int().min(1000),
      preferredIndustries: z.array(z.string()).min(1),
      tiers: z.any().optional(),
      description: z.string().trim().max(1000).optional().nullable(),
      deckUrl: z.string().trim().max(500).optional().nullable(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;

  try {
    const json = await req.json();
    const result = assignSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { organisationId, executiveUserId, campaignIds = [], newCampaign } = result.data;

    if (isDatabaseConfigured()) {
      // 1. Authorize: viewer must be an active ORGANISER (or creator) of this organisation
      const org = await (prisma as any).organisation.findUnique({
        where: { id: organisationId },
        select: { id: true, name: true, createdById: true },
      });

      if (!org) {
        return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
      }

      const isViewerOrganiser = await (prisma as any).organisationMember.findFirst({
        where: {
          organisationId,
          userId: viewerId,
          role: "ORGANISER",
          status: "ACTIVE",
        },
      });

      if (!isViewerOrganiser && org.createdById !== viewerId) {
        return NextResponse.json(
          { error: "Forbidden. You must be an active Organiser of this organisation to assign campaigns." },
          { status: 403 }
        );
      }

      // 2. Verify target user is an active member of this organisation
      const execMember = await (prisma as any).organisationMember.findFirst({
        where: {
          organisationId,
          userId: executiveUserId,
          status: "ACTIVE",
        },
      });

      if (!execMember) {
        return NextResponse.json(
          { error: "Target user is not an active member of this organisation." },
          { status: 400 }
        );
      }

      // 3. Execute assignment in transaction
      const outcome = await prisma.$transaction(async (tx: any) => {
        const assignedIds: string[] = [];

        // A. If new campaign requested, create it and assign
        if (newCampaign) {
          const defaultTiers = [
            { name: "Title Partner", amount: Math.round(newCampaign.targetAmount * 0.5), slots: 1, deliverables: ["Keynote", "Top branding"] },
            { name: "Gold Partner", amount: Math.round(newCampaign.targetAmount * 0.25), slots: 3, deliverables: ["Challenge Track", "Booth"] },
            { name: "Silver Partner", amount: Math.round(newCampaign.targetAmount * 0.1), slots: 5, deliverables: ["Swags", "Logo"] },
          ];

          const createdCamp = await tx.campaign.create({
            data: {
              userId: viewerId,
              organisationId,
              name: newCampaign.name,
              eventType: newCampaign.eventType,
              audienceSize: newCampaign.audienceSize,
              location: newCampaign.location,
              targetAmount: newCampaign.targetAmount,
              preferredIndustries: newCampaign.preferredIndustries,
              tiers: newCampaign.tiers || defaultTiers,
              description: newCampaign.description || null,
              deckUrl: newCampaign.deckUrl || null,
            },
          });

          // Add creator as Organiser CampaignMember
          await tx.campaignMember.upsert({
            where: {
              campaignId_userId: {
                campaignId: createdCamp.id,
                userId: viewerId,
              },
            },
            update: { role: "ORGANISER", status: "ACTIVE" },
            create: {
              campaignId: createdCamp.id,
              userId: viewerId,
              role: "ORGANISER",
              status: "ACTIVE",
            },
          });

          // Assign executive
          await tx.campaignMember.upsert({
            where: {
              campaignId_userId: {
                campaignId: createdCamp.id,
                userId: executiveUserId,
              },
            },
            update: {
              role: "EXECUTIVE",
              status: "ACTIVE",
              assignedById: viewerId,
            },
            create: {
              campaignId: createdCamp.id,
              userId: executiveUserId,
              role: "EXECUTIVE",
              status: "ACTIVE",
              assignedById: viewerId,
            },
          });

          assignedIds.push(createdCamp.id);
        }

        // B. Assign existing campaigns belonging to this organisation
        for (const campId of campaignIds) {
          const camp = await tx.campaign.findFirst({
            where: { id: campId, organisationId },
            select: { id: true, name: true },
          });

          if (camp) {
            await tx.campaignMember.upsert({
              where: {
                campaignId_userId: {
                  campaignId: camp.id,
                  userId: executiveUserId,
                },
              },
              update: {
                role: "EXECUTIVE",
                status: "ACTIVE",
                assignedById: viewerId,
              },
              create: {
                campaignId: camp.id,
                userId: executiveUserId,
                role: "EXECUTIVE",
                status: "ACTIVE",
                assignedById: viewerId,
              },
            });
            assignedIds.push(camp.id);
          }
        }

        return { assignedCount: assignedIds.length };
      });

      // 4. Notify executive of new assignments
      await createNotification({
        userId: executiveUserId,
        type: "campaign_assigned",
        title: "New Campaign Assigned!",
        body: `You have been assigned to ${outcome.assignedCount} campaign(s) in "${org.name}".`,
        href: "/app",
      });

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${outcome.assignedCount} campaign(s).`,
        assignedCount: outcome.assignedCount,
      });
    }

    // Demo Mode fallback
    for (const cId of campaignIds) {
      demoCampaignMembersRef.value.push({
        id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        campaignId: cId,
        userId: executiveUserId,
        role: "EXECUTIVE",
        status: "ACTIVE",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${campaignIds.length} campaign(s) (demo mode).`,
      assignedCount: campaignIds.length,
    });
  } catch (error: any) {
    console.error("[Team Assign API] Error assigning campaigns:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to assign campaigns." },
      { status: 500 }
    );
  }
}

const revokeAssignSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  executiveUserId: z.string().min(1, "Executive user ID is required"),
});

export async function DELETE(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;

  try {
    const json = await req.json();
    const result = revokeAssignSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { campaignId, executiveUserId } = result.data;

    if (isDatabaseConfigured()) {
      const camp = await (prisma as any).campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, userId: true, organisationId: true },
      });

      if (!camp) {
        return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
      }

      // Check authorization
      let isAuthorized = camp.userId === viewerId;
      if (!isAuthorized && camp.organisationId) {
        const isOrgOrganiser = await (prisma as any).organisationMember.findFirst({
          where: {
            organisationId: camp.organisationId,
            userId: viewerId,
            role: "ORGANISER",
            status: "ACTIVE",
          },
        });
        isAuthorized = !!isOrgOrganiser;
      }

      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Forbidden. You must be an Organiser to revoke assignments." },
          { status: 403 }
        );
      }

      // Revoke assignment
      await (prisma as any).campaignMember.updateMany({
        where: {
          campaignId,
          userId: executiveUserId,
        },
        data: {
          status: "REMOVED",
          revokedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Campaign assignment revoked successfully.",
      });
    }

    // Demo Mode
    const target = demoCampaignMembersRef.value.find(
      (m) => m.campaignId === campaignId && m.userId === executiveUserId
    );
    if (target) {
      target.status = "REMOVED";
    }

    return NextResponse.json({
      success: true,
      message: "Campaign assignment revoked (demo mode).",
    });
  } catch (error: any) {
    console.error("[Team Revoke Assign API] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to revoke campaign assignment." },
      { status: 500 }
    );
  }
}
