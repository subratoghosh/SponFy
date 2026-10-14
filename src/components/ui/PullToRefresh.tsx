"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: React.ReactNode;
}

function shouldIgnoreTouch(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  let el: HTMLElement | null = target;
  while (el && el !== document.body && el !== document.documentElement) {
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable) {
      return true;
    }
    const role = el.getAttribute("role");
    if (role === "dialog" || role === "alertdialog" || el.hasAttribute("aria-modal")) {
      return true;
    }
    // Ignore if inside a scrollable element that is scrolled down
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight &&
      el.scrollTop > 0
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const canPullRef = useRef(false);
  const isPullingRef = useRef(false);
  const distanceRef = useRef(0);

  // Check if device is touch-enabled and screen is below md
  useEffect(() => {
    const checkSupport = () => {
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const isMobile = window.innerWidth < 768;
      setIsSupported(isCoarse && isMobile);
    };

    checkSupport();
    window.addEventListener("resize", checkSupport);
    return () => window.removeEventListener("resize", checkSupport);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;
      // Single-finger touch only
      if (e.touches.length !== 1) {
        canPullRef.current = false;
        return;
      }
      // Must be at the very top of the page
      if (window.scrollY > 0) {
        canPullRef.current = false;
        return;
      }
      // Safety check: ignore inputs, dialogs, inner scrollables
      if (shouldIgnoreTouch(e.target)) {
        canPullRef.current = false;
        return;
      }

      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
      canPullRef.current = true;
      isPullingRef.current = false;
      distanceRef.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!canPullRef.current || isRefreshing) return;
      if (e.touches.length !== 1) {
        canPullRef.current = false;
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - startYRef.current;
      const deltaX = currentX - startXRef.current;

      // Cancel if dragged horizontally more than vertically
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        canPullRef.current = false;
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      // Dragging down at top of page
      if (deltaY > 0 && window.scrollY <= 0) {
        if (deltaY > 6) {
          isPullingRef.current = true;
          if (e.cancelable) {
            e.preventDefault();
          }
          // Dampened pull resistance (max ~95px)
          const dist = Math.min(95, (deltaY - 6) * 0.45);
          distanceRef.current = dist;
          setPullDistance(dist);
        }
      } else {
        isPullingRef.current = false;
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (!canPullRef.current) return;
      const dist = distanceRef.current;
      const wasPulling = isPullingRef.current;
      canPullRef.current = false;
      isPullingRef.current = false;
      distanceRef.current = 0;

      // Threshold: pulling more than 70px
      if (wasPulling && dist >= 70 && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);
        router.refresh();
        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isSupported, isRefreshing, router]);

  // Desktop render: strictly passthrough with zero overhead
  if (!isSupported) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Pulling Pill Indicator */}
      {pullDistance > 0 && !isRefreshing && (
        <div
          role="status"
          aria-label="Pull to refresh indicator"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none md:hidden"
          style={{
            transform: `translate(-50%, ${Math.min(pullDistance, 36)}px)`,
            opacity: Math.min(1, pullDistance / 35),
          }}
        >
          <div className="bg-[#FFF0B3] text-[#0C382E] border border-[#0C382E]/15 shadow-md px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all">
            <ArrowDown
              className="w-4 h-4 text-[#0C382E] transition-transform duration-100 shrink-0"
              style={{
                transform: `rotate(${Math.min(180, (pullDistance / 70) * 180)}deg)`,
              }}
            />
            <span>{pullDistance >= 70 ? "Release to refresh" : "Pull to refresh"}</span>
          </div>
        </div>
      )}

      {/* Spinning Refreshing Indicator */}
      {isRefreshing && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none md:hidden animate-fade-in"
        >
          <div className="bg-[#FFF0B3] text-[#0C382E] border border-[#0C382E]/15 shadow-md px-4 py-2 rounded-full flex items-center gap-2.5 text-xs font-bold">
            <RefreshCw className="w-4 h-4 text-[#0C382E] animate-spin shrink-0" />
            <span>Refreshing...</span>
          </div>
        </div>
      )}

      {/* Screen Reader Announcement */}
      <span className="sr-only" aria-live="polite">
        {isRefreshing ? "Refreshing..." : ""}
      </span>

      {children}
    </>
  );
};

export default PullToRefresh;
