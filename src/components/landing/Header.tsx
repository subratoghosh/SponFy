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
      <nav className="pointer-events-auto w-full max-w-[1240px] bg-green-hero/90 backdrop-blur-md border border-butter-cream/25 rounded-full px-5 py-3 shadow-xl flex items-center justify-between transition-all">
        {/* Logo Wordmark */}
        <SponfyBrand href="/" size="md" theme="dark" />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-text-onDarkSub">
          <a href="#workflow" className="hover:text-butter-cream transition-colors">
            Workflow
          </a>
          <a href="#showcase" className="hover:text-butter-cream transition-colors">
            Showcase
          </a>
          <a href="#intelligence" className="hover:text-butter-cream transition-colors">
            Intelligence
          </a>
          <a href="#analytics" className="hover:text-butter-cream transition-colors">
            Analytics
          </a>
          <a href="#faq" className="hover:text-butter-cream transition-colors">
            FAQ
          </a>
        </div>

        {/* CTA & Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-text-onDark hover:text-butter-cream transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link href="/app">
            <Button variant="butter" size="sm" className="font-bold shadow-md">
              Start a campaign
              <ArrowRight className="w-4 h-4 ml-1" />
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
        <div className="pointer-events-auto fixed inset-x-4 top-20 bg-green-hero border border-butter-cream/20 rounded-2xl p-6 shadow-2xl z-50 flex flex-col gap-4 text-center sm:hidden animate-fade-in">
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
