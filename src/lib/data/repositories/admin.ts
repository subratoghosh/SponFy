import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  AdminOverviewMetrics,
  AdminAnalyticsData,
  AdminUser,
  AuditLogEntry,
  UserRole,
  AccountStatus,
} from "@/types";
import { getCampaigns } from "./campaigns";
import { getSponsors } from "./sponsors";
import { getReplyAnalyses } from "./replies";

// In-memory store for empty states / test fallback
let inMemoryUsers: AdminUser[] = process.env.NODE_ENV === "test" ? [
  {
    id: "usr-admin-1",
    name: "Subrato Ghosh (Platform Lead)",
    email: "admin@sponfy.dev",
    image: null,
    orgName: "SponFy Engineering",
    orgType: "Core Team",
    role: "ADMIN",
    accountMode: "INDIVIDUAL",
    status: "ACTIVE",
    campaignsCount: 3,
    emailsSentCount: 42,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-lead-2",
    name: "Aarav Sharma",
    email: "aarav@test-org.org",
    image: null,
    orgName: "Tech Event 2026",
    orgType: "Conference",
    role: "USER",
    accountMode: "INDIVIDUAL",
    status: "ACTIVE",
    campaignsCount: 2,
    emailsSentCount: 34,
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-org-3",
    name: "Sneha Patel (Organiser)",
    email: "sneha@fest.org",
    image: null,
    orgName: "E-Cell Global",
    orgType: "College Fest",
    role: "ORGANISER",
    accountMode: "ORGANISER",
    status: "ACTIVE",
    campaignsCount: 5,
    emailsSentCount: 88,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-exec-4",
    name: "Rohan Verma (Executive)",
    email: "rohan@fest.org",
    image: null,
    orgName: "E-Cell Global",
    orgType: "College Fest",
    role: "EXECUTIVE",
    accountMode: "EXECUTIVE",
    status: "ACTIVE",
    campaignsCount: 1,
    emailsSentCount: 12,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
] : [];

let inMemoryAuditLogs: AuditLogEntry[] = process.env.NODE_ENV === "test" ? [
  {
    id: "audit-1",
    adminId: "usr-admin-1",
    adminName: "Subrato Ghosh",
    adminEmail: "admin@sponfy.dev",
    action: "user_suspended",
    targetType: "user",
    targetId: "usr-lead-2",
    details: { reason: "Policy review" },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
] : [];

function getTimeBoundary(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "all":
    default:
      return new Date(0);
  }
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const POSITIVE_INTENTS = ["INTERESTED", "POSITIVE", "NEGOTIATING"];
const CONTACTED_STAGES = ["CONTACTED", "REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"];
const REPLIED_STAGES = ["REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"];
const INTERESTED_STAGES = ["INTERESTED", "NEGOTIATION", "COMMITTED"];
// Heartbeats more than this far apart start a new session
const SESSION_GAP_MS = 30 * 60 * 1000;
const ACTIVE_SESSION_WINDOW_MS = 60 * 60 * 1000;

/** Percent change of the current period vs the previous one of equal length */
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function monthKey(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function buildFunnel(stages: string[]) {
  const total = stages.length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const contacted = stages.filter((s) => CONTACTED_STAGES.includes(s)).length;
  const replied = stages.filter((s) => REPLIED_STAGES.includes(s)).length;
  const interested = stages.filter((s) => INTERESTED_STAGES.includes(s)).length;
  const committed = stages.filter((s) => s === "COMMITTED").length;
  return [
    { stage: "Discovered", count: total, percentage: total > 0 ? 100 : 0 },
    { stage: "Contacted", count: contacted, percentage: pct(contacted) },
    { stage: "Replied", count: replied, percentage: pct(replied) },
    { stage: "Interested", count: interested, percentage: pct(interested) },
    { stage: "Committed", count: committed, percentage: pct(committed) },
  ];
}

function buildIndustryPerformance(companies: { industry: string | null; stage: string }[]) {
  const indMap = new Map<string, { count: number; replies: number; committed: number }>();
  for (const c of companies) {
    const ind = c.industry || "Uncategorized";
    const cur = indMap.get(ind) || { count: 0, replies: 0, committed: 0 };
    cur.count++;
    if (REPLIED_STAGES.includes(c.stage)) cur.replies++;
    if (c.stage === "COMMITTED") cur.committed++;
    indMap.set(ind, cur);
  }
  return Array.from(indMap.entries())
    .map(([industry, stats]) => ({
      industry,
      sponsorsCount: stats.count,
      replyRate: Math.round((stats.replies / stats.count) * 100),
      conversionRate: Math.round((stats.committed / stats.count) * 100),
    }))
    .sort((a, b) => b.sponsorsCount - a.sponsorsCount);
}

/**
 * 1. Overview KPI Metrics
 *
 * Platform totals (users, campaigns, confirmed sponsorships, revenue) are cumulative.
 * Flow metrics (new/active users, sponsors discovered, emails, replies) follow the
 * selected time range, and deltas compare against the previous range of equal length.
 */
export async function getAdminOverviewMetrics(timeRange = "30d"): Promise<AdminOverviewMetrics> {
  const cutoff = getTimeBoundary(timeRange);

  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const now = new Date();
      const hasPreviousPeriod = timeRange !== "all";
      const prevCutoff = new Date(cutoff.getTime() - (now.getTime() - cutoff.getTime()));
      const inRange = { gte: cutoff };
      const inPrevRange = { gte: prevCutoff, lt: cutoff };

      // Batch 1: User metrics
      const [totalUsers, newUsers, prevNewUsers, activeUsers, activeSessions] = await Promise.all([
        p.user.count(),
        p.user.count({ where: { createdAt: inRange } }),
        hasPreviousPeriod ? p.user.count({ where: { createdAt: inPrevRange } }) : 0,
        p.user.count({
          where: {
            OR: [
              { lastActiveAt: inRange },
              { campaigns: { some: { createdAt: inRange } } },
              { companies: { some: { createdAt: inRange } } },
              { messages: { some: { direction: "OUTBOUND", sentAt: inRange } } },
            ],
          },
        }),
        p.user.count({
          where: { lastActiveAt: { gte: new Date(now.getTime() - ACTIVE_SESSION_WINDOW_MS) } },
        }),
      ]);

      // Batch 2: Campaign and sponsor metrics
      const [totalCampaigns, activeCampaigns, completedCampaigns, newCampaigns, prevNewCampaigns, sponsorsDiscovered] =
        await Promise.all([
          p.campaign.count(),
          p.campaign.count({ where: { archived: false } }),
          p.campaign.count({ where: { archived: true } }),
          p.campaign.count({ where: { createdAt: inRange } }),
          hasPreviousPeriod ? p.campaign.count({ where: { createdAt: inPrevRange } }) : 0,
          p.company.count({ where: { createdAt: inRange } }),
        ]);

      // Batch 3: Outreach and deal metrics
      const [emailsSent, prevEmailsSent, repliesReceived, positiveResponses, confirmedSponsorships, committedRevenue] =
        await Promise.all([
          p.message.count({ where: { direction: "OUTBOUND", sentAt: inRange } }),
          hasPreviousPeriod ? p.message.count({ where: { direction: "OUTBOUND", sentAt: inPrevRange } }) : 0,
          p.message.count({ where: { direction: "INBOUND", sentAt: inRange } }),
          p.replyAnalysis.count({
            where: {
              message: { sentAt: inRange },
              OR: [{ intent: { in: POSITIVE_INTENTS } }, { meetingRequested: true }],
            },
          }),
          p.company.count({ where: { stage: "COMMITTED" } }),
          p.company.aggregate({
            where: { stage: "COMMITTED" },
            _sum: { pipelineValue: true },
          }),
        ]);

      return {
        totalUsers,
        newUsers,
        activeUsers,
        activeSessions,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalSponsorsDiscovered: sponsorsDiscovered,
        totalEmailsSent: emailsSent,
        totalRepliesReceived: repliesReceived,
        positiveResponses,
        confirmedSponsorships,
        committedRevenueTotal: committedRevenue._sum.pipelineValue || 0,
        usersDelta: hasPreviousPeriod ? percentChange(newUsers, prevNewUsers) : undefined,
        campaignsDelta: hasPreviousPeriod ? percentChange(newCampaigns, prevNewCampaigns) : undefined,
        outreachDelta: hasPreviousPeriod ? percentChange(emailsSent, prevEmailsSent) : undefined,
      };
    } catch (err) {
      console.warn("Prisma getAdminOverviewMetrics failed, using repository aggregations:", err);
    }
  }

  // Memory/seed fallback
  const campaigns = await getCampaigns();
  const sponsors = await getSponsors();
  const replies = await getReplyAnalyses();

  const totalUsers = inMemoryUsers.length;
  const newUsers = inMemoryUsers.filter((u) => new Date(u.createdAt) >= cutoff).length;
  const activeUsers = inMemoryUsers.filter(
    (u) => u.lastActiveAt && new Date(u.lastActiveAt) >= cutoff
  ).length;
  const activeCampaigns = campaigns.filter((c) => c.status !== "archived").length;
  const completedCampaigns = campaigns.filter((c) => c.status === "archived").length;
  const confirmedSponsors = sponsors.filter((s) => s.stage === "Committed");
  const committedRevenueTotal = confirmedSponsors.reduce(
    (sum, s) => sum + (s.pipelineValue || 0),
    0
  );
  const positiveCount = replies.filter((r) =>
    ["Interested", "Positive", "Negotiating"].includes(r.intent)
  ).length;

  const totalSentAcrossUsers = inMemoryUsers.reduce((sum, u) => sum + (u.emailsSentCount || 0), 0);

  return {
    totalUsers,
    newUsers,
    activeUsers,
    activeSessions: 0,
    totalCampaigns: campaigns.length,
    activeCampaigns,
    completedCampaigns,
    totalSponsorsDiscovered: sponsors.length,
    totalEmailsSent: totalSentAcrossUsers,
    totalRepliesReceived: replies.length,
    positiveResponses: positiveCount,
    confirmedSponsorships: confirmedSponsors.length,
    committedRevenueTotal,
  };
}

/**
 * 2. Deep Admin Analytics
 */
export async function getAdminAnalytics(timeRange = "30d"): Promise<AdminAnalyticsData> {
  const cutoff = getTimeBoundary(timeRange);

  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const now = new Date();

      const users: { id: string; createdAt: Date }[] = await p.user.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      // Growth chart window: last 6 months, or since the first signup (up to 24 months) for "all"
      let growthMonths = 6;
      if (timeRange === "all" && users.length > 0) {
        const first = users[0].createdAt;
        const spanned = (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth()) + 1;
        growthMonths = Math.min(24, Math.max(6, spanned));
      }
      const growthStart = new Date(now.getFullYear(), now.getMonth() - (growthMonths - 1), 1);
      const fetchFrom = cutoff < growthStart ? cutoff : growthStart;

      const [campaigns, companies, outboundMessages, activityLogs] = await Promise.all([
        p.campaign.findMany({
          select: {
            id: true,
            name: true,
            userId: true,
            eventType: true,
            archived: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
            companies: { select: { stage: true, pipelineValue: true } },
          },
        }),
        p.company.findMany({
          where: { createdAt: { gte: fetchFrom } },
          select: { userId: true, stage: true, industry: true, createdAt: true },
        }),
        p.message.findMany({
          where: { direction: "OUTBOUND", sentAt: { gte: fetchFrom } },
          select: { userId: true, sentAt: true },
        }),
        p.userActivityLog.findMany({
          where: { createdAt: { gte: fetchFrom } },
          select: { userId: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      // 1. userGrowth: cumulative registrations + distinct active users per month
      const activeByMonth = new Map<string, Set<string>>();
      const markActive = (userId: string, at: Date) => {
        if (at < growthStart) return;
        const key = monthKey(at);
        if (!activeByMonth.has(key)) activeByMonth.set(key, new Set());
        activeByMonth.get(key)!.add(userId);
      };
      activityLogs.forEach((l: any) => markActive(l.userId, l.createdAt));
      outboundMessages.forEach((m: any) => markActive(m.userId, m.sentAt));
      companies.forEach((c: any) => markActive(c.userId, c.createdAt));
      campaigns.forEach((c: any) => markActive(c.userId, c.createdAt));

      const userGrowth = [];
      for (let i = growthMonths - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const key = monthKey(monthStart);
        userGrowth.push({
          date: key,
          users: users.filter((u) => u.createdAt < monthEnd).length,
          active: activeByMonth.get(key)?.size || 0,
        });
      }

      // 2. sessionTrends: group each user's heartbeats into sessions, bucket the range into 6 periods
      const logsInRange = activityLogs.filter((l: any) => l.createdAt >= cutoff);
      const sessions: { start: Date; durationMs: number }[] = [];
      const lastSessionByUser = new Map<string, { start: Date; end: Date }>();
      for (const log of logsInRange) {
        const current = lastSessionByUser.get(log.userId);
        if (current && log.createdAt.getTime() - current.end.getTime() <= SESSION_GAP_MS) {
          current.end = log.createdAt;
        } else {
          if (current) sessions.push({ start: current.start, durationMs: current.end.getTime() - current.start.getTime() });
          lastSessionByUser.set(log.userId, { start: log.createdAt, end: log.createdAt });
        }
      }
      lastSessionByUser.forEach((s) => sessions.push({ start: s.start, durationMs: s.end.getTime() - s.start.getTime() }));

      // "all" spans from the first heartbeat, but never less than 30 days so buckets stay readable
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const firstLogAt: Date | undefined = logsInRange[0]?.createdAt;
      const trendStart =
        timeRange === "all"
          ? firstLogAt && firstLogAt < thirtyDaysAgo ? firstLogAt : thirtyDaysAgo
          : cutoff;
      const bucketCount = 6;
      const bucketMs = Math.max(1, (now.getTime() - trendStart.getTime()) / bucketCount);
      const sessionTrends = Array.from({ length: bucketCount }, (_, i) => {
        const bucketStart = new Date(trendStart.getTime() + i * bucketMs);
        const bucketEnd = new Date(trendStart.getTime() + (i + 1) * bucketMs);
        const inBucket = sessions.filter(
          (s) => s.start >= bucketStart && (i === bucketCount - 1 ? s.start <= now : s.start < bucketEnd)
        );
        const avgMs = inBucket.length > 0 ? inBucket.reduce((sum, s) => sum + s.durationMs, 0) / inBucket.length : 0;
        return {
          date: `${MONTH_NAMES[bucketStart.getMonth()]} ${bucketStart.getDate()}`,
          sessions: inBucket.length,
          avgDurationMinutes: Math.round((avgMs / 60000) * 10) / 10,
        };
      });

      // 3. campaignStatusBreakdown
      const campaignStatusBreakdown = [
        { status: "Active Pipeline", count: campaigns.filter((c: any) => !c.archived).length },
        { status: "Archived", count: campaigns.filter((c: any) => c.archived).length },
      ];

      // 4. campaignsByEventType
      const eventTypeMap = new Map<string, number>();
      campaigns.forEach((c: any) => {
        const type = c.eventType || "General";
        eventTypeMap.set(type, (eventTypeMap.get(type) || 0) + 1);
      });
      const campaignsByEventType = Array.from(eventTypeMap.entries()).map(([type, count]) => ({
        type,
        count,
      }));

      // 5 & 6. outreachFunnel + industryPerformance: sponsors discovered in range
      const companiesInRange = companies.filter((c: any) => c.createdAt >= cutoff);
      const outreachFunnel = buildFunnel(companiesInRange.map((c: any) => c.stage));
      const industryPerformance = buildIndustryPerformance(companiesInRange);

      // 7. topCampaigns: ranked by committed value, then sponsor count
      const topCampaigns = campaigns
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          ownerName: c.user?.name || c.user?.email || "Unknown owner",
          sponsorsCount: c.companies?.length || 0,
          committedAmount: (c.companies || [])
            .filter((cmp: any) => cmp.stage === "COMMITTED")
            .reduce((sum: number, cmp: any) => sum + (cmp.pipelineValue || 0), 0),
          status: c.archived ? "archived" : "active",
        }))
        .sort((a: any, b: any) => b.committedAmount - a.committedAmount || b.sponsorsCount - a.sponsorsCount)
        .slice(0, 10);

      return {
        userGrowth,
        sessionTrends,
        campaignStatusBreakdown,
        campaignsByEventType,
        outreachFunnel,
        industryPerformance,
        topCampaigns,
      };
    } catch (err) {
      console.warn("Prisma getAdminAnalytics failed, falling back to memory:", err);
    }
  }

  // Fallback (when database is not configured)
  const campaigns = await getCampaigns();
  const sponsors = await getSponsors();

  const userGrowth = [
    {
      date: monthKey(new Date()),
      users: inMemoryUsers.length,
      active: inMemoryUsers.filter((u) => u.lastActiveAt && new Date(u.lastActiveAt) >= cutoff).length,
    },
  ];

  const sessionTrends: AdminAnalyticsData["sessionTrends"] = [];

  const campaignStatusBreakdown = [
    { status: "Active Pipeline", count: campaigns.filter((c) => c.status !== "archived").length },
    { status: "Archived", count: campaigns.filter((c) => c.status === "archived").length },
  ];

  const eventTypeMap = new Map<string, number>();
  campaigns.forEach((c) => {
    const type = c.eventType || "General";
    eventTypeMap.set(type, (eventTypeMap.get(type) || 0) + 1);
  });
  const campaignsByEventType = Array.from(eventTypeMap.entries()).map(([type, count]) => ({ type, count }));

  // Repository sponsors use title-case stages; normalize to the DB enum for shared helpers
  const normalizedSponsors = sponsors.map((s) => ({
    industry: s.industry || null,
    stage: String(s.stage).toUpperCase(),
  }));
  const outreachFunnel = buildFunnel(normalizedSponsors.map((s) => s.stage));
  const industryPerformance = buildIndustryPerformance(normalizedSponsors);

  const topCampaigns = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    ownerName: "Unknown owner",
    sponsorsCount: sponsors.filter((s) => s.campaignId === c.id).length,
    committedAmount: sponsors.filter((s) => s.campaignId === c.id && s.stage === "Committed").reduce((sum, s) => sum + (s.pipelineValue || 0), 0),
    status: c.status || "active",
  }));

  return {
    userGrowth,
    sessionTrends,
    campaignStatusBreakdown,
    campaignsByEventType,
    outreachFunnel,
    industryPerformance,
    topCampaigns,
  };
}

/**
 * 3. User Management Operations
 */
export async function getAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  section?: "user" | "organiser" | "executive" | "all";
} = {}): Promise<{ users: AdminUser[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 10));
  const search = (params.search || "").toLowerCase().trim();
  const role = params.role || "all";
  const status = params.status || "all";
  const section = params.section || "all";

  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { orgName: { contains: search, mode: "insensitive" } },
        ];
      }
      if (role !== "all") where.role = role;
      if (status !== "all") where.status = status;

      if (section === "organiser") {
        where.OR = [{ role: "ORGANISER" }, { accountMode: "ORGANISER" }];
      } else if (section === "executive") {
        where.OR = [{ role: "EXECUTIVE" }, { accountMode: "EXECUTIVE" }];
      } else if (section === "user") {
        where.AND = [
          { role: { notIn: ["ORGANISER", "EXECUTIVE"] } },
          { OR: [{ accountMode: "INDIVIDUAL" }, { accountMode: null }] },
        ];
      }

      const [dbUsers, total] = await Promise.all([
        p.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                campaigns: true,
                messages: { where: { direction: "OUTBOUND" } },
              },
            },
          },
        }),
        p.user.count({ where }),
      ]);

      const users: AdminUser[] = dbUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        orgName: u.orgName,
        orgType: u.orgType,
        role: u.role || "USER",
        accountMode: u.accountMode || "INDIVIDUAL",
        status: u.status || "ACTIVE",
        campaignsCount: u._count?.campaigns || 0,
        emailsSentCount: u._count?.messages || 0,
        lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      }));

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn("Prisma getAdminUsers failed, using memory fallback:", err);
    }
  }

  // Memory fallback
  let filtered = [...inMemoryUsers];

  if (search) {
    filtered = filtered.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.orgName && u.orgName.toLowerCase().includes(search))
    );
  }

  if (role !== "all") {
    filtered = filtered.filter((u) => u.role === role);
  }

  if (status !== "all") {
    filtered = filtered.filter((u) => u.status === status);
  }

  if (section === "organiser") {
    filtered = filtered.filter((u) => u.role === "ORGANISER" || u.accountMode === "ORGANISER");
  } else if (section === "executive") {
    filtered = filtered.filter((u) => u.role === "EXECUTIVE" || u.accountMode === "EXECUTIVE");
  } else if (section === "user") {
    filtered = filtered.filter(
      (u) =>
        u.role !== "ORGANISER" &&
        u.role !== "EXECUTIVE" &&
        (!u.accountMode || u.accountMode === "INDIVIDUAL")
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    users: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function updateUserStatus(
  userId: string,
  newStatus: AccountStatus,
  adminId: string,
  reason?: string
): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      await p.user.update({
        where: { id: userId },
        data: { status: newStatus },
      });
      await recordAuditLog(
        adminId,
        newStatus === "SUSPENDED" ? "user_suspended" : "user_restored",
        "user",
        userId,
        { newStatus, reason: reason || "Administrative account moderation" }
      );
      return true;
    } catch (err) {
      console.error("Prisma updateUserStatus failed:", err);
    }
  }

  const u = inMemoryUsers.find((user) => user.id === userId);
  if (u) {
    u.status = newStatus;
    await recordAuditLog(
      adminId,
      newStatus === "SUSPENDED" ? "user_suspended" : "user_restored",
      "user",
      userId,
      { newStatus, reason }
    );
    return true;
  }
  return false;
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const targetUser = await p.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, accountMode: true },
      });

      if (!targetUser) {
        return { success: false, error: "User account not found." };
      }

      // Security restriction: Platform ADMIN can ONLY be assigned to an individual user.
      if (newRole === "ADMIN") {
        const isIndividual =
          (!targetUser.accountMode || targetUser.accountMode === "INDIVIDUAL") &&
          targetUser.role !== "ORGANISER" &&
          targetUser.role !== "EXECUTIVE";

        if (!isIndividual) {
          return {
            success: false,
            error: "Admin role can only be assigned to an individual user.",
          };
        }
      }

      if (newRole !== "ADMIN" && targetUser.role === "ADMIN") {
        const dbAdmins = await p.user.findMany({
          where: { role: "ADMIN", status: "ACTIVE" },
          select: { id: true },
        });
        if (dbAdmins.length <= 1) {
          return {
            success: false,
            error: "Cannot demote the sole active platform administrator.",
          };
        }
      }

      await p.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      await recordAuditLog(adminId, "role_changed", "user", userId, { newRole });
      return { success: true };
    } catch (err) {
      console.error("Prisma updateUserRole failed:", err);
      return { success: false, error: "Database update error." };
    }
  }

  const u = inMemoryUsers.find((user) => user.id === userId);
  if (!u) {
    return { success: false, error: "User not found." };
  }

  // Security restriction: Platform ADMIN can ONLY be assigned to an individual user.
  if (newRole === "ADMIN") {
    const isIndividual =
      (!u.accountMode || u.accountMode === "INDIVIDUAL") &&
      u.role !== "ORGANISER" &&
      u.role !== "EXECUTIVE";

    if (!isIndividual) {
      return {
        success: false,
        error: "Admin role can only be assigned to an individual user.",
      };
    }
  }

  // Prevent demoting the last active administrator in in-memory fallback
  const currentAdmins = inMemoryUsers.filter(
    (usr) => usr.role === "ADMIN" && usr.status === "ACTIVE"
  );
  if (newRole !== "ADMIN" && u.role === "ADMIN" && currentAdmins.length === 1 && currentAdmins[0].id === userId) {
    return {
      success: false,
      error: "Cannot demote the sole active platform administrator.",
    };
  }

  u.role = newRole;
  await recordAuditLog(adminId, "role_changed", "user", userId, { newRole });
  return { success: true };
}

export async function deleteUserAccount(
  userId: string,
  adminId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const dbAdmins = await p.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      if (dbAdmins.length === 1 && dbAdmins[0].id === userId) {
        return {
          success: false,
          error: "Cannot delete the sole platform administrator account.",
        };
      }

      await p.user.delete({
        where: { id: userId },
      });
      await recordAuditLog(adminId, "user_deleted", "user", userId, {
        reason: reason || "Administrative permanent deletion",
      });
      return { success: true };
    } catch (err) {
      console.error("Prisma deleteUserAccount failed:", err);
      return { success: false, error: "Database deletion error." };
    }
  }

  // In-memory fallback
  const currentAdmins = inMemoryUsers.filter((u) => u.role === "ADMIN");
  if (currentAdmins.length === 1 && currentAdmins[0].id === userId) {
    return {
      success: false,
      error: "Cannot delete the sole platform administrator account.",
    };
  }

  const idx = inMemoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    inMemoryUsers.splice(idx, 1);
    await recordAuditLog(adminId, "user_deleted", "user", userId, { reason });
    return { success: true };
  }
  return { success: false, error: "User not found." };
}

/**
 * 4. Audit Log Operations
 */
export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
} = {}): Promise<{ logs: AuditLogEntry[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 15));
  const action = params.action || "all";

  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const where: any = {};
      if (action !== "all") where.action = action;

      const [dbLogs, total] = await Promise.all([
        p.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            admin: {
              select: { name: true, email: true },
            },
          },
        }),
        p.auditLog.count({ where }),
      ]);

      const logs: AuditLogEntry[] = dbLogs.map((l: any) => ({
        id: l.id,
        adminId: l.adminId,
        adminName: l.admin?.name || "System Admin",
        adminEmail: l.admin?.email || "admin@sponfy.dev",
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        details: (l.details as Record<string, any>) || {},
        createdAt: l.createdAt.toISOString(),
      }));

      return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn("Prisma getAuditLogs failed, using memory fallback:", err);
    }
  }

  let filtered = [...inMemoryAuditLogs];
  if (action !== "all") {
    filtered = filtered.filter((l) => l.action === action);
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    logs: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function recordAuditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  details: Record<string, any> = {}
): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      let validAdminId = adminId;
      const adminExists = await p.user.findUnique({
        where: { id: adminId },
        select: { id: true },
      });
      if (!adminExists) {
        const fallbackAdmin = await p.user.findFirst({
          where: { role: "ADMIN" },
          select: { id: true },
        });
        if (fallbackAdmin) {
          validAdminId = fallbackAdmin.id;
        }
      }

      if (validAdminId && (adminExists || validAdminId !== adminId)) {
        await p.auditLog.create({
          data: {
            adminId: validAdminId,
            action,
            targetType,
            targetId,
            details,
          },
        });
        return;
      }
    } catch (err) {
      console.error("Prisma recordAuditLog failed:", err);
    }
  }

  inMemoryAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminId,
    adminName: "Subrato Ghosh",
    adminEmail: "admin@sponfy.dev",
    action,
    targetType,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  });
}
