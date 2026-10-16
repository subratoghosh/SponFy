"use client";

import { useEffect } from "react";

export const PwaRegister: React.FC = () => {
  useEffect(() => {
    // In dev, remove any worker left over from a production run on this origin:
    // its cache-first /_next/static/ handling serves stale, unhashed dev chunks
    // and causes hydration mismatches.
    if (
      process.env.NODE_ENV !== "production" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
        .then(() => ("caches" in window ? caches.keys() : []))
        .then((names) => Promise.all(names.filter((n) => n.startsWith("sponfy-")).map((n) => caches.delete(n))))
        .catch(() => {
          // Silently swallow cleanup failures
        });
      return;
    }

    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      try {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch(() => {
            // Silently swallow registration failures
          });
      } catch {
        // Silently swallow synchronous errors
      }
    }
  }, []);

  return null;
};

export default PwaRegister;
