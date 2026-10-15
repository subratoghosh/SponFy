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

function isValidGeminiApiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith("AIza");
}

export function getGeminiClient(): IGeminiClient {
  const apiKey = process.env.GEMINI_API_KEY;
  if (isValidGeminiApiKey(apiKey)) {
    return new RealGeminiClient(apiKey!);
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

  const hunterConfigured = !!(
    process.env.HUNTER_API_KEY &&
    process.env.HUNTER_API_KEY.length > 5 &&
    !process.env.HUNTER_API_KEY.includes("your-")
  );

  const zeroBounceConfigured = !!(
    process.env.ZEROBOUNCE_API_KEY &&
    process.env.ZEROBOUNCE_API_KEY.length > 5 &&
    !process.env.ZEROBOUNCE_API_KEY.includes("your-")
  );

  const groqConfigured = !!(
    process.env.GROQ_API_KEY &&
    process.env.GROQ_API_KEY.length > 5 &&
    !process.env.GROQ_API_KEY.includes("your-")
  );

  const grokConfigured = !!(
    process.env.XAI_API_KEY &&
    process.env.XAI_API_KEY.length > 5 &&
    !process.env.XAI_API_KEY.includes("your-")
  );

  const relevanceLlmConfigured = groqConfigured || grokConfigured;
  const relevanceLabel = groqConfigured
    ? "Connected via Groq (Llama 3.3)"
    : grokConfigured
    ? "Connected via xAI (Grok)"
    : "Optional (Groq / xAI Ready)";

  return [
    {
      name: "AI Intelligence Engine",
      service: "gemini",
      isConfigured: geminiConfigured,
      statusText: geminiConfigured ? "Connected & Active" : "Automated Engine Ready",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "LLM Relevance Verification",
      service: "groq" as any,
      isConfigured: relevanceLlmConfigured,
      statusText: relevanceLabel,
      lastChecked: new Date().toISOString(),
    },
    {
      name: "Live Web Search Intelligence",
      service: "tavily",
      isConfigured: tavilyConfigured,
      statusText: tavilyConfigured ? "Connected & Active" : "Web Intelligence Ready",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "Hunter Email Verification",
      service: "hunter" as any,
      isConfigured: hunterConfigured,
      statusText: hunterConfigured ? "Connected & Active" : "Needs API Key",
      lastChecked: new Date().toISOString(),
    },
    {
      name: "ZeroBounce Secondary Verification",
      service: "zerobounce" as any,
      isConfigured: zeroBounceConfigured,
      statusText: zeroBounceConfigured ? "Connected & Active" : "Needs API Key",
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
