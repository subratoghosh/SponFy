"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { KPIRow } from "./KPIRow";
import { TodayActionQueue } from "./TodayActionQueue";
import { Button } from "@/components/ui/button";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

export interface OrganiserCampaignProgress {
  id: string;
  name: string;
  eventType: string;
  location: string;
  audienceSize: number;
  targetAmount: number;
  committedAmount: number;
  progressPercent: number;
  totalSponsors: number;
}

export interface OrganiserTeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  designation?: string | null;
  collegeOrCompany?: string | null;
  role: "ORGANISER" | "EXECUTIVE";
  isOwner?: boolean;
  joinedAt: string;
}

export interface OrganiserPendingRequest {
  id: string;
  requesterName: string;
  requesterEmail?: string;
  requesterImage?: string | null;
  designation?: string | null;
  collegeOrCompany?: string | null;
  requestedRole: string;
  campaignName: string;
  campaignId: string;
  message?: string | null;
  roleInTeam?: string | null;
  whyJoin?: string | null;
  createdAt: string;
}

export interface OrganiserDashboardProps {
  organisation: {
    id: string;
    name: string;
    type: string;
    city?: string | null;
    website?: string | null;
    description?: string | null;
  };
  campaigns: OrganiserCampaignProgress[];
  activeCampaignId?: string;
  summary: {
    totalSponsors: number;
    qualifiedCount: number;
    sentEmails: number;
    repliesCount: number;
    overallReplyRate: number;
    positiveReplyRate: number;
    meetingCount: number;
    negotiationsCount: number;
    committedCount: number;
    committedAmount: number;
    pipelineAmount: number;
    targetAmount: number;
  };
  pendingRequests: OrganiserPendingRequest[];
  teamMembers: OrganiserTeamMember[];
  actionQueue: any[];
}

function timeAgo(dateString: string): string {
  try {
    const past = new Date(dateString).getTime();
    const now = Date.now();
    const diffMins = Math.max(1, Math.round((now - past) / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

export function OrganiserDashboardView({
  organisation,
  campaigns,
  activeCampaignId = "all",
  summary,
  pendingRequests,
  teamMembers,
  actionQueue,
}: OrganiserDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    searchParams.get("campaignId") || activeCampaignId
  );
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setSwitcherOpen(false);
    if (id === "all") {
      router.push("/app");
    } else {
      router.push(`/app?campaignId=${encodeURIComponent(id)}`);
    }
  };

  const selectedCampaign =
    selectedCampaignId === "all"
      ? null
      : campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Header with Organisation Info & Campaign Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-dark/12 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-dark/10 text-green-dark text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-green-mid" />
              <span>Organisation Workspace</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-butter-warm text-green-dark text-xs font-extrabold border border-green-dark/10">
              {organisation.type || "Club / Society"}
            </span>
            {organisation.city && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-dim">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                {organisation.city}
              </span>
            )}
            {organisation.website && (
              <a
                href={
                  organisation.website.startsWith("http")
                    ? organisation.website
                    : `https://${organisation.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-green-accent hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
            {organisation.name}
          </h1>

          {organisation.description && (
            <p className="text-xs sm:text-sm text-text-dim max-w-2xl leading-relaxed">
              {organisation.description}
            </p>
          )}
        </div>

        {/* Right side: Campaign Switcher & Manage Team CTA */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Campaign Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-butter-cream hover:bg-butter-warm text-green-dark rounded-2xl border border-green-dark/15 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Target className="w-4 h-4 text-green-mid shrink-0" />
              <span className="max-w-[180px] sm:max-w-[220px] truncate text-left">
                {selectedCampaign ? selectedCampaign.name : "All Campaigns (Aggregated)"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
            </button>

            {switcherOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSwitcherOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-green-dark/15 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                    Switch Campaign View
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCampaign("all")}
                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-butter-warm/60 cursor-pointer ${
                      selectedCampaignId === "all"
                        ? "text-green-dark bg-butter-warm/40 font-extrabold"
                        : "text-text-dim"
                    }`}
                  >
                    <span>All Campaigns (Aggregated)</span>
                    <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-bold">
                      {campaigns.length}
                    </span>
                  </button>

                  <div className="my-1 border-t border-green-dark/10" />

                  <div className="max-h-56 overflow-y-auto">
                    {campaigns.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCampaign(c.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-butter-warm/60 cursor-pointer ${
                          selectedCampaignId === c.id
                            ? "bg-butter-warm/40 text-green-dark font-bold"
                            : "text-text-dim"
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[10px] text-text-muted">
                          {c.eventType} • {formatCurrencyINR(c.targetAmount)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="my-1 border-t border-green-dark/10" />

                  <Link
                    href="/onboarding/organiser"
                    className="w-full text-left px-3 py-2 text-xs font-bold text-green-accent hover:bg-butter-warm/60 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Launch New Campaign</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          <Link href="/app/team">
            <Button
              variant="butter"
              size="sm"
              className="font-bold shadow-xs flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-green-dark" />
              <span>Team & Requests</span>
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Aggregated KPI Row */}
      <div className="animate-fade-in">
        <KPIRow summary={summary} />
      </div>

      {/* 3. Organiser Panels: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Action Queue & Campaigns Progress */}
        <div className="lg:col-span-8 space-y-6">
          {/* Action Queue */}
          <TodayActionQueue items={actionQueue} />

          {/* Campaigns Progress to Target */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-xl text-green-dark tracking-tight">
                  Organisation Campaigns
                </h2>
                <p className="text-xs text-text-dim mt-0.5">
                  Track goal progress, target funding, and prospect health for your events.
                </p>
              </div>
              <Link href="/onboarding/organiser">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-green-accent hover:bg-butter-warm/80 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New Campaign
                </Button>
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-8 bg-butter-panel/40 rounded-2xl border border-dashed border-green-dark/15 p-6">
                <Target className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-60" />
                <p className="text-sm font-bold text-green-dark">No active campaigns yet</p>
                <p className="text-xs text-text-dim mt-1 max-w-sm mx-auto">
                  Create your organisation&apos;s first campaign to start discovering sponsors and pitching deals.
                </p>
                <Link href="/onboarding/organiser" className="inline-block mt-4">
                  <Button variant="butter" size="sm" className="font-bold">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-5 rounded-2xl bg-butter-cream/40 border border-green-dark/10 hover:border-green-dark/25 transition space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-green-accent">
                          {camp.eventType}
                        </span>
                        <h3 className="font-heading font-black text-base text-green-dark truncate">
                          {camp.name}
                        </h3>
                        <p className="text-xs text-text-dim">
                          {camp.location} • {formatNumber(camp.audienceSize)} attendees
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-green-100 text-green-800 border border-green-300 shrink-0">
                        {camp.progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-butter-warm rounded-full overflow-hidden p-0.5 border border-green-dark/10">
                        <div
                          className="h-full bg-gradient-to-r from-green-mid to-green-600 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, camp.progressPercent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-text-dim">
                        <span>{formatCurrencyINR(camp.committedAmount)} committed</span>
                        <span className="text-text-muted">Target: {formatCurrencyINR(camp.targetAmount)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-green-dark/10 flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-dim">
                        <strong>{camp.totalSponsors}</strong> sponsors in pipeline
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectCampaign(camp.id)}
                        className="text-xs font-bold text-green-accent hover:underline cursor-pointer"
                      >
                        Filter Overview →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Pending Requests & Team Avatars */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top 3 Pending Access Requests */}
          <div className="bg-white rounded-3xl p-6 border border-green-dark/12 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-green-mid" />
                <h3 className="font-heading font-black text-base text-green-dark">
                  Access Requests
                </h3>
              </div>
              <Link
                href="/app/team"
                className="text-xs font-bold text-green-accent hover:underline"
              >
                View all ({pendingRequests.length})
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 rounded-2xl bg-butter-panel/40 border border-dashed border-green-dark/10 text-center py-6">
                <UserCheck className="w-6 h-6 text-green-mid mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-bold text-green-dark">All requests cleared</p>
                <p className="text-[11px] text-text-dim mt-0.5">
                  No pending member requests awaiting your review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-butter-cream/50 border border-green-dark/10 hover:border-green-dark/20 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-green-dark text-butter-cream flex items-center justify-center font-black text-xs shrink-0">
                          {req.requesterName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-dark truncate max-w-[140px]">
                            {req.requesterName}
                          </p>
                          <p className="text-[10px] text-text-dim truncate max-w-[140px]">
                            {req.designation || req.collegeOrCompany || "Team applicant"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                        {req.requestedRole}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-dim leading-snug line-clamp-2">
                      {req.message || req.whyJoin || "Wants to join the campaign organisation team."}
                    </p>

                    <div className="pt-2 border-t border-green-dark/10 flex items-center justify-between text-[10px] text-text-muted">
                      <span className="truncate max-w-[130px] font-semibold">
                        {req.campaignName}
                      </span>
                      <span>{timeAgo(req.createdAt)}</span>
                    </div>

                    <Link href="/app/team" className="block pt-1">
                      <Button
                        variant="butter"
                        size="sm"
                        className="w-full text-xs font-bold py-1.5 h-auto"
                      >
                        Review in Team Inbox
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Team Avatars Panel */}
          <div className="bg-white rounded-3xl p-6 border border-green-dark/12 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-mid" />
                <h3 className="font-heading font-black text-base text-green-dark">
                  Core Team ({teamMembers.length})
                </h3>
              </div>
              <Link
                href="/app/team"
                className="text-xs font-bold text-green-accent hover:underline"
              >
                Manage
              </Link>
            </div>

            {teamMembers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-butter-panel/40 border border-dashed border-green-dark/10 text-center py-4">
                <p className="text-xs text-text-dim">No members recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {teamMembers.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-butter-cream/60 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-green-dark/10 text-green-dark border border-green-dark/15 flex items-center justify-center font-black text-xs shrink-0">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-green-dark truncate">
                          {m.name} {m.isOwner && <span className="text-[10px] text-green-accent font-extrabold">(Owner)</span>}
                        </p>
                        <p className="text-[10px] text-text-dim truncate">
                          {m.designation || m.collegeOrCompany || m.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        m.role === "ORGANISER"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-purple-100 text-purple-800 border border-purple-300"
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-green-dark/10">
              <Link href="/app/team">
                <button
                  type="button"
                  className="w-full text-center text-xs font-bold text-green-dark hover:text-green-accent transition py-1 cursor-pointer"
                >
                  Open Team Management →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
