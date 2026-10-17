import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

export type CampaignAccessRole = "OWNER" | "ORGANISER" | "EXECUTIVE";

export interface CampaignAccessResult {
  allowed: boolean;
  role: CampaignAccessRole | null;
}

export interface RequireCampaignAccessResult {
  allowed: boolean;
  role: CampaignAccessRole | null;
  response?: NextResponse;
}

export interface InMemoryCampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  role: "ORGANISER" | "EXECUTIVE";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "REMOVED";
}

// In-memory campaign member store for demo mode
export const demoCampaignMembersRef = memoryStore<InMemoryCampaignMember[]>(
  "campaignMembers",
  () => [
    {
      id: "cm-demo-org-1",
      campaignId: "cmp_demo_1",
      userId: "usr-demo-organiser",
      role: "ORGANISER",
      status: "ACTIVE",
    },
    {
      id: "cm-demo-exec-1",
      campaignId: "cmp_demo_1",
      userId: "usr-demo-executive",
      role: "EXECUTIVE",
      status: "ACTIVE",
    },
  ]
);

const ROLE_RANK: Record<CampaignAccessRole, number> = {
  EXECUTIVE: 1,
  ORGANISER: 2,
  OWNER: 3,
};

/**
 * Checks whether a user has access to a campaign and identifies their highest role.
 * - Campaign.userId is the creator and has implicit OWNER access.
 * - Active CampaignMember records grant ORGANISER or EXECUTIVE access.
 */
export async function getCampaignAccess(
  userId: string,
  campaignId: string
): Promise<CampaignAccessResult> {
  if (!userId || !campaignId) {
    return { allowed: false, role: null };
  }

  if (isDatabaseConfigured()) {
    try {
      const campaign = await (prisma as any).campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, userId: true },
      });

      if (!campaign) {
        return { allowed: false, role: null };
      }

      if (campaign.userId === userId) {
        return { allowed: true, role: "OWNER" };
      }

      const member = await (prisma as any).campaignMember.findFirst({
        where: {
          campaignId,
          userId,
          status: "ACTIVE",
        },
        select: { role: true },
      });

      if (member) {
        const role: CampaignAccessRole =
          member.role === "ORGANISER" ? "ORGANISER" : "EXECUTIVE";
        return { allowed: true, role };
      }

      return { allowed: false, role: null };
    } catch (err) {
      console.error("[CampaignAccess] Error checking campaign access:", err);
      return { allowed: false, role: null };
    }
  }

  // Demo / In-memory fallback
  const demoMembers = demoCampaignMembersRef.value;
  const activeMember = demoMembers.find(
    (m) =>
      m.campaignId === campaignId &&
      m.userId === userId &&
      m.status === "ACTIVE"
  );

  if (activeMember) {
    return {
      allowed: true,
      role: activeMember.role as CampaignAccessRole,
    };
  }

  // Default demo user ownership fallback
  if (
    userId === "demo-user" ||
    userId.startsWith("usr-demo") ||
    userId.startsWith("usr-") ||
    userId === "usr-admin-1"
  ) {
    return { allowed: true, role: "OWNER" };
  }

  return { allowed: false, role: null };
}

/**
 * Enforces campaign access with an optional minimum required role (default: "EXECUTIVE").
 */
export async function requireCampaignAccess(
  userId: string,
  campaignId: string,
  minRole: CampaignAccessRole = "EXECUTIVE"
): Promise<RequireCampaignAccessResult> {
  const access = await getCampaignAccess(userId, campaignId);

  if (!access.allowed || !access.role) {
    return {
      allowed: false,
      role: null,
      response: NextResponse.json(
        {
          error: "Forbidden. You do not have access to this campaign.",
          code: "FORBIDDEN_CAMPAIGN_ACCESS",
        },
        { status: 403 }
      ),
    };
  }

  if (ROLE_RANK[access.role] < ROLE_RANK[minRole]) {
    return {
      allowed: false,
      role: access.role,
      response: NextResponse.json(
        {
          error: `Forbidden. Action requires ${minRole} role or higher.`,
          code: "INSUFFICIENT_CAMPAIGN_ROLE",
          currentRole: access.role,
          requiredRole: minRole,
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true, role: access.role };
}
