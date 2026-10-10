import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton: React.FC = () => {
  return (
    <div
      className="p-6 rounded-2xl bg-white border border-[#0C382E]/10 shadow-xs space-y-6 animate-fade-in"
      aria-busy="true"
      aria-label="Loading profile details"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#0C382E]/5">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};
