import { verifyAdminSession } from "@/lib/admin/auth";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

export const metadata = {
  title: "Administrative Settings | SponFy Admin",
  description: "Platform governance parameters, rate limiting, and system settings.",
};

export default async function AdminSettingsPage() {
  const adminAuth = await verifyAdminSession();

  return <AdminSettingsView adminUser={adminAuth.user} />;
}
