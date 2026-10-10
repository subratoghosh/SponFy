import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface KPISkeletonProps {
  count?: number;
}

export const KPISkeleton: React.FC<KPISkeletonProps> = ({ count = 4 }) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in"
      aria-busy="true"
      aria-label="Loading KPI metrics"
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#0C382E]/10 p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
};
