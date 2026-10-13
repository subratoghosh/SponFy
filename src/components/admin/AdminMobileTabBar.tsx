"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BOTTOM_NAV_CONTAINER_CLASS,
  BOTTOM_NAV_SAFE_AREA_STYLE,
  BOTTOM_NAV_INNER_CLASS,
  BOTTOM_NAV_TAB_BASE_CLASS,
  BOTTOM_NAV_TAB_ACTIVE_CLASS,
  BOTTOM_NAV_TAB_INACTIVE_CLASS,
  BOTTOM_NAV_ICON_ACTIVE_CLASS,
  BOTTOM_NAV_ICON_INACTIVE_CLASS,
  BOTTOM_NAV_LABEL_ACTIVE_CLASS,
  BOTTOM_NAV_LABEL_INACTIVE_CLASS,
} from "@/components/layout/bottom-nav-styles";

const ADMIN_MOBILE_TABS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Campaigns", href: "/admin/campaigns", icon: FolderKanban },
  { label: "Showcase", href: "/admin/showcase", icon: Building2 },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "App", href: "/app", icon: ArrowLeft },
];

export const AdminMobileTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin Mobile Navigation"
      className={cn("lg:hidden", BOTTOM_NAV_CONTAINER_CLASS)}
      style={BOTTOM_NAV_SAFE_AREA_STYLE}
    >
      <div className={BOTTOM_NAV_INNER_CLASS}>
        {ADMIN_MOBILE_TABS.map((tab) => {
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                BOTTOM_NAV_TAB_BASE_CLASS,
                isActive
                  ? BOTTOM_NAV_TAB_ACTIVE_CLASS
                  : BOTTOM_NAV_TAB_INACTIVE_CLASS
              )}
            >
              <Icon
                className={
                  isActive
                    ? BOTTOM_NAV_ICON_ACTIVE_CLASS
                    : BOTTOM_NAV_ICON_INACTIVE_CLASS
                }
              />
              <span
                className={
                  isActive
                    ? BOTTOM_NAV_LABEL_ACTIVE_CLASS
                    : BOTTOM_NAV_LABEL_INACTIVE_CLASS
                }
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
