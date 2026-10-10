"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  Filter,
  Archive,
  RotateCcw,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  IndianRupee,
  X,
} from "lucide-react";
import { Campaign } from "@/types";
import { AdminHeader } from "./AdminHeader";
import { formatCurrencyINR } from "@/lib/utils";

interface Props {
  initialCampaigns: Campaign[];
  adminUser?: any;
}

export function AdminCampaignsView({ initialCampaigns, adminUser }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.eventType.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.status !== "archived") ||
      (statusFilter === "archived" && c.status === "archived");

    return matchesSearch && matchesStatus;
  });

  const handleToggleArchive = async (campaign: Campaign) => {
    const isCurrentlyArchived = campaign.status === "archived";
    const nextArchived = !isCurrentlyArchived;
    setLoadingId(campaign.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: nextArchived }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Archive update failed");

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id ? { ...c, status: nextArchived ? "archived" : "active" } : c
        )
      );
      setFeedback({
        type: "success",
        message: `Campaign "${campaign.name}" has been ${nextArchived ? "archived" : "restored"}.`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update campaign" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4E6]">
      <AdminHeader
        adminUser={adminUser}
        title="Campaign Administration"
        subtitle="Platform-wide festival sponsorship campaigns, status oversight, and moderation."
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns, events, locations..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20 text-[#0C382E]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#FAF4E6] border border-[#0C382E]/10 px-3 py-2 rounded-xl text-[#0C382E] font-medium focus:outline-none"
            >
              <option value="all">All Campaign Statuses</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF4E6]/60 border-b border-[#0C382E]/10 text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Target Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400">
                      No campaigns found matching search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF4E6]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0C382E]">{c.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{c.id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {c.eventType}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-neutral-600">{c.location}</td>

                      <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                        {c.audienceSize.toLocaleString()} attendees
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-800 font-mono">
                        {formatCurrencyINR(c.targetAmount)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "archived"
                              ? "bg-neutral-100 text-neutral-600 border border-neutral-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {c.status === "archived" ? "ARCHIVED" : "ACTIVE"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-neutral-400 font-mono">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/app/campaigns`}
                            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
                            title="Inspect in workspace"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleToggleArchive(c)}
                            disabled={loadingId === c.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              c.status === "archived"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {loadingId === c.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : c.status === "archived" ? (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </>
                            ) : (
                              <>
                                <Archive className="w-3 h-3" />
                                <span>Archive</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
