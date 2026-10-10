"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SponfyBrand } from "@/components/ui/SponfyBrand";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-[1240px] bg-green-dark border-2 border-butter-cream/85 hover:border-butter-cream ring-1 ring-butter-cream/30 rounded-full px-6 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all duration-200">
        {/* Logo Wordmark */}
        <div className="hover:scale-105 transition-transform duration-200">
          <SponfyBrand href="/" size="md" theme="dark" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-text-onDarkSub">
          <a
            href="#workflow"
            className="px-3.5 py-1.5 rounded-full text-text-onDarkSub hover:text-butter-cream hover:bg-green-mid/70 transition-all duration-150"
          >
            Workflow
          </a>
          <a
            href="#showcase"
            className="px-3.5 py-1.5 rounded-full text-text-onDarkSub hover:text-butter-cream hover:bg-green-mid/70 transition-all duration-150"
          >
            Showcase
          </a>
          <a
            href="#intelligence"
            className="px-3.5 py-1.5 rounded-full text-text-onDarkSub hover:text-butter-cream hover:bg-green-mid/70 transition-all duration-150"
          >
            Intelligence
          </a>
          <a
            href="#analytics"
            className="px-3.5 py-1.5 rounded-full text-text-onDarkSub hover:text-butter-cream hover:bg-green-mid/70 transition-all duration-150"
          >
            Analytics
          </a>
          <a
            href="#faq"
            className="px-3.5 py-1.5 rounded-full text-text-onDarkSub hover:text-butter-cream hover:bg-green-mid/70 transition-all duration-150"
          >
            FAQ
          </a>
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
        <div className="fixed inset-x-0 top-16 md:top-[72px] bg-green-dark border-b border-green-mid p-6 shadow-2xl z-50 flex flex-col gap-3 text-center sm:hidden animate-fade-in">
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-butter-cream py-2 border-b border-green-mid"
          >
            Workflow
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-butter-cream py-2 border-b border-green-mid"
          >
            Showcase
          </a>
          <a
            href="#intelligence"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-butter-cream py-2 border-b border-green-mid"
          >
            Intelligence
          </a>
          <a
            href="#analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-butter-cream py-2 border-b border-green-mid"
          >
            Analytics
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-semibold text-butter-cream py-2 border-b border-green-mid"
          >
            FAQ
          </a>
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="hero-ghost" className="w-full">
                Log in
              </Button>
            </Link>
            <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="butter" className="w-full">
                Start a campaign
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
