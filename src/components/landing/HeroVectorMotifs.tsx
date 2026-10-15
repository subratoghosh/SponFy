"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MotifProps {
  className?: string;
  floatClass?: string;
  children: React.ReactNode;
}

const VectorMotifItem: React.FC<MotifProps> = ({
  className,
  floatClass = "float-motif-1",
  children,
}) => {
  return (
    <div
      className={cn(
        "absolute z-0 select-none vector-motif-interactive transition-all duration-300",
        floatClass,
        className
      )}
    >
      <div className="relative flex items-center justify-center p-2 rounded-2xl hover:bg-butter-cream/5 transition-colors">
        {/* Glow backdrop aura on hover */}
        <div className="absolute inset-0 rounded-full bg-butter-cream/0 group-hover:bg-butter-cream/20 blur-lg transition-all duration-300 pointer-events-none" />

        {/* The SVG Graphic */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export const HeroVectorMotifs: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 1. TOP-LEFT: Ascending Hackathon Rocket - tucked safely in top-left corner */}
      <VectorMotifItem
        className="top-[3%] left-[1%] lg:left-[2%] hidden md:block opacity-35 hover:opacity-90 scale-85"
        floatClass="float-motif-1"
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbit arc */}
          <ellipse
            cx="60"
            cy="60"
            rx="52"
            ry="24"
            transform="rotate(-30 60 60)"
            stroke="#FFF0B3"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.45"
          />
          {/* Rocket Fuselage */}
          <path
            d="M60 22 C68 34 74 52 72 70 L48 70 C46 52 52 34 60 22 Z"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.08)"
            strokeLinejoin="round"
          />
          {/* Rocket Nosecone Tip */}
          <path
            d="M56 34 C58 26 62 26 64 34 Z"
            fill="#FFF0B3"
            opacity="0.6"
          />
          {/* Porthole Window */}
          <circle cx="60" cy="46" r="6" stroke="#FFF0B3" strokeWidth="1.75" fill="rgba(12, 56, 46, 0.6)" />
          <circle cx="60" cy="46" r="3" fill="#FFF0B3" />
          {/* Wings / Fins */}
          <path
            d="M48 58 L36 72 L48 68 Z"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            fill="rgba(255, 240, 179, 0.12)"
          />
          <path
            d="M72 58 L84 72 L72 68 Z"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            fill="rgba(255, 240, 179, 0.12)"
          />
          {/* Center Fin */}
          <line x1="60" y1="58" x2="60" y2="70" stroke="#FFF0B3" strokeWidth="1.5" />
          {/* Rocket Thrust Flame */}
          <path
            d="M52 70 C56 84 60 92 60 92 C60 92 64 84 68 70 Z"
            stroke="#FEE790"
            strokeWidth="1.5"
            fill="rgba(254, 231, 144, 0.25)"
          />
          <path
            d="M55 70 C58 78 60 84 60 84 C60 84 62 78 65 70 Z"
            fill="#FFF0B3"
            opacity="0.7"
          />
          {/* Velocity sparks */}
          <circle cx="34" cy="42" r="1.5" fill="#FFF0B3" />
          <circle cx="88" cy="40" r="1.5" fill="#FFF0B3" />
          <circle cx="92" cy="78" r="2" fill="#FFF0B3" opacity="0.8" />
          <path d="M26 30 L30 30 M28 28 L28 32" stroke="#FFF0B3" strokeWidth="1.2" />
        </svg>
      </VectorMotifItem>

      {/* 2. TOP-RIGHT: Precision AI Fit Target & Crosshairs */}
      <VectorMotifItem
        className="top-[3%] right-[1%] lg:right-[3%] hidden md:block opacity-35 hover:opacity-90 scale-85"
        floatClass="float-motif-2"
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Target Circle */}
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            strokeDasharray="6 3"
            opacity="0.5"
          />
          {/* Middle Target Circle */}
          <circle
            cx="60"
            cy="60"
            r="35"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            fill="rgba(255, 240, 179, 0.05)"
          />
          {/* Inner Target Circle */}
          <circle
            cx="60"
            cy="60"
            r="22"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            fill="rgba(255, 240, 179, 0.12)"
          />
          {/* Bullseye Core */}
          <circle cx="60" cy="60" r="9" stroke="#FFF0B3" strokeWidth="1.75" fill="#FFF0B3" />
          {/* Crosshairs */}
          <line x1="60" y1="6" x2="60" y2="22" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="60" y1="98" x2="60" y2="114" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="6" y1="60" x2="22" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="98" y1="60" x2="114" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          {/* Dart Arrow */}
          <path
            d="M84 36 L63 57"
            stroke="#FFF0B3"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M84 36 L92 34 L88 42 Z" fill="#FFF0B3" />
          <path d="M84 36 L86 28 L78 32 Z" fill="#FFF0B3" />
          <circle cx="28" cy="30" r="2" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>

      {/* 3. TOP-CENTER GAP: Multi-Source AI Citation Constellation (cleared away from left-aligned headline) */}
      <VectorMotifItem
        className="top-[2%] left-[32%] lg:left-[38%] hidden xl:block opacity-25 hover:opacity-85 scale-85"
        floatClass="float-motif-3"
      >
        <svg
          width="132"
          height="132"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagonal Lattice Backbone */}
          <polygon
            points="60,18 96,38 96,82 60,102 24,82 24,38"
            stroke="#FFF0B3"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.45"
            fill="rgba(255, 240, 179, 0.04)"
          />
          {/* Connecting Neural Paths */}
          <line x1="60" y1="18" x2="60" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="24" y1="38" x2="60" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="96" y1="38" x2="60" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="24" y1="82" x2="60" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="96" y1="82" x2="60" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />
          <line x1="60" y1="102" x2="60" y2="60" stroke="#FFF0B3" strokeWidth="1.5" />

          {/* Central AI Brain Hub */}
          <circle cx="60" cy="60" r="14" stroke="#FFF0B3" strokeWidth="2" fill="rgba(14, 59, 46, 0.8)" />
          <circle cx="60" cy="60" r="8" fill="#FFF0B3" opacity="0.9" />

          {/* Peripheral Citation Nodes */}
          <circle cx="60" cy="18" r="6" stroke="#FFF0B3" strokeWidth="1.5" fill="#0E3B2E" />
          <circle cx="60" cy="18" r="2.5" fill="#FFF0B3" />

          <circle cx="96" cy="38" r="6" stroke="#FFF0B3" strokeWidth="1.5" fill="#0E3B2E" />
          <circle cx="96" cy="38" r="2.5" fill="#FFF0B3" />

          <circle cx="96" cy="82" r="6" stroke="#FFF0B3" strokeWidth="1.5" fill="#0E3B2E" />
          <circle cx="96" cy="82" r="2.5" fill="#FFF0B3" />

          <circle cx="60" cy="102" r="6" stroke="#FFF0B3" strokeWidth="1.5" fill="#0E3B2E" />
          <circle cx="60" cy="102" r="2.5" fill="#FFF0B3" />

          <circle cx="24" cy="82" r="6" stroke="#FFF0B3" strokeWidth="1.5" fill="#0E3B2E" />
          <circle cx="24" cy="82" r="2.5" fill="#FFF0B3" />

          <circle cx="24" cy="38" r="6" stroke="#FFF0B3" strokeWidth="1.5" fill="#0E3B2E" />
          <circle cx="24" cy="38" r="2.5" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>

      {/* 4. MID-RIGHT: Partnership Handshake Crest */}
      <VectorMotifItem
        className="top-[34%] right-[0.5%] lg:right-[1.5%] hidden lg:block opacity-35 hover:opacity-90 scale-85"
        floatClass="float-motif-4"
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular Shield Badge */}
          <circle
            cx="60"
            cy="60"
            r="46"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.45"
          />
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke="#FFF0B3"
            strokeWidth="1.5"
            fill="rgba(255, 240, 179, 0.05)"
          />
          {/* Left Arm & Hand */}
          <path
            d="M30 68 L44 58 L52 64 L48 74 L34 76 Z"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="rgba(255, 240, 179, 0.1)"
          />
          {/* Right Arm & Hand Clasping */}
          <path
            d="M90 68 L76 58 L68 64 L72 74 L86 76 Z"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="rgba(255, 240, 179, 0.1)"
          />
          {/* Clasping Fingers Center */}
          <path
            d="M52 64 C56 60 64 60 68 64 C64 70 56 70 52 64 Z"
            stroke="#FFF0B3"
            strokeWidth="2"
            fill="#FFF0B3"
          />
          {/* Star Glory on Top */}
          <polygon
            points="60,30 63,36 70,37 65,42 66,49 60,45 54,49 55,42 50,37 57,36"
            fill="#FEE790"
            stroke="#FFF0B3"
            strokeWidth="1"
          />
          <circle cx="40" cy="38" r="1.5" fill="#FFF0B3" />
          <circle cx="80" cy="38" r="1.5" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>

      {/* 5. BOTTOM-LEFT: Megaphone Outreach Broadcast (pushed safely to bottom corner) */}
      <VectorMotifItem
        className="bottom-[2%] left-[0.5%] lg:left-[1.5%] hidden sm:block opacity-35 hover:opacity-90 scale-80"
        floatClass="float-motif-2"
      >
        <svg
          width="122"
          height="122"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Megaphone Body */}
          <path
            d="M34 50 L56 40 L56 80 L34 70 Z"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.08)"
            strokeLinejoin="round"
          />
          {/* Megaphone Bell Front */}
          <ellipse
            cx="56"
            cy="60"
            rx="6"
            ry="20"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.15)"
          />
          {/* Handle */}
          <path
            d="M38 70 L38 88 L46 88 L46 66"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Mouthpiece */}
          <rect
            x="24"
            y="54"
            width="10"
            height="12"
            rx="2"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.12)"
          />
          {/* Broadcast Sound Wave Arcs */}
          <path
            d="M72 46 C78 54 78 66 72 74"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M82 40 C92 52 92 68 82 80"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="86" cy="30" r="1.5" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>

      {/* 6. LOWER-RIGHT: Trophy Cup */}
      <VectorMotifItem
        className="bottom-[14%] right-[1%] lg:right-[2%] hidden sm:block opacity-35 hover:opacity-90 scale-85"
        floatClass="float-motif-1"
      >
        <svg
          width="122"
          height="122"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Trophy Cup Body */}
          <path
            d="M40 32 L80 32 C80 56 68 68 60 70 C52 68 40 56 40 32 Z"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.1)"
            strokeLinejoin="round"
          />
          {/* Trophy Rim */}
          <ellipse
            cx="60"
            cy="32"
            rx="20"
            ry="5"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.2)"
          />
          {/* Trophy Handles */}
          <path
            d="M40 38 C28 38 28 54 40 58"
            stroke="#FFF0B3"
            strokeWidth="1.75"
          />
          <path
            d="M80 38 C92 38 92 54 80 58"
            stroke="#FFF0B3"
            strokeWidth="1.75"
          />
          {/* Trophy Stem */}
          <line x1="60" y1="70" x2="60" y2="84" stroke="#FFF0B3" strokeWidth="2.5" />
          {/* Trophy Base Pedestal */}
          <path
            d="M48 84 L72 84 L76 96 L44 96 Z"
            stroke="#FFF0B3"
            strokeWidth="1.75"
            fill="rgba(255, 240, 179, 0.15)"
            strokeLinejoin="round"
          />
          {/* Embossed Star on Cup */}
          <polygon
            points="60,42 62,47 67,47 63,50 65,55 60,52 55,55 57,50 53,47 58,47"
            fill="#FEE790"
            stroke="#FFF0B3"
            strokeWidth="0.8"
          />
          <circle cx="26" cy="30" r="1.5" fill="#FFF0B3" />
          <circle cx="94" cy="30" r="1.5" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>

      {/* 7. BOTTOM-LEFT GUTTER: Coin Stack */}
      <VectorMotifItem
        className="bottom-[2%] left-[18%] lg:left-[22%] hidden xl:block opacity-25 hover:opacity-80 scale-80"
        floatClass="float-motif-3"
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Coin 1 Bottom */}
          <ellipse cx="50" cy="74" rx="28" ry="9" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(255, 240, 179, 0.15)" />
          <path d="M22 66 C22 71 34 75 50 75 C66 75 78 71 78 66 L78 74 C78 79 66 83 50 83 C34 83 22 79 22 74 Z" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(14, 59, 46, 0.7)" />

          {/* Coin 2 Middle */}
          <ellipse cx="50" cy="58" rx="28" ry="9" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(255, 240, 179, 0.15)" />
          <path d="M22 50 C22 55 34 59 50 59 C66 59 78 55 78 50 L78 58 C78 63 66 67 50 67 C34 67 22 63 22 58 Z" stroke="#FFF0B3" strokeWidth="1.5" fill="rgba(14, 59, 46, 0.7)" />

          {/* Coin 3 Top */}
          <ellipse cx="50" cy="42" rx="28" ry="9" stroke="#FFF0B3" strokeWidth="1.75" fill="rgba(255, 240, 179, 0.25)" />
          {/* Coin Top Emblem (pure geometric star crest) */}
          <circle cx="50" cy="42" r="10" stroke="#FFF0B3" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="42" r="4" fill="#FFF0B3" />
          <circle cx="72" cy="36" r="2" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>

      {/* 8. BOTTOM-RIGHT GUTTER: Growth Chart */}
      <VectorMotifItem
        className="bottom-[2%] right-[8%] lg:right-[12%] hidden xl:block opacity-25 hover:opacity-80 scale-80"
        floatClass="float-motif-4"
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Axes */}
          <line x1="20" y1="80" x2="84" y2="80" stroke="#FFF0B3" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="20" x2="20" y2="80" stroke="#FFF0B3" strokeWidth="1.5" strokeLinecap="round" />

          {/* Bars */}
          <rect x="28" y="60" width="8" height="20" rx="2" stroke="#FFF0B3" strokeWidth="1.2" fill="rgba(255, 240, 179, 0.15)" />
          <rect x="42" y="48" width="8" height="32" rx="2" stroke="#FFF0B3" strokeWidth="1.2" fill="rgba(255, 240, 179, 0.2)" />
          <rect x="56" y="36" width="8" height="44" rx="2" stroke="#FFF0B3" strokeWidth="1.2" fill="rgba(255, 240, 179, 0.25)" />
          <rect x="70" y="24" width="8" height="56" rx="2" stroke="#FFF0B3" strokeWidth="1.2" fill="rgba(255, 240, 179, 0.35)" />

          {/* Trendline Curve */}
          <path
            d="M32 56 Q46 44 60 32 T76 18"
            stroke="#FEE790"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M72 16 L78 18 L76 24 Z" fill="#FEE790" />
          <circle cx="32" cy="56" r="2.5" fill="#FFF0B3" />
          <circle cx="46" cy="44" r="2.5" fill="#FFF0B3" />
          <circle cx="60" cy="32" r="2.5" fill="#FFF0B3" />
          <circle cx="74" cy="20" r="3" fill="#FFF0B3" />
        </svg>
      </VectorMotifItem>
    </div>
  );
};
