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

const MOBILE_TABS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Sponsors", href: "/app/sponsors", icon: Building2 },
  { label: "Outreach", href: "/app/outreach", icon: Send },
  { label: "Replies", href: "/app/replies", icon: Inbox },
  { label: "More", href: "/app/campaigns", icon: FolderKanban },
];

export const MobileTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-green-dark border-t border-green-mid/50 z-40 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {MOBILE_TABS.map((tab) => {
        const isActive =
          tab.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all min-h-[44px] min-w-[44px]",
              isActive
                ? "bg-butter-cream text-green-dark shadow-sm"
                : "text-text-onDarkSub hover:text-white"
            )}
          >
            <tab.icon
              className={cn("w-5 h-5 mb-0.5", isActive ? "text-green-dark" : "text-butter-cream/80")}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
