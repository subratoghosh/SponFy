"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, CheckCircle2 } from "lucide-react";
import { SponfyLogo } from "./SponfyLogo";
import { toast } from "./toast";

export const OfflineScreen: React.FC = () => {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  const previousFocusRef = useRef<HTMLElement | null>(null);
  const tryAgainButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Check mobile viewport (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Initial check for online status (guarded for SSR)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    const handleOnline = () => {
      setIsOffline((prev) => {
        if (prev) {
          // Trigger "Back online" toast for 2 seconds
          setShowBackOnlineToast(true);
          try {
            toast("Back online", "success", 2000);
          } catch {
            // Safe fallback
          }
          setTimeout(() => {
            setShowBackOnlineToast(false);
          }, 2000);

          router.refresh();

          // Restore focus
          if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
            previousFocusRef.current.focus();
          }
        }
        return false;
      });
      setStillOffline(false);
    };

    const handleOffline = () => {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  // Manage focus when offline screen appears on mobile
  useEffect(() => {
    if (isOffline && isMobile) {
      const timer = setTimeout(() => {
        tryAgainButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOffline, isMobile]);

  const handleTryAgain = () => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      setIsOffline(false);
      setShowBackOnlineToast(true);
      try {
        toast("Back online", "success", 2000);
      } catch {
        // Safe fallback
      }
      setTimeout(() => {
        setShowBackOnlineToast(false);
      }, 2000);

      router.refresh();

      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    } else {
      // Still offline: shake button and indicate status
      setShaking(true);
      setStillOffline(true);
      setTimeout(() => setShaking(false), 400);
      setTimeout(() => setStillOffline(false), 2000);
    }
  };

  return (
    <>
      {/* Offline Full-Screen Overlay (Mobile Only) */}
      {isOffline && isMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="offline-title"
          aria-describedby="offline-desc"
          className="fixed inset-0 z-[9990] bg-[#0C382E] text-white flex flex-col items-center justify-center p-6 text-center md:hidden animate-fade-in select-none"
        >
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            {/* SponFy Brand Logo */}
            <div className="flex items-center gap-3">
              <SponfyLogo size={48} variant="cream" animated={false} />
              <span className="text-butter-cream font-heading font-extrabold text-2xl tracking-tight">
                Spon<span className="text-[#F5D061]">Fy</span>
              </span>
            </div>

            {/* Offline Icon Container */}
            <div className="w-16 h-16 rounded-2xl bg-[#164E3E]/70 border border-[#FFF0B3]/20 flex items-center justify-center text-[#F5D061] shadow-inner mt-2">
              <WifiOff className="w-8 h-8 stroke-[2.2]" aria-hidden="true" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1
                id="offline-title"
                className="font-heading font-extrabold text-2xl text-butter-cream tracking-tight"
              >
                You&apos;re offline
              </h1>
              <p
                id="offline-desc"
                className="text-xs sm:text-sm text-[#D8EAE1] max-w-xs leading-relaxed"
              >
                Check your connection and try again. Your drafts and approvals are safe.
              </p>
            </div>

            {/* Try Again Button */}
            <div className="pt-2 w-full max-w-[220px]">
              <button
                ref={tryAgainButtonRef}
                type="button"
                onClick={handleTryAgain}
                className={`w-full py-3 px-6 rounded-full font-bold text-sm bg-butter-cream text-[#0C382E] hover:bg-butter-gold active:scale-95 shadow-md transition-all cursor-pointer ${
                  shaking ? "animate-shake bg-amber-300" : ""
                }`}
              >
                {stillOffline ? "Still offline" : "Try again"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Back online" Mobile Toast Banner */}
      {showBackOnlineToast && isMobile && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#0C382E] text-[#FFF0B3] border border-[#164E3E] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold md:hidden animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FFF0B3] shrink-0" />
          <span>Back online</span>
        </div>
      )}
    </>
  );
};

export default OfflineScreen;
