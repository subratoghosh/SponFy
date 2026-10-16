import { Campaign } from "@/types";
import { DEMO_CAMPAIGN } from "../seed-data";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

// In-memory store for empty states / fallback
const campaignsStoreRef = memoryStore<Campaign[]>("campaigns", () => process.env.NODE_ENV === "test" ? [DEMO_CAMPAIGN] : []);

export async function getCampaigns(userId?: string): Promise<Campaign[]> {
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
      const where: any = {};
      if (userId) {
        where.userId = userId;
      }
      const records = await prisma.campaign.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
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

  if (userId) {
    return campaignsStoreRef.value.filter((c) => (c as any).userId === userId);
  }
  return [...campaignsStoreRef.value];
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  if (isDatabaseConfigured()) {
    try {
      const r = await prisma.campaign.findUnique({
        where: { id },
      });
      if (r) {
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
      }
    } catch (err) {
      console.warn("Prisma getCampaignById failed:", err);
    }
  }

  if (id === DEMO_CAMPAIGN.id || id === "camp-demo-1") {
    return DEMO_CAMPAIGN;
  }

  return campaignsStoreRef.value.find((c) => c.id === id) || null;
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt">, userId?: string): Promise<Campaign> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          window.dispatchEvent(new CustomEvent("sponfy:campaigns-updated", { detail: { action: "created", campaign: json.data } }));
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Client fetch POST /api/campaigns failed:", e);
    }
  }

  if (isDatabaseConfigured()) {
    try {
      let resolvedUserId = userId;
      if (!resolvedUserId) {
        const user = await prisma.user.findFirst();
        resolvedUserId = user?.id || "usr-demo-lead";
      }

      const r = await prisma.campaign.create({
        data: {
          userId: resolvedUserId,
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

export async function deleteCampaign(id: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/campaigns?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const json = await res.json();
        window.dispatchEvent(new CustomEvent("sponfy:campaigns-updated", { detail: { action: "deleted", id } }));
        return json.success ?? true;
      }
    } catch (e) {
      console.warn("Client deleteCampaign failed:", e);
    }
  }

  if (isDatabaseConfigured()) {
    try {
      if ((prisma as any).campaign) {
        await (prisma as any).campaign.delete({ where: { id } });
        return true;
      }
    } catch (err) {
      console.warn("Prisma deleteCampaign failed, falling back to memory store:", err);
    }
  }

  const idx = campaignsStoreRef.value.findIndex((c) => c.id === id);
  if (idx !== -1) {
    campaignsStoreRef.value.splice(idx, 1);
    return true;
  }
  return false;
}
