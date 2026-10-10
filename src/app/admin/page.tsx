import { verifyAdminSession } from "@/lib/admin/auth";
import { getAdminOverviewMetrics, getAuditLogs } from "@/lib/data/repositories/admin";
import { AdminOverviewView } from "@/components/admin/AdminOverviewView";

export const metadata = {
  title: "Admin Overview | SponFy",
  description: "Platform-wide KPIs, live system metrics, and audit logging.",
};

export default async function AdminOverviewPage() {
  const adminAuth = await verifyAdminSession();
  const [metrics, auditLogsData] = await Promise.all([
    getAdminOverviewMetrics("30d"),
    getAuditLogs({ limit: 5 }),
  ]);

  return (
    <AdminOverviewView
      initialMetrics={metrics}
      initialAuditLogs={auditLogsData.logs}
      adminUser={adminAuth.user}
    />
  );
}
