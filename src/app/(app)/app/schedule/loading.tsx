import React from "react";

export default function ScheduleLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-green-dark/10 rounded-xl" />
          <div className="h-4 w-72 bg-green-dark/6 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-green-dark/10 rounded-xl" />
      </div>

      {/* Summary Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white rounded-3xl border border-green-dark/10 p-5" />
        ))}
      </div>

      {/* Main Calendar / List Skeleton */}
      <div className="h-[480px] bg-white rounded-3xl border border-green-dark/10 p-6" />
    </div>
  );
}
