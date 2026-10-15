"use client";

import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

interface InstallAppButtonProps {
  className?: string;
  label?: string;
  // Where to send people when the browser cannot show the install dialog
  fallbackHref?: string;
  // Keep the button visible even inside the installed app (used on /get-app)
  alwaysShow?: boolean;
  // "outline" is the ghost style used inside the dark site header
  variant?: "solid" | "outline";
  // Drop the top spacing wrapper (for inline use in the header)
  inline?: boolean;
  tabIndex?: number;
}

const BASE_CLASS =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-butter-cream/60 whitespace-nowrap";

const VARIANT_CLASS = {
  solid: "bg-butter-cream text-green-dark hover:opacity-90",
  outline:
    "border border-butter-cream/70 text-butter-cream hover:bg-green-mid/70 hover:border-butter-cream",
};

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  className = "",
  label = "Get the app",
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

  const content = (
    <>
      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
      {label}
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
