import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminEmails } from "@/lib/admin/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ToastProvider } from "@/components/ui/toast";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { GuidedSetupBanner } from "@/components/onboarding/GuidedSetupBanner";
import { ActivityHeartbeat } from "@/components/activity/ActivityHeartbeat";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("placeholder");

  if (!session?.user) {
    if (!isDemo) {
      redirect("/login");
    }
  } else if (session.user.role !== "ADMIN") {
    const status = session.user.onboardingStatus || "NOT_STARTED";
    if (status === "PENDING_APPROVAL") {
      redirect("/onboarding/pending");
    } else if (status !== "COMPLETE") {
      redirect("/onboarding");
    }
  }

  return (
    <ToastProvider>
      <ActivityHeartbeat />
      <div className="flex min-h-screen bg-butter-bg text-text-main overscroll-y-contain">
        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-8">
          <TopBar />
          <PullToRefresh>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
              <GuidedSetupBanner />
              {children}
            </main>
          </PullToRefresh>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar />
      </div>
    </ToastProvider>
  );
}
