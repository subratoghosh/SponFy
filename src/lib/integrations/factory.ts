import {
  IGeminiClient,
  RealGeminiClient,
  MockGeminiClient,
} from "./gemini";
import {
  ITavilyClient,
  RealTavilyClient,
  MockTavilyClient,
} from "./tavily";
import {
  IFirecrawlClient,
  RealFirecrawlClient,
  MockFirecrawlClient,
} from "./firecrawl";
import {
  IGmailClient,
  RealGmailClient,
  MockGmailClient,
} from "./gmail";
import { IntegrationHealth } from "@/types";

export function getGeminiClient(): IGeminiClient {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 5 && !apiKey.includes("your-")) {
    return new RealGeminiClient(apiKey);
  }
  return new MockGeminiClient();
}

export function getTavilyClient(): ITavilyClient {
  const apiKey = process.env.TAVILY_API_KEY;
  if (apiKey && apiKey.length > 5 && !apiKey.includes("your-")) {
    return new RealTavilyClient(apiKey);
  }
  return new MockTavilyClient();
}

export function getFirecrawlClient(): IFirecrawlClient {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (apiKey && apiKey.length > 5 && !apiKey.includes("your-")) {
    return new RealFirecrawlClient(apiKey);
  }
  return new MockFirecrawlClient();
}

export function getGmailClient(tokens?: any, redirectUriOverride?: string): IGmailClient {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET;
  const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl =
    (process.env.NODE_ENV === "production" && configuredAppUrl?.includes("localhost")
      ? vercelOrigin || "https://sponfy.vercel.app"
      : configuredAppUrl) ||
    vercelOrigin ||
    "http://localhost:3000";
  const defaultRedirect = `${baseUrl}/api/integrations/gmail/callback`;
  const redirectUri =
    redirectUriOverride ||
    process.env.GOOGLE_GMAIL_REDIRECT_URI ||
    process.env.GMAIL_REDIRECT_URI ||
    defaultRedirect;

  if (
    clientId &&
    clientSecret &&
    !clientId.includes("your-") &&
    !clientSecret.includes("your-")
  ) {
    return new RealGmailClient(clientId, clientSecret, redirectUri, tokens);
  }
  return new MockGmailClient();
}

export function getIntegrationStatus(): IntegrationHealth[] {
  const geminiConfigured = !!(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.length > 5 &&
    !process.env.GEMINI_API_KEY.includes("your-")
  );

  const tavilyConfigured = !!(
    process.env.TAVILY_API_KEY &&
    process.env.TAVILY_API_KEY.length > 5 &&
    !process.env.TAVILY_API_KEY.includes("your-")
  );

  const firecrawlConfigured = !!(
    process.env.FIRECRAWL_API_KEY &&
    process.env.FIRECRAWL_API_KEY.length > 5 &&
    !process.env.FIRECRAWL_API_KEY.includes("your-")
  );

  const gmailConfigured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_ID.includes("your-")
  );

  const dbConfigured = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("your-neon-host") &&
    !process.env.DATABASE_URL.includes("placeholder")
  );

  return [
    {
      name: "Gemini 2.0 Flash (AI Intelligence)",
      service: "gemini",
      isConfigured: geminiConfigured,
      statusText: geminiConfigured ? "Connected & Active" : "Demo Mock Mode Active",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "Tavily Web Search (Sponsor Intelligence)",
      service: "tavily",
      isConfigured: tavilyConfigured,
      statusText: tavilyConfigured ? "Connected & Active" : "Demo Mock Mode Active",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "Firecrawl Web Scraper & Crawler",
      service: "firecrawl",
      isConfigured: firecrawlConfigured,
      statusText: firecrawlConfigured ? "Connected & Active" : "Demo Mock Mode Active",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "Gmail API (OAuth & Email Outreach)",
      service: "gmail",
      isConfigured: gmailConfigured,
      statusText: gmailConfigured ? "OAuth Connected" : "Demo Mode (Simulated)",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "Cloud Database Storage",
      service: "database" as any,
      isConfigured: dbConfigured,
      statusText: dbConfigured ? "Connected (Secure Cloud Storage)" : "In-Memory Demo Store",
      lastChecked: new Date().toISOString(),
    },
  ];
}
