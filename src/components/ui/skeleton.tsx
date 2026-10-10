import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg skeleton-shimmer bg-butter-warm/60",
        className
      )}
      {...props}
    />
  );
};
