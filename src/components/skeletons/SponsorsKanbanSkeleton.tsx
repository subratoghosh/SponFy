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

      {/* Criteria Button Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2.5">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>

      {/* Card Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
};
