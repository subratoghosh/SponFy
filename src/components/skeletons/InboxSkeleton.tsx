import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const InboxSkeleton: React.FC = () => {
  return (
    <div
      className="flex-1 flex overflow-hidden border border-[#0C382E]/10 rounded-2xl bg-white shadow-xs animate-fade-in"
      aria-busy="true"
      aria-label="Loading email threads"
    >
      {/* Column 1: Thread List */}
      <div className="w-80 md:w-96 border-r border-[#0C382E]/10 bg-[#FAF4E6]/20 p-4 space-y-3 shrink-0">
        <Skeleton className="h-4 w-32 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-white border border-[#0C382E]/5 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>

      {/* Column 2: Thread View */}
      <div className="flex-1 p-6 space-y-6 bg-white overflow-hidden">
        <div className="flex justify-between items-start border-b border-[#0C382E]/10 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};
