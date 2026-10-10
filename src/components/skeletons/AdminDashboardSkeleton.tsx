import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true" aria-label="Loading administrative dashboard...">
      {/* Admin Header with Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-green-dark/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-red-100" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 12 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28" />
            <div className="flex items-center gap-1.5 pt-1">
              <Skeleton className="h-3 w-12 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Platform Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl bg-butter-bg/30" />
        </div>
        <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl bg-butter-bg/30" />
        </div>
      </div>

      {/* Platform Activity Table Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="divide-y divide-green-dark/5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
