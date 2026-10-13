"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { TARGET_INDUSTRIES } from "@/lib/config/constants";
import { PIPELINE_STAGES } from "@/lib/config/pipeline";

interface SponsorFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedIndustry: string;
  onIndustryChange: (val: string) => void;
  selectedStage: string;
  onStageChange: (val: string) => void;
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
}

export const SponsorFilters: React.FC<SponsorFiltersProps> = ({
  search,
  onSearchChange,
  selectedIndustry,
  onIndustryChange,
  selectedStage,
  onStageChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by company name or angle..."
          className="w-full pl-10 pr-4 py-2 bg-butter-panel text-green-dark text-xs rounded-xl border border-green-dark/15 focus:border-green-dark focus:ring-2 focus:ring-butter-cream/60 outline-none"
        />
      </div>

      {/* Filter Selects & View Toggle */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Industry Filter */}
        <select
          value={selectedIndustry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="px-3 py-2 bg-butter-panel text-green-dark text-xs rounded-xl border border-green-dark/15 outline-none cursor-pointer"
        >
          <option value="all">All Industries</option>
          {TARGET_INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>

        {/* Stage Filter */}
        <select
          value={selectedStage}
          onChange={(e) => onStageChange(e.target.value)}
          className="px-3 py-2 bg-butter-panel text-green-dark text-xs rounded-xl border border-green-dark/15 outline-none cursor-pointer"
        >
          <option value="all">All Stages</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex rounded-xl bg-butter-warm/80 p-1 border border-green-dark/10 text-xs font-bold">
          <button
            onClick={() => onViewModeChange("kanban")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === "kanban"
                ? "bg-white text-green-dark shadow-sm"
                : "text-text-dim hover:text-green-dark"
            }`}
          >
            Board
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-white text-green-dark shadow-sm"
                : "text-text-dim hover:text-green-dark"
            }`}
          >
            Table
          </button>
        </div>
      </div>
    </div>
  );
};
