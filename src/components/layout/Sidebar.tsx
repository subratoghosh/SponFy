"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  Building2,
  Send,
  Inbox,
  Clock,
  BarChart3,
  Settings,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Campaigns", href: "/app/campaigns", icon: FolderKanban },
  { label: "Discover", href: "/app/discover", icon: Sparkles },
  { label: "Sponsors", href: "/app/sponsors", icon: Building2 },
  { label: "Outreach", href: "/app/outreach", icon: Send },
  { label: "Replies", href: "/app/replies", icon: Inbox },
  { label: "Follow-ups", href: "/app/followups", icon: Clock },
  { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

import { SponfyBrand } from "@/components/ui/SponfyBrand";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 bg-green-dark text-text-onDarkSub flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-green-mid/40 selection:bg-butter-cream selection:text-green-dark">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-green-mid/40 flex items-center justify-between">
          <SponfyBrand href="/" size="md" theme="dark" />
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
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
                      isActive ? "text-green-dark" : "text-butter-cream/80 group-hover:text-butter-cream"
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

      {/* Bottom Safety & Demo Status Card */}
      <div className="p-4 border-t border-green-mid/40">
        <div className="p-3.5 bg-green-deep/80 rounded-xl border border-green-mid/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-butter-cream flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              Safety Active
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-butter-cream text-green-dark">
              Demo
            </span>
          </div>
          <p className="text-[11px] text-text-onDarkSub leading-snug">
            Human approval gate active on all outbound emails.
          </p>
        </div>
      </div>
    </aside>
  );
};
