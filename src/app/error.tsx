"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponfyLogo } from "@/components/ui/SponfyLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe diagnostic information on client/server without sensitive secrets
    console.error("SponFy Application Error caught by boundary:", {
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-butter-bg text-text-main flex flex-col items-center justify-center p-6 relative select-none">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {/* Mascot badge with warning pulse */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-green-dark border-2 border-butter-cream/40 shadow-xl flex items-center justify-center">
            <div className="relative">
              <SponfyLogo size={48} />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-green-dark flex items-center justify-center shadow-md border-2 border-green-dark animate-pulse">
                <AlertTriangle className="w-4 h-4 text-green-dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Heading & description */}
        <div className="space-y-2">
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
            Something went wrong.
          </h1>
          <p className="text-sm text-text-dim leading-relaxed">
            We ran into an unexpected hiccup loading this screen. Don't worry, your campaign and outreach data is safe.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-text-muted/70 bg-green-dark/5 px-2.5 py-1 rounded-md inline-block">
              Incident ID: {error.digest}
            </p>
          )}
        </div>

        {/* Action recovery buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="butter"
            size="lg"
            onClick={() => reset()}
            className="w-full sm:w-auto font-bold shadow-md hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Link href="/app" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-semibold border-green-dark/20 text-green-dark hover:bg-butter-cream/30"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-green-dark/70 hover:text-green-dark hover:bg-green-dark/5"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-text-muted pt-4">
          Persistent issue? Contact us at{" "}
          <a
            href="mailto:support@sponfy.dev"
            className="font-semibold underline hover:text-green-dark text-green-mid"
          >
            support@sponfy.dev
          </a>
        </p>
      </div>
    </div>
  );
}
