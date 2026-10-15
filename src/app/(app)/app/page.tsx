import React from "react";
import { getAnalyticsData } from "@/lib/data/repositories/analytics";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { getSponsors } from "@/lib/data/repositories/sponsors";
import { getDrafts } from "@/lib/data/repositories/outreach";
import { loadFollowups } from "@/lib/outreach/followup-service";
import { getReplyAnalyses } from "@/lib/data/repositories/replies";
import { DEMO_ACTIVITIES } from "@/lib/data/seed-data";
import { CampaignDashboardView } from "@/components/dashboard/CampaignDashboardView";
import { auth } from "@/lib/auth";

export default async function OverviewPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const isDemoUser = session?.user?.email === "demo@sponfy.dev";

  let rawCampaigns: any[] = [];
  try {
    rawCampaigns = await getCampaigns(userId);
  } catch (err) {
    console.warn("Failed to load campaigns in OverviewPage:", err);
  }

  // Remove preloaded demo campaign for real users
  const userCampaigns = isDemoUser
    ? rawCampaigns
    : rawCampaigns.filter(
        (c) => c.name !== "SponFy Hackathon 2026" && c.name !== "SponFy Flagship Campaign 2026" && c.id !== "camp-demo-1" && c.id !== "camp-sponfy-2026"
      );

  const activeCampaign = userCampaigns[0] || null;
  const campaignName = activeCampaign?.name || "Your Workspace";

  const emptySummary = {
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
  };

  let analytics = {
    funnel: [],
    outreachTrends: [],
    pipelineValueByStage: [],
    industryStats: [],
    followupLift: [],
    intentDistribution: [],
    summary: emptySummary,
  };

  try {
    const rawAnalytics = await getAnalyticsData(
      activeCampaign?.id,
      userId
    );
    if (isDemoUser) {
      analytics = rawAnalytics;
    } else if (userCampaigns.length > 0 && rawAnalytics) {
      analytics = rawAnalytics;
    }
  } catch (err) {
    console.warn("Failed to load analytics in OverviewPage:", err);
  }

  // Compute live action queue items across the entire workflow lifecycle with fault isolation
  const [sponsorsRes, draftsRes, followupsRes, repliesRes] = await Promise.allSettled([
    getSponsors(activeCampaign?.id, userId),
    getDrafts(undefined, userId),
    loadFollowups(undefined, userId, activeCampaign?.id),
    getReplyAnalyses(),
  ]);

  const sponsors = sponsorsRes.status === "fulfilled" ? sponsorsRes.value : [];
  const drafts = draftsRes.status === "fulfilled" ? draftsRes.value : [];
  const followups = followupsRes.status === "fulfilled" ? followupsRes.value : [];
  const replies = repliesRes.status === "fulfilled" ? repliesRes.value : [];

  const computedActions: any[] = [];

  // 1. Follow-ups Due
  const dueFollowups = followups.filter((f) => f.state === "due" || f.state === "draft_ready");
  for (const f of dueFollowups.slice(0, 3)) {
    computedActions.push({
      id: `act-fu-${f.companyId}`,
      type: "followup",
      badge: f.state === "draft_ready" ? "Follow-up Ready" : "Follow-up Due",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
      company: f.companyName,
      text: `Follow-up ${f.nextTouch ? f.nextTouch - 1 : 1} is due (${Math.floor(f.daysSinceLast)}d since last email).`,
      cta: "Review Follow-up",
      href: "/app/followups",
    });
  }

  // 2. Drafts awaiting approval
  const pendingApprovalDrafts = drafts.filter((d) => d.status === "draft");
  for (const d of pendingApprovalDrafts.slice(0, 3)) {
    const comp = sponsors.find((s) => s.id === d.companyId);
    computedActions.push({
      id: `act-dr-${d.id}`,
      type: "draft",
      badge: d.needsAttention ? "Needs Attention" : "Draft Ready",
      badgeColor: d.needsAttention
        ? "bg-amber-100 text-amber-800 border-amber-300"
        : "bg-purple-100 text-purple-800 border-purple-300",
      company: comp?.name || "Sponsor",
      text: d.needsAttention
        ? "Draft has unresolved placeholders. Edit before approving."
        : `Personalized email pitch ready for review. Quality score: ${d.quality?.overall || 90}%.`,
      cta: "Review Draft",
      href: "/app/outreach",
    });
  }

  // 3. Approved drafts ready to send
  const approvedDrafts = drafts.filter((d) => d.status === "approved");
  for (const d of approvedDrafts.slice(0, 2)) {
    const comp = sponsors.find((s) => s.id === d.companyId);
    computedActions.push({
      id: `act-app-${d.id}`,
      type: "send",
      badge: "Ready to Dispatch",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      company: comp?.name || "Sponsor",
      text: "Draft approved by organizer. Ready to send via connected Gmail.",
      cta: "Send via Gmail",
      href: "/app/outreach",
    });
  }

  // 4. Approved sponsors awaiting initial draft
  const approvedWithoutDrafts = sponsors.filter(
    (s) => s.sponsorApproved && !drafts.some((d) => d.companyId === s.id)
  );
  for (const s of approvedWithoutDrafts.slice(0, 2)) {
    computedActions.push({
      id: `act-need-draft-${s.id}`,
      type: "need_draft",
      badge: "Awaiting Draft",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      company: s.name,
      text: `Approved sponsor in pipeline. Fit score: ${s.fitScore}%. Generate personalized pitch.`,
      cta: "Draft Pitch",
      href: "/app/outreach",
    });
  }

  // 5. Inbound Replies
  for (const r of replies.slice(0, 2)) {
    const comp = sponsors.find((s) => s.id === r.companyId);
    computedActions.push({
      id: `act-rep-${r.id}`,
      type: r.meetingRequested ? "meeting" : "reply",
      badge: r.meetingRequested ? "Meeting Requested" : `Reply: ${r.intent}`,
      badgeColor: r.meetingRequested
        ? "bg-green-100 text-green-800 border-green-300"
        : "bg-blue-100 text-blue-800 border-blue-300",
      company: comp?.name || "Sponsor",
      text: r.summary || `Sponsor responded with ${r.intent} intent. Check the reply thread.`,
      cta: "View Reply",
      href: "/app/replies",
    });
  }

  // 6. Prospects at limit (2 follow-ups completed)
  const completeFollowups = followups.filter((f) => f.state === "complete");
  for (const f of completeFollowups.slice(0, 2)) {
    computedActions.push({
      id: `act-lim-${f.companyId}`,
      type: "limit",
      badge: "Touch Limit Reached",
      badgeColor: "bg-stone-100 text-stone-800 border-stone-300",
      company: f.companyName,
      text: `Sent 1 initial + 2 follow-ups with no response. Close prospect or handle manually.`,
      cta: "Manage Prospect",
      href: "/app/followups",
    });
  }

  const demoInsights = isDemoUser
    ? [
        "Developer Tools and Cloud companies in your pipeline have an 82% positive reply rate — 2.4x higher than FMCG brands.",
        "Outreach pitches sent between 10:00 AM and 11:30 AM IST showed a 40% faster reply turnaround from DevRel managers.",
        "Postman and Razorpay have active negotiations totaling ₹1.6 Lakhs; closing both achieves 52% of your target.",
      ]
    : [];

  const finalActionQueue = isDemoUser && computedActions.length === 0
    ? undefined // Falls back to DEFAULT_DEMO_ACTIONS for demo user
    : computedActions;

  return (
    <CampaignDashboardView
      analytics={analytics}
      campaignName={campaignName}
      activities={isDemoUser ? DEMO_ACTIVITIES : []}
      insights={isDemoUser ? demoInsights : []}
      actionQueue={finalActionQueue}
    />
  );
}
