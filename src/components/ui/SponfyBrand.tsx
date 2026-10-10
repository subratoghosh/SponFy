import React from "react";
import Link from "next/link";
import { SponfyLogo } from "./SponfyLogo";
import { cn } from "@/lib/utils";

interface SponfyBrandProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "auto";
  showLogo?: boolean;
  className?: string;
}

export const SponfyBrand: React.FC<SponfyBrandProps> = ({
  href = "/",
  size = "md",
  theme = "dark",
  showLogo = true,
  className = "",
}) => {
  const sizeMap = {
    sm: { logo: 28, text: "text-lg", containerGap: "gap-2" },
    md: { logo: 36, text: "text-xl", containerGap: "gap-2.5" },
    lg: { logo: 44, text: "text-2xl", containerGap: "gap-3" },
    xl: { logo: 56, text: "text-3xl", containerGap: "gap-3.5" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const isDarkTheme = theme === "dark";

  const content = (
    <div
      className={cn(
        "flex items-center group select-none transition-transform duration-200",
        currentSize.containerGap,
        className
      )}
    >
      {showLogo && (
        <div className="relative transform group-hover:scale-105 transition-transform duration-200">
          <SponfyLogo
            size={currentSize.logo}
            variant={isDarkTheme ? "cream" : "green"}
          />
        </div>
      )}

      <div className="flex items-baseline tracking-tight font-heading font-extrabold">
        <span
          className={cn(
            currentSize.text,
            isDarkTheme ? "text-butter-cream" : "text-green-dark"
          )}
        >
          Spon
        </span>
        <span
          className={cn(
            currentSize.text,
            "text-[#F5D061] transition-colors"
          )}
        >
          Fy
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};

export default SponfyBrand;
