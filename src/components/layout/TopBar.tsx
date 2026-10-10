"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FolderKanban,
  Mail,
  CheckCircle2,
  ChevronDown,
  User,
  Plus,
  LogOut,
  Settings,
  Sparkles,
  ShieldCheck,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { Campaign } from "@/types";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

export const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const campaignRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCampaigns().then((data) => {
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0]);
      } else {
        setSelectedCampaign(null);
      }
    });
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) {
        setCampaignDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="h-16 bg-butter-panel/90 backdrop-blur-md border-b border-green-dark/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Brand & Campaign Switcher */}
      <div className="flex items-center gap-3">
        {/* Mobile-only logo */}
        <div className="lg:hidden">
          <SponfyBrand href="/" size="sm" theme="light" />
        </div>

        {/* Campaign Switcher */}
        <div className="relative" ref={campaignRef}>
          <button
            onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-green-dark/15 hover:border-green-dark/30 transition-colors shadow-sm text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-butter-cream flex items-center justify-center text-green-dark font-bold text-xs shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block leading-none">
                Active Campaign
              </span>
              <span className="text-xs font-bold text-green-dark truncate max-w-[180px] block mt-0.5">
                {selectedCampaign?.name || (campaigns.length === 0 ? "No Active Campaign" : "Select Campaign")}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted ml-1" />
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
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Workspace Mode Badge */}
        {isDemo ? (
          <span className="px-2.5 py-1 rounded-full bg-butter-cream text-green-dark border border-butter-gold text-[11px] font-bold tracking-wide shadow-2xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span className="hidden xs:inline">Demo Mode</span>
            <span className="xs:hidden">Demo</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold tracking-wide shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden xs:inline">Live Workspace</span>
            <span className="xs:hidden">Live</span>
          </span>
        )}

        {/* User Profile Dropdown Button */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-2xl hover:bg-white/80 border border-transparent hover:border-green-dark/10 transition-all cursor-pointer"
            aria-label="User profile and account settings"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-dark text-butter-cream flex items-center justify-center font-black text-xs shadow-sm hover:ring-2 hover:ring-butter-cream transition-all shrink-0">
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
            <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-dropdown border border-green-dark/15 p-3 z-50 animate-fade-in space-y-3">
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
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-dark/10 text-green-dark">
                      {(user as any)?.role || (isDemo ? "DEMO" : "ORGANIZER")}
                    </span>
                    {(user as any)?.orgName && (
                      <span className="text-[10px] text-text-dim truncate font-medium">
                        • {(user as any).orgName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 pt-1 text-xs font-bold text-green-dark">
                <Link
                  href="/app/campaigns"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-butter-warm/60 transition-colors"
                >
                  <FolderKanban className="w-4 h-4 text-green-mid" />
                  <span>Campaign Initiatives</span>
                </Link>
                <Link
                  href="/app/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-butter-warm/60 transition-colors"
                >
                  <Settings className="w-4 h-4 text-green-mid" />
                  <span>Settings & Preferences</span>
                </Link>
                {!isDemo && (
                  <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PostgreSQL Database Active</span>
                  </div>
                )}
              </div>

              {/* Divider & Sign Out */}
              <div className="border-t border-green-dark/10 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setProfileDropdownOpen(false);
                    await signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </span>
                  <span className="text-[10px] text-red-400 font-normal">Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
