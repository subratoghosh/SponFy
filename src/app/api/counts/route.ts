import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { getSponsors } from "@/lib/data/repositories/sponsors";
import { getDrafts } from "@/lib/data/repositories/outreach";
import { getReplyAnalyses } from "@/lib/data/repositories/replies";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { Company, EmailDraft, ReplyAnalysis } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    const isDemoUser = !session?.user || session.user.email === "demo@sponfy.dev";

    if (isDemoUser) {
      // In Demo mode, return the demo numbers with clear demo flag
      return NextResponse.json({
        prospects: 24,
        qualified: 18,
        actionQueue: 3,
        drafts: 2,
        replies: 1,
        followups: 1,
        activities: 5,
        sentEmails: 12,
        committedCount: 3,
        committedAmount: 225000,
        pipelineAmount: 850000,
        isDemo: true,
      });
    }

    const rawCampaigns = await getCampaigns();
    const userCampaigns = rawCampaigns.filter(
      (c) => c.name !== "SponFy Hackathon 2026" && c.id !== "camp-demo-1"
    );

    // If new user has zero campaigns, return 0 everywhere
    if (userCampaigns.length === 0) {
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

    const campaignId = userCampaigns[0].id;
    const [sponsors, allDrafts, replies, analytics] = await Promise.all([
      getSponsors(campaignId),
      getDrafts(),
      getReplyAnalyses(),
      getAnalyticsData(campaignId),
    ]);

    const sponsorCompanyIds = new Set(sponsors.map((s: Company) => s.id));

    const pendingDrafts = allDrafts.filter(
      (d: EmailDraft) => d.status === "draft" && sponsorCompanyIds.has(d.companyId)
    );
    const campaignReplies = replies.filter(
      (r: ReplyAnalysis) => sponsorCompanyIds.has(r.companyId)
    );
    const qualifiedSponsors = sponsors.filter(
      (s: Company) => (s.fitScore || 0) >= 70
    );

    const actionQueueCount = pendingDrafts.length + campaignReplies.length;

    return NextResponse.json({
      prospects: sponsors.length,
      qualified: qualifiedSponsors.length,
      actionQueue: actionQueueCount,
      drafts: pendingDrafts.length,
      replies: campaignReplies.length,
      followups: 0,
      activities: 0,
      sentEmails: analytics.summary.sentEmails,
      committedCount: analytics.summary.committedCount,
      committedAmount: analytics.summary.committedAmount,
      pipelineAmount: analytics.summary.pipelineAmount,
      isDemo: false,
    });
  } catch (error) {
    console.error("Error in /api/counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
