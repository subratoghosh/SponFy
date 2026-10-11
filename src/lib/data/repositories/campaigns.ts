import { Campaign } from "@/types";
import { DEMO_CAMPAIGN } from "../seed-data";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

// In-memory store for demo mode sessions
const campaignsStoreRef = memoryStore<Campaign[]>("campaigns", () => [DEMO_CAMPAIGN]);

export async function getCampaigns(userId?: string): Promise<Campaign[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.campaign.findMany({
        where: userId ? { userId } : undefined,
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

export async function getCampaignById(id: string, userId?: string): Promise<Campaign | null> {
  if (isDatabaseConfigured()) {
    try {
      const r = await prisma.campaign.findFirst({
        where: userId ? { id, userId } : { id },
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

  const found = campaignsStoreRef.value.find((c) => c.id === id);
  if (!found || (userId && (found as any).userId && (found as any).userId !== userId)) return null;
  return found;
}

export async function createCampaign(
  data: Omit<Campaign, "id" | "createdAt">,
  userId?: string
): Promise<Campaign> {
  if (data.deckUrl && !data.deckUrl.startsWith("http://") && !data.deckUrl.startsWith("https://")) {
    throw new Error("Invalid deck URL: must start with http:// or https://");
  }
  if (isDatabaseConfigured()) {
    try {
      const activeUserId = userId || (await prisma.user.findFirst())?.id || "usr-demo-lead";

      const r = await prisma.campaign.create({
        data: {
          userId: activeUserId,
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
    userId,
    id: `camp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  } as any;
  campaignsStoreRef.value.unshift(newCampaign);
  return newCampaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<Campaign>,
  userId?: string
): Promise<Campaign | null> {
  if (updates.deckUrl && !updates.deckUrl.startsWith("http://") && !updates.deckUrl.startsWith("https://")) {
    throw new Error("Invalid deck URL: must start with http:// or https://");
  }
  if (isDatabaseConfigured()) {
    try {
      if (userId) {
        const check = await prisma.campaign.findFirst({ where: { id, userId } });
        if (!check) return null;
      }
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
  if (userId && (campaignsStoreRef.value[idx] as any).userId && (campaignsStoreRef.value[idx] as any).userId !== userId) {
    return null;
  }
  campaignsStoreRef.value[idx] = { ...campaignsStoreRef.value[idx], ...updates };
  return campaignsStoreRef.value[idx];
}
