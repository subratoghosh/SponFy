"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Cookie,
  Info,
  Check,
  X,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsentSettings {
  necessary: boolean;
  preferences: boolean;
  telemetry: boolean;
  timestamp: string | null;
}

const DEFAULT_CONSENT: ConsentSettings = {
  necessary: true,
  preferences: true,
  telemetry: true,
  timestamp: null,
};

export default function ConsentPage() {
  const [consent, setConsent] = useState<ConsentSettings>(DEFAULT_CONSENT);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sponfy_cookie_consent");
      if (stored) {
        setConsent(JSON.parse(stored));
      }
    } catch {
      // Fallback
    }
    setLoaded(true);
  }, []);

  const savePreferences = (updated: ConsentSettings) => {
    const payload = {
      ...updated,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    setConsent(payload);
    try {
      localStorage.setItem("sponfy_cookie_consent", JSON.stringify(payload));
      window.dispatchEvent(new Event("sponfy_consent_updated"));
    } catch {
      // Ignore
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      preferences: true,
      telemetry: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      necessary: true,
      preferences: false,
      telemetry: false,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col pt-24 sm:pt-28 pb-16 min-h-screen bg-butter-bg selection:bg-butter-cream">
      {/* Header */}
      <section className="relative px-6 pb-12 border-b border-green-dark/10">
        <div className="max-w-[900px] mx-auto text-center space-y-4">
          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-dark tracking-tight">
            Consent & Privacy Preferences
          </h1>
          <p className="text-text-dim text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Manage your personal data and cookie choices. You can customize your consent settings at any time to control how your browser interacts with SponFy.
          </p>
          {consent.timestamp && (
            <div className="text-xs text-text-dim/80 font-mono">
              Last saved: <span className="font-semibold text-green-dark">{new Date(consent.timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Settings Card */}
      <section className="px-6 py-12">
        <div className="max-w-[800px] mx-auto space-y-8">

          {/* Success Banner */}
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-green-100 border border-green-300 text-green-900 text-sm flex items-center gap-3 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <p className="font-bold">Preferences updated successfully!</p>
                <p className="text-xs text-green-800">Your privacy choices have been applied across your active session.</p>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {/* Category 1: Strictly Necessary */}
            <div className="p-6 rounded-2xl bg-white border border-green-dark/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-dark">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-green-dark flex items-center gap-2">
                      Strictly Necessary Cookies
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-dark/10 text-green-dark uppercase tracking-wider">
                        Required
                      </span>
                    </h3>
                    <p className="text-xs text-text-dim mt-0.5">
                      Session tokens, security verification, and CSRF protection.
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="text-xs font-bold text-text-muted px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 cursor-not-allowed select-none">
                    Always Active
                  </span>
                </div>
              </div>
              <p className="text-xs text-text-dim leading-relaxed pl-13 pt-1 border-t border-green-dark/5">
                These cookies are necessary for the website to function securely. They enable organizer login, workspace sessions, and account protection. Without these, core features cannot work.
              </p>
            </div>

            {/* Category 2: Functional & Preferences */}
            <div className="p-6 rounded-2xl bg-white border border-green-dark/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-dark">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-green-dark">
                      Functional & Preference Storage
                    </h3>
                    <p className="text-xs text-text-dim mt-0.5">
                      Saves your custom campaign targets, table filters, and UI layout preferences.
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setConsent({ ...consent, preferences: !consent.preferences })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      consent.preferences ? "bg-green-mid" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={consent.preferences}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        consent.preferences ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-dim leading-relaxed pl-13 pt-1 border-t border-green-dark/5">
                Remembers your configured expected campaign amount (e.g. ₹5.0L target goal), sidebar states, and selected event views so you don't have to re-enter them on every visit.
              </p>
            </div>

            {/* Category 3: Telemetry & Performance */}
            <div className="p-6 rounded-2xl bg-white border border-green-dark/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-dark">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-green-dark">
                      Telemetry & Diagnostics
                    </h3>
                    <p className="text-xs text-text-dim mt-0.5">
                      Anonymous error reporting and platform stability telemetry.
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setConsent({ ...consent, telemetry: !consent.telemetry })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      consent.telemetry ? "bg-green-mid" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={consent.telemetry}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        consent.telemetry ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-dim leading-relaxed pl-13 pt-1 border-t border-green-dark/5">
                Helps us monitor server uptime and fix broken sponsor search queries without tracking your personal identity or browsing history across other websites.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 rounded-2xl bg-white border border-green-dark/15 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleRejectNonEssential}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-green-dark/20 hover:bg-gray-100 text-xs font-bold text-green-dark transition-colors cursor-pointer"
            >
              Reject Non-Essential
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => savePreferences(consent)}
                className="w-full sm:w-auto text-xs font-bold"
              >
                Save My Preferences
              </Button>
              <Button
                variant="green"
                size="md"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto text-xs font-bold"
              >
                Accept All
              </Button>
            </div>
          </div>

          {/* Legal Links Note */}
          <div className="text-center text-xs text-text-dim space-y-1">
            <p>
              For complete details on our data governance standards, read our{" "}
              <Link href="/cookie-policy" className="text-green-dark font-bold underline">
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-dark font-bold underline">
                Privacy Policy
              </Link>.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
