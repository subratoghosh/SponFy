import { NextResponse } from "next/server";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { getSponsors, addSponsor } from "@/lib/data/repositories/sponsors";
import { DuplicateCompanyError, normalizeName, normalizeDomain } from "@/lib/outreach/duplicates";
import { FALLBACK_SPONSOR_CATALOG, DiscoveryCandidate } from "@/lib/discovery/catalog";
import { getFirecrawlClient } from "@/lib/integrations/factory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, prompt = "", targetCount = 5 } = body;

    const campaign = await getCampaignById(campaignId || "camp-sponfy-2026");
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // 1. Fetch all existing companies in this campaign to avoid any duplicate proposals
    const existing = await getSponsors(campaign.id);
    const existingNames = new Set(existing.map((c) => normalizeName(c.name)));
    const existingDomains = new Set(existing.map((c) => normalizeDomain(c.website)).filter(Boolean));

    let candidates: DiscoveryCandidate[] = [];

    // 2. Natural Language Processing Engine via Google Gemini 2.0 Flash
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.length > 10 && !geminiKey.includes("your-")) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const existingListSample = Array.from(existingNames).slice(0, 40).join(", ");
        const nlpPrompt = `You are a sponsorship intelligence scout for collegiate tech hackathons and developer events.
Target Event: "${campaign.name}" (${campaign.eventType}, ${campaign.audienceSize} students in ${campaign.location}, Target Budget: ₹${campaign.targetAmount}).
Preferred Industries: ${campaign.preferredIndustries?.join(", ") || "Developer Tools, AI, Cloud, Fintech"}.
User Search Intent: "${prompt || "Find high-fit prospective sponsors with active student developer or hackathon programs"}".

STRICT DEDUPLICATION RULE:
Do NOT suggest any of these companies that are already in the pipeline:
[${existingListSample}]

Generate ${Math.min(Number(targetCount) || 5, 10)} real, innovative technology companies that actively sponsor hackathons, provide student developer grants, or have strong synergies with this event.
Return a STRICT JSON array matching this format:
[
  {
    "name": "<Company Name>",
    "website": "<Valid full URL with https://>",
    "industry": "<e.g. AI & Machine Learning | Developer Tools | Cloud & Infrastructure | Cybersecurity | Fintech>",
    "description": "<2 sentences explaining company product and why they would sponsor this event>",
    "fitScore": <integer between 75 and 97>,
    "pipelineValue": <realistic sponsorship budget in INR between 30000 and 150000>,
    "signals": ["<Signal 1, e.g. Student Hackathon Partner>", "<Signal 2, e.g. Free Developer Credits>"]
  }
]`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: nlpPrompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text || "[]";
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any candidates that might still collide with existing
          candidates = parsed.filter(
            (c: any) =>
              c.name &&
              c.website &&
              !existingNames.has(normalizeName(c.name)) &&
              !existingDomains.has(normalizeDomain(c.website))
          );
        }
      } catch (geminiErr) {
        console.warn("Gemini NLP discovery generation error, falling back to catalog:", geminiErr);
      }
    }

    // 3. Web Scraping & Search Signals via Firecrawl (if candidates found or needed)
    const firecrawl = getFirecrawlClient();
    if (firecrawl.isConfigured() && candidates.length > 0) {
      try {
        // Enrich first 2 candidates with live web scrape signals if missing
        for (const cand of candidates.slice(0, 2)) {
          if (!cand.signals || cand.signals.length === 0) {
            const searchResults = await firecrawl.search(`${cand.name} student developer program hackathon`, 2);
            if (searchResults.length > 0) {
              cand.signals = searchResults.map((s) => s.title).slice(0, 2);
            }
          }
        }
      } catch (crawlErr) {
        console.warn("Firecrawl live signal enrichment skipped:", crawlErr);
      }
    }

    // 4. Robust Fallback Catalog (Deduplicated against pipeline)
    if (candidates.length < targetCount) {
      const cleanPrompt = prompt.toLowerCase().trim();
      const filteredCatalog = FALLBACK_SPONSOR_CATALOG.filter((c) => {
        const isNotDup = !existingNames.has(normalizeName(c.name)) && !existingDomains.has(normalizeDomain(c.website));
        if (!isNotDup) return false;

        // If user entered specific keywords, rank matching companies higher
        if (cleanPrompt) {
          const textToMatch = `${c.name} ${c.industry} ${c.description} ${c.signals.join(" ")}`.toLowerCase();
          return cleanPrompt.split(" ").some((w: string) => w.length > 2 && textToMatch.includes(w));
        }
        return true;
      });

      // If prompt filter was too restrictive, relax to any non-duplicate
      const availableFromCatalog =
        filteredCatalog.length > 0
          ? filteredCatalog
          : FALLBACK_SPONSOR_CATALOG.filter(
              (c) => !existingNames.has(normalizeName(c.name)) && !existingDomains.has(normalizeDomain(c.website))
            );

      for (const item of availableFromCatalog) {
        if (candidates.length >= targetCount) break;
        if (!candidates.some((c) => normalizeName(c.name) === normalizeName(item.name))) {
          candidates.push(item);
        }
      }
    }

    // 5. Add discovered candidates to the pipeline
    const added = [];
    const skipped: { name: string; reason: string; existingId?: string }[] = [];

    for (const c of candidates.slice(0, targetCount)) {
      try {
        const spon = await addSponsor({
          campaignId: campaign.id,
          name: c.name,
          website: c.website,
          industry: c.industry,
          description: c.description,
          stage: "Discovered",
          fitScore: c.fitScore || 88,
          scoreBreakdown: [
            { factor: "Industry Relevance", points: 20, maxPoints: 20, reason: "High synergy with technical student builders", positive: true },
            { factor: "Audience Overlap", points: 19, maxPoints: 20, reason: `${campaign.audienceSize} students in ${campaign.location}`, positive: true },
            { factor: "Product Synergy", points: 14, maxPoints: 15, reason: "Developer tooling integration track", positive: true },
            { factor: "Event Type Match", points: 14, maxPoints: 15, reason: "Active sponsor of tech hackathons", positive: true },
            { factor: "Student Program History", points: 13, maxPoints: 15, reason: "Free developer allowances", positive: true },
            { factor: "Financial Capability", points: 8, maxPoints: 10, reason: "Standard track budget tier", positive: true },
            { factor: "Geographic Alignment", points: 4, maxPoints: 5, reason: "National reach", positive: true },
          ],
          pipelineValue: c.pipelineValue || 50000,
          signals: c.signals || ["Developer Track Sponsor", "API Grants"],
          confidence: 90,
          researchStatus: "pending",
        });
        added.push(spon);
      } catch (err) {
        if (err instanceof DuplicateCompanyError) {
          skipped.push({ name: c.name, reason: "Already in this campaign's pipeline", existingId: err.existingId });
          continue;
        }
        throw err;
      }
    }

    // If all candidates happened to be in pipeline, retrieve existing matching records to show in UI
    const existingMatches =
      added.length === 0 && skipped.length > 0
        ? existing.filter((ex) => skipped.some((sk) => normalizeName(sk.name) === normalizeName(ex.name)))
        : [];

    return NextResponse.json({
      success: true,
      count: added.length,
      candidates: added.length > 0 ? added : existingMatches,
      skipped,
      alreadyInPipelineCount: existingMatches.length,
      existingTotal: existing.length,
    });
  } catch (err: any) {
    console.error("Discovery API route error:", err);
    return NextResponse.json({ error: err.message || "Discovery failed" }, { status: 500 });
  }
}
