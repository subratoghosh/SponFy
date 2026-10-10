import React from "react";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { DEMO_ACTIVITIES } from "@/lib/data/seed-data";
import { CampaignDashboardView } from "@/components/dashboard/CampaignDashboardView";
import { auth } from "@/lib/auth";

export default async function OverviewPage() {
  const session = await auth();
  const analytics = await getAnalyticsData();

  const isDemoUser = session?.user?.email === "demo@sponfy.dev";
  const hasData = analytics.summary.totalSponsors > 0;

  const demoInsights = [
    "Developer Tools and Cloud companies in your pipeline have an 82% positive reply rate — 2.4x higher than FMCG brands.",
    "Outreach pitches sent between 10:00 AM and 11:30 AM IST showed a 40% faster reply turnaround from DevRel managers.",
    "Postman and Razorpay have active negotiations totaling ₹1.6 Lakhs; closing both achieves 52% of your ₹5,00,000 target.",
  ];

  return (
    <CampaignDashboardView
      analytics={analytics}
      activities={hasData ? DEMO_ACTIVITIES : []}
      insights={hasData ? demoInsights : []}
      actionQueue={hasData ? undefined : []}
    />
  );
}
