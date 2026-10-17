import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export interface AuthContext {
  userId: string;
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  };
  session: any;
}

export type AuthResult =
  | { success: true; context: AuthContext }
  | { success: false; response: NextResponse };

/**
 * Enforces server-side authentication for API route handlers.
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Unauthorized. Please sign in to access this resource.", code: "UNAUTHORIZED" },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      context: {
        userId: session.user.id,
        user: session.user as any,
        session,
      },
    };
  } catch (error) {
    console.error("[AuthGuard] Error checking authentication:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Authentication check failed.", code: "AUTH_CHECK_FAILED" },
        { status: 401 }
      ),
    };
  }
}

/**
 * Enforces administrative role access for API route handlers.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const authRes = await requireAuth();
  if (!authRes.success) return authRes;

  const role = authRes.context.user.role;
  if (role !== "ADMIN") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden. Administrative privileges required.", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return authRes;
}

import { getCampaignAccess } from "@/lib/security/campaign-access";

/**
 * Verifies that the given company exists and belongs to the authenticated user,
 * or that the user is an active member of the company's campaign.
 * Prevents Insecure Direct Object References (IDOR).
 */
export async function verifyCompanyOwnership(
  companyId: string,
  userId: string
) {
  if (!companyId || !userId) return null;

  if (isDatabaseConfigured()) {
    try {
      const company = await (prisma as any).company.findFirst({
        where: { id: companyId },
      });
      if (!company) return null;

      // 1. Direct ownership for personal campaigns
      if (company.userId === userId) {
        return company;
      }

      // 2. Active member of organisation/campaign
      if (company.campaignId) {
        const { allowed } = await getCampaignAccess(userId, company.campaignId);
        if (allowed) {
          return company;
        }
      }

      return null;
    } catch (err) {
      console.error("[AuthGuard] verifyCompanyOwnership error:", err);
      return null;
    }
  }

  // Dev fallback when database is not configured
  return { id: companyId, userId, name: "Demo Company" };
}

/**
 * Verifies that the given outreach draft exists and belongs to the authenticated user,
 * or that the user is an active member of the draft's campaign.
 */
export async function verifyDraftOwnership(
  draftId: string,
  userId: string
) {
  if (!draftId || !userId) return null;

  if (isDatabaseConfigured()) {
    try {
      const draftDelegate = (prisma as any).emailDraft || (prisma as any).outreachDraft;
      const draft = await draftDelegate.findFirst({
        where: { id: draftId },
        include: {
          company: true,
        },
      });
      if (!draft) return null;

      // 1. Direct author ownership
      if (draft.userId === userId) {
        return draft;
      }

      // 2. Active member of organisation/campaign
      if (draft.company?.campaignId) {
        const { allowed } = await getCampaignAccess(userId, draft.company.campaignId);
        if (allowed) {
          return draft;
        }
      }

      return null;
    } catch (err) {
      console.error("[AuthGuard] verifyDraftOwnership error:", err);
      return null;
    }
  }

  return { id: draftId, userId, status: "DRAFT" };
}

/**
 * Extracts the real client IP address safely from trusted proxy headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Validates outbound URLs to prevent Open Redirects and SSRF (Server-Side Request Forgery).
 * Blocks loopback, private IP subnets, AWS metadata endpoints, and non-HTTP protocols.
 */
export function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);

    // Only allow standard web protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const rawHost = parsed.hostname.toLowerCase().trim();
    const host = rawHost.replace(/^\[|\]$/g, "");

    // Block localhost and standard loopbacks
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }

    // Block IPv4 private ranges (RFC 1918) and link-local/cloud metadata (169.254.x.x)
    const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octets = [
        parseInt(ipv4Match[1], 10),
        parseInt(ipv4Match[2], 10),
        parseInt(ipv4Match[3], 10),
        parseInt(ipv4Match[4], 10),
      ];

      // 10.0.0.0 - 10.255.255.255
      if (octets[0] === 10) return false;
      // 172.16.0.0 - 172.31.255.255
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
      // 192.168.0.0 - 192.168.255.255
      if (octets[0] === 192 && octets[1] === 168) return false;
      // 169.254.0.0 - 169.254.255.255 (AWS/GCP/Azure link-local metadata)
      if (octets[0] === 169 && octets[1] === 254) return false;
      // 127.0.0.0 - 127.255.255.255
      if (octets[0] === 127) return false;
      // 0.0.0.0
      if (octets[0] === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Standardized, safe error response that strips database errors, stack traces,
 * connection strings, and credential secrets before responding to the client.
 */
export function secureErrorResponse(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again later.",
  status = 500
): NextResponse {
  console.error("[API Error]", error);

  return NextResponse.json(
    {
      error: fallbackMessage,
      code: "INTERNAL_SERVER_ERROR",
    },
    { status }
  );
}
