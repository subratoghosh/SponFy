import { z } from "zod";

const serverEnvSchema = z.object({
  SITE_URL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  AUTH_SECRET: z.string().default("sponfy-dev-auth-secret-super-safe-fallback-32chars"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.8-flash"),
  TAVILY_API_KEY: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REDIRECT_URI: z.string().optional(),
  HUNTER_API_KEY: z.string().optional(),
  ZEROBOUNCE_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  TOKEN_ENCRYPTION_KEY: z.string().default("sponfy-32-byte-hex-secret-aes-key-2026-safe-fallback"),
  CRON_SECRET: z.string().default("sponfy-cron-secret-token"),
  ADMIN_EMAILS: z.string().optional(),
  SPONFY_LANGGRAPH_DISCOVERY_ENABLED: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_DEMO_MODE: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1" || !process.env.DATABASE_URL),
});

export const env = {
  ...serverEnvSchema.parse(process.env),
  ...clientEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  }),
};

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

export function isLangGraphDiscoveryEnabled(): boolean {
  return (
    process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED === "true" ||
    process.env.SPONFY_LANGGRAPH_DISCOVERY_ENABLED === "1"
  );
}
