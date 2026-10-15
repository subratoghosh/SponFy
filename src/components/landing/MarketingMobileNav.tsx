"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GitBranch,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
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

const PRIMARY_TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Why Us", href: "/why-us", icon: ShieldCheck },
  { label: "Workflow", href: "/workflow", icon: GitBranch },
  { label: "Showcase", href: "/showcase", icon: Layers },
  { label: "App", href: "/app", icon: ArrowRight },
];

export const MarketingMobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn("md:hidden", BOTTOM_NAV_CONTAINER_CLASS)}
      style={BOTTOM_NAV_SAFE_AREA_STYLE}
    >
      <div className={BOTTOM_NAV_INNER_CLASS}>
        {PRIMARY_TABS.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
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
