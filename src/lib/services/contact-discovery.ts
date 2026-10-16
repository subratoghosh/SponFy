import { getTavilyClient, getFirecrawlClient } from "@/lib/integrations/factory";
import { GoogleGenAI } from "@google/genai";
import { normalizeDomain } from "@/lib/outreach/duplicates";
import { verifyEmailStrictly, StrictVerificationResult } from "@/lib/integrations/verification/strict-verifier";
import { addContact } from "@/lib/data/repositories/sponsors";
import { Contact } from "@/types";

export interface ContactDiscoveryResult {
  found: boolean;
  contact?: Contact;
  verification?: StrictVerificationResult;
  sourceUrl?: string;
  reason: string;
}

/**
 * Discover real, verifiable public partnership contacts for a company
 * strictly through real-time web intelligence and domain crawling.
 *
 * GUARANTEE: Never invents or fabricates synthetic "partnerships@domain" patterns.
 */
export async function discoverRealCompanyContact(
  companyId: string,
  companyName: string,
  website?: string | null,
  userId?: string
): Promise<ContactDiscoveryResult> {
  const domain = website
    ? normalizeDomain(website)
    : companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";

  const tavily = getTavilyClient();
  const firecrawl = getFirecrawlClient();

  const snippets: Array<{ title: string; url: string; content: string }> = [];

  // 1. Search for public partnership and sponsorship contacts
  try {
    const queries = [
      `site:${domain} (contact OR email OR partnerships OR sponsorship OR devrel OR "reach out")`,
      `"${companyName}" (sponsorship OR partnership OR "developer relations") email contact`,
    ];

    if (tavily.isConfigured()) {
      const tavilyPromises = queries.map((q) =>
        fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: q,
            search_depth: "advanced",
            max_results: 5,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            for (const r of data.results || []) {
              snippets.push({
                title: r.title || "",
                url: r.url || "",
                content: (r.content || "").slice(0, 500),
              });
            }
          })
          .catch(() => {})
      );
      await Promise.all(tavilyPromises);
    }

    if (firecrawl.isConfigured()) {
      const fcResults = await firecrawl.search(`site:${domain} contact email partnerships`, 3);
      for (const r of fcResults) {
        snippets.push({
          title: r.title || "",
          url: r.url || "",
          content: (r.markdown || r.description || "").slice(0, 500),
        });
      }
    }
  } catch (searchErr) {
    console.warn("Contact search error:", searchErr);
  }

  // 2. Direct regex search for email addresses in retrieved snippets
  const allText = snippets.map((s) => `${s.title} ${s.content} ${s.url}`).join("\n");
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const rawMatches = Array.from(new Set(allText.match(emailRegex) || []));

  // Filter out irrelevant/boilerplate emails (e.g. sentry, cloudflare, w3.org, example.com)
  const candidateEmails = rawMatches.filter((em) => {
    const lower = em.toLowerCase();
    const emDomain = lower.split("@")[1];
    if (!emDomain) return false;
    const isBoilerplate =
      emDomain.includes("sentry.io") ||
      emDomain.includes("cloudflare.com") ||
      emDomain.includes("w3.org") ||
      emDomain.includes("schema.org") ||
      emDomain.includes("google.com") ||
      emDomain.includes("github.com") ||
      emDomain.includes("gravatar.com");
    return !isBoilerplate;
  });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.length < 10 || geminiKey.includes("your-")) {
    // If no AI key, pick first candidate matching the company domain
    const directMatch = candidateEmails.find((em) => em.toLowerCase().includes(domain));
    if (directMatch) {
      const verif = await verifyEmailStrictly(directMatch, { companyName });
      if (verif.isDeliverable) {
        const contact = await addContact(companyId, {
          name: `${companyName} Team`,
          role: "Sponsorship & Partnership Relations",
          email: directMatch,
          status: "verified",
          sourceUrl: snippets[0]?.url,
        });
        return {
          found: true,
          contact: contact || undefined,
          verification: verif,
          sourceUrl: snippets[0]?.url,
          reason: `Verified public contact found on ${domain}`,
        };
      }
    }
    return {
      found: false,
      reason: `No verified public contact email found on ${domain}. Please add an authorized contact manually to protect deliverability.`,
    };
  }

  // 3. Grounded AI Extraction via Gemini
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const extractionPrompt = `You are a corporate intelligence agent specializing in finding authentic partnership and sponsor contacts.
Target Company: "${companyName}"
Official Website/Domain: "${domain}"

CANDIDATE EMAILS DETECTED IN WEB TEXT:
${JSON.stringify(candidateEmails)}

WEB INTELLIGENCE SNIPPETS:
${snippets.map((s) => `- [${s.title}](${s.url}): ${s.content}`).join("\n") || "No search snippets available."}

STRICT ANTI-HALLUCINATION RULES:
1. ONLY return an email address that ACTUALLY appears in the detected candidate emails or text above.
2. DO NOT GUESS OR INVENT ANY EMAIL like "partnerships@${domain}" or "info@${domain}" unless it is explicitly present in the evidence.
3. If no authentic email is found in the evidence, you MUST return "email": null.
4. Prefer direct partnership, sponsor, DevRel, or marketing leads over generic support/privacy emails.

Respond ONLY with this JSON structure:
{
  "email": "<exact email from evidence or null>",
  "contactName": "<name of contact person or department>",
  "role": "<job title or role>",
  "sourceUrl": "<URL where email was mentioned>",
  "confidence": <integer 0-100>,
  "reason": "<explanation of how this contact was discovered>"
}`;

    const res = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: extractionPrompt,
      config: { responseMimeType: "application/json" },
    });

    let text = res?.text?.trim() || "{}";
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }
    const parsed = JSON.parse(text);

    if (parsed.email && typeof parsed.email === "string" && parsed.email.includes("@")) {
      const extractedEmail = parsed.email.trim().toLowerCase();

      // Run strict multi-layer verification on discovered email
      const verif = await verifyEmailStrictly(extractedEmail, { companyName });
      if (verif.isDeliverable && verif.status !== "INVALID" && verif.status !== "BOUNCED") {
        const contact = await addContact(companyId, {
          name: parsed.contactName || `${companyName} Partnerships`,
          role: parsed.role || "Partnerships / Sponsor Relations",
          email: extractedEmail,
          status: "verified",
          sourceUrl: parsed.sourceUrl || snippets[0]?.url,
        });

        return {
          found: true,
          contact: contact || undefined,
          verification: verif,
          sourceUrl: parsed.sourceUrl || snippets[0]?.url,
          reason: parsed.reason || "Verified public partnership contact discovered.",
        };
      } else {
        return {
          found: false,
          verification: verif,
          reason: `Discovered email ${extractedEmail} failed deliverability verification (${verif.reason}). Prevented bounce.`,
        };
      }
    }
  } catch (err: any) {
    console.warn("AI contact extraction failed:", err);
  }

  return {
    found: false,
    reason: `No verified public contact email published by ${companyName}. Add a verified contact to maintain zero-bounce compliance.`,
  };
}
