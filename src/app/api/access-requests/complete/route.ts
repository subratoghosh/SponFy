import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoAccessRequestsRef } from "@/lib/data/repositories/access-requests";
import { demoCampaignMembersRef } from "@/lib/security/campaign-access";

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

      if (!approvedReq && !activeMember) {
        return NextResponse.json(
          { error: "No approved access request found for your account." },
          { status: 400 }
        );
      }

      const targetRole = approvedReq?.requestedRole || activeMember?.role || "EXECUTIVE";

      // Activate CampaignMember if not already active
      if (approvedReq) {
        await (prisma as any).campaignMember.upsert({
          where: {
            campaignId_userId: {
              campaignId: approvedReq.campaignId,
              userId,
            },
          },
          update: {
            role: targetRole,
            status: "ACTIVE",
          },
          create: {
            campaignId: approvedReq.campaignId,
            userId,
            role: targetRole,
            status: "ACTIVE",
          },
        });

        // Activate OrganisationMember if organisation linked
        const orgId = approvedReq.organisationId;
        if (orgId) {
          await (prisma as any).organisationMember.upsert({
            where: {
              organisationId_userId: {
                organisationId: orgId,
                userId,
              },
            },
            update: {
              role: targetRole,
              status: "ACTIVE",
            },
            create: {
              organisationId: orgId,
              userId,
              role: targetRole,
              status: "ACTIVE",
            },
          });
        }
      }

      await (prisma as any).user.update({
        where: { id: userId },
        data: {
          role: targetRole,
          accountMode: targetRole,
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

    if (approvedDemoReq) {
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
