"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) handleClose();
        }}
        className="fixed inset-0 bg-green-deep/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-2xl border border-green-dark/15 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in",
          maxWidthClasses
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-5 border-b border-green-dark/10 flex items-start justify-between bg-butter-panel/60">
            <div>
              {title && <h3 className="text-xl font-bold text-green-dark font-heading">{title}</h3>}
              {description && <p className="text-sm text-text-dim mt-0.5">{description}</p>}
            </div>
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-text-muted hover:text-green-dark hover:bg-butter-warm/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props} />
  )
);
DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props} />
  )
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-heading font-bold text-lg text-green-dark", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-end space-x-2 pt-4", className)} {...props} />
  )
);
DialogFooter.displayName = "DialogFooter";
