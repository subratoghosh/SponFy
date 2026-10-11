"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SponfyLogo } from "@/components/ui/SponfyLogo";

interface LogoIntroProps {
  onComplete: () => void;
}

const SPARKS = [
  { isStar: true, color: "#F5D061", x: 75, y: -10 },
  { isStar: false, color: "#FFF0B3", x: 55, y: -58 },
  { isStar: true, color: "#F5D061", x: 0, y: -80 },
  { isStar: false, color: "#FFF0B3", x: -55, y: -58 },
  { isStar: true, color: "#F5D061", x: -75, y: -10 },
  { isStar: false, color: "#FFF0B3", x: -48, y: 44 },
  { isStar: true, color: "#F5D061", x: 0, y: 65 },
  { isStar: false, color: "#FFF0B3", x: 52, y: 44 },
];

export const LogoIntro: React.FC<LogoIntroProps> = ({ onComplete }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while overlay is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Timer & early exit event listeners (Escape, click, wheel, touch)
  useEffect(() => {
    // 3.2s total animation sequence
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onComplete();
      }
    };

    const handleScrollOrMove = () => {
      onComplete();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleScrollOrMove, { passive: true });
    window.addEventListener("touchmove", handleScrollOrMove, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleScrollOrMove);
      window.removeEventListener("touchmove", handleScrollOrMove);
    };
  }, [onComplete]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      aria-hidden="true"
      onClick={onComplete}
      className="logo-intro-root fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto bg-green-dark/40 backdrop-blur-[12px] animate-logo-intro-backdrop select-none cursor-pointer"
    >
      {/* Centre Stage Container */}
      <div className="animate-logo-intro-center-content flex flex-col items-center justify-center p-8">
        {/* Badge & Popping Robot Lockup (120px Centre Stage) */}
        <div className="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
          {/* 1. Green & Cream Border Badge (0.0s - 0.4s fade/scale in, morphs out at 2.6s - 3.2s) */}
          <div className="absolute w-[120px] h-[120px] rounded-full bg-green-dark border-[3.5px] border-butter-cream/90 shadow-[0_12px_36px_rgba(0,0,0,0.55)] animate-logo-intro-badge pointer-events-none" />

          {/* 2. Soft Yellow Glow Ring (pulses behind robot at 0.42s) */}
          <div className="absolute w-[136px] h-[136px] rounded-full border border-butter-gold/70 bg-butter-gold/25 blur-xs animate-logo-intro-glow pointer-events-none" />

          {/* 3. Spark Burst (fires at 0.42s outward) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {SPARKS.map((spark, index) => (
              <div
                key={index}
                className="absolute animate-logo-intro-sparkle flex items-center justify-center pointer-events-none"
                style={
                  {
                    "--spark-x": `${spark.x}px`,
                    "--spark-y": `${spark.y}px`,
                  } as React.CSSProperties
                }
              >
                {spark.isStar ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(245,208,97,0.6)]"
                    style={{ color: spark.color }}
                  >
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-[0_2px_6px_rgba(255,240,179,0.7)]"
                    style={{ backgroundColor: spark.color }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 4. Popping & Waving Robot (96px, springs up by -50px) */}
          <div className="absolute flex items-center justify-center animate-logo-intro-pop pointer-events-none">
            <div className="animate-logo-intro-sink">
              <SponfyLogo size={96} variant="cream" animated={true} />
            </div>
          </div>

          {/* 5. Robot Settle (fades in as badge morphs to 96px static logo at 2.6s - 3.2s) */}
          <div className="absolute flex items-center justify-center animate-logo-intro-settle pointer-events-none">
            <SponfyLogo size={96} variant="cream" animated={false} />
          </div>
        </div>

        {/* 6. Wordmark "SponFy": Slides up & fades in below robot at 2.5s - 3.2s */}
        <div className="animate-logo-intro-wordmark flex items-baseline tracking-tight font-heading font-extrabold select-none mt-6">
          <span className="text-4xl sm:text-5xl text-butter-cream drop-shadow-lg">Spon</span>
          <span className="text-4xl sm:text-5xl text-[#F5D061] drop-shadow-lg">Fy</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoIntro;
