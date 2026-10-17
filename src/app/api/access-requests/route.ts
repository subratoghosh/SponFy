import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createNotification } from "@/lib/data/repositories/notifications";
import { demoAccessRequestsRef } from "@/lib/data/repositories/access-requests";
import { AccessRequest, OrgRole } from "@/types";

const createAccessRequestSchema = z.object({
  campaignId: z.string().trim().min(1, "Campaign is required"),
  roleInTeam: z.string().trim().max(100).optional(),
  designation: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  availability: z.union([z.number(), z.string()]).optional(),
  availabilityHours: z.union([z.number(), z.string()]).optional(),
  whyJoin: z.string().trim().min(5, "Please state why you want to join").max(500),
  message: z.string().trim().max(500).optional().nullable(),
  requestedRole: z.enum(["ORGANISER", "EXECUTIVE"]).optional().default("EXECUTIVE"),
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

    const {
      campaignId,
      roleInTeam,
      designation,
      department,
      availability,
      availabilityHours,
      whyJoin,
      message,
      requestedRole = "EXECUTIVE",
    } = result.data;

    const roleTitle = (designation || roleInTeam || "").trim() || (requestedRole === "EXECUTIVE" ? "Executive" : "Organiser");
    const dept = (department || "").trim() || "General";
    const hours = availabilityHours !== undefined ? availabilityHours : availability !== undefined ? availability : null;

    const detailsObj = {
      roleInTeam: roleTitle,
      designation: roleTitle,
      department: dept,
      availabilityHours: hours ? String(hours).trim() : null,
      whyJoin,
    };

    if (isDatabaseConfigured()) {
      // 1. Fetch campaign and verify it belongs to an organisation
      const campaign = await (prisma as any).campaign.findUnique({
        where: { id: campaignId },
        select: {
          id: true,
          name: true,
          userId: true,
          organisationId: true,
          organisation: { select: { id: true, name: true } },
        },
      });

      if (!campaign || !campaign.organisationId) {
        return NextResponse.json(
          { error: "This campaign is personal or does not belong to an organisation." },
          { status: 400 }
        );
      }

      // 2. Prevent joining if user is already an ACTIVE member or the creator
      if (campaign.userId === userId) {
        return NextResponse.json(
          { error: "You are the creator and owner of this campaign." },
          { status: 400 }
        );
      }

      const existingActiveMember = await (prisma as any).campaignMember.findFirst({
        where: {
          campaignId,
          userId,
          status: "ACTIVE",
        },
      });

      if (existingActiveMember) {
        return NextResponse.json(
          { error: "You are already an active member of this campaign." },
          { status: 400 }
        );
      }

      // 3. Block duplicate pending requests
      const existingPending = await (prisma as any).accessRequest.findFirst({
        where: {
          campaignId,
          requesterId: userId,
          status: "PENDING",
        },
      });

      if (existingPending) {
        return NextResponse.json(
          { error: "You already have a pending access request for this campaign." },
          { status: 400 }
        );
      }

      // 4. Create AccessRequest
      const accessRequest = await (prisma as any).accessRequest.create({
        data: {
          requesterId: userId,
          campaignId,
          organisationId: campaign.organisationId,
          requestedRole: requestedRole as OrgRole,
          message: message || null,
          details: detailsObj,
          status: "PENDING",
        },
      });

      // 5. Update user onboardingStatus to PENDING_APPROVAL and profile fields
      await (prisma as any).user.update({
        where: { id: userId },
        data: {
          onboardingStatus: "PENDING_APPROVAL",
          accountMode: requestedRole,
          designation: roleTitle,
          department: dept,
        },
      });

      // 6. Notify all ACTIVE organisers of that campaign and campaign creator
      const organisers = await (prisma as any).campaignMember.findMany({
        where: {
          campaignId,
          role: "ORGANISER",
          status: "ACTIVE",
        },
        select: { userId: true },
      });

      const recipientIds = new Set<string>();
      if (campaign.userId) recipientIds.add(campaign.userId);
      organisers.forEach((o: any) => recipientIds.add(o.userId));
      recipientIds.delete(userId); // don't notify self

      const requesterName = user.name || "A team member";
      const notifBody =
        requestedRole === "EXECUTIVE"
          ? `${requesterName} wants to join as executive`
          : `${requesterName} requested to join "${campaign.name}" as Organiser.`;

      await Promise.all(
        Array.from(recipientIds).map((organiserId) =>
          createNotification({
            userId: organiserId,
            type: "access_request",
            title: "New Team Access Request",
            body: notifBody,
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
    // Check duplicate pending in demo store
    const existingDemoPending = demoAccessRequestsRef.value.find(
      (r) => r.campaignId === campaignId && r.requesterId === userId && r.status === "PENDING"
    );
    if (existingDemoPending) {
      return NextResponse.json(
        { error: "You already have a pending access request for this campaign." },
        { status: 400 }
      );
    }

    const newDemoReq: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: userId,
      campaignId,
      organisationId: "org-demo-1",
      requestedRole: requestedRole as OrgRole,
      message: message || null,
      details: detailsObj,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    demoAccessRequestsRef.value.unshift(newDemoReq);

    const { demoAuthUsersRef } = await import("@/lib/auth");
    const userEmail = user.email?.toLowerCase().trim();
    if (userEmail && demoAuthUsersRef.value[userEmail]) {
      demoAuthUsersRef.value[userEmail].onboardingStatus = "PENDING_APPROVAL";
      demoAuthUsersRef.value[userEmail].accountMode = requestedRole;
    }

    const requesterName = user.name || "Sneha Roy";
    const notifBody =
      requestedRole === "EXECUTIVE"
        ? `${requesterName} wants to join as executive`
        : `${requesterName} requested to join InnovateX 2026 as Organiser.`;

    await createNotification({
      userId: "usr-demo-organiser",
      type: "access_request",
      title: "New Team Access Request",
      body: notifBody,
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
