import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";
import { createNotification } from "@/lib/data/repositories/notifications";
import { demoAccessRequestsRef } from "@/lib/security/campaign-access";
import { AccessRequest } from "@/types";

const createAccessRequestSchema = z.object({
  organisationId: z.string().trim().optional(),
  campaignId: z.string().trim().optional(),
  requestedRole: z.enum(["ORGANISER", "EXECUTIVE"]).default("ORGANISER"),
  roleInTeam: z.string().trim().min(2, "Your role in the team is required").max(100),
  whyJoin: z.string().trim().min(5, "Please state why you want to join").max(500),
  message: z.string().trim().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;
  const user = authRes.context.user;

  try {
    const json = await req.json();
    const result = createAccessRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    let { organisationId, campaignId, requestedRole, roleInTeam, whyJoin, message } = result.data;

    if (!organisationId && !campaignId) {
      return NextResponse.json(
        { error: "Organisation or campaign is required to submit a join request." },
        { status: 400 }
      );
    }

    if (isDatabaseConfigured()) {
      let org: any = null;
      let campaign: any = null;

      if (campaignId) {
        campaign = await (prisma as any).campaign.findUnique({
          where: { id: campaignId },
          select: {
            id: true,
            name: true,
            userId: true,
            organisationId: true,
            organisation: { select: { id: true, name: true, createdById: true } },
          },
        });
        if (campaign?.organisationId) {
          organisationId = campaign.organisationId;
          org = campaign.organisation;
        }
      }

      if (organisationId && !org) {
        org = await (prisma as any).organisation.findUnique({
          where: { id: organisationId },
          select: { id: true, name: true, createdById: true },
        });
      }

      if (!org) {
        return NextResponse.json(
          { error: "Organisation not found or not registered." },
          { status: 404 }
        );
      }

      // 1. Creator cannot submit join request to their own organisation (no self-approval)
      if (org.createdById === userId) {
        return NextResponse.json(
          { error: "You are the creator of this organisation and already an active Organiser." },
          { status: 400 }
        );
      }

      // 2. Prevent joining if user is already an ACTIVE member of this organisation
      const existingActiveMember = await (prisma as any).organisationMember.findFirst({
        where: {
          organisationId: org.id,
          userId,
          status: "ACTIVE",
        },
      });

      if (existingActiveMember) {
        return NextResponse.json(
          { error: "You are already an active member of this organisation." },
          { status: 400 }
        );
      }

      // 3. Block duplicate pending requests
      const existingPending = await (prisma as any).accessRequest.findFirst({
        where: {
          organisationId: org.id,
          requesterId: userId,
          status: "PENDING",
        },
      });

      if (existingPending) {
        return NextResponse.json(
          { error: "You already have a pending access request for this organisation." },
          { status: 400 }
        );
      }

      // 4. Create AccessRequest
      const accessRequest = await (prisma as any).accessRequest.create({
        data: {
          requesterId: userId,
          organisationId: org.id,
          campaignId: campaignId || null,
          requestedRole: requestedRole || "ORGANISER",
          message: message || null,
          details: { roleInTeam, whyJoin },
          status: "PENDING",
        },
      });

      // 5. Update user onboardingStatus to PENDING_APPROVAL and role
      await (prisma as any).user.update({
        where: { id: userId },
        data: {
          onboardingStatus: "PENDING_APPROVAL",
          accountMode: requestedRole || "ORGANISER",
          role: requestedRole || "ORGANISER",
        },
      });

      // 6. Notify all ACTIVE organisers of that organisation
      const activeOrganisers = await (prisma as any).organisationMember.findMany({
        where: {
          organisationId: org.id,
          role: "ORGANISER",
          status: "ACTIVE",
        },
        select: { userId: true },
      });

      const recipientIds = new Set<string>();
      if (org.createdById) recipientIds.add(org.createdById);
      activeOrganisers.forEach((o: any) => recipientIds.add(o.userId));
      recipientIds.delete(userId); // don't notify self

      const requesterName = user.name || "A team member";
      await Promise.all(
        Array.from(recipientIds).map((organiserId) =>
          createNotification({
            userId: organiserId,
            type: "access_request",
            title: "New Organization Access Request",
            body: `${requesterName} requested to join "${org.name}" as ${requestedRole || "Organiser"}.`,
            href: "/app/team",
          })
        )
      );

      return NextResponse.json({
        success: true,
        requestId: accessRequest.id,
        redirectUrl: "/onboarding/pending",
      });
    }

    // Demo Mode fallback
    const newDemoReq: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: userId,
      campaignId,
      organisationId: "org-demo-1",
      requestedRole: "ORGANISER",
      message: message || null,
      details: { roleInTeam, whyJoin },
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    demoAccessRequestsRef.value.unshift(newDemoReq);

    const { demoAuthUsersRef } = await import("@/lib/auth");
    const userEmail = user.email?.toLowerCase().trim();
    if (userEmail && demoAuthUsersRef.value[userEmail]) {
      demoAuthUsersRef.value[userEmail].onboardingStatus = "PENDING_APPROVAL";
    }

    await createNotification({
      userId: "usr-demo-organiser",
      type: "access_request",
      title: "New Team Access Request",
      body: `${user.name || "Sneha Roy"} requested to join InnovateX 2026 as Organiser.`,
      href: "/app/team",
    });

    return NextResponse.json({
      success: true,
      requestId: newDemoReq.id,
      redirectUrl: "/onboarding/pending",
    });
  } catch (error) {
    console.error("[AccessRequest API] Error submitting access request:", error);
    return NextResponse.json(
      { error: "Failed to submit access request. Please try again." },
      { status: 500 }
    );
  }
}
