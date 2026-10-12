"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    // Never show cookie banner once inside /app, /admin, or authenticated
    if (
      pathname?.startsWith("/app") ||
      pathname?.startsWith("/admin") ||
      status === "authenticated"
    ) {
      setVisible(false);
      return;
    }

    try {
      const consent = localStorage.getItem("sponfy_cookie_consent");
      const dismissed = localStorage.getItem("sponfy_cookie_dismissed");
      if (!consent && !dismissed) {
        // Show after a brief delay on initial landing page visit
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, [pathname, status]);

  const handleDismiss = () => {
    try {
      localStorage.setItem("sponfy_cookie_dismissed", "true");
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        "sponfy_cookie_consent",
        JSON.stringify({
          necessary: true,
          preferences: true,
          telemetry: true,
          timestamp: new Date().toISOString(),
        })
      );
      localStorage.setItem("sponfy_cookie_dismissed", "true");
      window.dispatchEvent(new Event("sponfy_consent_updated"));
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(
        "sponfy_cookie_consent",
        JSON.stringify({
          necessary: true,
          preferences: false,
          telemetry: false,
          timestamp: new Date().toISOString(),
        })
      );
      localStorage.setItem("sponfy_cookie_dismissed", "true");
      window.dispatchEvent(new Event("sponfy_consent_updated"));
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  // Guard: Never display after login or inside app/admin dashboards
  if (
    !visible ||
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/admin") ||
    status === "authenticated"
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-white/95 backdrop-blur-md border-2 border-green-dark/15 rounded-3xl p-5 shadow-2xl animate-fade-in text-green-dark"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-butter-cream flex items-center justify-center text-green-dark shrink-0">
            <Cookie className="w-4 h-4 text-green-mid" />
          </div>
          <h3 className="font-heading font-black text-sm text-green-dark">
            Cookie & Privacy Choices
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-green-dark p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-text-dim leading-relaxed mb-4">
        We use essential cookies for secure organizer authentication and local storage for custom campaign target goals. Zero advertising trackers. Read our{" "}
        <Link href="/cookie-policy" className="underline font-bold text-green-dark">
          Cookie Policy
        </Link>.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Button
          variant="green"
          size="sm"
          onClick={handleAcceptAll}
          className="w-full sm:flex-1 text-xs font-bold py-2"
        >
          Accept All
        </Button>
        <button
          type="button"
          onClick={handleReject}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-green-dark/20 hover:bg-gray-100 text-xs font-bold text-green-dark transition-colors cursor-pointer"
        >
          Decline
        </button>
        <Link href="/consent" className="w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full px-3 py-2 text-xs font-bold text-text-muted hover:text-green-dark underline transition-colors cursor-pointer text-center"
          >
            Customize
          </button>
        </Link>
      </div>
    </aside>
  );
}
