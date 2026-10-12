"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SponfyBrand } from "@/components/ui/SponfyBrand";
import { LogoIntro } from "./LogoIntro";
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
  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  // Collapsible on all marketing pages when scrolled past on sm and up
  const isCollapsible = isScrolledPast;
  const isCollapsed = isCollapsible && !isExpanded;

  // Trigger detection: IntersectionObserver on "/" for hero, scroll distance (160px / 100px) on other pages
  useEffect(() => {
    // Reset state and clear pending timeout on navigation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsScrolledPast(false);
    setIsExpanded(false);

    if (pathname === "/") {
      const heroEl = document.getElementById("hero");
      if (!heroEl) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Hero is past the viewport when it is no longer intersecting and scrolled above the screen
          const past = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
          setIsScrolledPast(past);
          if (!past) {
            setIsExpanded(false);
          }
        },
        {
          threshold: 0,
        }
      );

      observer.observe(heroEl);

      return () => {
        observer.disconnect();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      let rafId: number | null = null;

      const checkScroll = () => {
        const currentY = window.scrollY;
        setIsScrolledPast((prev) => {
          if (currentY > 160) return true;
          if (currentY < 100) {
            setIsExpanded(false);
            return false;
          }
          return prev;
        });
      };

      // Check initial position on mount or route transition
      checkScroll();

      const onScroll = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          checkScroll();
          rafId = null;
        });
      };

      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", onScroll);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [pathname]);

  // Touch & Pointer: Close when tapping outside the expanded navbar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  // Hover handlers with debounce on mouse leave (400ms) to prevent flicker
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isCollapsible) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isCollapsible) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 400); // 400ms delay to prevent premature collapse
    }
  };

  // Keyboard accessibility: expand on focus, collapse when focus moves outside
  const handleFocus = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isCollapsible) {
      setIsExpanded(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!navRef.current?.contains(e.relatedTarget as Node)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsExpanded(false);
    }
  };

  const handleHamburgerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  // Logo intro animation lifecycle (only on "/", sm+, non-reduced-motion, once per session)
  useEffect(() => {
    if (pathname !== "/") {
      setIntroActive(false);
      return;
    }

    if (typeof window === "undefined") return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Hide intro below "sm" breakpoint (static logo on mobile)
    if (window.innerWidth < 640) {
      return;
    }

    // If already scrolled down at load time, skip
    if (window.scrollY > 20) {
      return;
    }

    // Play once per browser session
    try {
      if (sessionStorage.getItem("sponfy_logo_intro_played") === "true") {
        return;
      }
      sessionStorage.setItem("sponfy_logo_intro_played", "true");
    } catch {
      // Storage blocked or unavailable
    }

    setIntroActive(true);
  }, [pathname]);

  // Cancel intro immediately if user scrolls or if navbar collapses
  useEffect(() => {
    if (!introActive) return;

    if (isCollapsed) {
      setIntroActive(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIntroActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [introActive, isCollapsed]);

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-[1240px] flex justify-end">
        <nav
          ref={navRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onBlur={handleBlur}
          className={cn(
            "relative pointer-events-auto bg-green-dark border-2 border-butter-cream/85 hover:border-butter-cream ring-1 ring-butter-cream/30 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isCollapsed
              ? "w-full sm:max-w-[48px] sm:w-[48px] sm:h-[48px] sm:p-0 sm:justify-center px-6 py-2.5 justify-between overflow-hidden"
              : "w-full max-w-[1240px] sm:max-w-[1240px] sm:h-[52px] px-6 py-2.5 justify-between overflow-visible"
          )}
        >
          {/* Collapsed state 48px hamburger trigger on sm+ when past trigger threshold */}
          {isCollapsible && (
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={isExpanded}
              onClick={handleHamburgerToggle}
              onFocus={handleFocus}
              className={cn(
                "hidden sm:flex absolute right-0 top-0 w-[48px] h-[48px] items-center justify-center text-butter-cream rounded-full focus:outline-none transition-opacity duration-300 ease-in-out motion-reduce:transition-none z-10",
                isCollapsed
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <Menu className="w-5 h-5 text-butter-cream" />
            </button>
          )}

          {/* Full Navigation Content */}
          <div
            aria-hidden={isCollapsed ? "true" : undefined}
            className={cn(
              "w-full flex items-center justify-between transition-all ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:delay-0 shrink-0",
              isCollapsed
                ? "sm:opacity-0 sm:translate-x-2 sm:pointer-events-none duration-[200ms] delay-0"
                : "opacity-100 translate-x-0 duration-[400ms] delay-[200ms]"
            )}
          >
            {/* Logo Wordmark */}
            <div className="relative hover:scale-105 transition-transform duration-200 shrink-0">
              <div
                className={cn(
                  "transition-opacity duration-300",
                  introActive ? "opacity-0" : "opacity-100"
                )}
              >
                <SponfyBrand href={isCollapsed ? undefined : "/"} size="md" theme="dark" />
              </div>
              {introActive && (
                <LogoIntro onComplete={() => setIntroActive(false)} />
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-text-onDarkSub">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    tabIndex={isCollapsed ? -1 : undefined}
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
              <Link href="/login" tabIndex={isCollapsed ? -1 : undefined}>
                <Button
                  variant="butter"
                  size="sm"
                  tabIndex={isCollapsed ? -1 : undefined}
                  className="font-black uppercase tracking-wider text-xs px-4 py-1.5 shadow-md hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,240,179,0.4)] transition-all duration-150 group"
                >
                  LOGIN
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Trigger (screens < sm) */}
            <div className="flex sm:hidden items-center gap-2">
              <Link href="/login">
                <Button variant="butter" size="sm" className="text-xs px-3 py-1.5 font-bold">
                  LOGIN
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
          </div>
        </nav>
      </div>

      {/* Mobile Drawer (screens < sm) */}
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
                <Button variant="butter" className="w-full justify-center font-black uppercase tracking-wider text-xs shadow-md">
                  LOGIN
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
