import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoOrganisationsRef } from "@/app/api/organisations/mine/route";
import { demoCampaignMembersRef } from "@/lib/security/campaign-access";

const orgSubmissionSchema = z.object({
  organisationId: z.string().optional(),
  name: z.string().trim().min(2, "Organisation name is required").max(100),
  type: z.enum(["College Club", "Company", "NGO", "Fest Committee", "Other"]),
  description: z.string().trim().max(500).optional().nullable(),
  website: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  campaign: z.object({
    name: z.string().trim().min(2, "Campaign name is required").max(120),
    eventType: z.string().trim().min(1, "Event type is required"),
    audienceSize: z.coerce.number().int().min(1, "Audience size must be at least 1"),
    location: z.string().trim().min(1, "Location is required"),
    targetAmount: z.coerce.number().int().min(1000, "Target amount must be at least ₹1,000"),
    preferredIndustries: z.array(z.string()).min(1, "Select at least 1 preferred industry"),
    tiers: z.any().optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    deckUrl: z.string().trim().max(500).optional().nullable(),
  }),
});

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "org"}-${randomSuffix}`;
}

export async function POST(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    const json = await req.json();
    const result = orgSubmissionSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed. Please verify the organisation and campaign details.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { organisationId, name, type, description, website, city, campaign } = result.data;

    // Neon PostgreSQL dual-mode transaction
    if (isDatabaseConfigured()) {
      const outcome = await prisma.$transaction(async (tx: any) => {
        let org: any = null;

        // 1. Reuse existing organisation if selected
        if (organisationId) {
          org = await tx.organisation.findFirst({
            where: {
              id: organisationId,
              OR: [
                { createdById: userId },
                {
                  members: {
                    some: { userId, status: "ACTIVE" },
                  },
                },
              ],
            },
          });
        }

        // 2. Otherwise create new organisation with unique slug
        if (!org) {
          let uniqueSlug = generateSlug(name);
          let slugExists = await tx.organisation.findUnique({ where: { slug: uniqueSlug } });
          while (slugExists) {
            uniqueSlug = generateSlug(name);
            slugExists = await tx.organisation.findUnique({ where: { slug: uniqueSlug } });
          }

          org = await tx.organisation.create({
            data: {
              name,
              slug: uniqueSlug,
              type,
              description: description || null,
              website: website || null,
              city: city || null,
              createdById: userId,
            },
          });
        }

        // 3. Upsert OrganisationMember (role ORGANISER, status ACTIVE)
        await tx.organisationMember.upsert({
          where: {
            organisationId_userId: {
              organisationId: org.id,
              userId,
            },
          },
          update: {
            role: "ORGANISER",
            status: "ACTIVE",
          },
          create: {
            organisationId: org.id,
            userId,
            role: "ORGANISER",
            status: "ACTIVE",
          },
        });

        // 4. Create Campaign belonging to this organisation
        const defaultTiers = [
          { name: "Title Partner", amount: Math.round(campaign.targetAmount * 0.5), slots: 1, deliverables: ["Keynote", "Top branding"] },
          { name: "Gold Partner", amount: Math.round(campaign.targetAmount * 0.25), slots: 3, deliverables: ["Challenge Track", "Booth"] },
          { name: "Silver Partner", amount: Math.round(campaign.targetAmount * 0.1), slots: 5, deliverables: ["Swags", "Logo"] },
        ];

        const newCampaign = await tx.campaign.create({
          data: {
            userId,
            organisationId: org.id,
            name: campaign.name,
            eventType: campaign.eventType,
            audienceSize: campaign.audienceSize,
            location: campaign.location,
            targetAmount: campaign.targetAmount,
            preferredIndustries: campaign.preferredIndustries,
            tiers: campaign.tiers || defaultTiers,
            description: campaign.description || null,
            deckUrl: campaign.deckUrl || null,
          },
        });

        // 5. Upsert CampaignMember (role ORGANISER, status ACTIVE)
        await tx.campaignMember.upsert({
          where: {
            campaignId_userId: {
              campaignId: newCampaign.id,
              userId,
            },
          },
          update: {
            role: "ORGANISER",
            status: "ACTIVE",
          },
          create: {
            campaignId: newCampaign.id,
            userId,
            role: "ORGANISER",
            status: "ACTIVE",
          },
        });

        // 6. Update User role, accountMode, and onboarding status
        await tx.user.update({
          where: { id: userId },
          data: {
            role: "ORGANISER",
            accountMode: "ORGANISER",
            onboardingStatus: "COMPLETE",
            onboarded: true,
          },
        });

        return {
          organisationId: org.id,
          campaignId: newCampaign.id,
        };
      });

      return NextResponse.json({
        success: true,
        organisationId: outcome.organisationId,
        campaignId: outcome.campaignId,
        redirectUrl: "/app",
      });
    }

    // Demo Mode fallback
    const slug = generateSlug(name);
    const demoOrgId = organisationId || `org-demo-${Date.now()}`;
    if (!organisationId) {
      demoOrganisationsRef.value.push({
        id: demoOrgId,
        name,
        slug,
        type,
        city: city || null,
        description: description || null,
        website: website || null,
        createdById: userId,
      });
    }

    const demoCampId = `cmp_org_${Date.now()}`;
    demoCampaignMembersRef.value.push({
      id: `cm-${Date.now()}`,
      campaignId: demoCampId,
      userId,
      role: "ORGANISER",
      status: "ACTIVE",
    });

    const { demoAuthUsersRef } = await import("@/lib/auth");
    const userEmail = authRes.context.user.email?.toLowerCase().trim();
    if (userEmail && demoAuthUsersRef.value[userEmail]) {
      demoAuthUsersRef.value[userEmail].role = "ORGANISER";
      demoAuthUsersRef.value[userEmail].accountMode = "ORGANISER";
      demoAuthUsersRef.value[userEmail].onboardingStatus = "COMPLETE";
      demoAuthUsersRef.value[userEmail].organisationId = demoOrgId;
    }

    return NextResponse.json({
      success: true,
      organisationId: demoOrgId,
      campaignId: demoCampId,
      redirectUrl: "/app",
    });
  } catch (error) {
    console.error("[Organisations API] Error creating organisation & campaign:", error);
    return NextResponse.json(
      { error: "Failed to create organisation and campaign. Please try again." },
      { status: 500 }
    );
  }
}
