import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  title?: string;
  height?: number | string;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  title,
  height = 300,
}) => {
  return (
    <div
      className="p-6 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-4 animate-fade-in"
      aria-busy="true"
      aria-label="Loading chart data..."
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {title ? (
            <h4 className="font-heading font-bold text-base text-green-dark">{title}</h4>
          ) : (
            <Skeleton className="h-5 w-44" />
          )}
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-12 rounded-lg" />
          <Skeleton className="h-7 w-12 rounded-lg" />
          <Skeleton className="h-7 w-12 rounded-lg" />
        </div>
      </div>

      {/* Chart visualization placeholder */}
      <div
        className="w-full flex items-end gap-3 px-4 pt-6 pb-2 border-b border-l border-green-dark/10 rounded-bl-lg bg-butter-bg/20"
        style={{ height }}
      >
        {[...Array(8)].map((_, i) => {
          const heights = ["45%", "65%", "35%", "85%", "55%", "90%", "70%", "60%"];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                className="w-full max-w-[32px] rounded-t-lg"
                style={{ height: heights[i % heights.length] }}
              />
              <Skeleton className="h-2.5 w-6" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
