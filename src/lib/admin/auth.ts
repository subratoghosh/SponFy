import "server-only";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { AdminUser, UserRole } from "@/types";

export interface AdminAuthResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  reason?: "UNAUTHENTICATED" | "FORBIDDEN" | "SUSPENDED" | "NO_ADMIN_CONFIGURED";
  isDemo?: boolean;
}

/**
 * Returns a list of trusted admin emails configured in the server environment.
 * In production, only users matching this list or with role=ADMIN in the database are allowed.
 */
export function getAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS || "";
  return envAdmins
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Strictly verifies whether the current request is made by an authorized administrator.
 * Validates session securely on the server and checks the database record.
 * Never trusts client-supplied headers, client cookies, or mutable profile fields.
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
  // The demo admin bypass is only allowed when there is NO real database.
  // NEXT_PUBLIC_DEMO_MODE alone must never grant admin: .env.example ships with it
  // set to "true", so a real deployment that kept it would hand admin to anyone.
  const isDemo = !isDatabaseConfigured();

  let session: any = null;
  try {
    session = await auth();
  } catch (err: any) {
    // If the browser provides a stale, mismatched, or corrupted session cookie from a previous secret,
    // Auth.js / jose throws JWTSessionError (no matching decryption secret).
    // Catch cleanly and treat as unauthenticated instead of crashing the page.
    session = null;
  }

  // If there is NO database configured at all (local zero-config test environment), allow demo admin
  if (isDemo && !session?.user?.id && !session?.user?.email) {
    return {
      authorized: true,
      isDemo: true,
      user: {
        id: "demo-admin-id",
        email: "demo@sponfy.dev",
        name: "Demo Admin",
        role: "ADMIN",
      },
    };
  }

  // 1. Check if authenticated - always require an active logged in session when database is configured
  if (!session?.user?.id && !session?.user?.email) {
    return { authorized: false, reason: "UNAUTHENTICATED" };
  }

  const userEmail = (session.user.email || "").toLowerCase();
  const userId = session.user.id;
  const adminEmails = getAdminEmails();

  // 2. Database validation if database is configured
  if (isDatabaseConfigured()) {
    try {
      const dbUser = await (prisma as any).user.findFirst({
        where: {
          OR: [
            ...(userId ? [{ id: userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : []),
          ],
        },
      });

      if (!dbUser) {
        return { authorized: false, reason: "UNAUTHENTICATED" };
      }

      // Check if suspended
      if (dbUser.status === "SUSPENDED") {
        return { authorized: false, reason: "SUSPENDED" };
      }

      // Check explicit ADMIN role or server ADMIN_EMAILS environment variable or session role
      const hasDbAdminRole = dbUser.role === "ADMIN";
      const hasEnvAdminEmail =
        adminEmails.includes(dbUser.email?.toLowerCase()) ||
        (userEmail && adminEmails.includes(userEmail));
      const hasSessionAdminRole = (session.user as any)?.role === "ADMIN";

      if (hasDbAdminRole || hasEnvAdminEmail || hasSessionAdminRole) {
        return {
          authorized: true,
          user: {
            id: dbUser.id,
            email: dbUser.email || userEmail,
            name: dbUser.name || "Administrator",
            role: "ADMIN",
          },
          isDemo: false,
        };
      }

      // User exists but has no admin privileges
      return {
        authorized: false,
        reason: "FORBIDDEN",
        user: {
          id: dbUser.id,
          email: dbUser.email || userEmail,
          name: dbUser.name || "User",
          role: "USER",
        },
      };
    } catch (err) {
      console.error("verifyAdminSession database query failed:", err);
      // Fall through to environment variable check as fallback
    }
  }

  // 3. Fallback for environment variable matches or admin session role if DB is unreachable
  if ((userEmail && adminEmails.includes(userEmail)) || (session.user as any)?.role === "ADMIN") {
    return {
      authorized: true,
      user: {
        id: userId || "env-admin",
        email: userEmail || "admin@sponfy.dev",
        name: session.user.name || "System Admin",
        role: "ADMIN",
      },
      isDemo: false,
    };
  }

  // 4. Demo mode fallback when no DB configured
  if (isDemo) {
    return {
      authorized: true,
      user: {
        id: userId || "demo-admin-id",
        email: userEmail || "admin@sponfy.dev",
        name: session.user.name || "Demo Administrator",
        role: "ADMIN",
      },
      isDemo: true,
    };
  }

  return { authorized: false, reason: "FORBIDDEN" };
}
