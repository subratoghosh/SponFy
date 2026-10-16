import { describe, it, expect } from "vitest";
import { getSiteUrl, siteConfig } from "@/lib/config/site";
import { GET as healthGet, HEAD as healthHead } from "@/app/api/health/route";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("Production Readiness Suite", () => {
  describe("Site URL & SEO Configuration", () => {
    it("resolves canonical site URL with fallback and no trailing slash", () => {
      const url = getSiteUrl();
      expect(typeof url).toBe("string");
      expect(url.length).toBeGreaterThan(0);
      expect(url.endsWith("/")).toBe(false);
    });

    it("siteConfig contains required production metadata", () => {
      expect(siteConfig.name).toBe("SponFy");
      expect(siteConfig.description.length).toBeGreaterThan(20);
      expect(siteConfig.keywords.length).toBeGreaterThan(3);
    });

    it("generates crawler directives in robots() disallowing private dashboards and APIs", () => {
      const r = robots();
      expect(r.rules).toBeDefined();
      const defaultRule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
      expect(defaultRule?.disallow).toContain("/app/*");
      expect(defaultRule?.disallow).toContain("/admin/*");
      expect(defaultRule?.disallow).toContain("/api/*");
      expect(defaultRule?.allow).toContain("/");
      expect(defaultRule?.allow).toContain("/showcase");
      expect(r.sitemap).toContain("/sitemap.xml");
    });

    it("generates sitemap() containing only legitimate public routes", () => {
      const entries = sitemap();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThanOrEqual(8);

      const urls = entries.map((e) => e.url);
      expect(urls.some((u) => u === getSiteUrl() || u === `${getSiteUrl()}/`)).toBe(true);
      expect(urls.some((u) => u.includes("/showcase"))).toBe(true);
      expect(urls.some((u) => u.includes("/why-us"))).toBe(true);
      expect(urls.some((u) => u.includes("/workflow"))).toBe(true);

      // Verify NO private routes leaked
      expect(urls.some((u) => u.includes("/app"))).toBe(false);
      expect(urls.some((u) => u.includes("/admin"))).toBe(false);
      expect(urls.some((u) => u.includes("/api"))).toBe(false);
    });
  });

  describe("Health Check Endpoint (/api/health)", () => {
    it("HEAD /api/health returns 200 with no-store cache headers", async () => {
      const res = await healthHead();
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toContain("no-store");
    });

    it("GET /api/health returns JSON health diagnostics without leaking secrets", async () => {
      const res = await healthGet();
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("application/json");

      const body = await res.json();
      expect(body.status).toBe("healthy");
      expect(typeof body.uptimeSeconds).toBe("number");
      expect(body.storage).toBeDefined();
      expect(body.environment).toBeDefined();

      // Ensure no raw connection strings or secrets leaked
      const stringified = JSON.stringify(body);
      expect(stringified).not.toContain("postgres://");
      expect(stringified).not.toContain("postgresql://");
      expect(stringified).not.toContain("password");
    });
  });
});
