"use client";

import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

interface InstallAppButtonProps {
  className?: string;
  label?: string;
  icon?: "download" | "android";
  // Where to send people when the browser cannot show the install dialog
  fallbackHref?: string;
  // Keep the button visible even inside the installed app (used on /get-app)
  alwaysShow?: boolean;
  // Style variant
  variant?: "solid" | "outline" | "android" | "ghost";
  // Drop the top spacing wrapper (for inline use in the header)
  inline?: boolean;
  tabIndex?: number;
}

const AndroidIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 shrink-0" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M17.52 8.35L19.5 4.92c.16-.27.06-.62-.21-.77a.57.57 0 00-.77.21l-2.02 3.5a11.1 11.1 0 00-4.5-.94c-1.6 0-3.15.34-4.5.94L5.48 4.36a.57.57 0 00-.77-.21c-.27.15-.37.5-.21.77l1.98 3.43C3.76 10.13 2 13.06 2 16.5h20c0-3.44-1.76-6.37-4.48-8.15zM7.5 13.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm9 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
  </svg>
);

const BASE_CLASS =
  "inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-butter-cream/60 whitespace-nowrap";

const VARIANT_CLASS = {
  solid: "bg-butter-cream text-green-dark hover:opacity-90",
  outline:
    "border border-butter-cream/70 text-butter-cream hover:bg-green-mid/70 hover:border-butter-cream",
  android:
    "border border-butter-cream/35 bg-green-mid/30 text-butter-cream hover:bg-butter-cream hover:text-green-dark hover:border-butter-cream shadow-sm hover:shadow-[0_4px_16px_rgba(255,240,179,0.25)]",
  ghost:
    "text-butter-cream hover:text-white px-1 py-1 hover:opacity-90",
};

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  className = "",
  label = "Get the app",
  icon = "download",
  fallbackHref = "/get-app",
  alwaysShow = false,
  variant = "solid",
  inline = false,
  tabIndex,
}) => {
  const { canInstall, isStandalone, promptInstall } = useInstallPrompt();

  // Already running as an installed app: nothing to offer
  if (isStandalone && !alwaysShow) return null;

  const wrapperClass = inline ? "" : "pt-2";
  const classes = `${BASE_CLASS} ${VARIANT_CLASS[variant]} ${className}`;

  const renderIcon =
    icon === "android" ? (
      <AndroidIcon className="w-4 h-4 shrink-0 text-current" />
    ) : (
      <Download className="w-4 h-4 shrink-0 text-current" aria-hidden="true" />
    );

  const content = (
    <>
      {renderIcon}
      <span>{label}</span>
    </>
  );

  // Browser can show its native install dialog: do it right away
  if (canInstall) {
    return (
      <div className={wrapperClass}>
        <button
          type="button"
          onClick={() => promptInstall()}
          className={classes}
          tabIndex={tabIndex}
        >
          {content}
        </button>
      </div>
    );
  }

  // Otherwise open the page that explains how to install on each device
  return (
    <div className={wrapperClass}>
      <Link href={fallbackHref} className={classes}
          tabIndex={tabIndex}>
        {content}
      </Link>
    </div>
  );
};

export default InstallAppButton;
