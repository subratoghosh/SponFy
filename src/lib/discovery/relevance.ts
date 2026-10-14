/**
 * Fast Sponsor Relevance Filter
 * Classifies candidates discovered via web search before any expensive enrichment or verification.
 * Categories: RELEVANT | IRRELEVANT | UNCERTAIN
 */

export type RelevanceVerdict = "RELEVANT" | "IRRELEVANT" | "UNCERTAIN";

export interface RelevanceClassification {
  verdict: RelevanceVerdict;
  confidence: number; // 0 - 100
  reason: string;
  sourceReferences: Array<{ title: string; url: string }>;
}

export interface CandidateForRelevance {
  name: string;
  website: string;
  industry?: string;
  description?: string;
  snippets?: Array<{ title: string; url: string; content: string }>;
}

/**
 * Deterministic pre-filter: catches obvious non-commercial / government / individual pages
 * before spending model tokens.
 */
function deterministicFilter(candidate: CandidateForRelevance): RelevanceClassification | null {
  const nameLower = candidate.name.toLowerCase();
  const domainLower = candidate.website.toLowerCase();

  // Obvious non-sponsors / directory sites
  const irrelevantDomainPatterns = [
    "wikipedia.org",
    "gov.in",
    "nic.in",
    "edu.in",
    "ac.in",
    "reddit.com",
    "quora.com",
    "medium.com",
    "yelp.com",
    "yellowpages",
    "glassdoor.com",
  ];

  if (irrelevantDomainPatterns.some((pattern) => domainLower.includes(pattern))) {
    return {
      verdict: "IRRELEVANT",
      confidence: 95,
      reason: `Excluded domain (${domainLower}) is an informational directory, forum, or non-commercial entity.`,
      sourceReferences: [{ title: candidate.name, url: candidate.website }],
    };
  }

  // Obvious student clubs or campus-internal organizations
  if (/\b(student club|college chapter|campus society|student chapter)\b/i.test(candidate.description || "")) {
    return {
      verdict: "IRRELEVANT",
      confidence: 90,
      reason: "Entity is a student organisation or campus club rather than an external corporate sponsor.",
      sourceReferences: [{ title: candidate.name, url: candidate.website }],
    };
  }

  return null;
}

/**
 * Filter sponsor candidates for relevance against the user request and campaign criteria.
 */
export async function filterCandidateRelevance(
  candidate: CandidateForRelevance,
  userPrompt: string,
  preferredIndustries: string[] = []
): Promise<RelevanceClassification> {
  // 1. Run deterministic checks first (0 cost, 0 latency)
  const quickVerdict = deterministicFilter(candidate);
  if (quickVerdict) {
    return quickVerdict;
  }

  // 2. Keyword & industry alignment scoring
  const targetText = `${candidate.name} ${candidate.industry || ""} ${candidate.description || ""}`.toLowerCase();
  const promptTerms = userPrompt.toLowerCase().split(/\s+/).filter((t) => t.length > 3);

  const matchedPromptTerms = promptTerms.filter((term) => targetText.includes(term));
  const matchedIndustries = preferredIndustries.filter((ind) =>
    targetText.includes(ind.toLowerCase())
  );

  const sources = (candidate.snippets || []).slice(0, 3).map((s) => ({
    title: s.title,
    url: s.url,
  }));
  if (sources.length === 0 && candidate.website) {
    sources.push({ title: candidate.name, url: candidate.website });
  }

  // If clearly aligned with user prompt or preferred industries
  if (matchedPromptTerms.length >= 1 || matchedIndustries.length >= 1) {
    return {
      verdict: "RELEVANT",
      confidence: 88,
      reason: `Matches target criteria: aligned with ${matchedIndustries.join(", ") || matchedPromptTerms.join(", ") || "technology event sponsors"}.`,
      sourceReferences: sources,
    };
  }

  // If ambiguous but a legitimate company
  if (candidate.website.startsWith("http") && candidate.name.length > 2) {
    return {
      verdict: "UNCERTAIN",
      confidence: 65,
      reason: "General commercial company identified; review required to verify sponsorship budget synergy.",
      sourceReferences: sources,
    };
  }

  return {
    verdict: "IRRELEVANT",
    confidence: 75,
    reason: "No evident synergy with target campaign sectors or sponsorship request.",
    sourceReferences: sources,
  };
}
