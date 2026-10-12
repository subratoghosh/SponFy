"use client";

import { useState, useEffect, useCallback } from "react";

export interface AppCounts {
  prospects: number;
  qualified: number;
  actionQueue: number;
  drafts: number;
  replies: number;
  followups: number;
  activities: number;
  sentEmails: number;
  committedCount: number;
  committedAmount: number;
  pipelineAmount: number;
  isDemo: boolean;
}

const DEFAULT_COUNTS: AppCounts = {
  prospects: 0,
  qualified: 0,
  actionQueue: 0,
  drafts: 0,
  replies: 0,
  followups: 0,
  activities: 0,
  sentEmails: 0,
  committedCount: 0,
  committedAmount: 0,
  pipelineAmount: 0,
  isDemo: false,
};

export function useAppCounts(pollIntervalMs = 25000) {
  const [counts, setCounts] = useState<AppCounts>(DEFAULT_COUNTS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCounts = useCallback(async () => {
    // Only fetch if tab is visible to avoid needless background polling
    if (typeof document !== "undefined" && document.hidden) return;

    try {
      const res = await fetch("/api/counts");
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch {
      // Keep existing counts on network blip
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    // 1. Polling interval
    const interval = setInterval(fetchCounts, pollIntervalMs);

    // 2. Window focus listener
    const handleFocus = () => {
      fetchCounts();
    };
    window.addEventListener("focus", handleFocus);

    // 3. Tab visibility change listener
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCounts();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchCounts, pollIntervalMs]);

  return { counts, loading, refetch: fetchCounts };
}
