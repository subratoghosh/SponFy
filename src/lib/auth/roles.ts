import { NextResponse } from "next/server";
import { requireAuth, AuthResult } from "@/lib/security/auth-guard";
import { Role } from "@/types";

/**
 * Enforces role-based access control for API route handlers.
 * Allowed roles: "USER" | "EXECUTIVE" | "ORGANISER" | "ADMIN".
 * Returns 401 if unauthenticated, 403 if role is not within allowed roles.
 */
export async function requireRole(allowed: Role[]): Promise<AuthResult> {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes;
  }

  const role = (authRes.context.user.role || "USER") as Role;

  if (!allowed.includes(role)) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Forbidden. Insufficient permissions for this action.",
          code: "FORBIDDEN",
          requiredRoles: allowed,
        },
        { status: 403 }
      ),
    };
  }

  return authRes;
}

/**
 * Returns true if the user has Organiser privileges (or Admin).
 */
export function isOrganiser(role?: string | null): boolean {
  return role === "ORGANISER" || role === "ADMIN";
}

/**
 * Returns true if the user has Executive privileges (or Organiser/Admin).
 */
export function isExecutive(role?: string | null): boolean {
  return role === "EXECUTIVE" || role === "ORGANISER" || role === "ADMIN";
}

/**
 * Returns true if the user is an Admin.
 */
export function isAdmin(role?: string | null): boolean {
  return role === "ADMIN";
}

/**
 * Determines the primary home route for a user based on their role and onboardingStatus:
 * - ADMIN -> /admin
 * - USER/ORGANISER/EXECUTIVE with onboardingStatus COMPLETE -> /app
 * - PENDING_APPROVAL -> /onboarding/pending
 * - NOT_STARTED / DETAILS_DONE / others -> /onboarding
 */
export function getHomeRouteForUser(session: any): string {
  const user = session?.user;
  if (!user) return "/login";

  if (user.role === "ADMIN") {
    return "/admin";
  }

  const status = user.onboardingStatus;
  if (status === "COMPLETE") {
    return "/app";
  }

  if (status === "PENDING_APPROVAL") {
    return "/onboarding/pending";
  }

  return "/onboarding";
}
