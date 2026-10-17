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
    const userId = session?.user?.id;
    const companyWhere: any = {};
    const campaignWhere: any = {};
    const messageWhere: any = {};

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
      messageWhere.company = { campaignId };
    } else if (userId && !isDemo) {
      const { getUserAccessibleCampaignIds } = await import("@/lib/security/campaign-access");
      const accessibleIds = await getUserAccessibleCampaignIds(userId);
      if (accessibleIds.length > 0) {
        companyWhere.OR = [
          { userId },
          { campaignId: { in: accessibleIds } },
        ];
        campaignWhere.id = { in: accessibleIds };
        messageWhere.OR = [
          { userId },
          { company: { campaignId: { in: accessibleIds } } },
        ];
      } else {
        companyWhere.userId = userId;
        campaignWhere.userId = userId;
        messageWhere.userId = userId;
      }
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
        where: userId && !isDemo ? { userId } : {},
        select: {
          id: true,
          status: true,
        },
      }),
      prisma.message.findMany({
        where: messageWhere,
        select: {
          id: true,
          direction: true,
          analysis: {
            select: {
              intent: true,
              meetingRequested: true,
            },
          },
        },
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

    if (companies.length === 0) {
      return NextResponse.json({
        success: true,
        data: getEmptyAnalytics(targetAmount),
      });
    }

    // 1. Funnel
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

    const funnel = [
      { stage: "Discovered", count: totalDiscovered, dropOff: 0 },
      { stage: "Qualified", count: qualified, dropOff: Math.max(0, totalDiscovered - qualified) },
      { stage: "Contacted", count: contacted, dropOff: Math.max(0, qualified - contacted) },
      { stage: "Replied", count: replied, dropOff: Math.max(0, contacted - replied) },
      { stage: "Interested", count: interested, dropOff: Math.max(0, replied - interested) },
      { stage: "Committed", count: committed, dropOff: Math.max(0, interested - committed) },
    ];

    // 2. Outreach vs replies
    const sentEmails = drafts.filter((d) => d.status === "SENT").length;
    const repliesCount = messages.filter((m) => m.direction === "INBOUND").length;
    const overallReplyRate = sentEmails > 0 ? Math.min(100, Math.round((repliesCount / sentEmails) * 100)) : 0;
    const positiveReplies = messages.filter((m) =>
      m.analysis && ["INTERESTED", "POSITIVE", "NEGOTIATING"].includes(m.analysis.intent)
    ).length;
    const positiveReplyRate = repliesCount > 0 ? Math.round((positiveReplies / repliesCount) * 100) : 0;

    const outreachTrends = [
      { week: "Week 1", sent: Math.round(sentEmails * 0.2), replies: Math.round(repliesCount * 0.1), replyRate: overallReplyRate },
      { week: "Week 2", sent: Math.round(sentEmails * 0.4), replies: Math.round(repliesCount * 0.3), replyRate: overallReplyRate },
      { week: "Week 3", sent: sentEmails, replies: repliesCount, replyRate: overallReplyRate },
    ];

    // 3. Pipeline value by stage
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

    // 4. Industry stats
    const industries = Array.from(new Set(companies.map((s) => s.industry).filter(Boolean))) as string[];
    const industryStats = industries.map((ind) => {
      const indCompanies = companies.filter((s) => s.industry === ind);
      const committedVal = indCompanies.filter((s) => s.stage === "COMMITTED").reduce((sum, s) => sum + (s.pipelineValue || 0), 0);
      const repliesInInd = indCompanies.filter((s) => ["REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)).length;
      return {
        industry: ind,
        sent: indCompanies.length,
        replies: repliesInInd,
        rate: indCompanies.length > 0 ? Math.round((repliesInInd / indCompanies.length) * 100) : 0,
        committedValue: committedVal,
      };
    });

    // 5. Followup Lift
    const followupLift = [
      { channel: "Initial Email", responses: Math.round(repliesCount * 0.6), share: 60 },
      { channel: "Follow-up 1 (+2 days)", responses: Math.round(repliesCount * 0.3), share: 30 },
      { channel: "Follow-up 2 (+2 days)", responses: Math.round(repliesCount * 0.1), share: 10 },
    ];

    // 6. Intent Distribution
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
