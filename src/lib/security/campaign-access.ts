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

import { AccessRequest } from "@/types";

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

// In-memory access request store for demo mode
export const demoAccessRequestsRef = memoryStore<AccessRequest[]>(
  "accessRequests",
  () => [
    {
      id: "req-demo-1",
      requesterId: "usr-demo-lead",
      campaignId: "cmp_demo_org_1",
      organisationId: "org-demo-1",
      requestedRole: "ORGANISER",
      message: "I am leading corporate outreach for the 2026 fest.",
      details: {
        roleInTeam: "Sponsorship Convenor",
        whyJoin: "Connect corporate brands and coordinate deals with the core team.",
      },
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
  ]
);

export interface InMemoryOrganisationMember {
  id: string;
  organisationId: string;
  userId: string;
  role: "ORGANISER" | "EXECUTIVE";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "REMOVED";
}

export const demoOrganisationMembersRef = memoryStore<InMemoryOrganisationMember[]>(
  "organisationMembers",
  () => [
    {
      id: "om-demo-1",
      organisationId: "org-demo-1",
      userId: "usr-demo-lead",
      role: "ORGANISER",
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
 * - Active ORGANISER membership in the campaign's owning organisation grants ORGANISER access.
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
        select: { id: true, userId: true, organisationId: true },
      });

      if (!campaign) {
        return { allowed: false, role: null };
      }

      // 1. Direct campaign creator / owner
      if (campaign.userId === userId) {
        return { allowed: true, role: "OWNER" };
      }

      // 2. Active ORGANISER of the organisation that owns this campaign
      if (campaign.organisationId) {
        const orgMember = await (prisma as any).organisationMember.findFirst({
          where: {
            organisationId: campaign.organisationId,
            userId,
            role: "ORGANISER",
            status: "ACTIVE",
          },
          select: { role: true },
        });

        if (orgMember) {
          return { allowed: true, role: "ORGANISER" };
        }
      }

      // 3. Direct assigned CampaignMember (EXECUTIVE or ORGANISER)
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

  // Check demo organisation memberships
  const demoOrgMembers = demoOrganisationMembersRef.value;
  const activeOrgMember = demoOrgMembers.find(
    (m) => m.userId === userId && m.role === "ORGANISER" && m.status === "ACTIVE"
  );
  if (activeOrgMember) {
    return { allowed: true, role: "ORGANISER" };
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
 * Returns all campaign IDs that the user has authorized access to:
 * - Individually created campaigns (campaign.userId === userId)
 * - Campaigns belonging to organisations where user is an active ORGANISER
 * - Campaigns where user has an active CampaignMember assignment
 */
export async function getUserAccessibleCampaignIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  if (isDatabaseConfigured()) {
    try {
      const campaigns = await (prisma as any).campaign.findMany({
        where: {
          OR: [
            { userId },
            {
              members: {
                some: {
                  userId,
                  status: "ACTIVE",
                },
              },
            },
            {
              organisation: {
                members: {
                  some: {
                    userId,
                    role: "ORGANISER",
                    status: "ACTIVE",
                  },
                },
              },
            },
          ],
        },
        select: { id: true },
      });
      return campaigns.map((c: any) => c.id);
    } catch (err) {
      console.error("[CampaignAccess] Error fetching accessible campaign IDs:", err);
      return [];
    }
  }

  // In-memory demo fallback
  const assigned = demoCampaignMembersRef.value
    .filter((m) => m.userId === userId && m.status === "ACTIVE")
    .map((m) => m.campaignId);

  const defaultDemoCampaigns = ["cmp_demo_1", "cmp_demo_org_1"];
  return Array.from(new Set([...assigned, ...defaultDemoCampaigns]));
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
