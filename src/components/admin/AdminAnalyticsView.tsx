"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Users,
  Activity,
  Filter,
  RefreshCw,
  FolderKanban,
  Award,
  Layers,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { AdminAnalyticsData } from "@/types";
import { AdminHeader } from "./AdminHeader";
import { formatCurrencyINR } from "@/lib/utils";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";

interface Props {
  initialData: AdminAnalyticsData;
  adminUser?: any;
}

const TIME_RANGES = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "all", label: "All Time" },
];

const BRAND_COLORS = ["#0C382E", "#2D6A4F", "#D4A373", "#CCD5AE", "#E76F51", "#52B788"];

export function AdminAnalyticsView({ initialData, adminUser }: Props) {
  const [data, setData] = useState<AdminAnalyticsData>(initialData);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(false);

  const handleRangeChange = async (newRange: string) => {
    setRange(newRange);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?range=${newRange}&type=analytics`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load analytics range:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4E6]">
      <AdminHeader
        adminUser={adminUser}
        title="Platform Analytics"
        subtitle="Aggregated platform growth, session activity, campaign status, and outreach funnel."
      />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0C382E]" />
            <span className="text-xs font-bold text-[#0C382E] uppercase tracking-wider">
              Timeframe:
            </span>
            <div className="flex bg-[#FAF4E6] p-1 rounded-xl border border-[#0C382E]/10">
              {TIME_RANGES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleRangeChange(t.id)}
                  disabled={loading}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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

          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0C382E]" />
              Aggregating live datasets...
            </span>
          )}
        </div>

        {/* Row 1: User Growth & Daily Registrations */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton title="Loading Population Trends" height="h-64" />
            <ChartSkeleton title="Loading Acquisition Velocity" height="h-64" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Over Time */}
            <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0C382E]">
                    Population Trend
                  </span>
                  <span className="text-xs text-neutral-400">Monthly cumulative</span>
                </div>
                <h3 className="text-base font-bold text-[#0C382E]">
                  Total Registered & Active Organizers
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0C382E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0C382E" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="activeGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4A373" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#D4A373" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0C382E",
                        color: "#FFF",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Area type="monotone" dataKey="users" name="Total Users" stroke="#0C382E" strokeWidth={2.5} fill="url(#userGrowthGrad)" />
                    <Area type="monotone" dataKey="active" name="Active Users" stroke="#D4A373" strokeWidth={2} fill="url(#activeGrowthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Registrations By Day */}
            <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0C382E]">
                    Acquisition Velocity
                  </span>
                  <span className="text-xs text-neutral-400">Daily breakdown</span>
                </div>
                <h3 className="text-base font-bold text-[#0C382E]">
                  New Registrations per Day
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.registrationsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0C382E",
                        color: "#FFF",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" name="Signups" fill="#0C382E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Session Activity & Outreach Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Activity Trends */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Telemetry Estimate
                </span>
                <span className="text-xs text-neutral-400">Heartbeat derived</span>
              </div>
              <h3 className="text-base font-bold text-[#0C382E]">
                App Sessions & Mean Duration (Minutes)
              </h3>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sessionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C382E",
                      color: "#FFF",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line type="monotone" dataKey="sessions" name="Daily Sessions" stroke="#0C382E" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avgDurationMinutes" name="Avg Duration (min)" stroke="#2D6A4F" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outreach Conversion Funnel */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C382E]">
                  Pipeline Efficiency
                </span>
                <span className="text-xs text-neutral-400">Discovered to Closed</span>
              </div>
              <h3 className="text-base font-bold text-[#0C382E]">
                Sponsorship Deal Funnel
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              {data.outreachFunnel.map((stage, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0C382E]">{stage.count} sponsors</span>
                      <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stage.percentage}%`,
                        backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Industry Performance & Top Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Industry Performance */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0C382E]">
              Industry Reply & Conversion Rates
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2">Industry</th>
                    <th className="pb-2">Sponsors</th>
                    <th className="pb-2">Reply Rate</th>
                    <th className="pb-2">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.industryPerformance.map((ind, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 font-bold text-[#0C382E]">{ind.industry}</td>
                      <td className="py-2.5 text-neutral-600">{ind.sponsorsCount}</td>
                      <td className="py-2.5 font-mono text-emerald-700 font-bold">{ind.replyRate}%</td>
                      <td className="py-2.5 font-mono text-[#0C382E] font-bold">{ind.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Campaigns by Outcomes */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0C382E]">
              Top Campaigns by Sponsorship Volume
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2">Campaign</th>
                    <th className="pb-2">Owner</th>
                    <th className="pb-2">Sponsors</th>
                    <th className="pb-2">Committed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.topCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 font-bold text-[#0C382E]">{camp.name}</td>
                      <td className="py-2.5 text-neutral-500">{camp.ownerName}</td>
                      <td className="py-2.5 text-neutral-600 font-bold">{camp.sponsorsCount}</td>
                      <td className="py-2.5 font-bold text-emerald-700">
                        {formatCurrencyINR(camp.committedAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
