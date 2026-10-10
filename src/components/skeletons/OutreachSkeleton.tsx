import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const OutreachSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading email outreach workspace...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Main Outreach Layout: Left Draft Queue + Right Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Draft Queue (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-green-dark/10">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-green-dark/8 bg-butter-bg/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Composer & Quality Verification (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-green-dark/10">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>

            {/* Subject and Body Area */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>

            {/* Quality Score Panel */}
            <div className="p-4 rounded-xl bg-butter-bg/50 border border-green-dark/10 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-10 w-44 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
