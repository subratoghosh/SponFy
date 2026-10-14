"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { EmailDraft, Company } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to load outreach data");
  }
  return json;
};

export function useOutreachData() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "demo";

  // User-scoped SWR key to guarantee complete tenant isolation
  const swrKey = ["/api/outreach/state", userId];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    () => fetcher("/api/outreach/state"),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000, // 10s deduplication window
      keepPreviousData: true,
    }
  );

  const drafts: EmailDraft[] = data?.drafts || [];
  const companies: Company[] = data?.companies || [];

  return {
    drafts,
    companies,
    loading: isLoading,
    validating: isValidating,
    error,
    refetch: () => mutate(),
    mutate,
  };
}
