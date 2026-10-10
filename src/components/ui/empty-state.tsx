import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-green-dark/10 shadow-sm my-4",
        className
      )}
    >
      {/* 1. Butter Circle Badge Icon */}
      <div className="w-16 h-16 rounded-full bg-butter-cream flex items-center justify-center text-green-dark mb-4 shadow-sm">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>

      {/* 2. Headline */}
      <h3 className="text-lg sm:text-xl font-bold text-green-dark font-heading mb-1.5">
        {title}
      </h3>

      {/* 3. Context Narrative */}
      <p className="text-sm text-text-dim max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* 4. Primary Recovery CTA */}
      {actionLabel && onAction && (
        <Button variant="butter" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
