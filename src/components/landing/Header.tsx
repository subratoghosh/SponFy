"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SponfyBrand } from "@/components/ui/SponfyBrand";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Workflow", href: "/workflow" },
  { name: "Showcase", href: "/showcase" },
  { name: "Intelligence", href: "/intelligence" },
  { name: "Analytics", href: "/analytics" },
  { name: "FAQ", href: "/faq" },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-[1240px] bg-green-dark border-2 border-butter-cream/85 hover:border-butter-cream ring-1 ring-butter-cream/30 rounded-full px-6 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all duration-200">
        {/* Logo Wordmark */}
        <div className="hover:scale-105 transition-transform duration-200">
          <SponfyBrand href="/" size="md" theme="dark" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-text-onDarkSub">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full transition-all duration-200 inline-block font-semibold",
                  isActive
                    ? "text-butter-cream border border-butter-cream/90 bg-green-mid/80 shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                    : "text-text-onDarkSub hover:text-butter-cream hover:bg-green-mid/70 border border-transparent"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* CTA & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-text-onDark hover:text-butter-cream hover:bg-green-mid/70 transition-all duration-150 px-3.5 py-1.5 rounded-full"
          >
            Log in
          </Link>
          <Link href="/app">
            <Button
              variant="butter"
              size="sm"
              className="font-bold shadow-md hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,240,179,0.4)] transition-all duration-150 group"
            >
              Start a campaign
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/app">
            <Button variant="butter" size="sm" className="text-xs px-3 py-1.5">
              Launch
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 text-butter-cream hover:bg-green-mid rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-40 sm:hidden pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-4 top-20 bg-green-dark border-2 border-butter-cream/50 rounded-3xl p-6 shadow-2xl z-50 flex flex-col gap-2.5 text-center sm:hidden animate-fade-in pointer-events-auto max-h-[80vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-semibold py-2.5 px-4 rounded-xl transition-colors border",
                    isActive
                      ? "bg-green-mid text-butter-cream border-butter-cream/60 shadow-sm"
                      : "text-butter-cream/80 hover:text-butter-cream hover:bg-green-mid/40 border-transparent"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2 flex flex-col gap-2.5 border-t border-green-mid/40 mt-1">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero-ghost" className="w-full justify-center">
                  Log in
                </Button>
              </Link>
              <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="butter" className="w-full justify-center font-bold shadow-md">
                  Start a campaign
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
