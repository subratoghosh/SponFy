import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoAccessRequestsRef, demoCampaignMembersRef } from "@/lib/security/campaign-access";

export async function POST() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      // Check if user has an APPROVED access request or active membership
      const approvedReq = await (prisma as any).accessRequest.findFirst({
        where: {
          requesterId: userId,
          status: "APPROVED",
        },
        orderBy: { createdAt: "desc" },
      });

      const activeMember = await (prisma as any).campaignMember.findFirst({
        where: {
          userId,
          status: "ACTIVE",
        },
      });

      const activeOrgMember = await (prisma as any).organisationMember.findFirst({
        where: {
          userId,
          status: "ACTIVE",
        },
      });

      if (!approvedReq && !activeMember && !activeOrgMember) {
        return NextResponse.json(
          { error: "No approved access request or active membership found for your account." },
          { status: 400 }
        );
      }

      const assignedRole =
        approvedReq?.requestedRole === "EXECUTIVE" ||
        activeOrgMember?.role === "EXECUTIVE" ||
        activeMember?.role === "EXECUTIVE"
          ? "EXECUTIVE"
          : "ORGANISER";

      // Activate CampaignMember if campaign linked
      if (approvedReq && approvedReq.campaignId) {
        await (prisma as any).campaignMember.upsert({
          where: {
            campaignId_userId: {
              campaignId: approvedReq.campaignId,
              userId,
            },
          },
          update: {
            role: assignedRole,
            status: "ACTIVE",
          },
          create: {
            campaignId: approvedReq.campaignId,
            userId,
            role: assignedRole,
            status: "ACTIVE",
          },
        });
      }

      // Activate OrganisationMember if organisation linked
      if (approvedReq && approvedReq.organisationId) {
        await (prisma as any).organisationMember.upsert({
          where: {
            organisationId_userId: {
              organisationId: approvedReq.organisationId,
              userId,
            },
          },
          update: {
            role: assignedRole,
            status: "ACTIVE",
          },
          create: {
            organisationId: approvedReq.organisationId,
            userId,
            role: assignedRole,
            status: "ACTIVE",
          },
        });
      }

      await (prisma as any).user.update({
        where: { id: userId },
        data: {
          role: assignedRole,
          accountMode: assignedRole,
          onboardingStatus: "COMPLETE",
          onboarded: true,
        },
      });

      return NextResponse.json({
        success: true,
        redirectUrl: "/app",
      });
    }

    // Demo Mode
    const { demoAuthUsersRef } = await import("@/lib/auth");
    const userEmail = authRes.context.user.email?.toLowerCase().trim();

    const approvedDemoReq = demoAccessRequestsRef.value.find(
      (r) => r.requesterId === userId && r.status === "APPROVED"
    );
    const targetRole = approvedDemoReq?.requestedRole || "EXECUTIVE";

    if (approvedDemoReq && approvedDemoReq.campaignId) {
      const existingMember = demoCampaignMembersRef.value.find(
        (m) => m.campaignId === approvedDemoReq.campaignId && m.userId === userId
      );
      if (existingMember) {
        existingMember.role = targetRole;
        existingMember.status = "ACTIVE";
      } else {
        demoCampaignMembersRef.value.push({
          id: `cm-${Date.now()}`,
          campaignId: approvedDemoReq.campaignId,
          userId,
          role: targetRole,
          status: "ACTIVE",
        });
      }
    }

    if (userEmail && demoAuthUsersRef.value[userEmail]) {
      demoAuthUsersRef.value[userEmail].role = targetRole;
      demoAuthUsersRef.value[userEmail].accountMode = targetRole;
      demoAuthUsersRef.value[userEmail].onboardingStatus = "COMPLETE";
    }

    return NextResponse.json({
      success: true,
      redirectUrl: "/app",
    });
  } catch (error) {
    console.error("[AccessRequest Complete API] Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to finalize workspace activation." },
      { status: 500 }
    );
  }
}
