import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";
import { ScoreFactor } from "@/types";

export interface DiscoveryResultRecord {
  id: string;
  userId: string;
  campaignId: string;
  name: string;
  website?: string;
  domain?: string;
  industry?: string;
  description?: string;
  whyRelevant?: string;
  sponsorshipType?: string;
  fitScore?: number;
  pipelineValue: number;
  signals: string[];
  confidence?: number;
  researchStatus: string;
  scoreBreakdown?: ScoreFactor[];
  query?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

const discoveryResultsStoreRef = memoryStore<DiscoveryResultRecord[]>(
  "discoveryResults",
  () => []
);

// Safely access discoveryResult on Prisma client even if language server types are cached
const db = prisma as any;

export async function saveDiscoveryResults(
  userId: string,
  campaignId: string,
  candidates: Array<{
    name: string;
    website?: string;
    domain?: string;
    industry?: string;
    description?: string;
    whyRelevant?: string;
    sponsorshipType?: string;
    fitScore?: number;
    pipelineValue?: number;
    signals?: string[];
    confidence?: number;
    scoreBreakdown?: ScoreFactor[];
  }>,
  query?: string
): Promise<DiscoveryResultRecord[]> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day expiry

  if (isDatabaseConfigured()) {
    try {
      const created = await Promise.all(
        candidates.map((c) =>
          db.discoveryResult.create({
            data: {
              userId,
              campaignId,
              name: c.name,
              website: c.website || null,
              domain: c.domain || (c.website ? c.website.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase() : null),
              industry: c.industry || null,
              description: c.description || null,
              whyRelevant: c.whyRelevant || null,
              sponsorshipType: c.sponsorshipType || null,
              fitScore: c.fitScore ?? null,
              pipelineValue: c.pipelineValue ?? 0,
              signals: (c.signals as any) || [],
              confidence: c.confidence ?? null,
              scoreBreakdown: (c.scoreBreakdown as any) || null,
              query: query || null,
              expiresAt,
            },
          })
        )
      );

      return created.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        campaignId: r.campaignId,
        name: r.name,
        website: r.website || undefined,
        domain: r.domain || undefined,
        industry: r.industry || undefined,
        description: r.description || undefined,
        whyRelevant: r.whyRelevant || undefined,
        sponsorshipType: r.sponsorshipType || undefined,
        fitScore: r.fitScore ?? undefined,
        pipelineValue: r.pipelineValue,
        signals: (r.signals as any) || [],
        confidence: r.confidence ?? undefined,
        researchStatus: r.researchStatus,
        scoreBreakdown: (r.scoreBreakdown as any) || undefined,
        query: r.query || undefined,
        expiresAt: r.expiresAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Prisma saveDiscoveryResults failed, falling back to memory store:", err);
    }
  }

  // Memory store fallback
  const records: DiscoveryResultRecord[] = candidates.map((c, i) => ({
    id: `disc-${Date.now()}-${i}`,
    userId,
    campaignId,
    name: c.name,
    website: c.website,
    domain: c.domain || (c.website ? c.website.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase() : undefined),
    industry: c.industry,
    description: c.description,
    whyRelevant: c.whyRelevant,
    sponsorshipType: c.sponsorshipType,
    fitScore: c.fitScore,
    pipelineValue: c.pipelineValue ?? 0,
    signals: c.signals || [],
    confidence: c.confidence,
    researchStatus: "NOT_STARTED",
    scoreBreakdown: c.scoreBreakdown,
    query,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  discoveryResultsStoreRef.value.push(...records);
  return records;
}

export async function getDiscoveryResults(
  userId: string,
  campaignId?: string
): Promise<DiscoveryResultRecord[]> {
  const now = new Date();

  if (isDatabaseConfigured()) {
    try {
      const records = await db.discoveryResult.findMany({
        where: {
          userId,
          ...(campaignId ? { campaignId } : {}),
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        campaignId: r.campaignId,
        name: r.name,
        website: r.website || undefined,
        domain: r.domain || undefined,
        industry: r.industry || undefined,
        description: r.description || undefined,
        whyRelevant: r.whyRelevant || undefined,
        sponsorshipType: r.sponsorshipType || undefined,
        fitScore: r.fitScore ?? undefined,
        pipelineValue: r.pipelineValue,
        signals: (r.signals as any) || [],
        confidence: r.confidence ?? undefined,
        researchStatus: r.researchStatus,
        scoreBreakdown: (r.scoreBreakdown as any) || undefined,
        query: r.query || undefined,
        expiresAt: r.expiresAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Prisma getDiscoveryResults failed, falling back to memory store:", err);
    }
  }

  // Memory store fallback
  return discoveryResultsStoreRef.value.filter(
    (r) =>
      r.userId === userId &&
      (!campaignId || r.campaignId === campaignId) &&
      new Date(r.expiresAt).getTime() > now.getTime()
  );
}

export async function clearDiscoveryResults(
  userId: string,
  campaignId?: string
): Promise<number> {
  let dbCount = 0;
  if (isDatabaseConfigured()) {
    try {
      const res = await db.discoveryResult.deleteMany({
        where: {
          userId,
          ...(campaignId ? { campaignId } : {}),
        },
      });
      dbCount = res.count;
    } catch (err) {
      console.warn("Prisma clearDiscoveryResults failed, falling back to memory store:", err);
    }
  }

  const before = discoveryResultsStoreRef.value.length;
  discoveryResultsStoreRef.value = discoveryResultsStoreRef.value.filter(
    (r) => !(r.userId === userId && (!campaignId || r.campaignId === campaignId))
  );
  const memCount = before - discoveryResultsStoreRef.value.length;
  return dbCount || memCount;
}

export async function deleteDiscoveryResult(
  id: string,
  userId: string
): Promise<boolean> {
  let dbSuccess = false;
  if (isDatabaseConfigured()) {
    try {
      const res = await db.discoveryResult.deleteMany({
        where: { id, userId },
      });
      dbSuccess = res.count > 0;
    } catch (err) {
      console.warn("Prisma deleteDiscoveryResult failed, falling back to memory store:", err);
    }
  }

  const idx = discoveryResultsStoreRef.value.findIndex(
    (r) => r.id === id && r.userId === userId
  );
  if (idx !== -1) {
    discoveryResultsStoreRef.value.splice(idx, 1);
    return true;
  }
  return dbSuccess;
}
