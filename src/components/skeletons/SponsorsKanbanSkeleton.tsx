import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SponsorsKanbanSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading sponsor pipeline...">
      {/* Header & Filter Controls Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-1">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Kanban Board Columns (horizontal scrollable on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {[
          "Discovered",
          "Researched",
          "Qualified",
          "Contacted",
          "Replied",
          "Committed",
        ].map((title, colIdx) => (
          <div
            key={colIdx}
            className="flex flex-col min-w-[260px] md:min-w-0 rounded-2xl bg-butter-bg/40 border border-green-dark/10 p-3.5 space-y-3"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-green-dark/60">
                {title}
              </span>
              <Skeleton className="h-4 w-5 rounded-full" />
            </div>

            {/* Draggable card skeletons inside column */}
            <div className="space-y-3 flex-1">
              {[...Array(colIdx % 2 === 0 ? 3 : 2)].map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="p-3.5 rounded-xl bg-white border border-green-dark/10 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex items-center justify-between pt-1 border-t border-green-dark/5">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
