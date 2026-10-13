export interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

export interface IFirecrawlClient {
  isConfigured(): boolean;
  search(query: string, limit?: number): Promise<FirecrawlSearchResult[]>;
  scrapeUrl(url: string): Promise<{ markdown: string; title?: string; description?: string }>;
}

export class RealFirecrawlClient implements IFirecrawlClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith("fc-");
  }

  async search(query: string, limit = 5): Promise<FirecrawlSearchResult[]> {
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!res.ok) {
        console.warn(`Firecrawl v2 search responded with status ${res.status}`);
        // Fallback to v1 search if v2 is not active
        const fallbackRes = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, limit }),
        });
        if (!fallbackRes.ok) return [];
        const fallbackData = await fallbackRes.json();
        return (fallbackData.data || []).map((item: any) => ({
          url: item.url || "",
          title: item.title || "",
          description: item.description || item.snippet || "",
          markdown: item.markdown || "",
        }));
      }

      const json = await res.json();
      const results = json.data || json.results || [];
      return results.map((item: any) => ({
        url: item.url || "",
        title: item.title || "",
        description: item.description || item.snippet || "",
        markdown: item.markdown || "",
      }));
    } catch (err) {
      console.warn("Firecrawl search error:", err);
      return [];
    }
  }

  async scrapeUrl(url: string): Promise<{ markdown: string; title?: string; description?: string }> {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
        }),
      });

      if (!res.ok) {
        throw new Error(`Firecrawl scrape failed with status ${res.status}`);
      }

      const json = await res.json();
      const data = json.data || {};
      return {
        markdown: data.markdown || "",
        title: data.metadata?.title || "",
        description: data.metadata?.description || "",
      };
    } catch (err) {
      console.warn(`Firecrawl scrape error on ${url}:`, err);
      return { markdown: "", title: "", description: "" };
    }
  }
}

export class MockFirecrawlClient implements IFirecrawlClient {
  isConfigured(): boolean {
    return false;
  }

  async search(query: string, limit = 5): Promise<FirecrawlSearchResult[]> {
    return [
      {
        url: "https://github.com/education",
        title: "GitHub Education - Student Developer Pack & Campus Grants",
        description: "Official student programs, hackathon sponsorship kits, and GitHub developer access for university builders.",
      },
      {
        url: "https://postman.com/student-program",
        title: "Postman Student Programs & API Hackathon Sponsorship",
        description: "API platform supporting student hackathons with track bounties, swag packs, and certification awards.",
      },
    ].slice(0, limit);
  }

  async scrapeUrl(url: string) {
    return {
      markdown: "# Sponsor Program\n\nWe love supporting student builders, hackathons, and developer tracks.",
      title: "Developer Community Sponsorship",
      description: "Student developer support and hackathon grants.",
    };
  }
}
