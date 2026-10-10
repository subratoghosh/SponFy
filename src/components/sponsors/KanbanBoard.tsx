"use client";

import React from "react";
import { Company, PipelineStage } from "@/types";
import { PIPELINE_STAGES } from "@/lib/config/pipeline";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  sponsors: Company[];
  onStageChange: (sponsorId: string, targetStage: PipelineStage) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  sponsors,
  onStageChange,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none">
      {PIPELINE_STAGES.map((stage) => {
        const stageSponsors = sponsors.filter((s) => s.stage === stage.id);
        return (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            sponsors={stageSponsors}
            onDropSponsor={onStageChange}
          />
        );
      })}
    </div>
  );
};
