"use client";

import React, { useState, useEffect } from "react";
import { getSponsors, updateSponsorStage } from "@/lib/data/repositories/sponsors";
import { Company, PipelineStage } from "@/types";
import { KanbanBoard } from "@/components/sponsors/KanbanBoard";
import { SponsorTableView } from "@/components/sponsors/SponsorTableView";
import { SponsorFilters } from "@/components/sponsors/SponsorFilters";
import { CSVImportModal } from "@/components/sponsors/CSVImportModal";
import { useToast } from "@/components/ui/toast";
import { Building2, Compass, FileSpreadsheet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

import { useSession } from "next-auth/react";
import { SponsorsKanbanSkeleton } from "@/components/skeletons/SponsorsKanbanSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function SponsorsPipelinePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const loadSponsors = () => {
    setLoading(true);
    getSponsors()
      .then((data) => {
        const isDemo = !session?.user || session.user.email === "demo@sponfy.dev";
        const cleanData = isDemo
          ? data
          : data.filter((s) => s.campaignId !== "camp-demo-1");
        setSponsors(cleanData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSponsors();
  }, [session]);

  const handleStageChange = async (sponsorId: string, targetStage: PipelineStage) => {
    try {
      const updated = await updateSponsorStage(sponsorId, targetStage);
      if (updated) {
        setSponsors((prev) =>
          prev.map((s) => (s.id === sponsorId ? { ...s, stage: targetStage } : s))
        );
        toast(`Moved ${updated.name} to ${targetStage}`, "success");
      }
    } catch {
      toast("Failed to move sponsor stage", "error");
    }
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

      {/* Main Content Area: Skeletons, Empty State, or Data */}
      {loading ? (
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
        />
      ) : (
        <SponsorTableView sponsors={filteredSponsors} />
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={loadSponsors}
      />
    </div>
  );
}
