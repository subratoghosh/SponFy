import { verifyAdminSession } from "@/lib/admin/auth";
import { getAdminAnalytics } from "@/lib/data/repositories/admin";
import { AdminAnalyticsView } from "@/components/admin/AdminAnalyticsView";

export const metadata = {
  title: "Platform Analytics | SponFy Admin",
  description: "Aggregated user growth, campaign velocity, and outreach conversion analytics.",
};

export default async function AdminAnalyticsPage() {
  const adminAuth = await verifyAdminSession();
  const analyticsData = await getAdminAnalytics("30d");

  return (
    <AdminAnalyticsView
      initialData={analyticsData}
      adminUser={adminAuth.user}
    />
  );
}
