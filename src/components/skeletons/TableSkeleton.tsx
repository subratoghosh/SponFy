import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  cols?: number;
  rows?: number;
  showFilters?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns = 5,
  cols,
  rows = 6,
  showFilters = true,
}) => {
  const colCount = cols || columns;
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true" aria-label="Loading table data...">
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1">
          <Skeleton className="h-10 w-72 max-w-full rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-green-dark/10 bg-white overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-green-dark/10 bg-butter-bg/40">
          {[...Array(colCount)].map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 ${i === 0 ? "w-36" : i === colCount - 1 ? "w-20 ml-auto" : "w-24"}`}
            />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-green-dark/5">
          {[...Array(rows)].map((_, rIdx) => (
            <div key={rIdx} className="flex items-center gap-4 px-6 py-4">
              {[...Array(colCount)].map((_, cIdx) => (
                <div
                  key={cIdx}
                  className={`flex items-center gap-3 ${
                    cIdx === 0
                      ? "w-48"
                      : cIdx === columns - 1
                      ? "w-24 ml-auto justify-end"
                      : "flex-1"
                  }`}
                >
                  {cIdx === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                  <Skeleton
                    className={`h-4 ${
                      cIdx === 0
                        ? "w-28"
                        : cIdx === 1
                        ? "w-20 rounded-full"
                        : cIdx === columns - 1
                        ? "h-8 w-16 rounded-lg"
                        : "w-24"
                    }`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-green-dark/10 bg-butter-bg/20 text-xs">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
