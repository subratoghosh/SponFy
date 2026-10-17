import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const modeSchema = z.object({
  mode: z.enum(["USER", "INDIVIDUAL", "ORGANISER", "EXECUTIVE"]),
});

export async function POST(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    const json = await req.json();
    const result = modeSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid mode selection.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { mode } = result.data;

    // Security requirement: mode route only allows USER directly.
    // Privileged roles (ORGANISER, EXECUTIVE) must be granted through Part 2 (org creation)
    // or Part 3 (executive access request), never via direct self-assignment here.
    if (mode === "ORGANISER" || mode === "EXECUTIVE") {
      return NextResponse.json(
        {
          error: "Privileged roles cannot be self-assigned directly. Please proceed through the organiser creation or executive access request flow.",
          code: "ROLE_ASSIGNMENT_FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Role USER / INDIVIDUAL mode
    if (isDatabaseConfigured()) {
      // The session id can be stale (e.g. old cookie); resolve the real DB user by id, then by email.
      const sessionEmail = authRes.context.user.email?.toLowerCase().trim();
      const dbUser =
        (await (prisma as any).user.findUnique({ where: { id: userId }, select: { id: true } })) ||
        (sessionEmail
          ? await (prisma as any).user.findUnique({ where: { email: sessionEmail }, select: { id: true } })
          : null);
      if (!dbUser) {
        return NextResponse.json(
          { error: "We couldn't find your account. Please sign out and sign in again.", code: "USER_NOT_FOUND" },
          { status: 401 }
        );
      }
      await (prisma as any).user.update({
        where: { id: dbUser.id },
        data: {
          role: "USER",
          accountMode: "INDIVIDUAL",
          onboardingStatus: "COMPLETE",
          onboarded: true,
        },
      });
    } else {
      const { demoAuthUsersRef } = await import("@/lib/auth");
      const userEmail = authRes.context.user.email?.toLowerCase().trim();
      if (userEmail && demoAuthUsersRef.value[userEmail]) {
        demoAuthUsersRef.value[userEmail].role = "USER";
        demoAuthUsersRef.value[userEmail].accountMode = "INDIVIDUAL";
        demoAuthUsersRef.value[userEmail].onboardingStatus = "COMPLETE";
      }
    }

    return NextResponse.json({
      success: true,
      role: "USER",
      accountMode: "INDIVIDUAL",
      onboardingStatus: "COMPLETE",
      redirectUrl: "/app",
    });
  } catch (error) {
    console.error("[OnboardingMode] Error selecting mode:", error);
    return NextResponse.json(
      { error: "Failed to update workspace mode. Please try again." },
      { status: 500 }
    );
  }
}
