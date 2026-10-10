import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-butter-bg text-text-main">
        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-8">
          <TopBar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar />
      </div>
    </ToastProvider>
  );
}
