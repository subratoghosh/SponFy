import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" aria-busy="true">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <Skeleton className="h-12 w-full rounded-xl bg-butter-bg/40" />

          <div className="flex items-center justify-between pt-2 border-t border-green-dark/5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
