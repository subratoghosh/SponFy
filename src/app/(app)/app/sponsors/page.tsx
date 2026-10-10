"use client";

import React, { useState, useEffect } from "react";
import { getSponsors, updateSponsorStage } from "@/lib/data/repositories/sponsors";
import { Company, PipelineStage } from "@/types";
import { KanbanBoard } from "@/components/sponsors/KanbanBoard";
import { SponsorTableView } from "@/components/sponsors/SponsorTableView";
import { SponsorFilters } from "@/components/sponsors/SponsorFilters";
import { useToast } from "@/components/ui/toast";
import { Building2, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

import { SponsorsKanbanSkeleton } from "@/components/skeletons/SponsorsKanbanSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function SponsorsPipelinePage() {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const loadSponsors = () => {
    setLoading(true);
    getSponsors()
      .then(setSponsors)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSponsors();
  }, []);

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
            Sponsors Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Manage 24 active target companies across 12 relationship stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/discover">
            <Button variant="butter" size="sm" className="font-bold shadow-md">
              <Sparkles className="w-4 h-4 mr-1" /> Discover New
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
          <EmptyState
            icon={Building2}
            title="No sponsors discovered yet"
            description="Use SponFy's AI discovery engine to find active companies with campus and hackathon sponsorship budgets."
            actionLabel="Discover Sponsors with AI"
            actionHref="/app/discover"
          />
        ) : (
          <EmptyState
            icon={Building2}
            title="No sponsors match your filters"
            description="No sponsors in your pipeline match your current keyword, stage, or industry criteria."
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
    </div>
  );
}
