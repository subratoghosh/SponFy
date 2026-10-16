import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/showcase",
          "/why-us",
          "/workflow",
          "/intelligence",
          "/analytics",
          "/faq",
          "/get-app",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/app",
          "/app/*",
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/onboarding",
          "/onboarding/*",
          "/login",
          "/signup",
          "/_next/*",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/showcase", "/why-us", "/workflow"],
        disallow: ["/app/*", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
