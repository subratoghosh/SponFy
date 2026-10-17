import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoAccessRequestsRef } from "@/app/api/access-requests/route";

export async function GET() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      const user = await (prisma as any).user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          accountMode: true,
          onboardingStatus: true,
        },
      });

      const latestRequest = await (prisma as any).accessRequest.findFirst({
        where: { requesterId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              eventType: true,
              location: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        onboardingStatus: user?.onboardingStatus || "NOT_STARTED",
        role: user?.role || "USER",
        request: latestRequest
          ? {
              id: latestRequest.id,
              status: latestRequest.status,
              campaignName: latestRequest.campaign?.name || "Campaign",
              organisationName: latestRequest.organisation?.name || "Organisation",
              city: latestRequest.organisation?.city || latestRequest.campaign?.location || "",
              decisionNote: latestRequest.decisionNote || null,
              createdAt: latestRequest.createdAt.toISOString(),
            }
          : null,
      });
    }

    // Demo Mode
    const req = demoAccessRequestsRef.value.find((r) => r.requesterId === userId) || demoAccessRequestsRef.value[0];
    return NextResponse.json({
      success: true,
      onboardingStatus: "PENDING_APPROVAL",
      role: "USER",
      request: req
        ? {
            id: req.id,
            status: req.status,
            campaignName: "InnovateX National Hackathon 2026",
            organisationName: "TechFest Committee",
            city: "Bengaluru",
            decisionNote: req.decisionNote || null,
            createdAt: req.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("[AccessRequest Status API] Error checking status:", error);
    return NextResponse.json(
      { error: "Failed to retrieve access request status." },
      { status: 500 }
    );
  }
}
