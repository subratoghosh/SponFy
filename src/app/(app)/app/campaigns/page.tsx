"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { getCampaigns, deleteCampaign } from "@/lib/data/repositories/campaigns";

const CreateCampaignModal = dynamic(
  () => import("@/components/campaigns/CreateCampaignModal").then((m) => m.CreateCampaignModal),
  { ssr: false }
);
import { Campaign } from "@/types";
import {
  Plus,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  Filter,
  Users,
  MapPin,
  TrendingUp,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/skeletons/CardSkeleton";
import { formatCurrencyINR } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "archived";
type ViewMode = "grid" | "table";

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const loadData = useCallback(() => {
    setLoading(true);
    getCampaigns()
      .then((data) => {
        const isDemo = !session?.user || session.user.email === "demo@sponfy.dev";
        const cleanData = isDemo
          ? data
          : data.filter((c) => c.name !== "SponFy Hackathon 2026" && c.name !== "SponFy Flagship Campaign 2026" && c.id !== "camp-demo-1" && c.id !== "camp-sponfy-2026");
        setCampaigns(cleanData);
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this campaign? This action only removes the campaign from your workspace.")) {
      return;
    }
    const success = await deleteCampaign(id);
    if (success) {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    }
  };

  useEffect(() => {
    loadData();
    const handleCampaignsUpdated = () => loadData();
    window.addEventListener("sponfy:campaigns-updated", handleCampaignsUpdated);
    return () => {
      window.removeEventListener("sponfy:campaigns-updated", handleCampaignsUpdated);
    };
  }, [loadData]);

  const eventTypes = useMemo(() => {
    const types = new Set(campaigns.map((c) => c.eventType).filter(Boolean));
    return Array.from(types);
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      // Status filter
      if (statusFilter !== "all" && camp.status !== statusFilter) return false;
      // Type filter
      if (typeFilter !== "all" && camp.eventType !== typeFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = camp.name.toLowerCase().includes(q);
        const matchType = camp.eventType?.toLowerCase().includes(q);
        const matchLoc = camp.location?.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchLoc) return false;
      }
      return true;
    });
  }, [campaigns, statusFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Manage your campaigns, conferences, and event sponsorship initiatives.
          </p>
        </div>
        <Button
          variant="butter"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="font-bold shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1" /> New Campaign
        </Button>
      </div>

      {/* Interactive Options Bar (Status Filter Buttons + View Toggles + Search) */}
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-green-dark/10 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Status and Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap w-full md:w-auto pb-1 md:pb-0 touch-pan-x">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              statusFilter === "all"
                ? "bg-green-dark text-butter-cream shadow-xs"
                : "text-text-dim hover:text-green-dark hover:bg-butter-warm/60"
            )}
          >
            All ({campaigns.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              statusFilter === "active"
                ? "bg-green-dark text-butter-cream shadow-xs"
                : "text-text-dim hover:text-green-dark hover:bg-butter-warm/60"
            )}
          >
            Active ({campaigns.filter((c) => c.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("archived")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              statusFilter === "archived"
                ? "bg-green-dark text-butter-cream shadow-xs"
                : "text-text-dim hover:text-green-dark hover:bg-butter-warm/60"
            )}
          >
            Archived ({campaigns.filter((c) => c.status === "archived").length})
          </button>

          {/* Event Type Dropdown/Pill if available */}
          {eventTypes.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-green-dark/10">
              <span className="text-[11px] text-text-muted font-semibold uppercase mr-1">
                Type:
              </span>
              <button
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                  typeFilter === "all"
                    ? "bg-butter-warm text-green-dark font-bold"
                    : "text-text-dim hover:text-green-dark"
                )}
              >
                All Types
              </button>
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                    typeFilter === type
                      ? "bg-butter-warm text-green-dark font-bold"
                      : "text-text-dim hover:text-green-dark"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Search Box + View Switcher (Grid vs Table) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-butter-bg/60 border border-green-dark/10 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-green-dark text-green-dark placeholder:text-text-muted"
            />
          </div>

          <div className="flex items-center bg-butter-warm/60 p-0.5 rounded-xl border border-green-dark/10">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid Card View"
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-white text-green-dark shadow-xs"
                  : "text-text-muted hover:text-green-dark"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Compact Table View"
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-green-dark shadow-xs"
                  : "text-text-muted hover:text-green-dark"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Skeletons, Empty State, or Campaigns Content */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={campaigns.length === 0 ? "No campaigns created yet" : "No matching campaigns"}
          description={
            campaigns.length === 0
              ? "Create your first campaign or event sponsorship initiative to start discovering high-fit sponsors."
              : "Try adjusting your search terms or filter options above."
          }
          actionLabel={campaigns.length === 0 ? "Create First Campaign" : undefined}
          onAction={campaigns.length === 0 ? () => setModalOpen(true) : undefined}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onDelete={handleDeleteCampaign}
            />
          ))}
        </div>
      ) : (
        /* Compact Clean Table View */
        <div className="bg-white rounded-2xl border border-green-dark/10 overflow-hidden shadow-xs animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-butter-warm/40 border-b border-green-dark/10 text-text-dim uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Campaign Name</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Target Goal</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-dark/5">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-butter-bg/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-green-dark">
                      <Link href="/app" className="hover:underline flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-green-mid" />
                        <span>{camp.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-text-dim">
                      <span className="px-2 py-0.5 rounded-full bg-butter-warm text-[11px] font-semibold text-green-dark">
                        {camp.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-dim">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        {camp.audienceSize.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-dim">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        {camp.location}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-green-dark">
                      {formatCurrencyINR(camp.targetAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          camp.status === "active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/app"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-green-dark hover:text-green-mid"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.id)}
                          title="Remove Campaign"
                          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Wizard Dialog */}
      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadData}
      />
    </div>
  );
}
