import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { PIPELINE_STAGES } from "@/lib/config/pipeline";
import { getMeetings } from "@/lib/data/repositories/meetings";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId") || undefined;
  const isDemo = session?.user?.email === "demo@sponfy.dev";

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: getEmptyAnalytics(0),
    });
  }

  try {
    let userId = session?.user?.id;
    if (!userId && session?.user?.email) {
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

    const companyWhere: any = {};
    const campaignWhere: any = {};
    const messageWhere: any = {};
    const draftWhere: any = {};

    if (campaignId) {
      if (userId && !isDemo) {
        const { getCampaignAccess } = await import("@/lib/security/campaign-access");
        const { allowed } = await getCampaignAccess(userId, campaignId);
        if (!allowed) {
          return NextResponse.json({ error: "Forbidden. No access to this campaign." }, { status: 403 });
        }
      }
      companyWhere.campaignId = campaignId;
      campaignWhere.id = campaignId;
      messageWhere.draft = { company: { campaignId } };
      draftWhere.company = { campaignId };
    } else if (userId) {
      const { getUserAccessibleCampaignIds } = await import("@/lib/security/campaign-access");
      const accessibleIds = await getUserAccessibleCampaignIds(userId);

      companyWhere.OR = [
        { userId },
        ...(isDemo ? [{ userId: "usr-demo-lead" }] : []),
        ...(accessibleIds.length > 0 ? [{ campaignId: { in: accessibleIds } }] : []),
      ];
      if (accessibleIds.length > 0) {
        campaignWhere.id = { in: accessibleIds };
      } else {
        campaignWhere.userId = userId;
      }
      messageWhere.OR = [
        { userId },
        ...(accessibleIds.length > 0 ? [{ draft: { company: { campaignId: { in: accessibleIds } } } }] : []),
      ];
      draftWhere.OR = [
        { userId },
        ...(accessibleIds.length > 0 ? [{ company: { campaignId: { in: accessibleIds } } }] : []),
      ];
    }

    const [companies, drafts, messages, campaigns, userMeetings] = await Promise.all([
      prisma.company.findMany({
        where: companyWhere,
        select: {
          id: true,
          stage: true,
          fitScore: true,
          pipelineValue: true,
          industry: true,
        },
      }),
      prisma.emailDraft.findMany({
        where: draftWhere,
        select: {
          id: true,
          status: true,
          sentAt: true,
        },
      }),
      prisma.message.findMany({
        where: messageWhere,
        select: {
          id: true,
          direction: true,
          sentAt: true,
          subject: true,
          analysis: {
            select: {
              intent: true,
              meetingRequested: true,
            },
          },
        },
        orderBy: { sentAt: "asc" },
      }),
      prisma.campaign.findMany({
        where: campaignWhere,
        select: {
          id: true,
          targetAmount: true,
        },
      }),
      userId ? getMeetings(userId, campaignId) : Promise.resolve([]),
    ]);

    const activeCampaign = campaigns[0] || null;
    const targetAmount = activeCampaign?.targetAmount || 0;

    // For any user with 0 companies and 0 outreach, return clean zero metrics
    if (companies.length === 0 && drafts.length === 0 && messages.length === 0) {
      return NextResponse.json({
        success: true,
        data: getEmptyAnalytics(targetAmount),
      });
    }

    // 1. Funnel Calculation
    const totalDiscovered = companies.length;
    const qualified = companies.filter((s) => (s.fitScore || 0) >= 70).length;
    const contacted = companies.filter((s) =>
      ["CONTACTED", "REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
    ).length;
    const replied = companies.filter((s) =>
      ["REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
    ).length;
    const interested = companies.filter((s) =>
      ["INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
    ).length;
    const committed = companies.filter((s) => s.stage === "COMMITTED").length;

    const funnel = totalDiscovered > 0 ? [
      { stage: "Discovered", count: totalDiscovered, dropOff: 0 },
      { stage: "Qualified", count: qualified, dropOff: Math.max(0, totalDiscovered - qualified) },
      { stage: "Contacted", count: contacted, dropOff: Math.max(0, qualified - contacted) },
      { stage: "Replied", count: replied, dropOff: Math.max(0, contacted - replied) },
      { stage: "Interested", count: interested, dropOff: Math.max(0, replied - interested) },
      { stage: "Committed", count: committed, dropOff: Math.max(0, interested - committed) },
    ] : [];

    // 2. Real Outreach vs Replies Timeline Over Real Weeks
    const sentEmails = drafts.filter((d) => d.status === "SENT").length;
    const repliesCount = messages.filter((m) => m.direction === "INBOUND").length;
    const overallReplyRate = sentEmails > 0 ? Math.min(100, Math.round((repliesCount / sentEmails) * 100)) : 0;
    const positiveReplies = messages.filter((m) =>
      m.analysis && ["INTERESTED", "POSITIVE", "NEGOTIATING"].includes(m.analysis.intent)
    ).length;
    const positiveReplyRate = repliesCount > 0 ? Math.round((positiveReplies / repliesCount) * 100) : 0;

    let outreachTrends: any[] = [];
    if (sentEmails > 0 || repliesCount > 0) {
      const now = new Date();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

      const buckets = [
        { label: "Week 1", start: new Date(now.getTime() - 3 * oneWeekMs), end: new Date(now.getTime() - 2 * oneWeekMs) },
        { label: "Week 2", start: new Date(now.getTime() - 2 * oneWeekMs), end: new Date(now.getTime() - 1 * oneWeekMs) },
        { label: "Week 3", start: new Date(now.getTime() - 1 * oneWeekMs), end: now },
      ];

      outreachTrends = buckets.map((b) => {
        const sentInBucket = drafts.filter((d) => {
          if (d.status !== "SENT" || !d.sentAt) return false;
          const t = new Date(d.sentAt).getTime();
          return t >= b.start.getTime() && t <= b.end.getTime();
        }).length;

        const repliesInBucket = messages.filter((m) => {
          if (m.direction !== "INBOUND" || !m.sentAt) return false;
          const t = new Date(m.sentAt).getTime();
          return t >= b.start.getTime() && t <= b.end.getTime();
        }).length;

        return {
          week: b.label,
          sent: sentInBucket,
          replies: repliesInBucket,
          replyRate: sentInBucket > 0 ? Math.min(100, Math.round((repliesInBucket / sentInBucket) * 100)) : 0,
        };
      });

      // If all bucket counts are 0 because sentAt was recent or not spread across weeks, show current totals in Week 3
      const allZero = outreachTrends.every((t) => t.sent === 0 && t.replies === 0);
      if (allZero && (sentEmails > 0 || repliesCount > 0)) {
        outreachTrends = [
          { week: "Week 1", sent: 0, replies: 0, replyRate: 0 },
          { week: "Week 2", sent: 0, replies: 0, replyRate: 0 },
          { week: "Week 3", sent: sentEmails, replies: repliesCount, replyRate: overallReplyRate },
        ];
      }
    }

    // 3. Real Pipeline Value by Stage
    const pipelineValueByStage = PIPELINE_STAGES.map((st) => {
      const dbStageKey = st.id.toUpperCase().replace(/\s+/g, "_");
      const stageCompanies = companies.filter((s) => s.stage === dbStageKey);
      const totalVal = stageCompanies.reduce((sum, s) => sum + (s.pipelineValue || 0), 0);
      return {
        stage: st.label,
        value: totalVal,
        count: stageCompanies.length,
        color: st.color,
      };
    }).filter((item) => item.value > 0 || item.count > 0);

    // 4. Real Grouped by Industry
    const industries = Array.from(new Set(companies.map((s) => s.industry).filter(Boolean))) as string[];
    const industryStats = industries.map((ind) => {
      const indCompanies = companies.filter((s) => s.industry === ind);
      const committedVal = indCompanies
        .filter((s) => s.stage === "COMMITTED")
        .reduce((sum, s) => sum + (s.pipelineValue || 0), 0);
      const repliesInInd = indCompanies.filter((s) =>
        ["REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
      ).length;
      return {
        industry: ind,
        sent: indCompanies.length,
        replies: repliesInInd,
        rate: indCompanies.length > 0 ? Math.round((repliesInInd / indCompanies.length) * 100) : 0,
        committedValue: committedVal,
      };
    });

    // 5. Real Follow-up Channel Lift
    let followupLift: any[] = [];
    if (repliesCount > 0) {
      const initialReplies = messages.filter(
        (m) => m.direction === "INBOUND" && !m.subject?.toLowerCase().includes("follow")
      ).length;
      const followReplies = Math.max(0, repliesCount - initialReplies);
      followupLift = [
        { channel: "Initial Email", responses: initialReplies, share: Math.round((initialReplies / repliesCount) * 100) },
        { channel: "Follow-up Touchpoints", responses: followReplies, share: Math.round((followReplies / repliesCount) * 100) },
      ];
    }

    // 6. Real Intent Distribution
    const intentCounts: Record<string, number> = {};
    messages.forEach((m) => {
      if (m.analysis) {
        intentCounts[m.analysis.intent] = (intentCounts[m.analysis.intent] || 0) + 1;
      }
    });

    const intentDistribution = Object.entries(intentCounts).map(([intent, count]) => ({
      name: intent,
      value: count,
    }));

    const committedAmount = companies
      .filter((s) => s.stage === "COMMITTED")
      .reduce((acc, s) => acc + (s.pipelineValue || 0), 0);

    const pipelineAmount = companies.reduce((acc, s) => acc + (s.pipelineValue || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        funnel,
        outreachTrends,
        pipelineValueByStage,
        industryStats,
        followupLift,
        intentDistribution,
        summary: {
          totalSponsors: companies.length,
          qualifiedCount: qualified,
          sentEmails,
          repliesCount,
          overallReplyRate,
          positiveReplyRate,
          meetingCount: (() => {
            const booked = (userMeetings || []).filter(
              (m: any) => m.status === "scheduled" || m.status === "completed"
            );
            return booked.length > 0
              ? booked.length
              : messages.filter((m) => m.analysis?.meetingRequested).length;
          })(),
          negotiationsCount: companies.filter((s) => s.stage === "NEGOTIATION").length,
          committedCount: committed,
          committedAmount,
          pipelineAmount,
          targetAmount,
        },
      },
    });
  } catch (err: any) {
    console.error("GET /api/analytics error:", err);
    return NextResponse.json({
      success: true,
      data: getEmptyAnalytics(0),
    });
  }
}

function getEmptyAnalytics(targetAmount: number) {
  return {
    funnel: [],
    outreachTrends: [],
    pipelineValueByStage: [],
    industryStats: [],
    followupLift: [],
    intentDistribution: [],
    summary: {
      totalSponsors: 0,
      qualifiedCount: 0,
      sentEmails: 0,
      repliesCount: 0,
      overallReplyRate: 0,
      positiveReplyRate: 0,
      meetingCount: 0,
      negotiationsCount: 0,
      committedCount: 0,
      committedAmount: 0,
      pipelineAmount: 0,
      targetAmount,
    },
  };
}
