import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();

    let userId = session?.user?.id || null;
    if (!userId && session?.user?.email && isDatabaseConfigured()) {
      try {
        const u = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (u) userId = u.id;
      } catch {
        // continue
      }
    }

    const isDemo = session?.user?.email === "demo@sponfy.dev";

    // If unauthenticated or no database configured, return exact zero counts
    if (!userId || !isDatabaseConfigured()) {
      return NextResponse.json({
        prospects: 0,
        qualified: 0,
        actionQueue: 0,
        drafts: 0,
        replies: 0,
        followups: 0,
        activities: 0,
        sentEmails: 0,
        committedCount: 0,
        committedAmount: 0,
        pipelineAmount: 0,
        isDemo: false,
      });
    }

    // Find accessible campaigns for this user
    const userCampaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId, status: "ACTIVE" } } },
        ],
      },
      select: { id: true },
    });
    const accessibleCampaignIds = userCampaigns.map((c) => c.id);

    const companyWhere: any = {
      OR: [
        { userId },
        ...(isDemo ? [{ userId: "usr-demo-lead" }] : []),
        ...(accessibleCampaignIds.length > 0 ? [{ campaignId: { in: accessibleCampaignIds } }] : []),
      ],
    };

    const [companies, drafts, messages, followups, activitiesCount] = await Promise.all([
      prisma.company.findMany({
        where: companyWhere,
        select: {
          id: true,
          stage: true,
          fitScore: true,
          pipelineValue: true,
        },
      }),
      prisma.emailDraft.findMany({
        where: { userId },
        select: { id: true, status: true },
      }),
      prisma.message.findMany({
        where: { userId },
        select: { id: true, direction: true },
      }),
      prisma.followupTask.findMany({
        where: {
          status: "PENDING",
          sequence: { userId },
        },
        select: { id: true },
      }),
      prisma.activity.count({
        where: { userId },
      }),
    ]);

    const prospects = companies.length;
    const qualified = companies.filter((c) => (c.fitScore || 0) >= 70).length;
    const pendingDrafts = drafts.filter((d) => d.status === "DRAFT").length;
    const sentEmails = drafts.filter((d) => d.status === "SENT").length;
    const repliesCount = messages.filter((m) => m.direction === "INBOUND").length;
    const followupsCount = followups.length;
    const actionQueue = pendingDrafts + repliesCount + followupsCount;

    const committedCompanies = companies.filter((c) => c.stage === "COMMITTED");
    const committedCount = committedCompanies.length;
    const committedAmount = committedCompanies.reduce((sum, c) => sum + (c.pipelineValue || 0), 0);
    const pipelineAmount = companies.reduce((sum, c) => sum + (c.pipelineValue || 0), 0);

    return NextResponse.json({
      prospects,
      qualified,
      actionQueue,
      drafts: pendingDrafts,
      replies: repliesCount,
      followups: followupsCount,
      activities: activitiesCount,
      sentEmails,
      committedCount,
      committedAmount,
      pipelineAmount,
      isDemo: false,
    });
  } catch (error) {
    console.error("Error in /api/counts:", error);
    return NextResponse.json({
      prospects: 0,
      qualified: 0,
      actionQueue: 0,
      drafts: 0,
      replies: 0,
      followups: 0,
      activities: 0,
      sentEmails: 0,
      committedCount: 0,
      committedAmount: 0,
      pipelineAmount: 0,
      isDemo: false,
    });
  }
}
