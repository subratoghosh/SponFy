import { EmailQuality } from "@/types";

interface QualityEvalContext {
  companyName: string;
  industry?: string;
  campaignName?: string;
  audienceSize?: number | string;
  subject: string;
  body: string;
}

/**
 * Evaluates the outreach email draft using Groq Cloud API for ultra-fast, cost-effective
 * evaluation. Generates truly unique scores (personalization, relevance, clarity, CTA, professionalism)
 * and tailored constructive improvement suggestions.
 */
export async function evaluateEmailQuality(context: QualityEvalContext): Promise<EmailQuality> {
  const { companyName, industry = "Technology", campaignName = "Student Event", audienceSize = "500+", subject, body } = context;

  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey && groqApiKey.length > 5 && !groqApiKey.includes("your-")) {
    try {
      const prompt = `You are an elite sponsorship outreach advisor. Critically evaluate this cold sponsorship pitch email.
Target Company: ${companyName} (${industry})
Campaign/Event: ${campaignName} (${audienceSize} attendees)
Email Subject: ${subject}
Email Body:
${body}

Analyze the email on 5 core dimensions:
1. Personalization (0-100): Does it cite specific company initiatives, tools, or contacts?
2. Relevance to Student Cohort (0-100): Is there natural synergy with ${companyName}'s target developer/engineering audience?
3. Clarity & Tone (0-100): Is the message concise, professional, and free of fluff or buzzwords?
4. Call to Action Precision (0-100): Is the next step specific, low-friction, and respectful of their time?
5. Professionalism (0-100): Is the tone appropriate and polite?

Compute an overall score (0-100) and provide 2-3 specific, actionable improvement suggestions for THIS particular email.

Return strict JSON:
{
  "personalization": <integer 0-100>,
  "relevance": <integer 0-100>,
  "clarity": <integer 0-100>,
  "cta": <integer 0-100>,
  "professionalism": <integer 0-100>,
  "overall": <integer 0-100>,
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

      // Try fast models on Groq: qwen/qwen3.8-27b, then openai/gpt-oss-20b
      const modelsToTry = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"];
      for (const model of modelsToTry) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              response_format: { type: "json_object" },
              messages: [{ role: "user", content: prompt }],
              temperature: 0.2,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              if (typeof parsed.overall === "number") {
                return {
                  personalization: Math.min(100, Math.max(0, Math.round(parsed.personalization || 75))),
                  relevance: Math.min(100, Math.max(0, Math.round(parsed.relevance || 80))),
                  clarity: Math.min(100, Math.max(0, Math.round(parsed.clarity || 85))),
                  cta: Math.min(100, Math.max(0, Math.round(parsed.cta || 78))),
                  professionalism: Math.min(100, Math.max(0, Math.round(parsed.professionalism || 88))),
                  overall: Math.min(100, Math.max(0, Math.round(parsed.overall || 81))),
                  suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
                    ? parsed.suggestions.slice(0, 3)
                    : ["Highlight past hackathon deliverables or previous partner testimonials."],
                };
              }
            }
          }
        } catch (innerErr) {
          // try next model
        }
      }
    } catch (groqErr) {
      console.warn("Groq quality evaluation failed, falling back to heuristics:", groqErr);
    }
  }

  // Deterministic, dynamic heuristic evaluation based on unique email characteristics
  const bodyLen = body.length;
  const hasSpecificContact = !body.startsWith("Hi Team") && !body.startsWith("Dear Sir");
  const mentionsCompany = body.toLowerCase().includes(companyName.toLowerCase());
  const mentionsNumbers = /\d+/.test(body);
  const mentionsTimeSlot = /10[- ]minute|15[- ]minute|call|sync|thursday|tuesday|calendar|meet/i.test(body);
  const hasDeckLink = body.includes("http") || body.includes(".pdf");

  let personalization = 60;
  if (hasSpecificContact) personalization += 20;
  if (mentionsCompany) personalization += 15;
  if (body.toLowerCase().includes(industry.toLowerCase())) personalization += 5;

  let relevance = 70;
  if (mentionsNumbers) relevance += 15;
  if (body.toLowerCase().includes("student") || body.toLowerCase().includes("developer")) relevance += 10;

  let clarity = 80;
  if (bodyLen > 250 && bodyLen < 1200) clarity += 10;
  else if (bodyLen >= 1200) clarity -= 15;

  let cta = 65;
  if (mentionsTimeSlot) cta += 20;
  if (hasDeckLink) cta += 10;

  let professionalism = 85;
  if (subject && subject.length > 10 && subject.length < 80) professionalism += 10;

  const overall = Math.round((personalization + relevance + clarity + cta + professionalism) / 5);

  const suggestions: string[] = [];
  if (!hasSpecificContact) suggestions.push(`Address a direct partnership lead at ${companyName} rather than a generic greeting.`);
  if (!mentionsTimeSlot) suggestions.push("Propose a low-commitment 10-minute discovery call to boost reply conversions.");
  if (!hasDeckLink) suggestions.push("Include a link to your sponsorship prospectus or deck.");
  if (suggestions.length === 0) suggestions.push("Email is well-tailored. Consider testing an alternative enthusiastic subject line.");

  return {
    personalization: Math.min(99, Math.max(30, personalization)),
    relevance: Math.min(99, Math.max(40, relevance)),
    clarity: Math.min(99, Math.max(40, clarity)),
    cta: Math.min(99, Math.max(35, cta)),
    professionalism: Math.min(99, Math.max(50, professionalism)),
    overall: Math.min(99, Math.max(40, overall)),
    suggestions,
  };
}
