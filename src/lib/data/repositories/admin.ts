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
import { getDrafts } from "./outreach";
import { getReplyAnalyses } from "./replies";

// In-memory demo store for fallback / local testing
let inMemoryUsers: AdminUser[] = [
  {
    id: "usr-admin-1",
    name: "Subrato Ghosh (Platform Lead)",
    email: "admin@sponfy.dev",
    image: null,
    orgName: "SponFy Engineering",
    orgType: "Core Team",
    role: "ADMIN",
    status: "ACTIVE",
    campaignsCount: 3,
    emailsSentCount: 42,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-lead-2",
    name: "Aarav Sharma",
    email: "aarav@iitd-fest.org",
    image: null,
    orgName: "IIT Delhi Tryst 2026",
    orgType: "College Tech Fest",
    role: "USER",
    status: "ACTIVE",
    campaignsCount: 2,
    emailsSentCount: 34,
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-lead-3",
    name: "Pooja Varma",
    email: "pooja@bits-waves.in",
    image: null,
    orgName: "BITS Goa Waves",
    orgType: "Cultural Fest",
    role: "USER",
    status: "ACTIVE",
    campaignsCount: 1,
    emailsSentCount: 18,
    lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-lead-4",
    name: "Rohan Kulkarni",
    email: "rohan@hacknitk.com",
    image: null,
    orgName: "NITK HackVerse",
    orgType: "Student Hackathon",
    role: "USER",
    status: "ACTIVE",
    campaignsCount: 2,
    emailsSentCount: 27,
    lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "usr-lead-5",
    name: "Meera Nair",
    email: "meera@cet-dhwani.edu",
    image: null,
    orgName: "College of Engg Trivandrum",
    orgType: "Cultural Fest",
    role: "USER",
    status: "SUSPENDED",
    campaignsCount: 1,
    emailsSentCount: 4,
    lastActiveAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let inMemoryAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-1",
    adminId: "usr-admin-1",
    adminName: "Subrato Ghosh",
    adminEmail: "admin@sponfy.dev",
    action: "user_suspended",
    targetType: "user",
    targetId: "usr-lead-5",
    details: { reason: "Inactivity and unverified campus domain policy review" },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-2",
    adminId: "usr-admin-1",
    adminName: "Subrato Ghosh",
    adminEmail: "admin@sponfy.dev",
    action: "role_changed",
    targetType: "user",
    targetId: "usr-admin-1",
    details: { role: "ADMIN", reason: "Initial administrator designation" },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

/**
 * 1. Overview KPI Metrics
 */
export async function getAdminOverviewMetrics(timeRange = "30d"): Promise<AdminOverviewMetrics> {
  const cutoff = getTimeBoundary(timeRange);

  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      // Batch 1: User and campaign metrics
      const [
        totalUsers,
        newUsers,
        activeUsers,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
      ] = await Promise.all([
        p.user.count(),
        p.user.count({ where: { createdAt: { gte: cutoff } } }),
        p.user.count({ where: { status: "ACTIVE" } }),
        p.campaign.count(),
        p.campaign.count({ where: { archived: false } }),
        p.campaign.count({ where: { archived: true } }),
      ]);

      // Batch 2: Company, message, and session metrics
      const [
        totalCompanies,
        totalSent,
        totalReplies,
        positiveReplies,
        committedCompanies,
        activeSessionsCount,
      ] = await Promise.all([
        p.company.count(),
        p.message.count({ where: { direction: "OUTBOUND" } }),
        p.message.count({ where: { direction: "INBOUND" } }),
        p.replyAnalysis.count({
          where: {
            intent: { in: ["INTERESTED", "POSITIVE", "NEGOTIATING"] },
          },
        }),
        p.company.count({ where: { stage: "COMMITTED" } }),
        p.session.count({ where: { expires: { gt: new Date() } } }),
      ]);

      const committedRevenue = await p.company.aggregate({
        where: { stage: "COMMITTED" },
        _sum: { pipelineValue: true },
      });

      return {
        totalUsers,
        newUsers,
        activeUsers,
        activeSessions: activeSessionsCount,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalSponsorsDiscovered: totalCompanies,
        totalEmailsSent: totalSent,
        totalRepliesReceived: totalReplies,
        positiveResponses: positiveReplies,
        confirmedSponsorships: committedCompanies,
        committedRevenueTotal: committedRevenue._sum.pipelineValue || 0,
        usersDelta: 0,
        campaignsDelta: 0,
        outreachDelta: 0,
      };
    } catch (err) {
      console.warn("Prisma getAdminOverviewMetrics failed, using repository aggregations:", err);
    }
  }

  // Memory/seed fallback
  const campaigns = await getCampaigns();
  const sponsors = await getSponsors();
  const drafts = await getDrafts();
  const replies = await getReplyAnalyses();

  const totalUsers = inMemoryUsers.length;
  const newUsers = inMemoryUsers.filter((u) => new Date(u.createdAt) >= cutoff).length;
  const activeUsers = inMemoryUsers.filter((u) => u.status === "ACTIVE").length;
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
    usersDelta: 0,
    campaignsDelta: 0,
    outreachDelta: 0,
  };
}

/**
 * 2. Deep Admin Analytics
 */
export async function getAdminAnalytics(timeRange = "30d"): Promise<AdminAnalyticsData> {
  if (isDatabaseConfigured()) {
    try {
      const p = prisma as any;
      const days = timeRange === "7d" ? 7 : timeRange === "60d" ? 60 : 30;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [users, campaigns, companies, messages, analyses] = await Promise.all([
        p.user.findMany({
          select: { id: true, name: true, createdAt: true, status: true },
          orderBy: { createdAt: "asc" },
        }),
        p.campaign.findMany({
          include: {
            user: { select: { id: true, name: true, email: true } },
            companies: { select: { id: true, stage: true, pipelineValue: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        p.company.findMany({
          select: { id: true, stage: true, industry: true, pipelineValue: true, campaignId: true },
        }),
        p.message.findMany({
          select: { id: true, direction: true, createdAt: true },
        }),
        p.replyAnalysis.findMany({
          select: { id: true, intent: true },
        }),
      ]);

      // 1. userGrowth: group by month
      const monthsMap = new Map<string, { users: number; active: number }>();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthsMap.set(key, { users: 0, active: 0 });
      }

      let cumulative = 0;
      for (const u of users) {
        const d = new Date(u.createdAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        cumulative++;
        const curr = monthsMap.get(key) || { users: 0, active: 0 };
        curr.users = cumulative;
        if (u.status === "ACTIVE") curr.active++;
        monthsMap.set(key, curr);
      }

      let runningUsers = 0;
      let runningActive = 0;
      const userGrowth = Array.from(monthsMap.entries()).map(([date, val]) => {
        if (val.users > 0) runningUsers = val.users;
        if (val.active > 0) runningActive = val.active;
        return {
          date,
          users: runningUsers,
          active: runningActive,
        };
      });

      // 2. registrationsByDay
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
      users
        .filter((u: any) => new Date(u.createdAt) >= cutoff)
        .forEach((u: any) => {
          const d = dayNames[new Date(u.createdAt).getDay()];
          dayCounts[d as keyof typeof dayCounts]++;
        });
      const registrationsByDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
        date: d,
        count: dayCounts[d as keyof typeof dayCounts],
      }));

      // 3. sessionTrends
      const sessionTrends = [
        { date: "Day 1-5", sessions: 0, avgDurationMinutes: 0 },
        { date: "Day 6-10", sessions: 0, avgDurationMinutes: 0 },
        { date: "Day 11-15", sessions: 0, avgDurationMinutes: 0 },
        { date: "Day 16-20", sessions: 0, avgDurationMinutes: 0 },
        { date: "Day 21-25", sessions: 0, avgDurationMinutes: 0 },
        { date: "Day 26-30", sessions: 0, avgDurationMinutes: 0 },
      ];

      // 4. campaignStatusBreakdown
      const campaignStatusBreakdown = [
        { status: "Active Pipeline", count: campaigns.filter((c: any) => !c.archived).length },
        { status: "Archived", count: campaigns.filter((c: any) => c.archived).length },
      ];

      // 5. campaignsByEventType
      const eventTypeMap = new Map<string, number>();
      campaigns.forEach((c: any) => {
        const type = c.eventType || "General";
        eventTypeMap.set(type, (eventTypeMap.get(type) || 0) + 1);
      });
      const campaignsByEventType = Array.from(eventTypeMap.entries()).map(([type, count]) => ({
        type,
        count,
      }));
      if (campaignsByEventType.length === 0) {
        campaignsByEventType.push({ type: "General", count: 0 });
      }

      // 6. outreachFunnel
      const totalSponsors = companies.length;
      const contacted = companies.filter((s: any) =>
        ["CONTACTED", "REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
      ).length;
      const replied = companies.filter((s: any) =>
        ["REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
      ).length;
      const interested = companies.filter((s: any) =>
        ["INTERESTED", "NEGOTIATION", "COMMITTED"].includes(s.stage)
      ).length;
      const committed = companies.filter((s: any) => s.stage === "COMMITTED").length;

      const outreachFunnel = [
        { stage: "Discovered", count: totalSponsors, percentage: totalSponsors > 0 ? 100 : 0 },
        { stage: "Contacted", count: contacted, percentage: totalSponsors > 0 ? Math.round((contacted / totalSponsors) * 100) : 0 },
        { stage: "Replied", count: replied, percentage: totalSponsors > 0 ? Math.round((replied / totalSponsors) * 100) : 0 },
        { stage: "Interested", count: interested, percentage: totalSponsors > 0 ? Math.round((interested / totalSponsors) * 100) : 0 },
        { stage: "Committed", count: committed, percentage: totalSponsors > 0 ? Math.round((committed / totalSponsors) * 100) : 0 },
      ];

      // 7. industryPerformance
      const indMap = new Map<string, { count: number; replies: number; committed: number }>();
      companies.forEach((c: any) => {
        const ind = c.industry || "General";
        const cur = indMap.get(ind) || { count: 0, replies: 0, committed: 0 };
        cur.count++;
        if (["REPLIED", "INTERESTED", "NEGOTIATION", "COMMITTED"].includes(c.stage)) {
          cur.replies++;
        }
        if (c.stage === "COMMITTED") {
          cur.committed++;
        }
        indMap.set(ind, cur);
      });

      const industryPerformance = Array.from(indMap.entries()).map(([industry, stats]) => ({
        industry,
        sponsorsCount: stats.count,
        replyRate: stats.count > 0 ? Math.round((stats.replies / stats.count) * 100) : 0,
        conversionRate: stats.count > 0 ? Math.round((stats.committed / stats.count) * 100) : 0,
      }));
      if (industryPerformance.length === 0) {
        industryPerformance.push({ industry: "Technology", sponsorsCount: 0, replyRate: 0, conversionRate: 0 });
      }

      // 8. topCampaigns
      const topCampaigns = campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        ownerName: c.user?.name || "Campus Organizer",
        sponsorsCount: c.companies?.length || 0,
        committedAmount: (c.companies || [])
          .filter((cmp: any) => cmp.stage === "COMMITTED")
          .reduce((sum: number, cmp: any) => sum + (cmp.pipelineValue || 0), 0),
        status: c.archived ? "archived" : "active",
      }));

      return {
        userGrowth,
        registrationsByDay,
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
    { date: "Oct 2026", users: inMemoryUsers.length, active: inMemoryUsers.filter((u) => u.status === "ACTIVE").length },
  ];

  const registrationsByDay = [
    { date: "Mon", count: 0 },
    { date: "Tue", count: 0 },
    { date: "Wed", count: 0 },
    { date: "Thu", count: 0 },
    { date: "Fri", count: 0 },
    { date: "Sat", count: 0 },
    { date: "Sun", count: 0 },
  ];

  const sessionTrends = [
    { date: "Day 1-5", sessions: 0, avgDurationMinutes: 0 },
    { date: "Day 6-10", sessions: 0, avgDurationMinutes: 0 },
    { date: "Day 11-15", sessions: 0, avgDurationMinutes: 0 },
    { date: "Day 16-20", sessions: 0, avgDurationMinutes: 0 },
    { date: "Day 21-25", sessions: 0, avgDurationMinutes: 0 },
    { date: "Day 26-30", sessions: 0, avgDurationMinutes: 0 },
  ];

  const campaignStatusBreakdown = [
    { status: "Active Pipeline", count: campaigns.filter((c) => c.status !== "archived").length },
    { status: "Archived", count: campaigns.filter((c) => c.status === "archived").length },
  ];

  const campaignsByEventType = [
    { type: "Hackathons", count: campaigns.length },
  ];

  const totalSponsors = sponsors.length;
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

  const outreachFunnel = [
    { stage: "Discovered", count: totalSponsors, percentage: totalSponsors > 0 ? 100 : 0 },
    { stage: "Contacted", count: contacted, percentage: totalSponsors > 0 ? Math.round((contacted / totalSponsors) * 100) : 0 },
    { stage: "Replied", count: replied, percentage: totalSponsors > 0 ? Math.round((replied / totalSponsors) * 100) : 0 },
    { stage: "Interested", count: interested, percentage: totalSponsors > 0 ? Math.round((interested / totalSponsors) * 100) : 0 },
    { stage: "Committed", count: committed, percentage: totalSponsors > 0 ? Math.round((committed / totalSponsors) * 100) : 0 },
  ];

  const industryPerformance = [
    { industry: "Technology", sponsorsCount: sponsors.length, replyRate: 0, conversionRate: 0 },
  ];

  const topCampaigns = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    ownerName: "Campus Organizer",
    sponsorsCount: sponsors.filter((s) => s.campaignId === c.id).length,
    committedAmount: sponsors.filter((s) => s.campaignId === c.id && s.stage === "Committed").reduce((sum, s) => sum + (s.pipelineValue || 0), 0),
    status: c.status || "active",
  }));

  return {
    userGrowth,
    registrationsByDay,
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
} = {}): Promise<{ users: AdminUser[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 10));
  const search = (params.search || "").toLowerCase().trim();
  const role = params.role || "all";
  const status = params.status || "all";

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
                messages: true,
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
      if (newRole === "USER") {
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

  // Prevent demoting the last active administrator in in-memory fallback
  const currentAdmins = inMemoryUsers.filter(
    (u) => u.role === "ADMIN" && u.status === "ACTIVE"
  );
  if (newRole === "USER" && currentAdmins.length === 1 && currentAdmins[0].id === userId) {
    return {
      success: false,
      error: "Cannot demote the sole active platform administrator.",
    };
  }

  const u = inMemoryUsers.find((user) => user.id === userId);
  if (u) {
    u.role = newRole;
    await recordAuditLog(adminId, "role_changed", "user", userId, { newRole });
    return { success: true };
  }
  return { success: false, error: "User not found." };
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
