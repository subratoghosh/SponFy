import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, festName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(cleanEmail);

    // 1. If database is connected, persist the user into Neon/PostgreSQL
    if (isDatabaseConfigured()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in." },
          { status: 409 }
        );
      }

      const hashedPassword = hashPassword(password);

      const newUser: any = await (prisma as any).user.create({
        data: {
          name: name?.trim() || cleanEmail.split("@")[0],
          email: cleanEmail,
          password: hashedPassword,
          orgName: festName?.trim() || null,
          role: isAdmin ? "ADMIN" : "USER",
          accountMode: "INDIVIDUAL",
          onboardingStatus: isAdmin ? "COMPLETE" : "NOT_STARTED",
          onboarded: isAdmin,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          accountMode: newUser.accountMode,
          onboardingStatus: newUser.onboardingStatus,
        },
      });
    }

    // 2. If database is in local demo mode
    const { demoAuthUsersRef } = await import("@/lib/auth");
    const demoUser = {
      id: isAdmin ? "usr-admin-1" : `demo-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || "Demo Organizer",
      role: isAdmin ? "ADMIN" : "USER",
      accountMode: "INDIVIDUAL",
      onboardingStatus: isAdmin ? "COMPLETE" : "NOT_STARTED",
    };
    demoAuthUsersRef.value[cleanEmail] = demoUser;

    return NextResponse.json({
      success: true,
      message: "Demo registration successful.",
      user: demoUser,
    });
  } catch (error: any) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}
