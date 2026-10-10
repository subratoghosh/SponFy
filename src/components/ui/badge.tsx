import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral"
    | "butter"
    | "green"
    | "outline"
    | "secondary"
    | "destructive"
    | "default";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    error: "bg-red-100 text-red-800 border-red-300",
    destructive: "bg-red-100 text-red-800 border-red-300",
    info: "bg-sky-100 text-sky-800 border-sky-300",
    neutral: "bg-stone-100 text-stone-800 border-stone-300",
    secondary: "bg-stone-100 text-stone-800 border-stone-300",
    outline: "bg-transparent text-[#0C382E] border-[#0C382E]/20",
    butter: "bg-butter-cream text-green-dark border-butter-gold font-bold",
    green: "bg-green-dark text-butter-cream border-green-mid font-semibold",
    default: "bg-green-dark text-butter-cream border-green-mid font-semibold",
  }[variant];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border border-solid select-none leading-none",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
