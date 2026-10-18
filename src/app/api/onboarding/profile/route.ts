import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().min(5, "Phone number is required").max(25),
  designation: z.string().trim().min(1, "Designation is required").max(100),
  collegeOrCompany: z.string().trim().min(1, "College or company is required").max(120),
  department: z.string().trim().min(1, "Department is required").max(100),
});

interface DemoUserProfile {
  name: string;
  phone: string;
  designation: string;
  collegeOrCompany: string;
  department: string;
  onboardingStatus: string;
}

const demoProfilesRef = memoryStore<Record<string, DemoUserProfile>>("onboardingProfiles", () => ({}));

export async function GET() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;
  const sessionEmail = authRes.context.user.email?.toLowerCase().trim();

  if (isDatabaseConfigured()) {
    try {
      const dbUser =
        (await (prisma as any).user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            phone: true,
            designation: true,
            collegeOrCompany: true,
            department: true,
            onboardingStatus: true,
          },
        })) ||
        (sessionEmail
          ? await (prisma as any).user.findUnique({
              where: { email: sessionEmail },
              select: {
                name: true,
                phone: true,
                designation: true,
                collegeOrCompany: true,
                department: true,
                onboardingStatus: true,
              },
            })
          : null);

      if (dbUser) {
        return NextResponse.json({
          success: true,
          profile: {
            name: dbUser.name || authRes.context.user.name || "",
            phone: dbUser.phone || "",
            designation: dbUser.designation || "",
            collegeOrCompany: dbUser.collegeOrCompany || "",
            department: dbUser.department || "",
            onboardingStatus: dbUser.onboardingStatus || "NOT_STARTED",
          },
        });
      }
    } catch (err) {
      console.warn("Failed to fetch profile in GET /api/onboarding/profile:", err);
    }
  }

  const demoProfile = demoProfilesRef.value[userId] || ({} as any);
  return NextResponse.json({
    success: true,
    profile: {
      name: demoProfile.name || authRes.context.user.name || "",
      phone: demoProfile.phone || "",
      designation: demoProfile.designation || "",
      collegeOrCompany: demoProfile.collegeOrCompany || "",
      department: demoProfile.department || "",
      onboardingStatus: demoProfile.onboardingStatus || "NOT_STARTED",
    },
  });
}

export async function PATCH(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    const json = await req.json();
    const result = profileSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed. Please fill in all fields correctly.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, phone, designation, collegeOrCompany, department } = result.data;

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
          name,
          phone,
          designation,
          collegeOrCompany,
          department,
          onboardingStatus: "DETAILS_DONE",
        },
      });
    } else {
      demoProfilesRef.value[userId] = {
        name,
        phone,
        designation,
        collegeOrCompany,
        department,
        onboardingStatus: "DETAILS_DONE",
      };
    }

    return NextResponse.json({
      success: true,
      onboardingStatus: "DETAILS_DONE",
      message: "Profile details updated successfully.",
    });
  } catch (error) {
    console.error("[OnboardingProfile] Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile details. Please try again." },
      { status: 500 }
    );
  }
}
