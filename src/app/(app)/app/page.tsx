import React from "react";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { DEMO_ACTIVITIES } from "@/lib/data/seed-data";
import { CampaignDashboardView } from "@/components/dashboard/CampaignDashboardView";
import { auth } from "@/lib/auth";

export default async function OverviewPage() {
  const session = await auth();
  const isDemoUser = session?.user?.email === "demo@sponfy.dev";

  const [rawAnalytics, rawCampaigns] = await Promise.all([
    getAnalyticsData(),
    getCampaigns(),
  ]);

  // Remove preloaded demo campaign for real users
  const userCampaigns = isDemoUser
    ? rawCampaigns
    : rawCampaigns.filter(
        (c) => c.name !== "SponFy Hackathon 2026" && c.id !== "camp-demo-1"
      );

  const activeCampaign = userCampaigns[0] || null;
  const campaignName = activeCampaign?.name || "Your Workspace";

  // For real users without campaigns, start completely from zero
  const analytics = isDemoUser
    ? rawAnalytics
    : userCampaigns.length === 0
    ? {
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
          targetAmount: activeCampaign?.targetAmount || 0,
        },
      }
    : rawAnalytics;

  const demoInsights = [
    "Developer Tools and Cloud companies in your pipeline have an 82% positive reply rate — 2.4x higher than FMCG brands.",
    "Outreach pitches sent between 10:00 AM and 11:30 AM IST showed a 40% faster reply turnaround from DevRel managers.",
    "Postman and Razorpay have active negotiations totaling ₹1.6 Lakhs; closing both achieves 52% of your target.",
  ];

  return (
    <CampaignDashboardView
      analytics={analytics}
      campaignName={campaignName}
      activities={isDemoUser ? DEMO_ACTIVITIES : []}
      insights={isDemoUser ? demoInsights : []}
      actionQueue={isDemoUser && analytics.summary.totalSponsors > 0 ? undefined : []}
    />
  );
}
