import { describe, it, expect } from "vitest";
import {
  getAdminOverviewMetrics,
  getAdminAnalytics,
  getAdminUsers,
  getAuditLogs,
  updateUserStatus,
  updateUserRole,
} from "@/lib/data/repositories/admin";

describe("Admin Governance & Platform Telemetry", { timeout: 15000 }, () => {
  it("calculates accurate overview KPI metrics with realistic relationships", async () => {
    const metrics = await getAdminOverviewMetrics("30d");

    expect(metrics.totalUsers).toBeGreaterThanOrEqual(1);
    expect(metrics.activeUsers).toBeLessThanOrEqual(metrics.totalUsers);
    expect(metrics.totalCampaigns).toBeGreaterThanOrEqual(metrics.activeCampaigns);
    expect(metrics.totalEmailsSent).toBeGreaterThanOrEqual(metrics.totalRepliesReceived);
    expect(metrics.totalRepliesReceived).toBeGreaterThanOrEqual(metrics.positiveResponses);
  });

  it("returns structured analytics datasets with non-negative counts", async () => {
    const analytics = await getAdminAnalytics("30d");

    expect(analytics.userGrowth.length).toBeGreaterThan(0);
    expect(analytics.outreachFunnel.length).toBeGreaterThan(0);
    expect(analytics.industryPerformance.length).toBeGreaterThan(0);

    // Funnel stage percentages should be between 0 and 100
    for (const stage of analytics.outreachFunnel) {
      expect(stage.percentage).toBeGreaterThanOrEqual(0);
      expect(stage.percentage).toBeLessThanOrEqual(100);
    }
  });

  it("filters and paginates users properly in repository", async () => {
    const res = await getAdminUsers({ limit: 10, role: "ADMIN" });

    expect(res.users.length).toBeGreaterThanOrEqual(1);
    for (const u of res.users) {
      expect(u.role).toBe("ADMIN");
    }
  });

  it("prevents demoting the sole active administrator", async () => {
    // Find the current admin
    const { users } = await getAdminUsers({ role: "ADMIN" });
    const admin = users[0];

    const demoteAttempt = await updateUserRole(admin.id, "USER", admin.id);
    expect(demoteAttempt.success).toBe(false);
    expect(demoteAttempt.error).toContain("sole active platform administrator");
  });

  it("filters user management into 3 sections: user, organiser, and executive", async () => {
    const userSection = await getAdminUsers({ section: "user" });
    const orgSection = await getAdminUsers({ section: "organiser" });
    const execSection = await getAdminUsers({ section: "executive" });

    expect(userSection.users.length).toBeGreaterThanOrEqual(1);
    expect(orgSection.users.length).toBeGreaterThanOrEqual(1);
    expect(execSection.users.length).toBeGreaterThanOrEqual(1);

    for (const u of userSection.users) {
      expect(u.role).not.toBe("ORGANISER");
      expect(u.role).not.toBe("EXECUTIVE");
    }

    for (const u of orgSection.users) {
      expect(u.role === "ORGANISER" || u.accountMode === "ORGANISER").toBe(true);
    }

    for (const u of execSection.users) {
      expect(u.role === "EXECUTIVE" || u.accountMode === "EXECUTIVE").toBe(true);
    }
  });

  it("enforces that admin can ONLY be assigned to an individual user", async () => {
    const { users: admins } = await getAdminUsers({ role: "ADMIN" });
    const adminId = admins[0].id;

    // Organiser cannot be promoted to ADMIN
    const { users: orgUsers } = await getAdminUsers({ section: "organiser" });
    const orgUser = orgUsers[0];
    const orgPromoAttempt = await updateUserRole(orgUser.id, "ADMIN", adminId);
    expect(orgPromoAttempt.success).toBe(false);
    expect(orgPromoAttempt.error).toContain("Admin role can only be assigned to an individual user");

    // Executive cannot be promoted to ADMIN
    const { users: execUsers } = await getAdminUsers({ section: "executive" });
    const execUser = execUsers[0];
    const execPromoAttempt = await updateUserRole(execUser.id, "ADMIN", adminId);
    expect(execPromoAttempt.success).toBe(false);
    expect(execPromoAttempt.error).toContain("Admin role can only be assigned to an individual user");

    // Individual user CAN be promoted to ADMIN
    const { users: individualUsers } = await getAdminUsers({ section: "user" });
    const targetIndividual = individualUsers.find((u) => u.role === "USER");
    if (targetIndividual) {
      const promoResult = await updateUserRole(targetIndividual.id, "ADMIN", adminId);
      expect(promoResult.success).toBe(true);
    }
  });

  it("records immutable audit log entries", async () => {
    const { logs: initialLogs } = await getAuditLogs();
    const initialCount = initialLogs.length;

    // Suspend a user to generate an audit log
    const { users } = await getAdminUsers({ role: "USER" });
    if (users.length > 0) {
      const targetUser = users[0];
      await updateUserStatus(targetUser.id, "SUSPENDED", "usr-admin-1", "Test suspension");

      const { logs: updatedLogs } = await getAuditLogs();
      expect(updatedLogs.length).toBeGreaterThanOrEqual(initialCount);
      expect(updatedLogs[0].action).toBe("user_suspended");
      expect(updatedLogs[0].targetId).toBe(targetUser.id);
    }
  });

  it("provides all required skeleton component files", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const skeletonFiles = [
      "src/components/ui/skeleton.tsx",
      "src/components/skeletons/DashboardSkeleton.tsx",
      "src/components/skeletons/TableSkeleton.tsx",
      "src/components/skeletons/ChartSkeleton.tsx",
      "src/components/skeletons/CardSkeleton.tsx",
      "src/components/skeletons/SponsorsKanbanSkeleton.tsx",
      "src/components/skeletons/OutreachSkeleton.tsx",
      "src/components/skeletons/AdminDashboardSkeleton.tsx",
      "src/components/skeletons/KPISkeleton.tsx",
      "src/components/skeletons/ProfileSkeleton.tsx",
      "src/components/skeletons/InboxSkeleton.tsx",
      "src/components/skeletons/CandidateListSkeleton.tsx",
    ];

    for (const file of skeletonFiles) {
      const fullPath = path.resolve(process.cwd(), file);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content.length).toBeGreaterThan(100);
    }
  });
});

