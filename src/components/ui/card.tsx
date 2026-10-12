import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevation?: "none" | "sm" | "md" | "lg";
  fullHeight?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, elevation = "sm", fullHeight = true, children, ...props }, ref) => {
    const elevationClasses = {
      none: "border border-green-dark/10 shadow-none",
      sm: "shadow-sm border border-green-dark/10",
      md: "shadow-md border border-green-dark/12",
      lg: "shadow-lg border border-green-dark/15",
    }[elevation];

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl p-5 sm:p-6 transition-all duration-300 min-w-0",
          fullHeight && "h-full flex flex-col justify-between",
          elevationClasses,
          interactive && "feature-card-interactive cursor-pointer hover:-translate-y-1 hover:shadow-hover hover:border-green-dark/30",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 min-w-0 shrink-0", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-heading font-bold text-base sm:text-lg text-green-dark break-words min-w-0 leading-snug", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-green-dark/60 leading-relaxed min-w-0", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0 flex-1 min-w-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4 mt-auto min-w-0 border-t border-green-dark/6", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
