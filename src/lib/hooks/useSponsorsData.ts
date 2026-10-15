"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Company, PipelineStage } from "@/types";
import { useToast } from "@/components/ui/toast";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to load sponsors");
  }
  return json;
};

export interface UseSponsorsOptions {
  campaignId?: string;
  search?: string;
  stage?: string;
  industry?: string;
  page?: number;
  limit?: number;
}

export function useSponsorsData(options: UseSponsorsOptions = {}) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const userId = session?.user?.id || "demo";

  const {
    campaignId,
    search = "",
    stage = "all",
    industry = "all",
    page = 1,
    limit = 50,
  } = options;

  const queryParams = new URLSearchParams();
  if (campaignId) queryParams.set("campaignId", campaignId);
  if (search) queryParams.set("search", search);
  if (stage && stage !== "all") queryParams.set("stage", stage);
  if (industry && industry !== "all") queryParams.set("industry", industry);
  if (page > 1) queryParams.set("page", String(page));
  if (limit !== 50) queryParams.set("limit", String(limit));

  const url = `/api/sponsors?${queryParams.toString()}`;
  // User ID included in SWR key to guarantee zero cross-user cache contamination
  const swrKey = session?.user ? [url, userId] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => fetcher(url),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000, // 10s deduplication window
      keepPreviousData: true, // Smooth transitions during pagination/filters
    }
  );

  const sponsors: Company[] = data?.data || [];
  const pagination = data?.pagination || {
    total: sponsors.length,
    page,
    limit,
    totalPages: 1,
    hasMore: false,
  };

  /**
   * Safe optimistic update on stage change with rollback
   */
  const updateStageOptimistic = async (sponsorId: string, newStage: PipelineStage) => {
    const previousData = data;

    // Optimistically update UI
    mutate(
      {
        ...data,
        data: sponsors.map((s) => (s.id === sponsorId ? { ...s, stage: newStage } : s)),
      },
      false
    );

    try {
      const res = await fetch(`/api/sponsors/${encodeURIComponent(sponsorId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to update stage");
      }
      toast(`Moved to ${newStage}`, "success");
      mutate(); // Revalidate with server truth
    } catch (err: any) {
      // Rollback to previous state
      mutate(previousData, false);
      toast(err.message || "Failed to move stage. Rolled back.", "error");
    }
  };

  /**
   * Safe optimistic removal of sponsor
   */
  const removeSponsorOptimistic = async (sponsorId: string, sponsorName: string) => {
    const previousData = data;

    // Optimistically remove from list
    mutate(
      {
        ...data,
        data: sponsors.filter((s) => s.id !== sponsorId),
      },
      false
    );

    try {
      const res = await fetch(`/api/sponsors/${encodeURIComponent(sponsorId)}`, {
        method: "DELETE",
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to remove sponsor");
      }
      toast(`Removed ${sponsorName} from tracker`, "success");
      mutate();
    } catch (err: any) {
      mutate(previousData, false);
      toast(err.message || "Failed to remove sponsor. Rolled back.", "error");
    }
  };

  /**
   * Safe optimistic bulk removal of sponsors
   */
  const removeSelectedSponsorsOptimistic = async (sponsorIds: string[]) => {
    if (!sponsorIds.length) return false;
    const previousData = data;

    // Optimistically filter out selected sponsors
    mutate(
      {
        ...data,
        data: sponsors.filter((s) => !sponsorIds.includes(s.id)),
      },
      false
    );

    try {
      const res = await fetch("/api/sponsors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: sponsorIds }),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to delete selected sponsors");
      }
      toast(`Deleted ${sponsorIds.length} sponsor${sponsorIds.length > 1 ? "s" : ""} from campaign`, "success");
      mutate();
      return true;
    } catch (err: any) {
      mutate(previousData, false);
      toast(err.message || "Failed to delete sponsors. Rolled back.", "error");
      return false;
    }
  };

  return {
    sponsors,
    pagination,
    loading: isLoading,
    validating: isValidating,
    error,
    refetch: () => mutate(),
    updateStage: updateStageOptimistic,
    removeSponsor: removeSponsorOptimistic,
    removeSelectedSponsors: removeSelectedSponsorsOptimistic,
  };
}
