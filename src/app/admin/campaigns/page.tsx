import { verifyAdminSession } from "@/lib/admin/auth";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { AdminCampaignsView } from "@/components/admin/AdminCampaignsView";

export const metadata = {
  title: "Campaign Governance | SponFy Admin",
  description: "Platform-wide campaign oversight, status monitoring, and moderation.",
};

export default async function AdminCampaignsPage() {
  const adminAuth = await verifyAdminSession();
  const campaigns = await getCampaigns();

  return (
    <AdminCampaignsView
      initialCampaigns={campaigns}
      adminUser={adminAuth.user}
    />
  );
}
