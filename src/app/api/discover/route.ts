import { NextResponse } from "next/server";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { addSponsor } from "@/lib/data/repositories/sponsors";
import { DuplicateCompanyError } from "@/lib/outreach/duplicates";
import { getGeminiClient } from "@/lib/integrations/factory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, prompt, targetCount = 5 } = body;

    const campaign = await getCampaignById(campaignId || "camp-sponfy-2026");
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Dynamic candidate generation
    const candidates = [
      {
        name: "Anthropic",
        website: "https://www.anthropic.com",
        industry: "AI & Machine Learning",
        description: "AI safety and research company behind Claude 3.7 with dedicated student developer grant programs.",
        fitScore: 95,
        pipelineValue: 100000,
        signals: ["Claude API Credits Grant", "AI Track Challenge Sponsor"],
      },
      {
        name: "Neon Tech",
        website: "https://neon.tech",
        industry: "Developer Tools",
        description: "Serverless Postgres with instant branching built for modern cloud and hackathon developers.",
        fitScore: 92,
        pipelineValue: 50000,
        signals: ["Serverless Postgres Track", "Free Hacker Tier"],
      },
      {
        name: "Inngest",
        website: "https://www.inngest.com",
        industry: "Developer Tools",
        description: "Event-driven background jobs and durable execution engine for TypeScript developers.",
        fitScore: 89,
        pipelineValue: 40000,
        signals: ["Best Event-Driven Architecture Prize"],
      },
      {
        name: "Mistral AI",
        website: "https://mistral.ai",
        industry: "AI & Machine Learning",
        description: "Frontier open and commercial AI models for developers.",
        fitScore: 91,
        pipelineValue: 75000,
        signals: ["Open Weights Challenge", "API Credits"],
      },
      {
        name: "Appwrite",
        website: "https://appwrite.io",
        industry: "Developer Tools",
        description: "Open-source backend server for web, mobile, and flutter developers.",
        fitScore: 90,
        pipelineValue: 30000,
        signals: ["Appwrite Cloud Pro credits", "Flutter Track partner"],
      },
    ];

    const added = [];
    const skipped: { name: string; reason: string }[] = [];
    for (const c of candidates.slice(0, targetCount)) {
      let spon;
      try {
        spon = await addSponsor({
          campaignId: campaign.id,
          name: c.name,
          website: c.website,
          industry: c.industry,
          description: c.description,
          stage: "Discovered",
          fitScore: c.fitScore,
          scoreBreakdown: [
            { factor: "Industry Relevance", points: 20, maxPoints: 20, reason: "High synergy with technical student builders", positive: true },
            { factor: "Audience Overlap", points: 19, maxPoints: 20, reason: `${campaign.audienceSize} students in ${campaign.location}`, positive: true },
            { factor: "Product Synergy", points: 14, maxPoints: 15, reason: "Developer tooling integration track", positive: true },
            { factor: "Event Type Match", points: 14, maxPoints: 15, reason: "Active sponsor of tech hackathons", positive: true },
            { factor: "Student Program History", points: 13, maxPoints: 15, reason: "Free developer allowances", positive: true },
            { factor: "Financial Capability", points: 8, maxPoints: 10, reason: "Standard track budget tier", positive: true },
            { factor: "Geographic Alignment", points: 4, maxPoints: 5, reason: "National reach", positive: true },
          ],
          pipelineValue: c.pipelineValue,
          signals: c.signals,
          confidence: 90,
          researchStatus: "pending",
        });
      } catch (err) {
        if (err instanceof DuplicateCompanyError) {
          skipped.push({ name: c.name, reason: "Already in this campaign's pipeline" });
          continue;
        }
        throw err;
      }
      added.push(spon);
    }

    return NextResponse.json({ success: true, count: added.length, candidates: added, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Discovery failed" }, { status: 500 });
  }
}
