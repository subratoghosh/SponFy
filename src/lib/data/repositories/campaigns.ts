import { Campaign } from "@/types";
import { DEMO_CAMPAIGN } from "../seed-data";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

// In-memory store for empty states / fallback
const campaignsStoreRef = memoryStore<Campaign[]>("campaigns", () => process.env.NODE_ENV === "test" ? [DEMO_CAMPAIGN] : []);

export async function getCampaigns(): Promise<Campaign[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Client fetch /api/campaigns failed:", e);
    }
    return [];
  }

  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
      });
      return records.map((r) => ({
        id: r.id,
        name: r.name,
        eventType: r.eventType,
        audienceSize: r.audienceSize,
        location: r.location,
        targetAmount: r.targetAmount,
        preferredIndustries: r.preferredIndustries,
        tiers: (r.tiers as any) || [],
        deckUrl: r.deckUrl || undefined,
        description: r.description || "",
        status: r.archived ? "archived" : "active",
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Prisma getCampaigns failed:", err);
      return [];
    }
  }

  return [...campaignsStoreRef.value];
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  if (isDatabaseConfigured()) {
    try {
      const r = await prisma.campaign.findUnique({
        where: { id },
      });
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        eventType: r.eventType,
        audienceSize: r.audienceSize,
        location: r.location,
        targetAmount: r.targetAmount,
        preferredIndustries: r.preferredIndustries,
        tiers: (r.tiers as any) || [],
        deckUrl: r.deckUrl || undefined,
        description: r.description || "",
        status: r.archived ? "archived" : "active",
        createdAt: r.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma getCampaignById failed:", err);
      return null;
    }
  }

  return campaignsStoreRef.value.find((c) => c.id === id) || null;
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt">): Promise<Campaign> {
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";

      const r = await prisma.campaign.create({
        data: {
          userId,
          name: data.name,
          eventType: data.eventType,
          audienceSize: data.audienceSize,
          location: data.location,
          targetAmount: data.targetAmount,
          preferredIndustries: data.preferredIndustries,
          tiers: (data.tiers as any) || [],
          deckUrl: data.deckUrl,
          description: data.description || "",
          archived: data.status === "archived",
        },
      });
      return {
        id: r.id,
        name: r.name,
        eventType: r.eventType,
        audienceSize: r.audienceSize,
        location: r.location,
        targetAmount: r.targetAmount,
        preferredIndustries: r.preferredIndustries,
        tiers: (r.tiers as any) || [],
        deckUrl: r.deckUrl || undefined,
        description: r.description || "",
        status: r.archived ? "archived" : "active",
        createdAt: r.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma createCampaign failed, falling back to memory store:", err);
    }
  }

  const newCampaign: Campaign = {
    ...data,
    id: `camp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  campaignsStoreRef.value.unshift(newCampaign);
  return newCampaign;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  if (isDatabaseConfigured()) {
    try {
      const r = await prisma.campaign.update({
        where: { id },
        data: {
          name: updates.name,
          eventType: updates.eventType,
          audienceSize: updates.audienceSize,
          location: updates.location,
          targetAmount: updates.targetAmount,
          preferredIndustries: updates.preferredIndustries,
          tiers: updates.tiers ? (updates.tiers as any) : undefined,
          deckUrl: updates.deckUrl,
          description: updates.description,
          archived: updates.status ? updates.status === "archived" : undefined,
        },
      });
      return {
        id: r.id,
        name: r.name,
        eventType: r.eventType,
        audienceSize: r.audienceSize,
        location: r.location,
        targetAmount: r.targetAmount,
        preferredIndustries: r.preferredIndustries,
        tiers: (r.tiers as any) || [],
        deckUrl: r.deckUrl || undefined,
        description: r.description || "",
        status: r.archived ? "archived" : "active",
        createdAt: r.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma updateCampaign failed, falling back to memory store:", err);
    }
  }

  const idx = campaignsStoreRef.value.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  campaignsStoreRef.value[idx] = { ...campaignsStoreRef.value[idx], ...updates };
  return campaignsStoreRef.value[idx];
}
