import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

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
        orderBy: { updatedAt: "desc" },
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

      await (prisma as any).user.update({
        where: { id: userId },
        data: {
          role: "ORGANISER",
          accountMode: "ORGANISER",
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
    if (userEmail && demoAuthUsersRef.value[userEmail]) {
      demoAuthUsersRef.value[userEmail].role = "ORGANISER";
      demoAuthUsersRef.value[userEmail].accountMode = "ORGANISER";
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
