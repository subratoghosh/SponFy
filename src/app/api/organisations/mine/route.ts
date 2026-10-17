import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

export interface DemoOrg {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  website?: string | null;
  city?: string | null;
  createdById: string;
}

export const demoOrganisationsRef = memoryStore<DemoOrg[]>(
  "organisations",
  () => [
    {
      id: "org-demo-1",
      name: "TechFest Committee",
      slug: "techfest-committee",
      type: "College Club",
      city: "Mumbai",
      createdById: "usr-demo-organiser",
    },
  ]
);

export async function GET() {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    if (isDatabaseConfigured()) {
      const orgs = await (prisma as any).organisation.findMany({
        where: {
          OR: [
            { createdById: userId },
            {
              members: {
                some: {
                  userId,
                  status: "ACTIVE",
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          city: true,
          website: true,
          description: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ success: true, organisations: orgs });
    }

    // Demo mode
    const orgs = demoOrganisationsRef.value.filter(
      (o) => o.createdById === userId || userId.startsWith("usr-demo")
    );

    return NextResponse.json({ success: true, organisations: orgs });
  } catch (error) {
    console.error("[Organisations Mine API] Error fetching user organisations:", error);
    return NextResponse.json(
      { error: "Failed to load organisations." },
      { status: 500 }
    );
  }
}
