/**
 * Canonical Site URL & Metadata Configuration
 *
 * Centralizes the canonical base URL resolution for metadataBase, sitemap.xml, robots.txt,
 * OpenGraph, Twitter Cards, and canonical tags.
 *
 * Priority:
 * 1. SITE_URL (recommended explicit environment variable for production)
 * 2. NEXT_PUBLIC_APP_URL (if configured with a non-localhost domain)
 * 3. VERCEL_PROJECT_PRODUCTION_URL (system env var provided by Vercel for the stable production branch)
 * 4. Fallback: https://sponfy.vercel.app in production, http://localhost:3000 in development
 *
 * CRITICAL RULE: Never use VERCEL_URL as the canonical site URL because VERCEL_URL points to ephemeral preview deployment hashes.
 */
export function getSiteUrl(): string {
  if (process.env.SITE_URL) {
    const url = process.env.SITE_URL.trim().replace(/\/+$/, "");
    return url.startsWith("http") ? url : `https://${url}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, "");
    return url.startsWith("http") ? url : `https://${url}`;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/+$/, "")}`;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://sponfy.vercel.app";
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const siteConfig = {
  name: "SponFy",
  title: "SponFy — AI Sponsorship Operating System",
  tagline: "Find, research, and win event sponsors with human-in-the-loop AI",
  description:
    "Find, research and win sponsors for campaigns, conferences, summits, and organizations — with AI that asks before it sends.",
  shortDescription: "Find, research and win event sponsors with explainable AI and human-approved outreach.",
  url: getSiteUrl(),
  ogImage: "/icon.svg",
  creator: "@sponfy",
  keywords: [
    "sponsorship operating system",
    "event sponsorship",
    "conference sponsors",
    "hackathon sponsors",
    "AI outreach",
    "sponsor research",
    "verified sponsor contacts",
    "brand partnerships",
    "SponFy",
  ],
};
