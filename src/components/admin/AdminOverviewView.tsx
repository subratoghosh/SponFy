"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  UserCheck,
  Activity,
  FolderKanban,
  CheckCircle2,
  Archive,
  Building2,
  Send,
  Inbox,
  ThumbsUp,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import { AdminOverviewMetrics, AuditLogEntry } from "@/types";
import { AdminHeader } from "./AdminHeader";
import { KPISkeleton } from "@/components/skeletons/KPISkeleton";

interface Props {
  initialMetrics: AdminOverviewMetrics;
  initialAuditLogs: AuditLogEntry[];
  adminUser?: any;
}

const TIME_RANGES = [
  { id: "24h", label: "24 Hours" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "all", label: "All Time" },
];

export function AdminOverviewView({
  initialMetrics,
  initialAuditLogs,
  adminUser,
}: Props) {
  const [range, setRange] = useState("30d");
  const [metrics, setMetrics] = useState<AdminOverviewMetrics>(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<"users" | "campaigns" | "outreach" | "audit">("users");
  const [showAuditTrail, setShowAuditTrail] = useState(true);
  const [showSecurityCard, setShowSecurityCard] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  const handleRangeChange = async (newRange: string) => {
    setRange(newRange);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/metrics?range=${newRange}&type=overview`);
      if (!res.ok) throw new Error("Failed to load metrics");
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update metrics");
    } finally {
      setLoading(false);
    }
  };

  const domainTabs = [
    { id: "users", label: "Users & Accounts", icon: Users },
    { id: "campaigns", label: "Campaigns & Funds", icon: FolderKanban },
    { id: "outreach", label: "Outreach & Delivery", icon: Send },
    { id: "audit", label: "Security & Audits", icon: ShieldAlert },
  ];

  const kpiGroups = [
    {
      title: "User Population & Engagement",
      description: "Platform adoption, newly onboarded organizers, and qualifying active users.",
      cards: [
        {
          label: "Total Registered Users",
          value: metrics.totalUsers,
          delta: metrics.usersDelta,
          icon: Users,
          hint: "All organizer and admin accounts created on SponFy",
        },
        {
          label: "New Registrations",
          value: metrics.newUsers,
          delta: metrics.usersDelta,
          icon: UserPlus,
          hint: `Accounts registered in the selected ${range} window`,
        },
        {
          label: "Active Users",
          value: metrics.activeUsers,
          icon: UserCheck,
          hint: "Users with qualifying activity (campaign, discovery, outreach) in period",
        },
        {
          label: "Active App Sessions",
          value: metrics.activeSessions,
          icon: Activity,
          isEstimate: true,
          hint: "Users with app activity in the last 60 minutes (heartbeat-based)",
        },
      ],
    },
    {
      title: "Campaign Operations",
      description: "Sponsorship campaigns organized across events and organizations.",
      cards: [
        {
          label: "Total Campaigns",
          value: metrics.totalCampaigns,
          delta: metrics.campaignsDelta,
          icon: FolderKanban,
          hint: "Cumulative sponsorship campaigns created on the platform",
        },
        {
          label: "Active Campaigns",
          value: metrics.activeCampaigns,
          icon: CheckCircle2,
          hint: "Campaigns currently soliciting brand partners",
        },
        {
          label: "Archived / Concluded",
          value: metrics.completedCampaigns,
          icon: Archive,
          hint: "Finished or historically archived campaigns",
        },
        {
          label: "Discovered Sponsors",
          value: metrics.totalSponsorsDiscovered,
          icon: Building2,
          hint: `Sponsor companies added across all campaigns in the selected ${range} window`,
        },
      ],
    },
    {
      title: "Outreach & Deal Pipeline",
      description: "Email pitch volume, response rates, and confirmed brand sponsors.",
      cards: [
        {
          label: "Emails Sent",
          value: metrics.totalEmailsSent,
          delta: metrics.outreachDelta,
          icon: Send,
          hint: `Outreach emails sent to sponsor contacts in the selected ${range} window`,
        },
        {
          label: "Replies Received",
          value: metrics.totalRepliesReceived,
          icon: Inbox,
          hint: `Inbound sponsor responses received in the selected ${range} window`,
        },
        {
          label: "Positive Responses",
          value: metrics.positiveResponses,
          icon: ThumbsUp,
          hint: `Replies in the selected ${range} window showing interest or requesting a meeting`,
        },
        {
          label: "Confirmed Sponsorships",
          value: metrics.confirmedSponsorships,
          icon: Award,
          hint: "Formally closed and contracted brand sponsorship packages",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF4E6]">
      <AdminHeader
        adminUser={adminUser}
        title="Administrative Overview"
        subtitle="Platform-wide KPIs, live system metrics, and audit logging."
      />

      <div className="px-4 pt-5 pb-28 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* Top Controls Bar: Domain Navigation Tabs & Time Window Filter */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-3 sm:p-4 shadow-xs space-y-4 sm:space-y-3">
          {/* Domain Category Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap w-full sm:w-auto pb-1 sm:pb-0 touch-pan-x">
              {domainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedDomain === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedDomain(tab.id as any)}
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0C382E] text-white shadow-xs"
                        : "text-neutral-600 hover:text-[#0C382E] hover:bg-[#FAF4E6]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Option Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAuditTrail(!showAuditTrail)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors border ${
                  showAuditTrail
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-neutral-50 text-neutral-500 border-neutral-200"
                }`}
                title="Toggle Audit Log visibility"
              >
                Audit Trail: {showAuditTrail ? "On" : "Off"}
              </button>

              <button
                onClick={() => setIsCompact(!isCompact)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors border ${
                  isCompact
                    ? "bg-[#FFF0B3] text-[#0C382E] border-[#0C382E]/20"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200"
                }`}
              >
                Density: {isCompact ? "Compact" : "Comfortable"}
              </button>
            </div>
          </div>

          {/* Time Window Filter & Realtime Telemetry Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0C382E]" />
                <span className="text-xs font-bold text-[#0C382E] uppercase tracking-wider">
                  Window
                </span>
              </div>
              <div className="flex max-w-full overflow-x-auto no-scrollbar bg-[#FAF4E6] p-0.5 rounded-xl border border-[#0C382E]/10">
                {TIME_RANGES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleRangeChange(t.id)}
                    disabled={loading}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 sm:px-2.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      range === t.id
                        ? "bg-[#0C382E] text-white shadow-xs"
                        : "text-neutral-600 hover:text-[#0C382E]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              {loading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0C382E]" />
                  Telemetry updating...
                </span>
              )}
              <Link
                href="/admin/analytics"
                className="inline-flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl bg-[#FFF0B3] text-[#0C382E] font-bold text-xs hover:bg-[#FFF0B3]/80 transition-all border border-[#0C382E]/10"
              >
                <span>Analytics Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => handleRangeChange(range)}
              className="underline font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic KPI Cards filtered by selected domain */}
        {kpiGroups
          .filter((_, gIdx) => {
            if (selectedDomain === "users" && gIdx === 0) return true;
            if (selectedDomain === "campaigns" && gIdx === 1) return true;
            if (selectedDomain === "outreach" && gIdx === 2) return true;
            return false;
          })
          .map((group, gIdx) => (
            <section key={gIdx} className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0C382E] tracking-tight">
                    {group.title}
                  </h2>
                  {!isCompact && <p className="text-xs text-neutral-500">{group.description}</p>}
                </div>
              </div>

              {loading ? (
                <KPISkeleton count={4} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.cards.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className={`bg-white rounded-2xl border border-[#0C382E]/10 shadow-xs hover:shadow-md transition-all group relative overflow-hidden ${
                        isCompact ? "p-3.5" : "p-5"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                          {card.label}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-[#FAF4E6] text-[#0C382E] flex items-center justify-center group-hover:bg-[#0C382E] group-hover:text-[#FFF0B3] transition-colors">
                          <card.icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-[#0C382E] tracking-tight">
                          {card.value.toLocaleString()}
                        </span>

                        {card.delta !== undefined && (
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              card.delta >= 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {card.delta >= 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {card.delta > 0 ? `+${card.delta}%` : `${card.delta}%`}
                          </span>
                        )}

                        {card.isEstimate && (
                          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Estimate
                          </span>
                        )}
                      </div>

                      {!isCompact && (
                        <p className="text-[11px] text-neutral-500 mt-2 line-clamp-1 flex items-center gap-1">
                          <Info className="w-3 h-3 shrink-0 text-neutral-400" />
                          <span>{card.hint}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

        {/* Operational Security & Audit Activity Grid */}
        {selectedDomain === "audit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Recent Audit Feed */}
            {showAuditTrail && (
              <div className={`${showSecurityCard ? "lg:col-span-2" : "lg:col-span-3"} bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4`}>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0C382E] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#0C382E]" />
                      <span>Administrative Audit Trail</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Immutable event log of sensitive operations (suspensions, roles, account actions).
                    </p>
                  </div>
                  <Link
                    href="/admin/activity"
                    className="text-xs font-bold text-[#0C382E] hover:underline flex items-center gap-1"
                  >
                    <span>Full Audit Log</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {initialAuditLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No administrative actions logged yet.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {initialAuditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="py-3 flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF4E6] text-[#0C382E] border border-[#0C382E]/10">
                              {log.action}
                            </span>
                            <span className="text-neutral-500">
                              target: <strong className="text-neutral-800">{log.targetType}/{log.targetId}</strong>
                            </span>
                          </div>
                          <div className="text-neutral-500 text-[11px]">
                            Performed by: <strong className="text-[#0C382E]">{log.adminName || log.adminEmail || log.adminId}</strong>
                          </div>
                        </div>
                        <time className="text-[11px] text-neutral-400 font-mono shrink-0">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Platform Security & Health Card */}
            {showSecurityCard && (
              <div className={`${showAuditTrail ? "lg:col-span-1" : "lg:col-span-3"} bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs flex flex-col justify-between space-y-4`}>
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Security Profile
                  </span>
                  <h3 className="text-base font-bold text-[#0C382E]">
                    Platform Governance & RLS
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    All tenant boundaries enforced at database level via strict tenant data isolation. Administrative actions are verified server-side with zero client-side credential exposure.
                  </p>

                  <div className="p-3 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Role Enforcement:</span>
                      <span className="font-bold text-[#0C382E]">Server-Side Guarded</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Audit Storage:</span>
                      <span className="font-bold text-[#0C382E]">AuditLog Model</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Service Key Status:</span>
                      <span className="font-bold text-emerald-700">Protected (Backend Only)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/admin/users"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C382E] text-white text-xs font-bold hover:bg-[#0C382E]/90 transition-all shadow-sm"
                  >
                    <span>Manage Users & Roles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
