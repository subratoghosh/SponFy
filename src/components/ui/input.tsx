import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-text-dim tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-2.5 bg-white text-green-dark text-sm rounded-xl border border-green-dark/20",
            "placeholder:text-text-muted/70 outline-none transition-all duration-200",
            "focus:border-green-dark focus:ring-2 focus:ring-butter-cream/60 focus:bg-butter-panel",
            "disabled:opacity-50 disabled:bg-butter-warm/40 disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-600 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-text-muted">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
