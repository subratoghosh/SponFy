"use client";

import React, { useEffect, useState } from "react";
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
  CalendarDays,
  Clock,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SponfyLogo } from "@/components/ui/SponfyLogo";

const MAIN_NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Campaigns", href: "/app/campaigns", icon: FolderKanban },
  { label: "Discover", href: "/app/discover", icon: Compass },
  { label: "Sponsors", href: "/app/sponsors", icon: Building2 },
  { label: "Outreach", href: "/app/outreach", icon: Send },
  { label: "Replies", href: "/app/replies", icon: Inbox },
  { label: "Schedule", href: "/app/schedule", icon: CalendarDays },
  { label: "Follow-ups", href: "/app/followups", icon: Clock },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  // Collapse after navigating, even though the pointer is still over the sidebar
  useEffect(() => {
    setIsExpanded(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);

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
    user?.email === "admin@sponfy.dev";

  const isOrganiser =
    (user as any)?.role === "ORGANISER" || isAdmin;

  const renderNavLink = (item: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive =
      item.href === "/app"
        ? pathname === "/app"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        title={item.label}
        aria-label={item.label}
        className={cn(
          "flex items-center h-10 rounded-xl font-semibold text-sm transition-all duration-200 group relative",
          isActive
            ? "bg-butter-cream text-green-dark shadow-md font-bold"
            : "text-text-onDarkSub hover:bg-green-mid/50 hover:text-white"
        )}
      >
        <div className="w-[48px] shrink-0 flex items-center justify-center">
          <item.icon
            className={cn(
              "w-4 h-4 stroke-[2] shrink-0",
              isActive
                ? "text-green-dark"
                : "text-butter-cream/80 group-hover:text-butter-cream"
            )}
          />
        </div>
        <div className="flex-1 flex items-center justify-between pr-3 min-w-0 overflow-hidden opacity-0 group-data-[expanded=true]/sidebar:opacity-100 transition-opacity duration-200">
          <span className="truncate whitespace-nowrap">{item.label}</span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-dark shrink-0 ml-2" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Layout Spacer: reserves collapsed 72px on desktop so page content does not shift or reflow */}
      <div className="hidden lg:block w-[72px] shrink-0" aria-hidden="true" />

      {/* Desktop Collapsible Floating Overlay Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between",
          "fixed top-0 left-0 h-screen z-40",
          "w-[72px] data-[expanded=true]:w-64",
          "bg-green-dark text-text-onDarkSub",
          "border-r border-green-mid/40",
          "selection:bg-butter-cream selection:text-green-dark",
          "overflow-hidden",
          "transition-[width,box-shadow] duration-200 ease-out",
          "data-[expanded=true]:shadow-2xl data-[expanded=true]:shadow-black/40",
          "group/sidebar"
        )}
        data-expanded={isExpanded}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocus={(e) => {
          // Only keyboard focus expands; a mouse click on a link shouldn't hold it open
          if (e.target.matches(":focus-visible")) setIsExpanded(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsExpanded(false);
        }}
      >
        {/* Scrollable Upper Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {/* Brand Header */}
          <div className="h-16 border-b border-green-mid/40 flex items-center px-3 shrink-0">
            <Link
              href="/"
              className="flex items-center h-10 w-full group/brand select-none"
              title="SponFy"
              aria-label="SponFy"
            >
              <div className="w-[48px] shrink-0 flex items-center justify-center transform group-hover/brand:scale-105 transition-transform duration-200">
                <SponfyLogo size={32} variant="cream" />
              </div>
              <div className="flex items-baseline tracking-tight font-heading font-extrabold whitespace-nowrap min-w-0 overflow-hidden opacity-0 group-data-[expanded=true]/sidebar:opacity-100 transition-opacity duration-200 pl-1">
                <span className="text-xl text-butter-cream">Spon</span>
                <span className="text-xl text-[#F5D061]">Fy</span>
              </div>
            </Link>
          </div>

          {/* Main Navigation List */}
          <nav className="p-3 space-y-1.5">
            {MAIN_NAV_ITEMS.map(renderNavLink)}
            {isOrganiser && renderNavLink({ label: "Team", href: "/app/team", icon: Users })}

            {/* Admin Console Navigation Item (Visible for Administrators) */}
            {isAdmin && (
              <div className="pt-2 border-t border-green-mid/40 mt-2">
                <div className="overflow-hidden max-h-0 group-data-[expanded=true]/sidebar:max-h-6 opacity-0 group-data-[expanded=true]/sidebar:opacity-100 transition-all duration-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-butter-cream/60 px-3.5 block mb-1 whitespace-nowrap">
                    Governance
                  </span>
                </div>
                <Link
                  href="/admin"
                  title="Admin Console"
                  aria-label="Admin Console"
                  className={cn(
                    "flex items-center h-10 rounded-xl font-semibold text-sm transition-all duration-200 group relative",
                    pathname.startsWith("/admin")
                      ? "bg-amber-400 text-green-dark shadow-md font-bold"
                      : "text-amber-300 hover:bg-green-mid/50 hover:text-amber-200 border border-amber-400/20 bg-green-deep/40"
                  )}
                >
                  <div className="w-[48px] shrink-0 flex items-center justify-center">
                    <ShieldCheck
                      className={cn(
                        "w-4 h-4 stroke-[2] shrink-0",
                        pathname.startsWith("/admin")
                          ? "text-green-dark"
                          : "text-amber-400 group-hover:text-amber-300"
                      )}
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-between pr-3 min-w-0 overflow-hidden opacity-0 group-data-[expanded=true]/sidebar:opacity-100 transition-opacity duration-200">
                    <span className="truncate whitespace-nowrap">Admin Console</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-green-dark shrink-0 ml-1">
                      Admin
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Pinned Section: Analytics, Settings & User Profile */}
        <div className="p-3 space-y-3 shrink-0 bg-green-dark">
          {/* Pinned Bottom Nav Items (Analytics & Settings) */}
          <nav className="space-y-1.5">
            {BOTTOM_NAV_ITEMS.map(renderNavLink)}
          </nav>

          {/* User Profile Card with Sign Out Button */}
          <div className="flex flex-col group-data-[expanded=true]/sidebar:flex-row items-center justify-between p-2 rounded-xl bg-green-deep/50 border border-green-mid/30 gap-2 group-data-[expanded=true]/sidebar:gap-2 transition-all duration-200">
            <div className="flex items-center gap-2.5 min-w-0 w-full group-data-[expanded=true]/sidebar:w-auto justify-center group-data-[expanded=true]/sidebar:justify-start">
              <div
                className="w-7 h-7 rounded-lg bg-butter-cream text-green-dark font-black text-xs flex items-center justify-center shrink-0"
                title={displayName}
                aria-label={displayName}
              >
                {initials}
              </div>
              <div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 group-data-[expanded=true]/sidebar:opacity-100 max-w-0 group-data-[expanded=true]/sidebar:max-w-[130px] transition-all duration-200">
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
              aria-label="Log out of account"
              className="p-1.5 rounded-lg text-text-onDarkSub/80 hover:text-red-300 hover:bg-green-mid/60 transition-colors shrink-0 cursor-pointer flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
