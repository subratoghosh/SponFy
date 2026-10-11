"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GitBranch,
  Layers,
  BarChart3,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  FileText,
  LogIn,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRIMARY_TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Workflow", href: "/workflow", icon: GitBranch },
  { label: "Showcase", href: "/showcase", icon: Layers },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const MORE_LINKS = [
  { label: "Reply Intelligence", href: "/intelligence", icon: Sparkles, desc: "Sentiment analysis & AI drafts" },
  { label: "Knowledge Base & FAQ", href: "/faq", icon: HelpCircle, desc: "Safety, Gmail OAuth & answers" },
  { label: "Privacy Policy", href: "/privacy", icon: ShieldCheck, desc: "Data protection & zero LLM training" },
  { label: "Terms of Service", href: "/terms", icon: FileText, desc: "Organizer rules & anti-spam policy" },
];

export const MarketingMobileNav: React.FC = () => {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Slide-Up Bottom Sheet when "More" is active */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative w-full bg-green-dark border-t-2 border-butter-cream/40 rounded-t-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))] animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-green-mid/40">
              <span className="text-xs font-bold uppercase tracking-wider text-butter-cream/80 flex items-center gap-2">
                <Menu className="w-4 h-4 text-butter-cream" />
                Explore SponFy
              </span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-full text-butter-cream/70 hover:text-white hover:bg-green-mid/60"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {MORE_LINKS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 p-3 rounded-2xl border transition-all text-left",
                      isActive
                        ? "bg-green-mid text-butter-cream border-butter-cream/60 shadow-sm"
                        : "bg-green-deep/60 text-butter-cream/90 border-green-mid/40 hover:bg-green-mid/40 hover:text-white"
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-butter-cream/15 text-butter-cream flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm leading-snug">{item.label}</div>
                      <div className="text-[11px] text-text-onDarkSub/70 truncate">{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMoreOpen(false)}>
                <Button variant="butter" className="w-full justify-center text-sm font-extrabold shadow-md">
                  <LogIn className="w-4 h-4 mr-2" />
                  Log in to Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Dock Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-green-dark/95 backdrop-blur-xl border-t border-green-mid/60 shadow-[0_-10px_35px_rgba(0,0,0,0.45)] px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around"
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[46px] min-w-[46px]",
                isActive
                  ? "bg-butter-cream text-green-dark shadow-sm scale-105"
                  : "text-text-onDarkSub/85 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mb-0.5",
                  isActive ? "text-green-dark stroke-[2.5]" : "text-butter-cream/80"
                )}
              />
              <span className="leading-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* Launch App direct link */}
        <Link
          href="/app"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold text-butter-cream hover:text-white transition-all min-h-[46px] min-w-[46px] group"
        >
          <div className="w-6 h-6 rounded-lg bg-butter-cream/20 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
            <ArrowRight className="w-3.5 h-3.5 text-butter-cream" />
          </div>
          <span className="leading-tight text-butter-cream font-extrabold">App</span>
        </Link>

        {/* More Trigger */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-h-[46px] min-w-[46px]",
            moreOpen
              ? "bg-green-mid text-butter-cream border border-butter-cream/40"
              : "text-text-onDarkSub/85 hover:text-white"
          )}
          aria-label="More navigation options"
        >
          <Menu className="w-5 h-5 mb-0.5 text-butter-cream/80" />
          <span className="leading-tight">More</span>
        </button>
      </nav>
    </>
  );
};
