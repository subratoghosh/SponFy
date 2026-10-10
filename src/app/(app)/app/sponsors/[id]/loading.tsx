import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SponsorDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true">
      {/* Top back button */}
      <Skeleton className="h-8 w-28 rounded-lg" />

      {/* Sponsor Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-green-dark/10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Tab row */}
        <div className="flex items-center gap-2 border-b border-green-dark/10 pb-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-32 w-full rounded-xl bg-butter-bg/40 mt-4" />
        </div>
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
