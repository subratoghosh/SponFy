"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Compass,
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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Campaigns", href: "/app/campaigns", icon: FolderKanban },
  { label: "Discover", href: "/app/discover", icon: Compass },
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
  const { data: session } = useSession();

  const user = session?.user;
  const isDemo = !user || user.email === "demo@sponfy.dev";
  const displayName = user?.name || (isDemo ? "Demo Organizer" : "Event Organizer");
  const displayEmail = user?.email || (isDemo ? "demo@sponfy.dev" : "");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "OR";

  const isAdmin =
    (user as any)?.role === "ADMIN" ||
    user?.email === "admin@sponfy.dev" ||
    user?.email === "subratog840@gmail.com" ||
    user?.email === "subratoghosh@gmail.com";

  return (
    <aside className="hidden lg:flex w-64 bg-green-dark text-text-onDarkSub flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-green-mid/40 selection:bg-butter-cream selection:text-green-dark overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
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

          {/* Admin Console Navigation Item (Visible for Administrators) */}
          {isAdmin && (
            <div className="pt-2 border-t border-green-mid/40 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-butter-cream/60 px-3.5 block mb-1">
                Governance
              </span>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group",
                  pathname.startsWith("/admin")
                    ? "bg-amber-400 text-green-dark shadow-md font-bold"
                    : "text-amber-300 hover:bg-green-mid/50 hover:text-amber-200 border border-amber-400/20 bg-green-deep/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className={cn(
                      "w-4 h-4 stroke-[2]",
                      pathname.startsWith("/admin")
                        ? "text-green-dark"
                        : "text-amber-400 group-hover:text-amber-300"
                    )}
                  />
                  <span>Admin Console</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-green-dark">
                  Admin
                </span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom User Profile & Sign Out Bar */}
      <div className="p-4 border-t border-green-mid/40 space-y-3 shrink-0 bg-green-dark">
        {/* Safety Gate Indicator */}
        <div className="p-3 bg-green-deep/80 rounded-xl border border-green-mid/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-butter-cream flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              Safety Gate
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-butter-cream text-green-dark">
              {isDemo ? "Demo" : "Live DB"}
            </span>
          </div>
          <p className="text-[10px] text-text-onDarkSub/80 leading-snug">
            All AI pitches require manual organizer approval.
          </p>
        </div>

        {/* User Profile Card with Sign Out Button */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-green-deep/50 border border-green-mid/30">
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="w-7 h-7 rounded-lg bg-butter-cream text-green-dark font-black text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-text-onDarkSub/70 truncate">
                {displayEmail || "Organizer"}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Log out of account"
            className="p-1.5 rounded-lg text-text-onDarkSub/80 hover:text-red-300 hover:bg-green-mid/60 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
