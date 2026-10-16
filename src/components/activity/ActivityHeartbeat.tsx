"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Re-ping while the tab stays visible so long single-page sessions are counted
const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000;

function sendHeartbeat(path: string) {
  fetch("/api/activity/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    keepalive: true,
  }).catch(() => {
    // Activity tracking is best-effort
  });
}

export function ActivityHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    sendHeartbeat(pathname);
  }, [pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat(window.location.pathname);
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
