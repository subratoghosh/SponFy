import "server-only";
import { SourceItem, ResearchSections } from "@/types";

export interface ITavilyClient {
  isConfigured(): boolean;
  searchSponsorshipInfo(companyName: string, website: string): Promise<{
    sources: SourceItem[];
    sections: ResearchSections;
    recommendedAngle: string;
  }>;
}

export class RealTavilyClient implements ITavilyClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  async searchSponsorshipInfo(companyName: string, website: string) {
    try {
      const query = `"${companyName}" sponsorship hackathon student developer programs partnership contact`;
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: "advanced",
          include_domains: [website, "github.com", "linkedin.com", "medium.com"].filter(Boolean),
          max_results: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`Tavily API responded with status ${res.status}`);
      }

      const data = await res.json();
      const sources: SourceItem[] = (data.results || []).map((r: any, idx: number) => ({
        id: `src-${Date.now()}-${idx}`,
        url: r.url,
        title: r.title,
        snippet: r.content,
      }));

      // Only report what the search actually returned. Anything we could not
      // verify from a cited source is left empty / flagged instead of invented.
      const topSnippet = (sources[0]?.snippet || "").trim().slice(0, 500);
      const unverified = "Not verified from search sources";
      return {
        sources,
        sections: {
          overview: topSnippet
            ? `${topSnippet} (from: ${sources[0].url})`
            : `No public information about ${companyName} was found in search results.`,
          productsAndServices: [],
          targetAudience: unverified,
          recentInitiatives: [],
          studentDeveloperPrograms: [],
          sponsorshipOpportunities: [],
          suggestedAngle: `${unverified}: review the ${sources.length} cited source(s) before choosing an angle for ${companyName}.`,
        },
        recommendedAngle: sources.length
          ? `Read the ${sources.length} cited source(s) and pick an ask that matches what ${companyName} has publicly done.`
          : `No verified sponsorship history found for ${companyName}; treat any ask as a cold pitch.`,
      };
    } catch (err: any) {
      // Never fall back to synthetic "sources" for a real company.
      console.error("Real Tavily research failed:", err);
      throw new Error(`Tavily research failed: ${err?.message || err}`);
    }
  }
}

export class MockTavilyClient implements ITavilyClient {
  isConfigured(): boolean {
    return false;
  }

  async searchSponsorshipInfo(companyName: string, website: string) {
    return {
      sources: [
        {
          id: `src-mock-1`,
          url: `${website || "https://example.com"}/student-program`,
          title: `${companyName} Student Developer Community & Hackathons`,
          snippet: `${companyName} offers API credits, swag kits, and prize sponsorship for university hackathons across India.`,
        },
        {
          id: `src-mock-2`,
          url: `${website || "https://example.com"}/developers`,
          title: `${companyName} Developer Documentation & Ecosystem Grants`,
          snippet: `Empowering campus builders with dedicated developer toolkits, workshops, and mentor support.`,
        },
      ],
      sections: {
        overview: `${companyName} is a market leader with dedicated developer relations programs targeting university student builders across India.`,
        productsAndServices: ["Core Cloud & Developer Tools", "API Platform", "Developer Workspaces"],
        targetAudience: "Full-stack developers, engineering students, tech founders.",
        recentInitiatives: ["Campus Hackathon Tour 2026", "Developer Certification Bounties"],
        studentDeveloperPrograms: ["Campus Leader Network", "Student Developer Grants"],
        sponsorshipOpportunities: ["Best Use Track Prize (₹50k+)", "Swag packs for all attendees", "API Workshop slot"],
        suggestedAngle: `Highlight 800 engineering students building full-stack products who will directly adopt ${companyName}'s tools.`,
      },
      recommendedAngle: `Pitch the 'Best Integration with ${companyName}' track to onboard 800 hackers into their developer ecosystem.`,
    };
  }
}
