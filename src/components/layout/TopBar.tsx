"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  User,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { Campaign } from "@/types";

import { SponfyBrand } from "@/components/ui/SponfyBrand";

export const TopBar: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getCampaigns().then((data) => {
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0]);
      }
    });
  }, []);

  return (
    <header className="h-16 bg-butter-panel/90 backdrop-blur-md border-b border-green-dark/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Brand & Campaign Switcher */}
      <div className="flex items-center gap-3">
        {/* Mobile-only logo */}
        <div className="lg:hidden">
          <SponfyBrand href="/" size="sm" theme="light" />
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-green-dark/15 hover:border-green-dark/30 transition-colors shadow-sm text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-butter-cream flex items-center justify-center text-green-dark font-bold text-xs shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block leading-none">
                Active Campaign
              </span>
              <span className="text-xs font-bold text-green-dark truncate max-w-[180px] block mt-0.5">
                {selectedCampaign?.name || "SponFy Hackathon 2026"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted ml-1" />
          </button>

          {/* Campaign Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-dropdown border border-green-dark/15 p-2 z-50 animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 py-1.5 block">
                Select Campaign
              </span>
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCampaign(c);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-green-dark hover:bg-butter-warm/60 flex items-center justify-between transition-colors"
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
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-3 py-2 text-xs font-bold text-green-dark hover:text-green-mid flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New Campaign
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Search, Integrations Status, User Profile */}
      <div className="flex items-center gap-3">
        {/* Gmail Status Pill */}
        <Link
          href="/app/settings"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-green-dark/12 text-xs font-semibold text-text-dim hover:bg-butter-warm/40 transition-colors shadow-sm"
        >
          <Mail className="w-3.5 h-3.5 text-green-mid" />
          <span>Gmail:</span>
          <span className="inline-flex items-center gap-1 text-green-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected (Demo)
          </span>
        </Link>

        {/* Demo Mode Badge */}
        <span className="px-2.5 py-1 rounded-full bg-butter-cream text-green-dark border border-butter-gold text-[11px] font-bold tracking-wide shadow-sm">
          Demo Mode
        </span>

        {/* User Avatar Menu Link */}
        <Link
          href="/app/settings"
          className="w-9 h-9 rounded-full bg-green-dark text-butter-cream flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-butter-cream transition-all"
        >
          SG
        </Link>
      </div>
    </header>
  );
};
