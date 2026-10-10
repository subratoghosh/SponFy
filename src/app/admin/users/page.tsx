import { verifyAdminSession } from "@/lib/admin/auth";
import { getAdminUsers } from "@/lib/data/repositories/admin";
import { AdminUsersView } from "@/components/admin/AdminUsersView";

export const metadata = {
  title: "User Management | SponFy Admin",
  description: "Administrative governance of platform user accounts, roles, and status.",
};

export default async function AdminUsersPage() {
  const adminAuth = await verifyAdminSession();
  const { users, total } = await getAdminUsers({ limit: 50 });

  return (
    <AdminUsersView
      initialUsers={users}
      total={total}
      adminUser={adminAuth.user}
    />
  );
}
