/**
 * Duplicate-company detection. A sponsorship drive must never hold the same
 * company twice, otherwise two teammates can each "own" and email it.
 * Pure functions so the rule is unit-testable.
 */

export class DuplicateCompanyError extends Error {
  readonly existingId: string;
  constructor(name: string, existingId: string) {
    super(`"${name}" is already in this campaign.`);
    this.name = "DuplicateCompanyError";
    this.existingId = existingId;
  }
}

/** "https://www.Postman.com/careers" -> "postman.com". Empty string if unusable. */
export function normalizeDomain(website?: string | null): string {
  if (!website) return "";
  try {
    const withScheme = /^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`;
    return new URL(withScheme).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** "Polygon (Polygon Labs)" and "polygon labs" should not both slip through; keep it conservative. */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface CompanyKey {
  id?: string;
  campaignId: string;
  name: string;
  website?: string | null;
}

/** Returns the existing company that collides with `candidate` in the same campaign, if any. */
export function findDuplicateCompany<T extends CompanyKey>(existing: T[], candidate: CompanyKey): T | undefined {
  const candDomain = normalizeDomain(candidate.website);
  const candName = normalizeName(candidate.name);

  return existing.find((c) => {
    if (c.campaignId !== candidate.campaignId) return false;
    const domain = normalizeDomain(c.website);
    if (candDomain && domain && candDomain === domain) return true;
    return candName.length > 0 && normalizeName(c.name) === candName;
  });
}
