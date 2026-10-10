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

      return {
        sources,
        sections: {
          overview: `${companyName} is a recognized technology company with active community involvement.`,
          productsAndServices: ["Core Platform", "Developer APIs", "Cloud Services"],
          targetAudience: "Software developers, tech enthusiasts, engineering students.",
          recentInitiatives: ["Developer Community Meetups", "University Hackathon Challenges"],
          studentDeveloperPrograms: ["Student Ambassador Program", "Campus Grant Support"],
          sponsorshipOpportunities: ["Challenge Track Sponsor", "Product Credits & Swag Kits"],
          suggestedAngle: `Emphasize student adoption of ${companyName}'s developer tools during the 36h hackathon.`,
        },
        recommendedAngle: `Propose a sponsored challenge track around ${companyName}'s API and developer suite.`,
      };
    } catch (err) {
      console.warn("Real Tavily research failed, using mock:", err);
      const mock = new MockTavilyClient();
      return mock.searchSponsorshipInfo(companyName, website);
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
