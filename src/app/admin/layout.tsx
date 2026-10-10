import React from "react";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SponfyBrand } from "@/components/ui/SponfyBrand";
import { ShieldAlert, ArrowLeft, LogIn, Lock } from "lucide-react";

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

  // Strict server-side access enforcement - no admin UI or data ever rendered for unauthorized users
  if (!adminAuth.authorized) {
    return (
      <div className="min-h-screen bg-[#FAF4E6] flex flex-col items-center justify-center p-6 text-center selection:bg-[#FFF0B3] selection:text-[#0C382E]">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#0C382E]/10 p-8 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <SponfyBrand href="/" size="md" theme="light" />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-800 border border-red-200">
              <Lock className="w-3.5 h-3.5" />
              Access Denied (403)
            </span>
            <h1 className="text-2xl font-black text-[#0C382E] tracking-tight">
              Administrator Privileges Required
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed">
              This area is strictly restricted to verified platform administrators. Your current account does not have authorization to view or manage platform governance resources.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 text-left font-mono space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-red-600 font-bold">UNAUTHORIZED</span>
            </div>
            <div className="flex justify-between">
              <span>Required Role:</span>
              <span className="text-[#0C382E] font-bold">ADMIN</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/app"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0C382E] text-white font-semibold hover:bg-[#0C382E]/90 transition-all text-sm shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to App
            </Link>
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFF0B3] text-[#0C382E] font-semibold hover:bg-[#FFF0B3]/80 transition-all text-sm border border-[#0C382E]/10"
            >
              <LogIn className="w-4 h-4" />
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF4E6] selection:bg-[#FFF0B3] selection:text-[#0C382E]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
