import { Campaign } from "@/types";

export interface WebSnippet {
  title: string;
  url: string;
  content: string;
}

/**
 * Perform real-time live web searches across Tavily and Firecrawl
 * to gather fresh sponsor intelligence for the user's query.
 */
export async function fetchLiveWebIntelligence(
  userPrompt: string,
  campaign: Campaign
): Promise<WebSnippet[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const snippets: WebSnippet[] = [];
  const seenUrls = new Set<string>();

  const queries: string[] = [
    userPrompt.trim(),
    `${userPrompt} sponsorship partnership grants India 2025 2026`,
  ];

  // Add category-tailored query if prompt mentions specific industries
  const promptLower = userPrompt.toLowerCase();
  const sectors: string[] = [];
  if (/(cloud|infrastructure|devops|aws|azure|gcp)/i.test(promptLower)) sectors.push("cloud");
  if (/(developer tools|devtools|api|database|git|software)/i.test(promptLower)) sectors.push("software and developer tools");
  if (/(fintech|payments|banking|upi)/i.test(promptLower)) sectors.push("fintech");
  if (/(ai|machine learning|llm|generative)/i.test(promptLower)) sectors.push("AI startups");
  if (/(web3|crypto|blockchain|defi)/i.test(promptLower)) sectors.push("web3");

  if (sectors.length > 0) {
    queries.push(`${sectors.join(" ")} companies sponsoring events programs campaigns India`);
  } else {
    queries.push("top tech companies sponsoring events partner programs campaigns India");
  }

  const tasks: Promise<any>[] = [];

  // 1. Tavily Live Web Search (Bounded timeout of 6s)
  if (tavilyKey && tavilyKey.length > 5) {
    for (const q of queries) {
      tasks.push(
        fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            api_key: tavilyKey,
            query: q,
            max_results: 10,
            search_depth: "basic",
          }),
        })
          .then(async (res) => {
            if (!res.ok) return;
            const data = await res.json();
            for (const item of data.results || []) {
              if (item.url && !seenUrls.has(item.url)) {
                seenUrls.add(item.url);
                snippets.push({
                  title: item.title || "",
                  url: item.url,
                  content: (item.content || "").slice(0, 320),
                });
              }
            }
          })
          .catch((err) => {
            console.warn("Tavily live search query failed:", err?.message || err);
          })
      );
    }
  }

  // 2. Firecrawl Live Web Search (Bounded timeout of 6s)
  if (firecrawlKey && firecrawlKey.startsWith("fc-")) {
    tasks.push(
      fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          query: queries[0],
          limit: 6,
        }),
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json();
          for (const item of data.data || []) {
            if (item.url && !seenUrls.has(item.url)) {
              seenUrls.add(item.url);
              snippets.push({
                title: item.title || "",
                url: item.url,
                content: (item.description || item.snippet || "").slice(0, 320),
              });
            }
          }
        })
        .catch((err) => {
          console.warn("Firecrawl live search query failed:", err?.message || err);
        })
    );
  }

  // Run all searches concurrently with a 6-second timeout
  await Promise.race([
    Promise.all(tasks),
    new Promise((resolve) => setTimeout(resolve, 6000)),
  ]);

  return snippets;
}
