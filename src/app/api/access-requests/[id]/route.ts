import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { requireCampaignAccess } from "@/lib/security/campaign-access";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createNotification } from "@/lib/data/repositories/notifications";
import { demoAccessRequestsRef } from "@/lib/data/repositories/access-requests";
import { demoCampaignMembersRef } from "@/lib/security/campaign-access";

const decisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().max(500).optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const viewerId = authRes.context.userId;
  const { id } = await params;

  try {
    const json = await req.json();
    const result = decisionSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid decision request payload.", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { action, note } = result.data;

    if (isDatabaseConfigured()) {
      const accessRequest = await (prisma as any).accessRequest.findUnique({
        where: { id },
        include: {
          campaign: { select: { id: true, name: true, organisationId: true, userId: true } },
          requester: { select: { id: true, name: true, email: true } },
        },
      });

      if (!accessRequest) {
        return NextResponse.json({ error: "Access request not found." }, { status: 404 });
      }

      if (accessRequest.status !== "PENDING") {
        return NextResponse.json(
          { error: `This request has already been ${accessRequest.status.toLowerCase()}.` },
          { status: 400 }
        );
      }

      // Security: Nobody can decide their own request
      if (accessRequest.requesterId === viewerId) {
        return NextResponse.json(
          { error: "Forbidden. You cannot approve or reject your own request." },
          { status: 403 }
        );
      }

      // Security: Must be an ORGANISER of this campaign (or OWNER / ADMIN)
      const accessCheck = await requireCampaignAccess(viewerId, accessRequest.campaignId, "ORGANISER");
      if (!accessCheck.allowed) {
        return accessCheck.response || NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }

      const campaignName = accessRequest.campaign?.name || "the campaign";

      if (action === "APPROVE") {
        await prisma.$transaction(async (tx: any) => {
          // 1. Update request status
          await tx.accessRequest.update({
            where: { id },
            data: {
              status: "APPROVED",
              decidedById: viewerId,
              decidedAt: new Date(),
              decisionNote: note || null,
            },
          });

          // 2. Activate CampaignMember
          await tx.campaignMember.upsert({
            where: {
              campaignId_userId: {
                campaignId: accessRequest.campaignId,
                userId: accessRequest.requesterId,
              },
            },
            update: {
              role: accessRequest.requestedRole,
              status: "ACTIVE",
            },
            create: {
              campaignId: accessRequest.campaignId,
              userId: accessRequest.requesterId,
              role: accessRequest.requestedRole,
              status: "ACTIVE",
            },
          });

          // 3. Activate OrganisationMember if organisation linked
          const orgId = accessRequest.organisationId || accessRequest.campaign?.organisationId;
          if (orgId) {
            await tx.organisationMember.upsert({
              where: {
                organisationId_userId: {
                  organisationId: orgId,
                  userId: accessRequest.requesterId,
                },
              },
              update: {
                role: accessRequest.requestedRole,
                status: "ACTIVE",
                decidedById: viewerId,
                decidedAt: new Date(),
              },
              create: {
                organisationId: orgId,
                userId: accessRequest.requesterId,
                role: accessRequest.requestedRole,
                status: "ACTIVE",
                decidedById: viewerId,
                decidedAt: new Date(),
              },
            });
          }

          // 4. Update Requester role and onboarding status
          await tx.user.update({
            where: { id: accessRequest.requesterId },
            data: {
              role: accessRequest.requestedRole,
              accountMode: accessRequest.requestedRole,
              onboardingStatus: "COMPLETE",
              onboarded: true,
            },
          });
        });

        // Notify requester of approval
        await createNotification({
          userId: accessRequest.requesterId,
          type: "request_approved",
          title: "Access Request Approved!",
          body: `Your request to join "${campaignName}" as ${accessRequest.requestedRole.toLowerCase()} has been approved. Welcome to the team!`,
          href: "/app",
        });

        return NextResponse.json({
          success: true,
          status: "APPROVED",
          message: "Access request approved successfully.",
        });
      } else {
        // action === "REJECT"
        await (prisma as any).accessRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            decidedById: viewerId,
            decidedAt: new Date(),
            decisionNote: note || null,
          },
        });

        // Notify requester of rejection
        await createNotification({
          userId: accessRequest.requesterId,
          type: "request_rejected",
          title: "Access Request Declined",
          body: `Your request to join "${campaignName}" was not approved.${note ? ` Note: ${note}` : ""}`,
          href: "/onboarding/pending",
        });

        return NextResponse.json({
          success: true,
          status: "REJECTED",
          message: "Access request rejected.",
        });
      }
    }

    // Demo Mode fallback
    const reqItem = demoAccessRequestsRef.value.find((r) => r.id === id);
    if (!reqItem) {
      return NextResponse.json({ error: "Access request not found." }, { status: 404 });
    }

    // Security check in demo mode too
    if (reqItem.requesterId === viewerId) {
      return NextResponse.json(
        { error: "Forbidden. You cannot approve or reject your own request." },
        { status: 403 }
      );
    }

    if (action === "APPROVE") {
      reqItem.status = "APPROVED";
      reqItem.decidedById = viewerId;
      reqItem.decidedAt = new Date().toISOString();
      reqItem.decisionNote = note || null;

      const existingCm = demoCampaignMembersRef.value.find(
        (m) => m.campaignId === reqItem.campaignId && m.userId === reqItem.requesterId
      );
      if (existingCm) {
        existingCm.role = reqItem.requestedRole;
        existingCm.status = "ACTIVE";
      } else {
        demoCampaignMembersRef.value.push({
          id: `cm-${Date.now()}`,
          campaignId: reqItem.campaignId,
          userId: reqItem.requesterId,
          role: reqItem.requestedRole,
          status: "ACTIVE",
        });
      }

      // Update demo user if exists
      const { demoAuthUsersRef } = await import("@/lib/auth");
      Object.values(demoAuthUsersRef.value).forEach((u) => {
        if (u.id === reqItem.requesterId) {
          u.role = reqItem.requestedRole;
          u.accountMode = reqItem.requestedRole;
          u.onboardingStatus = "COMPLETE";
        }
      });

      await createNotification({
        userId: reqItem.requesterId,
        type: "request_approved",
        title: "Access Request Approved!",
        body: `Your request to join InnovateX 2026 as ${reqItem.requestedRole.toLowerCase()} has been approved.`,
        href: "/app",
      });
    } else {
      reqItem.status = "REJECTED";
      reqItem.decidedById = viewerId;
      reqItem.decidedAt = new Date().toISOString();
      reqItem.decisionNote = note || null;

      await createNotification({
        userId: reqItem.requesterId,
        type: "request_rejected",
        title: "Access Request Declined",
        body: `Your access request was declined.${note ? ` Note: ${note}` : ""}`,
        href: "/onboarding/pending",
      });
    }

    return NextResponse.json({
      success: true,
      status: reqItem.status,
    });
  } catch (error) {
    console.error("[AccessRequest Decision API] Error processing decision:", error);
    return NextResponse.json(
      { error: "Failed to process access request decision." },
      { status: 500 }
    );
  }
}
