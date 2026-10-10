"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Send,
  Inbox,
  FolderKanban,
  Sparkles,
  Clock,
  BarChart3,
  Settings,
  ShieldCheck,
  Home,
  Menu,
  X,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MOBILE_TABS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Campaigns", href: "/app/campaigns", icon: FolderKanban },
  { label: "Sponsors", href: "/app/sponsors", icon: Building2 },
  { label: "Outreach", href: "/app/outreach", icon: Send },
  { label: "Replies", href: "/app/replies", icon: Inbox },
];

const MORE_APP_ITEMS = [
  { label: "AI Discover", href: "/app/discover", icon: Sparkles, desc: "Search and discover high-fit sponsors" },
  { label: "Follow-ups", href: "/app/followups", icon: Clock, desc: "Automated sequence reminders" },
  { label: "Analytics", href: "/app/analytics", icon: BarChart3, desc: "Campaign conversions & metrics" },
  { label: "Settings", href: "/app/settings", icon: Settings, desc: "Gmail connection & fest preferences" },
  { label: "Admin Console", href: "/admin", icon: ShieldCheck, desc: "Platform governance & metrics" },
  { label: "Landing Home", href: "/", icon: Home, desc: "Back to marketing overview" },
];

export const MobileTabBar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);

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

  return (
    <>
      {/* Slide-Up App Drawer */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative w-full bg-green-dark border-t-2 border-butter-cream/40 rounded-t-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))] animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-green-mid/40">
              <span className="text-xs font-bold uppercase tracking-wider text-butter-cream/80 flex items-center gap-2">
                <Menu className="w-4 h-4 text-butter-cream" />
                Workspace Navigation
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-full text-butter-cream/70 hover:text-white hover:bg-green-mid/60"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {MORE_APP_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href) && item.href !== "/";
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 p-3 rounded-2xl border transition-all text-left",
                      isActive
                        ? "bg-green-mid text-butter-cream border-butter-cream/60 shadow-sm"
                        : "bg-green-deep/60 text-butter-cream/90 border-green-mid/40 hover:bg-green-mid/40 hover:text-white"
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-butter-cream/15 text-butter-cream flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-snug">{item.label}</div>
                      <div className="text-[11px] text-text-onDarkSub/70 truncate">{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2">
              <Link href="/app/campaigns?action=new" onClick={() => setMoreOpen(false)}>
                <Button variant="butter" className="w-full justify-center text-sm font-extrabold shadow-md">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create New Fest Campaign
                </Button>
              </Link>
            </div>

            {/* Mobile User Profile & Log Out */}
            <div className="pt-3 border-t border-green-mid/40 space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-green-deep/80 border border-green-mid/40">
                <div className="w-9 h-9 rounded-xl bg-butter-cream text-green-dark font-black text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-text-onDarkSub/70 truncate">
                    {displayEmail || "Organizer"}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-green-mid text-butter-cream">
                  {isDemo ? "Demo" : "Live"}
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setMoreOpen(false);
                  await signOut({ callbackUrl: "/login" });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 hover:text-white hover:bg-red-900/60 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Dock Tab Bar */}
      <nav
        aria-label="App Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-green-dark/95 backdrop-blur-xl border-t border-green-mid/60 z-40 px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-10px_35px_rgba(0,0,0,0.45)]"
      >
        {MOBILE_TABS.map((tab) => {
          const isActive =
            tab.href === "/app"
              ? pathname === "/app"
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

        {/* More Menu Trigger */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[46px] min-w-[46px]",
            moreOpen
              ? "bg-green-mid text-butter-cream border border-butter-cream/40"
              : "text-text-onDarkSub/85 hover:text-white"
          )}
          aria-label="More workspace options"
        >
          <Menu className="w-5 h-5 mb-0.5 text-butter-cream/80" />
          <span className="leading-tight">More</span>
        </button>
      </nav>
    </>
  );
};
