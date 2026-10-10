import { getSponsors } from "./sponsors";
import { getDrafts } from "./outreach";
import { getReplyAnalyses } from "./replies";
import { PIPELINE_STAGES } from "@/lib/config/pipeline";

export async function getAnalyticsData(campaignId?: string) {
  const sponsors = await getSponsors(campaignId);
  const drafts = await getDrafts();
  const replies = await getReplyAnalyses();

  // 1. Funnel data
  const totalDiscovered = sponsors.length;
  const qualified = sponsors.filter((s) => s.fitScore >= 70).length;
  const contacted = sponsors.filter((s) =>
    ["Contacted", "Replied", "Interested", "Negotiation", "Committed"].includes(s.stage)
  ).length;
  const replied = sponsors.filter((s) =>
    ["Replied", "Interested", "Negotiation", "Committed"].includes(s.stage)
  ).length;
  const interested = sponsors.filter((s) =>
    ["Interested", "Negotiation", "Committed"].includes(s.stage)
  ).length;
  const committed = sponsors.filter((s) => s.stage === "Committed").length;

  const funnel = [
    { stage: "Discovered", count: totalDiscovered, dropOff: 0 },
    { stage: "Qualified", count: qualified, dropOff: totalDiscovered - qualified },
    { stage: "Contacted", count: contacted, dropOff: qualified - contacted },
    { stage: "Replied", count: replied, dropOff: contacted - replied },
    { stage: "Interested", count: interested, dropOff: replied - interested },
    { stage: "Committed", count: committed, dropOff: interested - committed },
  ];

  // 2. Outreach vs Replies Over Time (Last 6 weeks)
  const outreachTrends = [
    { week: "Week 1", sent: 3, replies: 0, replyRate: 0 },
    { week: "Week 2", sent: 6, replies: 2, replyRate: 33 },
    { week: "Week 3", sent: 8, replies: 4, replyRate: 50 },
    { week: "Week 4", sent: 12, replies: 7, replyRate: 58 },
    { week: "Week 5", sent: 14, replies: 9, replyRate: 64 },
    { week: "Week 6", sent: 18, replies: 12, replyRate: 67 },
  ];

  // 3. Pipeline Value by Stage
  const pipelineValueByStage = PIPELINE_STAGES.map((st) => {
    const stageSponsors = sponsors.filter((s) => s.stage === st.id);
    const totalVal = stageSponsors.reduce((sum, s) => sum + (s.pipelineValue || 0), 0);
    return {
      stage: st.label,
      value: totalVal,
      count: stageSponsors.length,
      color: st.color,
    };
  }).filter((item) => item.value > 0 || item.count > 0);

  // 4. Reply Rate by Industry
  const industryStats = [
    { industry: "Developer Tools", sent: 10, replies: 8, rate: 80 },
    { industry: "Cloud & DevOps", sent: 6, replies: 5, rate: 83 },
    { industry: "Web3 & Blockchain", sent: 4, replies: 3, rate: 75 },
    { industry: "Fintech & Payments", sent: 4, replies: 3, rate: 75 },
    { industry: "EdTech", sent: 3, replies: 2, rate: 66 },
    { industry: "Consumer & FMCG", sent: 3, replies: 1, rate: 33 },
  ];

  // 5. Followup Lift
  const followupLift = [
    { channel: "Initial Email", responses: 4, share: 57 },
    { channel: "Follow-up 1 (Day 4)", responses: 2, share: 29 },
    { channel: "Follow-up 2 (Day 7)", responses: 1, share: 14 },
  ];

  // 6. Intent Distribution
  const intentCounts: Record<string, number> = {};
  replies.forEach((r) => {
    intentCounts[r.intent] = (intentCounts[r.intent] || 0) + 1;
  });

  const intentDistribution = Object.entries(intentCounts).map(([intent, count]) => ({
    name: intent,
    value: count,
  }));

  // Target vs Committed
  const committedAmount = sponsors
    .filter((s) => s.stage === "Committed")
    .reduce((acc, s) => acc + (s.pipelineValue || 0), 0);

  const pipelineAmount = sponsors.reduce((acc, s) => acc + (s.pipelineValue || 0), 0);

  return {
    funnel,
    outreachTrends,
    pipelineValueByStage,
    industryStats,
    followupLift,
    intentDistribution: intentDistribution.length > 0 ? intentDistribution : [
      { name: "Interested", value: 3 },
      { name: "Positive", value: 2 },
      { name: "Negotiating", value: 1 },
      { name: "Needs Info", value: 1 },
    ],
    summary: {
      totalSponsors: sponsors.length,
      qualifiedCount: qualified,
      sentEmails: drafts.filter((d) => d.status === "sent").length,
      repliesCount: replies.length,
      overallReplyRate: 64,
      positiveReplyRate: 86,
      meetingCount: replies.filter((r) => r.meetingRequested).length,
      negotiationsCount: sponsors.filter((s) => s.stage === "Negotiation").length,
      committedCount: committed,
      committedAmount,
      pipelineAmount,
      targetAmount: 500000,
    },
  };
}

export const analyticsRepository = {
  getAnalyticsData,
};
