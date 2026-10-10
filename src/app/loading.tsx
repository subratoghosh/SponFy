import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-butter-bg flex flex-col items-center justify-center p-6 animate-fade-in" aria-busy="true">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="animate-pulse">
          <SponfyBrand size="lg" theme="light" />
        </div>
        <div className="w-48 space-y-2 mt-4">
          <Skeleton className="h-2 w-full rounded-full" />
          <p className="text-xs font-semibold text-green-dark/60 tracking-wider uppercase">
            Loading SponFy...
          </p>
        </div>
      </div>
    </div>
  );
}
