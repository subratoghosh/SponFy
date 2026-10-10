import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "butter"
    | "green"
    | "glass"
    | "hero-ghost"
    | "danger"
    | "subtle"
    | "outline"
    | "ghost"
    | "secondary"
    | "default";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "butter",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "text-xs px-3.5 py-1.5 min-h-[36px]",
      md: "text-sm px-5 py-2.5 min-h-[44px]",
      lg: "text-base px-7 py-3.5 min-h-[50px]",
    }[size];

    const variantClasses = {
      butter: "btn-butter",
      green: "btn-green",
      default: "btn-green",
      glass: "btn-glass",
      "hero-ghost": "btn-hero-ghost",
      danger: "bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 font-medium shadow-sm transition-all",
      subtle: "bg-butter-warm hover:bg-butter-cream text-green-dark rounded-xl px-4 py-2 font-medium transition-all",
      outline: "border border-[#0C382E]/20 hover:bg-[#0C382E]/5 text-[#0C382E] rounded-xl px-4 py-2 font-medium transition-all",
      ghost: "hover:bg-[#0C382E]/5 text-[#0C382E] rounded-xl px-4 py-2 font-medium transition-all",
      secondary: "bg-[#0C382E]/10 hover:bg-[#0C382E]/15 text-[#0C382E] rounded-xl px-4 py-2 font-medium transition-all",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold select-none cursor-pointer active:scale-[0.98] transition-transform",
          variantClasses,
          sizeClasses,
          loading && "opacity-80 cursor-wait",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
