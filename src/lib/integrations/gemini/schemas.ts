import "server-only";
import { z } from "zod";

export const scoreFactorSchema = z.object({
  factor: z.string().min(1).max(100),
  points: z.number().min(0).max(100),
  maxPoints: z.number().min(1).max(100),
  reason: z.string().min(1).max(500),
  positive: z.boolean(),
});

export const geminiFitScoreSchema = z.object({
  fitScore: z.number().min(0).max(100).optional(),
  score: z.number().min(0).max(100).optional(),
  confidence: z.number().min(0).max(100).default(85),
  scoreBreakdown: z.array(scoreFactorSchema).optional(),
  breakdown: z.array(scoreFactorSchema).optional(),
  summaryReason: z.string().min(1).max(1000),
}).transform((val) => ({
  fitScore: val.fitScore ?? val.score ?? 50,
  confidence: val.confidence,
  scoreBreakdown: val.scoreBreakdown ?? val.breakdown ?? [],
  summaryReason: val.summaryReason,
}));

export const emailQualitySchema = z.object({
  personalization: z.number().min(0).max(100).default(80),
  relevance: z.number().min(0).max(100).default(80),
  clarity: z.number().min(0).max(100).default(80),
  cta: z.number().min(0).max(100).default(80),
  professionalism: z.number().min(0).max(100).default(80),
  overall: z.number().min(0).max(100).default(80),
  suggestions: z.array(z.string().max(300)).default([]),
});

export const geminiDraftSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  quality: emailQualitySchema,
});

export const geminiReplyAnalysisSchema = z.object({
  intent: z.enum([
    "Interested",
    "Positive",
    "Needs Info",
    "Negotiating",
    "Not Interested",
    "Maybe Later",
    "Out of Office",
    "Unclear",
  ]),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  confidence: z.number().min(0).max(100),
  summary: z.string().max(500),
  questions: z.array(z.string().max(300)).default([]),
  requestedInfo: z.array(z.string().max(300)).default([]),
  nextAction: z.string().max(300).default("Review reply"),
  urgency: z.enum(["high", "medium", "low"]).default("medium"),
  meetingRequested: z.boolean().default(false),
});

/**
 * Delimits and sanitizes untrusted input text before feeding into LLM prompts
 * to mitigate prompt injection and format hijacking.
 */
export function delimitUntrustedContent(content: string, maxLen: number = 2000): string {
  if (!content) return "";
  const trimmed = content.slice(0, maxLen).replace(/[\r\n]{3,}/g, "\n\n");
  return `<<<UNTRUSTED_EXTERNAL_DATA_START>>>\n${trimmed}\n<<<UNTRUSTED_EXTERNAL_DATA_END>>>`;
}
