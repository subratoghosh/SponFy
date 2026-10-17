import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoAccessRequestsRef } from "@/lib/data/repositories/access-requests";

export async function POST() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      // Find latest pending access request
      const pendingReq = await (prisma as any).accessRequest.findFirst({
        where: {
          requesterId: userId,
          status: "PENDING",
        },
      });

      if (pendingReq) {
        await (prisma as any).accessRequest.update({
          where: { id: pendingReq.id },
          data: { status: "CANCELLED" },
        });
      }

      // Reset user onboarding status back to DETAILS_DONE
      await (prisma as any).user.update({
        where: { id: userId },
        data: { onboardingStatus: "DETAILS_DONE" },
      });

      return NextResponse.json({
        success: true,
        message: "Access request cancelled successfully.",
        redirectUrl: "/onboarding",
      });
    }

    // Demo Mode
    demoAccessRequestsRef.value = demoAccessRequestsRef.value.map((r) =>
      r.requesterId === userId && r.status === "PENDING"
        ? { ...r, status: "CANCELLED" }
        : r
    );

    const { demoAuthUsersRef } = await import("@/lib/auth");
    const userEmail = authRes.context.user.email?.toLowerCase().trim();
    if (userEmail && demoAuthUsersRef.value[userEmail]) {
      demoAuthUsersRef.value[userEmail].onboardingStatus = "DETAILS_DONE";
    }

    return NextResponse.json({
      success: true,
      message: "Access request cancelled.",
      redirectUrl: "/onboarding",
    });
  } catch (error) {
    console.error("[AccessRequest Cancel API] Error cancelling request:", error);
    return NextResponse.json(
      { error: "Failed to cancel access request." },
      { status: 500 }
    );
  }
}
