import dynamic from "next/dynamic";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getAdminAnalytics } from "@/lib/data/repositories/admin";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";

const AdminAnalyticsView = dynamic(
  () => import("@/components/admin/AdminAnalyticsView").then((m) => m.AdminAnalyticsView),
  {
    loading: () => (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    ),
  }
);

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
