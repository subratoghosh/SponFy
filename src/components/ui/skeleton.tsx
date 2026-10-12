import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  stagger?: 1 | 2 | 3 | 4 | 5;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, stagger, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg skeleton-shimmer bg-butter-warm/60",
        stagger && `skeleton-stagger-${stagger}`,
        className
      )}
      {...props}
    />
  );
};
