/**
 * LLM Relevance Verification Service
 * Supports Groq Cloud (Free tier with Llama 3.3 70B / 3.1 8B) and xAI (Grok-2).
 * Evaluates candidate companies discovered via Tavily against the user's original natural-language query.
 */

export interface GrokRelevanceResult {
  relevant: boolean;
  decision: "RELEVANT" | "IRRELEVANT" | "UNCERTAIN";
  reason: string;
  evidence: Array<{ title: string; url: string }>;
  confidence: number; // 0 - 100
  provider?: "groq" | "xai";
}

export interface CandidateForGrok {
  name: string;
  website: string;
  industry?: string;
  description?: string;
  snippets?: Array<{ title: string; url: string; content: string }>;
}

export class GrokRelevanceVerifier {
  private groqKey?: string;
  private xaiKey?: string;
  private groqModel: string;
  private xaiModel: string;

  constructor(apiKey?: string, model?: string) {
    this.groqKey = process.env.GROQ_API_KEY;
    this.xaiKey = apiKey || process.env.XAI_API_KEY;
    this.groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    this.xaiModel = model || "grok-2-latest";
  }

  isConfigured(): boolean {
    const hasGroq = !!(this.groqKey && this.groqKey.length > 5 && !this.groqKey.includes("your-"));
    const hasXai = !!(this.xaiKey && this.xaiKey.length > 5 && !this.xaiKey.includes("your-"));
    return hasGroq || hasXai;
  }

  getProvider(): "groq" | "xai" | null {
    if (this.groqKey && this.groqKey.length > 5 && !this.groqKey.includes("your-")) {
      return "groq";
    }
    if (this.xaiKey && this.xaiKey.length > 5 && !this.xaiKey.includes("your-")) {
      return "xai";
    }
    return null;
  }

  async verifyCandidate(
    candidate: CandidateForGrok,
    userPrompt: string,
    eventContext?: { eventType?: string; audienceSize?: number; location?: string }
  ): Promise<GrokRelevanceResult> {
    const evidenceList = (candidate.snippets || []).slice(0, 3).map((s) => ({
      title: s.title || candidate.name,
      url: s.url || candidate.website,
    }));

    if (evidenceList.length === 0 && candidate.website) {
      evidenceList.push({ title: candidate.name, url: candidate.website });
    }

    const provider = this.getProvider();
    if (!provider) {
      return {
        relevant: false,
        decision: "UNCERTAIN",
        reason: "GROQ_API_KEY or XAI_API_KEY is not configured; manual review required.",
        evidence: evidenceList,
        confidence: 50,
      };
    }

    const snippetText = (candidate.snippets || [])
      .slice(0, 3)
      .map((s) => `- ${s.title}: ${s.content}`)
      .join("\n");

    const prompt = `You are a corporate sponsorship relevance evaluator.
User Request: "${userPrompt}"
Target Event: ${eventContext?.eventType || "Event"} with ${eventContext?.audienceSize || 800} attendees in ${eventContext?.location || "India"}.

Company Candidate:
- Name: ${candidate.name}
- Website: ${candidate.website}
- Industry: ${candidate.industry || "Unknown"}
- Description: ${candidate.description || "N/A"}

Web Evidence from Search:
${snippetText || "None provided"}

TASK:
Determine if this company is a genuine, relevant corporate sponsor candidate for the user's specific request.
Exclude directory sites, universities, student clubs, government portals, or completely unrelated businesses.

STRICT JSON OUTPUT ONLY:
{
  "relevant": boolean,
  "decision": "RELEVANT" | "IRRELEVANT" | "UNCERTAIN",
  "reason": "Concise 1-2 sentence rationale",
  "confidence": integer 0-100
}`;

    const endpoint =
      provider === "groq"
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api.x.ai/v1/chat/completions";

    const key = provider === "groq" ? this.groqKey : this.xaiKey;
    const model = provider === "groq" ? this.groqModel : this.xaiModel;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are an expert sponsorship relevance auditor. Respond ONLY with valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        throw new Error(`${provider.toUpperCase()} API HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      const decision =
        parsed.decision === "RELEVANT" || parsed.decision === "IRRELEVANT"
          ? parsed.decision
          : "UNCERTAIN";
      const relevant = decision === "RELEVANT";

      return {
        relevant,
        decision,
        reason: parsed.reason || `Evaluated by ${provider === "groq" ? "Groq (Llama 3.3)" : "Grok"} model.`,
        evidence: evidenceList,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 85,
        provider,
      };
    } catch (err: any) {
      console.warn(`${provider.toUpperCase()} relevance verification failed:`, err?.message || err);
      return {
        relevant: false,
        decision: "UNCERTAIN",
        reason: `Verification service error (${provider}): ${err?.message || "unreachable"}`,
        evidence: evidenceList,
        confidence: 0,
        provider,
      };
    }
  }
}

let grokInstance: GrokRelevanceVerifier | null = null;

export function getGrokVerifier(): GrokRelevanceVerifier {
  if (!grokInstance) {
    grokInstance = new GrokRelevanceVerifier();
  }
  return grokInstance;
}

export async function verifyGrokRelevance({
  companyName,
  userPrompt,
  website,
  snippets,
}: {
  companyName: string;
  userPrompt: string;
  website: string;
  snippets?: string[];
}): Promise<{ verified: boolean; decision: string; reason: string; confidence: number }> {
  const verifier = new GrokRelevanceVerifier();
  const res = await verifier.verifyCandidate(
    {
      name: companyName,
      website,
      snippets: (snippets || []).map((s) => ({ title: companyName, url: website, content: s })),
    },
    userPrompt
  );
  return {
    verified: res.relevant,
    decision: res.decision,
    reason: res.reason,
    confidence: res.confidence,
  };
}

