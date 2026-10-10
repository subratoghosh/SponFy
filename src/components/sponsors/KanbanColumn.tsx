"use client";

import React, { useState } from "react";
import { Company, PipelineStage } from "@/types";
import { StageDefinition } from "@/lib/config/pipeline";
import { SponsorCard } from "./SponsorCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  stage: StageDefinition;
  sponsors: Company[];
  onDropSponsor: (sponsorId: string, targetStage: PipelineStage) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  sponsors,
  onDropSponsor,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const sponsorId = e.dataTransfer.getData("text/plain");
    if (sponsorId) {
      onDropSponsor(sponsorId, stage.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "w-72 shrink-0 bg-butter-panel rounded-3xl p-4 border flex flex-col max-h-[75vh] transition-all",
        isDragOver
          ? "border-green-dark ring-2 ring-butter-cream bg-white shadow-lg"
          : "border-green-dark/12 shadow-sm"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-green-dark/10">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-heading font-extrabold text-xs text-green-dark uppercase tracking-wider">
            {stage.label}
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-green-dark border border-green-dark/10">
          {sponsors.length}
        </span>
      </div>

      {/* Cards List with Scroll */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {sponsors.length === 0 ? (
          <div className="h-24 rounded-2xl border-2 border-dashed border-green-dark/10 flex items-center justify-center text-[11px] font-semibold text-text-muted">
            Drop sponsors here
          </div>
        ) : (
          sponsors.map((spon) => (
            <SponsorCard
              key={spon.id}
              sponsor={spon}
              onDragStart={(e, id) => e.dataTransfer.setData("text/plain", id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
