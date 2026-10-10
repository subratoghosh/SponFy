import React from "react";

interface SponfyLogoProps {
  className?: string;
  size?: number | string;
  variant?: "cream" | "green" | "gold" | "monochrome";
  withSparkle?: boolean;
}

export const SponfyLogo: React.FC<SponfyLogoProps> = ({
  className = "",
  size = 36,
  variant = "cream",
  withSparkle = false,
}) => {
  // Color tokens based on variant
  const isGreen = variant === "green";
  const isGold = variant === "gold";

  // Primary body & head fill
  const bodyFill = isGreen
    ? "#0C3729"
    : isGold
    ? "#F5D061"
    : "#FBF7EE";

  // Facial feature & stroke color
  const strokeColor = isGreen ? "#FBF7EE" : "#0C3729";

  // Badge gold accent
  const badgeGold = "#F5D061";
  const badgeDark = "#0C3729";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Antenna */}
        <circle cx="50" cy="12" r="4.5" fill={bodyFill} />
        <path
          d="M50 16.5V23"
          stroke={bodyFill}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Head Side Ears */}
        <rect x="18" y="32" width="5" height="12" rx="2.5" fill={bodyFill} />
        <rect x="77" y="32" width="5" height="12" rx="2.5" fill={bodyFill} />

        {/* Main Robot Head */}
        <rect
          x="21"
          y="23"
          width="58"
          height="40"
          rx="12"
          fill={bodyFill}
        />

        {/* Screen Bezel (Inner Outline) */}
        <rect
          x="26"
          y="28"
          width="48"
          height="30"
          rx="8"
          stroke={strokeColor}
          strokeWidth="3.2"
          fill="none"
        />

        {/* Happy Smiling Eyes: ^ ^ */}
        <path
          d="M34 43C36 38.5 40 38.5 42 43"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M58 43C60 38.5 64 38.5 66 43"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Happy Smile Mouth */}
        <path
          d="M46.5 48.5C48 51.5 52 51.5 53.5 48.5"
          stroke={strokeColor}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Robot Body */}
        <path
          d="M35 66C32 75 32 94 50 95C68 94 68 75 65 66Z"
          fill={bodyFill}
        />

        {/* Left Arm (Resting at side) */}
        <path
          d="M34 68C28.5 73 24.5 81 27 86.5C28.5 89 33 87 34 81C34.5 77 34.5 72 34 68Z"
          fill={bodyFill}
        />

        {/* Right Arm (Waving up high) */}
        <path
          d="M66 68C72 65 83 58 85 49.5C86.5 46.5 83.5 45.5 81 48C76 53 68 62 65 71Z"
          fill={bodyFill}
        />

        {/* Chest Emblem: Handshake Badge */}
        {/* Badge Base */}
        <ellipse cx="50" cy="80.5" rx="10.5" ry="7.5" fill={isGreen ? "#164e3b" : "#FFFFFF"} />

        {/* Golden Left Loop / Hand */}
        <path
          d="M44 80.5C44 77.5 47 75.5 50 78.5L52.5 81C53.5 82 53.5 83.5 52 84.5C50.5 85.5 48.5 85.5 47 84L44 80.5Z"
          fill={badgeGold}
        />

        {/* Dark Right Loop / Hand (Interlocking Handshake) */}
        <path
          d="M56 80.5C56 83.5 53 85.5 50 82.5L47.5 80C46.5 79 46.5 77.5 48 76.5C49.5 75.5 51.5 75.5 53 77L56 80.5Z"
          fill={isGreen ? "#F5D061" : badgeDark}
        />

        {/* Interlocking Handshake Center Clasp */}
        <path
          d="M47.5 79.5C49 78.2 51 78.2 52.5 79.5L50 82L47.5 79.5Z"
          fill={badgeGold}
        />
      </svg>

      {/* Optional decorative sparkle in corner */}
      {withSparkle && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-butter-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-butter-gold"></span>
        </span>
      )}
    </div>
  );
};

export default SponfyLogo;
