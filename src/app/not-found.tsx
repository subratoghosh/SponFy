"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, LayoutDashboard, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponfyLogo } from "@/components/ui/SponfyLogo";

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-butter-bg text-text-main flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Organic Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-butter-cream/20 blur-3xl pointer-events-none -z-10 blob-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-green-light/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-xl w-full text-center space-y-8 animate-fade-in relative z-10">
        {/* Animated SponFy 404 Mascot Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-green-dark border-2 border-butter-cream/40 shadow-2xl flex items-center justify-center transform hover:rotate-3 transition-transform duration-300">
            <div className="relative">
              <SponfyLogo size={56} className="filter drop-shadow-md" />
              {/* Question mark / ping antenna badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-butter-cream text-green-dark font-mono font-black text-sm flex items-center justify-center shadow-lg border border-green-dark/20 animate-bounce">
                404
              </div>
            </div>
          </div>
        </div>

        {/* Display Typography */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-dark/8 border border-green-dark/12 text-green-dark text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-green-dark animate-spin" style={{ animationDuration: "12s" }} />
            HTTP 404 — Page Not Found
          </div>
          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-black text-green-dark tracking-tight leading-tight">
            Looks like this connection went nowhere.
          </h1>
          <p className="text-sm sm:text-base text-text-dim max-w-md mx-auto leading-relaxed font-normal">
            We couldn't find the page you're looking for. It may have moved, or the link might be incorrect.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/app" className="w-full sm:w-auto">
            <Button
              variant="green"
              size="lg"
              className="w-full sm:w-auto font-bold shadow-md hover:scale-105 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-semibold border-green-dark/20 text-green-dark hover:bg-butter-cream/30"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleGoBack}
            className="w-full sm:w-auto text-green-dark/70 hover:text-green-dark hover:bg-green-dark/5"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Footer Navigation Hint */}
        <p className="text-xs text-text-muted pt-4">
          Need help? Reach out at{" "}
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
