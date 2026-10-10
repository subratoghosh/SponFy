import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RepliesLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading inbox...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* 2-column inbox layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-green-dark/8 bg-butter-bg/30 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-green-dark/10">
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl bg-butter-bg/40" />
          <Skeleton className="h-32 w-full rounded-xl bg-green-dark/5" />
        </div>
      </div>
    </div>
  );
}
