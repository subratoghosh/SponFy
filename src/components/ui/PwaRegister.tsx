"use client";

import { useEffect } from "react";

export const PwaRegister: React.FC = () => {
  useEffect(() => {
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
