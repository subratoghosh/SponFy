import React from "react";
import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileTabBar } from "@/components/admin/AdminMobileTabBar";

export const metadata = {
  title: "Admin Console | SponFy",
  description: "Administrative control plane, analytics, and platform governance.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminAuth = await verifyAdminSession();

  // Strict server-side access enforcement: non-admins get a 404
  if (!adminAuth.authorized) {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-[#FAF4E6] selection:bg-[#FFF0B3] selection:text-[#0C382E]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 pb-[calc(88px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <main className="flex-1">
          {children}
        </main>
      </div>
      <AdminMobileTabBar />
    </div>
  );
}
