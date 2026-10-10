import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export const CandidateListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#0C382E] p-3 rounded-xl bg-[#FAF4E6] border border-[#0C382E]/10">
        <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
        <span>Researching companies with campus & hackathon sponsorship budgets...</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-[#0C382E]/10 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
