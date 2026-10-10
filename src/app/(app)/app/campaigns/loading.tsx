import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/skeletons/CardSkeleton";

export default function CampaignsLoading() {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
      <CardSkeleton count={6} />
    </div>
  );
}
