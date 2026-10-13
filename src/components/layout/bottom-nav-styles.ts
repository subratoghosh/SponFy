/**
 * Shared mobile bottom navigation bar styles.
 * Matches the solid brand cream design system from the marketing pages.
 */

export const BOTTOM_NAV_CONTAINER_CLASS =
  "fixed bottom-0 inset-x-0 z-40 bg-[#FFF0B3]/95 backdrop-blur-md border-t border-green-dark/15 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-3 sm:px-4 pt-1.5";

export const BOTTOM_NAV_SAFE_AREA_STYLE: React.CSSProperties = {
  paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
};

export const BOTTOM_NAV_INNER_CLASS =
  "w-full max-w-md mx-auto flex items-center justify-around gap-1";

export const BOTTOM_NAV_TAB_BASE_CLASS =
  "flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl text-[10px] transition-all min-h-[44px] min-w-[44px] flex-1 text-center select-none";

export const BOTTOM_NAV_TAB_ACTIVE_CLASS =
  "bg-green-dark text-butter-cream shadow-sm scale-[1.02]";

export const BOTTOM_NAV_TAB_INACTIVE_CLASS =
  "text-green-dark/80 hover:text-green-dark hover:bg-green-dark/5";

export const BOTTOM_NAV_ICON_ACTIVE_CLASS =
  "w-5 h-5 mb-0.5 shrink-0 text-butter-cream stroke-[2.5]";

export const BOTTOM_NAV_ICON_INACTIVE_CLASS =
  "w-5 h-5 mb-0.5 shrink-0 text-green-dark/85 stroke-[2]";

export const BOTTOM_NAV_LABEL_ACTIVE_CLASS =
  "leading-tight tracking-tight text-butter-cream font-bold";

export const BOTTOM_NAV_LABEL_INACTIVE_CLASS =
  "leading-tight tracking-tight text-green-dark font-semibold";
