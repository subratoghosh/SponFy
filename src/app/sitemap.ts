import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  // Public marketing routes with appropriate crawl priority and change frequency
  const publicRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  }> = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/showcase", priority: 0.9, changeFrequency: "weekly" },
    { path: "/why-us", priority: 0.8, changeFrequency: "monthly" },
    { path: "/workflow", priority: 0.8, changeFrequency: "monthly" },
    { path: "/intelligence", priority: 0.8, changeFrequency: "monthly" },
    { path: "/analytics", priority: 0.7, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/get-app", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
