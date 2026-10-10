import React from "react";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { DEMO_ACTIVITIES } from "@/lib/data/seed-data";
import { CampaignDashboardView } from "@/components/dashboard/CampaignDashboardView";

export default async function OverviewPage() {
  const analytics = await getAnalyticsData();

  const insights = [
    "Developer Tools and Cloud companies in your pipeline have an 82% positive reply rate — 2.4x higher than FMCG brands.",
    "Outreach pitches sent between 10:00 AM and 11:30 AM IST showed a 40% faster reply turnaround from DevRel managers.",
    "Postman and Razorpay have active negotiations totaling ₹1.6 Lakhs; closing both achieves 52% of your ₹5,00,000 target.",
  ];

  return (
    <CampaignDashboardView
      analytics={analytics}
      activities={DEMO_ACTIVITIES}
      insights={insights}
    />
  );
}
