"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FolderKanban,
  CheckCircle2,
  ChevronDown,
  Plus,
  LogOut,
  Settings,
  ShieldCheck,
  Compass,
  Clock,
  BarChart3,
  Download,
} from "lucide-react";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { Campaign } from "@/types";
import { SponfyBrand } from "@/components/ui/SponfyBrand";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS } from "@/lib/config/nav";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

const MOBILE_DROPDOWN_LABELS = ["Campaigns", "Follow-ups", "Analytics", "Settings"] as const;

const NAV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderKanban,
  Compass,
  Clock,
  BarChart3,
  Settings,
};

const mobileNavItems = MOBILE_DROPDOWN_LABELS.map(
  (label) => MAIN_NAV_ITEMS.find((item) => item.label === label)!
).filter(Boolean);

export const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const campaignRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const refreshCampaigns = useCallback(() => {
    getCampaigns().then((data) => {
      const isDemo = !session?.user || session.user.email === "demo@sponfy.dev";
      const cleanData = isDemo
        ? data
        : data.filter((c) => c.name !== "SponFy Hackathon 2026" && c.name !== "SponFy Flagship Campaign 2026" && c.id !== "camp-demo-1" && c.id !== "camp-sponfy-2026");
      setCampaigns(cleanData);
      if (cleanData.length > 0) {
        setSelectedCampaign((prev) => {
          if (prev && cleanData.some((c) => c.id === prev.id)) {
            return cleanData.find((c) => c.id === prev.id) || cleanData[0];
          }
          return cleanData[0];
        });
      } else {
        setSelectedCampaign(null);
      }
    });
  }, [session]);

  useEffect(() => {
    refreshCampaigns();
    const handleCampaignsUpdated = () => refreshCampaigns();
    window.addEventListener("sponfy:campaigns-updated", handleCampaignsUpdated);
    return () => {
      window.removeEventListener("sponfy:campaigns-updated", handleCampaignsUpdated);
    };
  }, [refreshCampaigns]);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) {
        setCampaignDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCampaignDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const user = session?.user;
  const isDemo = !user || user.email === "demo@sponfy.dev";
  const isAdmin =
    !isDemo &&
    ((user as any)?.role === "ADMIN" ||
      user?.email === "admin@sponfy.dev");
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
    <header className="h-16 bg-butter-panel/90 backdrop-blur-md border-b border-green-dark/10 px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-30">
      {/* Left: Mobile Brand & Campaign Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile-only logo */}
        <div className="lg:hidden shrink-0">
          <SponfyBrand href="/" size="sm" theme="light" />
        </div>

        {/* Campaign Switcher */}
        <div className="relative min-w-0" ref={campaignRef}>
          <button
            onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white border border-green-dark/15 hover:border-green-dark/30 transition-colors shadow-sm text-left cursor-pointer min-w-0 max-w-[110px] xs:max-w-[140px] sm:max-w-[200px]"
            title={selectedCampaign?.name || "Active Campaign"}
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-butter-cream flex items-center justify-center text-green-dark font-bold text-xs shrink-0">
              <FolderKanban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block leading-none">
                Active Campaign
              </span>
              <span className="text-xs font-bold text-green-dark truncate max-w-[180px] block mt-0.5">
                {selectedCampaign?.name || (campaigns.length === 0 ? "No Active Campaign" : "Select Campaign")}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0 ml-0.5 sm:ml-1" />
          </button>

          {/* Campaign Dropdown */}
          {campaignDropdownOpen && (
            <div className="absolute top-12 left-0 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-white rounded-2xl shadow-dropdown border border-green-dark/15 p-2 z-50 animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 py-1.5 block">
                Your Campaigns
              </span>
              {campaigns.length === 0 ? (
                <div className="px-3 py-3 text-xs text-text-muted text-center space-y-2">
                  <p>No campaigns created yet.</p>
                  <Link
                    href="/app/campaigns"
                    onClick={() => setCampaignDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark bg-butter-cream px-3 py-1.5 rounded-lg hover:bg-butter-gold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Campaign
                  </Link>
                </div>
              ) : (
                <>
                  {campaigns.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCampaign(c);
                        setCampaignDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-green-dark hover:bg-butter-warm/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate">{c.name}</span>
                      {selectedCampaign?.id === c.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-green-dark/10 my-1 pt-1">
                    <Link
                      href="/app/campaigns"
                      onClick={() => setCampaignDropdownOpen(false)}
                      className="w-full px-3 py-2 text-xs font-bold text-green-dark hover:text-green-mid flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Campaign
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Mode Badge & Interactive User Profile Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Admin Console Quick Button */}
        {isAdmin && (
          <Link
            href="/admin"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 text-[11px] font-bold tracking-wide shadow-2xs flex items-center gap-1.5 transition-all shrink-0"
            title="Open Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}

        {/* Workspace Mode Badge */}
        {isDemo ? (
          <span className="px-2 py-1 sm:px-2.5 rounded-full bg-butter-cream text-green-dark border border-butter-gold text-[10px] sm:text-[11px] font-bold tracking-wide shadow-2xs flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
            <span className="hidden sm:inline">Demo Mode</span>
            <span className="sm:hidden hidden min-[380px]:inline">Demo</span>
          </span>
        ) : (
          <span className="px-2 py-1 sm:px-2.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-2xs flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="hidden min-[380px]:inline">Workspace</span>
          </span>
        )}

        {/* User Profile Dropdown Button */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 p-0.5 sm:px-2 sm:py-1 rounded-full sm:rounded-2xl hover:bg-white/80 border border-transparent hover:border-green-dark/10 transition-all cursor-pointer"
            aria-label="User profile and account settings"
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-green-dark text-butter-cream flex items-center justify-center font-black text-xs shadow-sm hover:ring-2 hover:ring-butter-cream transition-all shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left pr-1">
              <span className="text-xs font-extrabold text-green-dark block leading-none truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-text-muted truncate block max-w-[120px] mt-0.5">
                {displayEmail || "Organizer"}
              </span>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-text-muted" />
          </button>

          {/* User Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div
              role="menu"
              aria-label="User profile and account settings"
              className="absolute top-12 right-0 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-dropdown border border-green-dark/15 p-3 z-50 animate-fade-in space-y-2"
            >
              {/* Profile Card Header */}
              <div className="p-3 rounded-xl bg-butter-bg/60 border border-green-dark/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-dark text-butter-cream flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-xs text-green-dark truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-text-muted truncate">
                    {displayEmail || "demo@sponfy.dev"}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                        isAdmin
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-green-dark/10 text-green-dark"
                      )}
                    >
                      {isAdmin ? "ADMIN" : (user as any)?.role || (isDemo ? "DEMO" : "ORGANIZER")}
                    </span>
                    {(user as any)?.orgName && (
                      <span className="text-[10px] text-text-dim truncate font-medium">
                        • {(user as any).orgName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile-only Navigation Links (missing from bottom tab bar) */}
              <div className="md:hidden border-t border-green-dark/10 pt-1.5 space-y-1 text-xs font-bold text-green-dark">
                {mobileNavItems.map((item) => {
                  const Icon = NAV_ICON_MAP[item.icon] || Compass;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-butter-warm/60 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-green-mid shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Admin Console Link (Visible for Administrators on Mobile only) */}
              {isAdmin && (
                <div className="md:hidden border-t border-green-dark/10 pt-1.5 text-xs font-bold">
                  <Link
                    href="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Admin Console</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-800">
                      Admin
                    </span>
                  </Link>
                </div>
              )}

              {/* Optional Install App Item */}
              {canInstall && (
                <div className="border-t border-green-dark/10 pt-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      setProfileDropdownOpen(false);
                      await promptInstall();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-green-dark hover:bg-butter-warm/60 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-green-mid shrink-0" />
                    <span>Install app</span>
                  </button>
                </div>
              )}

              {/* Divider & Sign Out */}
              <div className="border-t border-green-dark/10 pt-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setProfileDropdownOpen(false);
                    await signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
