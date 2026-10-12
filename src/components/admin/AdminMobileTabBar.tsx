"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_MOBILE_TABS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Showcase", href: "/admin/showcase", icon: Building2 },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const AdminMobileTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-green-dark/95 backdrop-blur-xl border-t border-green-mid/60 shadow-[0_-10px_35px_rgba(0,0,0,0.45)] px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around"
    >
      {ADMIN_MOBILE_TABS.map((tab) => {
        const isActive =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[46px] min-w-[46px]",
              isActive
                ? "bg-butter-cream text-green-dark shadow-sm scale-105"
                : "text-text-onDarkSub/85 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 mb-0.5",
                isActive ? "text-green-dark stroke-[2.5]" : "text-butter-cream/80"
              )}
            />
            <span className="leading-tight">{tab.label}</span>
          </Link>
        );
      })}

      <Link
        href="/app"
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-butter-cream hover:text-white transition-all min-h-[46px] min-w-[46px]"
      >
        <ArrowLeft className="w-5 h-5 mb-0.5 text-butter-cream/80" />
        <span className="leading-tight">App</span>
      </Link>
    </nav>
  );
};
