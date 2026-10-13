"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Send,
  Inbox,
  FolderKanban,
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

const MOBILE_TABS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Campaigns", href: "/app/campaigns", icon: FolderKanban },
  { label: "Sponsors", href: "/app/sponsors", icon: Building2 },
  { label: "Outreach", href: "/app/outreach", icon: Send },
  { label: "Replies", href: "/app/replies", icon: Inbox },
];

export const MobileTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App Navigation"
      className={cn("lg:hidden", BOTTOM_NAV_CONTAINER_CLASS)}
      style={BOTTOM_NAV_SAFE_AREA_STYLE}
    >
      <div className={BOTTOM_NAV_INNER_CLASS}>
        {MOBILE_TABS.map((tab) => {
          const isActive =
            tab.href === "/app"
              ? pathname === "/app"
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
