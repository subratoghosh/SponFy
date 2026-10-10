"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderKanban,
  ShieldAlert,
  Settings,
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Campaigns", href: "/admin/campaigns", icon: FolderKanban },
  { label: "Security & Auditing", href: "/admin/activity", icon: ShieldAlert },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-green-mid/40 flex items-center justify-between">
          <div>
            <SponfyBrand href="/admin" size="md" theme="dark" />
            <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-butter-cream/20 text-butter-cream text-[11px] font-bold tracking-wide w-fit border border-butter-cream/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN CONSOLE</span>
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-text-onDarkSub hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Cluster indicator */}
        <div className="px-5 py-3 border-b border-green-mid/30 bg-green-dark/40 flex items-center justify-between text-xs">
          <span className="text-text-onDarkSub flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Control Plane
          </span>
          <span className="font-mono text-[10px] text-butter-cream/80 bg-green-mid/40 px-2 py-0.5 rounded">
            v2.4-SECURE
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-butter-cream text-green-dark shadow-md font-bold"
                    : "text-text-onDarkSub hover:bg-green-mid/50 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "w-4 h-4 stroke-[2]",
                      isActive
                        ? "text-green-dark"
                        : "text-butter-cream/80 group-hover:text-butter-cream"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-dark" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switch to User App */}
      <div className="p-4 border-t border-green-mid/40 space-y-2">
        <Link
          href="/app"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-green-mid/30 hover:bg-green-mid/60 text-butter-cream border border-green-mid/50 text-xs font-semibold transition-all group"
        >
          <span>Return to Workspace</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="text-[11px] text-text-onDarkSub/70 text-center">
          Authenticated Administrator Session
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-green-dark border-b border-green-mid/40 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <SponfyBrand href="/admin" size="sm" theme="dark" />
          <span className="text-xs bg-butter-cream text-green-dark font-bold px-2 py-0.5 rounded-md">
            ADMIN
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg bg-green-mid/40 text-butter-cream hover:bg-green-mid/70"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-green-dark text-text-onDarkSub z-10 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-green-dark text-text-onDarkSub flex-col shrink-0 h-screen sticky top-0 border-r border-green-mid/40 selection:bg-butter-cream selection:text-green-dark">
        {navContent}
      </aside>
    </>
  );
}
