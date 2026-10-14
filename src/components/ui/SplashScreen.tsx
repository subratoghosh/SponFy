"use client";

import React, { useState, useEffect } from "react";
import { SponfyLogo } from "./SponfyLogo";

export const SplashScreen: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only show below the md breakpoint (mobile: < 768px)
    if (window.innerWidth >= 768) {
      return;
    }

    // Only show once per browser session
    let alreadyShown = true;
    try {
      alreadyShown = Boolean(sessionStorage.getItem("sponfy_splash_shown"));
      if (!alreadyShown) {
        sessionStorage.setItem("sponfy_splash_shown", "1");
      }
    } catch {
      // If sessionStorage is unavailable or throws, default to not showing
      alreadyShown = true;
    }

    if (alreadyShown) {
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setVisible(true);

    if (prefersReducedMotion) {
      // Skip animations and show for ~300ms only
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }

    // Stay for ~750ms after hydration, then fade out over 300ms
    const holdTimer = setTimeout(() => {
      setFading(true);
      const fadeTimer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(fadeTimer);
    }, 750);

    return () => clearTimeout(holdTimer);
  }, []);

  // Return null when unmounted or complete so it does not block clicks and leaves the DOM
  if (!mounted || !visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Loading SponFy"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] bg-[#0C382E] flex flex-col items-center justify-center transition-opacity duration-300 md:hidden ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in select-none">
        <SponfyLogo size={72} variant="cream" animated={false} />
        <span className="text-butter-cream font-heading font-extrabold text-2xl tracking-tight">
          Spon<span className="text-[#F5D061]">Fy</span>
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
