"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getSponsors, updateSponsorStage } from "@/lib/data/repositories/sponsors";
import { Company, PipelineStage } from "@/types";
import { KanbanBoard } from "@/components/sponsors/KanbanBoard";
import { SponsorTableView } from "@/components/sponsors/SponsorTableView";
import { SponsorFilters } from "@/components/sponsors/SponsorFilters";
import { CSVImportModal } from "@/components/sponsors/CSVImportModal";
import { useToast } from "@/components/ui/toast";
import { Building2, Compass, FileSpreadsheet, Plus, Mail, CheckSquare, Square, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import useSWR from "swr";

import { useSession } from "next-auth/react";
import { SponsorsKanbanSkeleton } from "@/components/skeletons/SponsorsKanbanSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { GenerateDraftModal } from "@/components/sponsors/GenerateDraftModal";
import { BulkDraftModal } from "@/components/sponsors/BulkDraftModal";

import { useDebounce } from "@/lib/hooks/useDebounce";
import { useSponsorsData } from "@/lib/hooks/useSponsorsData";

export default function SponsorsPipelinePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [sponsorToRemove, setSponsorToRemove] = useState<Company | null>(null);
  const [removing, setRemoving] = useState(false);

  // Bulk Selection and Direct Draft & Delete State
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<string[]>([]);
  const [draftModalSponsor, setDraftModalSponsor] = useState<Company | null>(null);
  const [isBulkDraftModalOpen, setIsBulkDraftModalOpen] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Load user active campaign for draft context
  const { data: campaignsData } = useSWR(
    session?.user ? ["/api/campaigns", session.user.id] : null,
    async ([url]) => {
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    }
  );
  const activeCampaign = campaignsData?.[0] || null;

  // Debounce search query by 300ms
  const debouncedSearch = useDebounce(search, 300);

  const {
    sponsors: rawSponsors,
    loading,
    refetch,
    updateStage,
    removeSponsor,
    removeSelectedSponsors,
  } = useSponsorsData({
    search: debouncedSearch,
    industry: selectedIndustry,
    stage: selectedStage,
  });

  const isDemo = !session?.user || session.user.email === "demo@sponfy.dev";
  const sponsors = isDemo
    ? rawSponsors
    : rawSponsors.filter((s) => s.campaignId !== "camp-demo-1");

  const handleToggleSelectSponsor = (id: string) => {
    setSelectedSponsorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredSponsors.map((s) => s.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedSponsorIds.includes(id));
    if (areAllSelected) {
      setSelectedSponsorIds([]);
    } else {
      setSelectedSponsorIds(allFilteredIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedSponsorIds([]);
  };

  const selectedSponsorsList = sponsors.filter((s) => selectedSponsorIds.includes(s.id));

  const handleRemoveSponsor = async () => {
    if (!sponsorToRemove) return;
    setRemoving(true);
    try {
      await removeSponsor(sponsorToRemove.id, sponsorToRemove.name);
      setSponsorToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSponsorIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      const success = await removeSelectedSponsors(selectedSponsorIds);
      if (success) {
        setSelectedSponsorIds([]);
        setShowBulkDeleteConfirm(false);
      }
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleStageChange = async (sponsorId: string, targetStage: PipelineStage) => {
    await updateStage(sponsorId, targetStage);
  };

  // Filter logic
  const filteredSponsors = sponsors.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.industry.toLowerCase().includes(search.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "all" || s.industry === selectedIndustry;

    const matchesStage =
      selectedStage === "all" || s.stage === selectedStage;

    return matchesSearch && matchesIndustry && matchesStage;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Sponsors Tracker
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Track and manage {sponsors.length} target companies across relationship stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="font-bold border-[#0C382E]/20 text-[#0C382E] hover:bg-[#FAF4E6] gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2D6A4F]" />
            Import CSV
          </Button>

          <Link href="/app/discover">
            <Button variant="butter" size="sm" className="font-bold shadow-md cursor-pointer">
              <Compass className="w-4 h-4 mr-1" /> Discover New
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <SponsorFilters
        search={search}
        onSearchChange={setSearch}
        selectedIndustry={selectedIndustry}
        onIndustryChange={setSelectedIndustry}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Multi-Select Quick Action Bar */}
      {filteredSponsors.length > 0 && (
        <div className="flex items-center justify-between text-xs font-semibold px-2 py-1 text-text-dim">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 hover:text-green-dark transition-colors cursor-pointer text-xs"
            >
              {filteredSponsors.length > 0 &&
              filteredSponsors.every((s) => selectedSponsorIds.includes(s.id)) ? (
                <>
                  <CheckSquare className="w-4 h-4 text-green-dark" />
                  <span>Deselect All ({filteredSponsors.length})</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-text-muted" />
                  <span>Select All ({filteredSponsors.length})</span>
                </>
              )}
            </button>
            {selectedSponsorIds.length > 0 && (
              <span className="text-green-dark font-bold bg-butter-cream px-2.5 py-0.5 rounded-full border border-green-dark/15 shadow-2xs">
                {selectedSponsorIds.length} sponsor{selectedSponsorIds.length > 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          {selectedSponsorIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs text-text-dim hover:text-green-dark underline font-medium cursor-pointer"
              >
                Clear
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5 shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Selected ({selectedSponsorIds.length})</span>
              </Button>

              <Button
                variant="butter"
                size="sm"
                onClick={() => setIsBulkDraftModalOpen(true)}
                className="text-xs font-black gap-1.5 shadow-xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-green-dark" />
                <span>Bulk Draft Outreach ({selectedSponsorIds.length})</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area: Skeletons, Empty State, or Data */}
      {loading && sponsors.length === 0 ? (
        viewMode === "kanban" ? (
          <SponsorsKanbanSkeleton />
        ) : (
          <TableSkeleton rows={6} cols={5} />
        )
      ) : filteredSponsors.length === 0 ? (
        sponsors.length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              icon={Building2}
              title="No sponsors discovered yet"
              description="Use SponFy's AI discovery engine or upload an existing spreadsheet of target brand leads directly into your workspace."
              actionLabel="Discover Sponsors with AI"
              actionHref="/app/discover"
            />
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCsvModalOpen(true)}
                className="text-xs font-bold border-[#0C382E]/20 text-[#0C382E] hover:bg-[#FAF4E6] gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Or Upload Company CSV File
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No sponsors match your filters"
            description="No sponsors in your tracker match your current keyword, stage, or industry criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch("");
              setSelectedIndustry("all");
              setSelectedStage("all");
            }}
          />
        )
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          sponsors={filteredSponsors}
          onStageChange={handleStageChange}
          onRemoveSponsor={(s) => setSponsorToRemove(s)}
          selectedSponsorIds={selectedSponsorIds}
          onToggleSelectSponsor={handleToggleSelectSponsor}
          onDraftEmail={(s) => setDraftModalSponsor(s)}
        />
      ) : (
        <SponsorTableView
          sponsors={filteredSponsors}
          onRemoveSponsor={(s) => setSponsorToRemove(s)}
          selectedSponsorIds={selectedSponsorIds}
          onToggleSelectSponsor={handleToggleSelectSponsor}
          onSelectAll={handleSelectAll}
          onDraftEmail={(s) => setDraftModalSponsor(s)}
        />
      )}

      {/* Floating Bottom Sticky Bar when sponsors are selected */}
      {selectedSponsorIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-green-dark text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 h-6 rounded-full bg-butter-gold text-green-dark flex items-center justify-center font-black text-xs">
              {selectedSponsorIds.length}
            </span>
            <span>Sponsor{selectedSponsorIds.length > 1 ? "s" : ""} Selected</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Button
              variant="butter"
              size="sm"
              onClick={() => setIsBulkDraftModalOpen(true)}
              className="text-xs font-black gap-1.5 shadow-sm text-green-dark"
            >
              <Mail className="w-3.5 h-3.5 text-green-dark" />
              <span>Draft Outreach ({selectedSponsorIds.length})</span>
            </Button>
            <button
              onClick={handleClearSelection}
              className="text-xs text-white/70 hover:text-white underline font-semibold cursor-pointer ml-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Direct Individual Draft Generation Modal */}
      {draftModalSponsor && (
        <GenerateDraftModal
          isOpen={!!draftModalSponsor}
          onClose={() => setDraftModalSponsor(null)}
          sponsor={draftModalSponsor}
          campaign={activeCampaign}
        />
      )}

      {/* Bulk Draft Outreach Modal */}
      <BulkDraftModal
        isOpen={isBulkDraftModalOpen}
        onClose={() => setIsBulkDraftModalOpen(false)}
        selectedSponsors={selectedSponsorsList}
        campaign={activeCampaign}
        onSuccess={() => {
          setSelectedSponsorIds([]);
        }}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Remove Sponsor Confirmation Modal */}
      {sponsorToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-green-dark/15 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-black text-lg text-green-dark">
                Remove {sponsorToRemove.name}?
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                This will remove <strong>{sponsorToRemove.name}</strong> from your active campaign sponsor tracker and cancel any pending unsent drafts.
              </p>
              <div className="p-3 mt-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-normal">
                <strong>Note:</strong> Past sent email history, received replies, and suppression records will remain safely preserved in your workspace.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSponsorToRemove(null)}
                disabled={removing}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemoveSponsor}
                loading={removing}
                className="text-xs font-bold"
              >
                Remove from Campaign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Selected Sponsors Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-green-dark/15 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-black text-lg text-green-dark">
                Delete {selectedSponsorIds.length} Selected Sponsor{selectedSponsorIds.length > 1 ? "s" : ""}?
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                This will permanently remove <strong>{selectedSponsorIds.length} companies</strong> from this campaign&apos;s tracker and delete their pending unsent drafts.
              </p>
              <div className="p-3 mt-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-normal">
                <strong>Note:</strong> Past sent outreach records, incoming responses, and sender suppression lists are permanently preserved.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isDeletingBulk}
                className="text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                loading={isDeletingBulk}
                className="text-xs font-bold gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedSponsorIds.length} Companies</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
