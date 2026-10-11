"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("sponfy_cookie_consent");
      if (!consent) {
        // Show after a brief delay so page renders smoothly
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, []);

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
      window.dispatchEvent(new Event("sponfy_consent_updated"));
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

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
          onClick={() => setVisible(false)}
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
            onClick={() => setVisible(false)}
            className="w-full px-3 py-2 text-xs font-bold text-text-muted hover:text-green-dark underline transition-colors cursor-pointer text-center"
          >
            Customize
          </button>
        </Link>
      </div>
    </aside>
  );
}
