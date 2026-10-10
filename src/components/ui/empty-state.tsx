import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionHref?: string;
  variant?: "default" | "compact" | "transparent";
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
  variant = "default",
  className,
}) => {
  const isCompact = variant === "compact";
  const isTransparent = variant === "transparent";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl transition-all",
        isCompact
          ? "p-6 my-2 bg-white/70 border border-green-dark/10"
          : isTransparent
          ? "p-8 my-4 bg-transparent border border-dashed border-green-dark/15"
          : "p-8 sm:p-12 my-4 bg-white border border-green-dark/10 shadow-sm",
        className
      )}
    >
      {/* 1. Butter Circle Badge Icon */}
      <div
        className={cn(
          "rounded-full bg-butter-cream flex items-center justify-center text-green-dark shadow-sm",
          isCompact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"
        )}
      >
        <Icon className={cn("stroke-[1.75]", isCompact ? "w-6 h-6" : "w-8 h-8")} />
      </div>

      {/* 2. Headline */}
      <h3
        className={cn(
          "font-bold text-green-dark font-heading",
          isCompact ? "text-base mb-1" : "text-lg sm:text-xl mb-1.5"
        )}
      >
        {title}
      </h3>

      {/* 3. Context Narrative */}
      <p
        className={cn(
          "text-text-dim max-w-md leading-relaxed",
          isCompact ? "text-xs mb-4" : "text-sm mb-6"
        )}
      >
        {description}
      </p>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          actionHref ? (
            <Link href={actionHref}>
              <Button variant="butter" size={isCompact ? "sm" : "md"}>
                {actionLabel}
              </Button>
            </Link>
          ) : onAction ? (
            <Button
              variant="butter"
              size={isCompact ? "sm" : "md"}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null
        )}

        {secondaryActionLabel && (
          secondaryActionHref ? (
            <Link href={secondaryActionHref}>
              <Button variant="outline" size={isCompact ? "sm" : "md"} className="border-green-dark/20 text-green-dark">
                {secondaryActionLabel}
              </Button>
            </Link>
          ) : onSecondaryAction ? (
            <Button
              variant="outline"
              size={isCompact ? "sm" : "md"}
              onClick={onSecondaryAction}
              className="border-green-dark/20 text-green-dark"
            >
              {secondaryActionLabel}
            </Button>
          ) : null
        )}
      </div>
    </div>
  );
};
