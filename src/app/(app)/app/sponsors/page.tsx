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
import Link from "next/link";

export default function SponsorsPipelinePage() {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  const loadSponsors = () => {
    getSponsors().then(setSponsors);
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

      {/* Main Content Area */}
      {viewMode === "kanban" ? (
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
