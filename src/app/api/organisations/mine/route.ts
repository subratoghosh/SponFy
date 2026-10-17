import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { demoOrganisationsRef } from "@/lib/data/repositories/organisations";

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
