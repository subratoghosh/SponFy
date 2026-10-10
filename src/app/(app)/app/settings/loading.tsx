import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex gap-2 border-b border-green-dark/10 pb-2">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-60" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
