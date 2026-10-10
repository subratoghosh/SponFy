"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard view error caught:", {
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-white border border-green-dark/10 shadow-sm text-center max-w-xl mx-auto my-8 space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
        <AlertCircle className="w-8 h-8 stroke-[1.75]" />
      </div>

      <div className="space-y-2">
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-green-dark">
          Failed to load this dashboard view
        </h2>
        <p className="text-sm text-text-dim leading-relaxed">
          The requested data could not be retrieved. Your other campaigns, sponsors, and settings remain untouched.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="butter" onClick={() => reset()} className="font-bold">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/app")}
          className="border-green-dark/20 text-green-dark"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard Overview
        </Button>
      </div>
    </div>
  );
}
