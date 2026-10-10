import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true" aria-label="Loading dashboard...">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Today High-Priority Action Queue Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-green-dark/8 bg-butter-bg/40 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Pipeline Summary & Activity Feed + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Pipeline Summary Card */}
          <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Card */}
          <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-green-dark/5 last:border-0">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-green-dark text-butter-cream space-y-4 shadow-md">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-butter-cream/20" />
            <Skeleton className="h-5 w-32 bg-butter-cream/20" />
          </div>
          <div className="space-y-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-green-mid/50 border border-butter-cream/10 space-y-2">
                <Skeleton className="h-3.5 w-full bg-butter-cream/15" />
                <Skeleton className="h-3.5 w-4/5 bg-butter-cream/15" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
