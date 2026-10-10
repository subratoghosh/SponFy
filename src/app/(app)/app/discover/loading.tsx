import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/skeletons/CardSkeleton";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4">
        <Skeleton className="h-24 w-full rounded-xl bg-butter-bg/40" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <Skeleton className="h-6 w-48" />
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}
