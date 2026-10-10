import { Campaign } from "@/types";
import { DEMO_CAMPAIGN } from "../seed-data";

// In-memory store for demo mode sessions
let campaignsStore: Campaign[] = [DEMO_CAMPAIGN];

export async function getCampaigns(): Promise<Campaign[]> {
  return [...campaignsStore];
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const found = campaignsStore.find((c) => c.id === id);
  return found || campaignsStore[0] || null;
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt">): Promise<Campaign> {
  const newCampaign: Campaign = {
    ...data,
    id: `camp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  campaignsStore.unshift(newCampaign);
  return newCampaign;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  const idx = campaignsStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  campaignsStore[idx] = { ...campaignsStore[idx], ...updates };
  return campaignsStore[idx];
}
