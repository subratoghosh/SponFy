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
      const query = `"${companyName}" sponsorship partnership event programs grants contact`;
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
          url: `${website || "https://example.com"}/community-program`,
          title: `${companyName} Community & Event Sponsorships`,
          snippet: `${companyName} offers credits, partner packages, and sponsorship grants for technology events and industry campaigns.`,
        },
        {
          id: `src-mock-2`,
          url: `${website || "https://example.com"}/partners`,
          title: `${companyName} Partner Network & Ecosystem Grants`,
          snippet: `Empowering event organizers and builders with dedicated toolkits, workshops, and partner support.`,
        },
      ],
      sections: {
        overview: `${companyName} is a market leader with dedicated partnership programs targeting professional and builder communities.`,
        productsAndServices: ["Core Cloud & Developer Tools", "API Platform", "Developer Workspaces"],
        targetAudience: "Full-stack developers, engineering professionals, founders.",
        recentInitiatives: ["National Partner Tour 2026", "Ecosystem Innovation Bounties"],
        studentDeveloperPrograms: ["Community Leader Network", "Builder Grants"],
        sponsorshipOpportunities: ["Partner Track Prize (₹50k+)", "Branded booth packages", "Workshop slot"],
        suggestedAngle: `Highlight 800 high-intent attendees and builders who will directly adopt ${companyName}'s products.`,
      },
      recommendedAngle: `Pitch the 'Best Innovation with ${companyName}' track to onboard attendees into their ecosystem.`,
    };
  }
}
