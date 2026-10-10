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
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("placeholder");

  let session: any = null;
  try {
    session = await auth();
  } catch (err: any) {
    // If the browser provides a stale, mismatched, or corrupted session cookie from a previous secret,
    // Auth.js / jose throws JWTSessionError (no matching decryption secret).
    // Catch cleanly and treat as unauthenticated instead of crashing the page.
    session = null;
  }

  // 1. Check if authenticated
  if (!session?.user?.id && !session?.user?.email) {
    if (isDemo) {
      // In local demo mode with no DB, provide a controlled demo admin context
      return {
        authorized: true,
        user: {
          id: "usr-admin-1",
          email: "admin@sponfy.dev",
          name: "Subrato Ghosh (Platform Lead)",
          role: "ADMIN",
        },
        isDemo: true,
      };
    }
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

      // Check explicit ADMIN role or server ADMIN_EMAILS environment variable
      const hasDbAdminRole = dbUser.role === "ADMIN";
      const hasEnvAdminEmail = adminEmails.includes(dbUser.email?.toLowerCase());

      if (hasDbAdminRole || hasEnvAdminEmail) {
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

  // 3. Fallback for environment variable matches if DB is unreachable
  if (userEmail && adminEmails.includes(userEmail)) {
    return {
      authorized: true,
      user: {
        id: userId || "env-admin",
        email: userEmail,
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
