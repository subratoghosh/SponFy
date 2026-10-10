import { verifyAdminSession } from "@/lib/admin/auth";
import { getAuditLogs } from "@/lib/data/repositories/admin";
import { AdminActivityView } from "@/components/admin/AdminActivityView";

export const metadata = {
  title: "Audit Trail & Activity | SponFy Admin",
  description: "Administrative event history and security audit logging.",
};

export default async function AdminActivityPage() {
  const adminAuth = await verifyAdminSession();
  const { logs, total } = await getAuditLogs({ limit: 50 });

  return (
    <AdminActivityView
      initialLogs={logs}
      total={total}
      adminUser={adminAuth.user}
    />
  );
}
