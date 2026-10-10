import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";

export default function AnalyticsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in" aria-busy="true">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-44 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton title="Outreach Sent vs. Authentic Replies" />
        <ChartSkeleton title="Pipeline Value Distribution by Stage" />
      </div>
    </div>
  );
}
