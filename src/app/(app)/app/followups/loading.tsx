import React from "react";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function FollowupsLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true">
      <TableSkeleton columns={5} rows={6} />
    </div>
  );
}
