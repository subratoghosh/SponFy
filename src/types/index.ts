import { z } from "zod";

// Pipeline Stages
export type PipelineStage =
  | "Discovered"
  | "Researched"
  | "Qualified"
  | "Contact Found"
  | "Draft Ready"
  | "Approved"
  | "Contacted"
  | "Replied"
  | "Interested"
  | "Negotiation"
  | "Committed"
  | "Lost";

// Contact Verification Status
export type ContactStatus = "verified" | "public" | "needs_verification" | "unknown";

// Reply Intents
export type ReplyIntent =
  | "Interested"
  | "Positive"
  | "Needs Info"
  | "Negotiating"
  | "Not Interested"
  | "Maybe Later"
  | "Out of Office"
  | "Unclear";

// Reply Sentiment
export type ReplySentiment = "positive" | "neutral" | "negative";

// Urgency Level
export type UrgencyLevel = "high" | "medium" | "low";

// Draft Status
export type DraftStatus = "draft" | "approved" | "sent" | "failed";

// Followup Status
export type FollowupStatus = "pending" | "completed" | "skipped" | "cancelled";

// AI Job Status
export type AIJobStatus = "queued" | "processing" | "completed" | "failed";

// Fit Score Breakdown Factor
export interface ScoreFactor {
  factor: string;
  points: number; // e.g. +18 or -5
  maxPoints: number;
  reason: string;
  positive: boolean;
}

// Research Sections
export interface ResearchSections {
  overview: string;
  productsAndServices: string[];
  targetAudience: string;
  recentInitiatives: string[];
  studentDeveloperPrograms: string[];
  sponsorshipOpportunities: string[];
  suggestedAngle: string;
}

// Cited Source
export interface SourceItem {
  id?: string;
  url: string;
  title: string;
  snippet: string;
}

// Contact
export interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  email: string;
  status: ContactStatus;
  sourceUrl?: string;
  createdAt: string;
}

// Email Quality Evaluation
export interface EmailQuality {
  personalization: number; // 0-100
  relevance: number;
  clarity: number;
  cta: number;
  professionalism: number;
  overall: number;
  suggestions: string[];
}

// Email Draft
export interface EmailDraft {
  id: string;
  companyId: string;
  contactId?: string;
  subject: string;
  body: string;
  quality: EmailQuality;
  status: DraftStatus;
  approvedAt?: string;
  createdAt: string;
}

// Message
export interface Message {
  id: string;
  draftId?: string;
  companyId: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  direction: "outbound" | "inbound";
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}

// Reply Analysis
export interface ReplyAnalysis {
  id: string;
  messageId: string;
  companyId: string;
  intent: ReplyIntent;
  sentiment: ReplySentiment;
  confidence: number; // 0-100
  summary: string;
  questions: string[];
  requestedInfo: string[];
  nextAction: string;
  urgency: UrgencyLevel;
  meetingRequested: boolean;
  createdAt: string;
}

// Company (Sponsor)
export interface Company {
  id: string;
  campaignId: string;
  name: string;
  website: string;
  industry: string;
  description: string;
  stage: PipelineStage;
  fitScore: number;
  scoreBreakdown: ScoreFactor[];
  pipelineValue: number;
  signals: string[];
  confidence: number;
  researchStatus: "pending" | "completed" | "failed";
  contacts?: Contact[];
  sources?: SourceItem[];
  researchReport?: {
    sections: ResearchSections;
    recommendedAngle: string;
  };
  latestDraft?: EmailDraft;
  createdAt: string;
  updatedAt: string;
}

// Tier config
export interface SponsorshipTier {
  name: string;
  amount: number;
  deliverables: string[];
  slots: number;
}

// Campaign
export interface Campaign {
  id: string;
  name: string;
  eventType: string; // "Hackathon" | "Cultural Fest" | "Tech Symposium" | "Student Club"
  audienceSize: number;
  location: string;
  targetAmount: number;
  preferredIndustries: string[];
  tiers: SponsorshipTier[];
  deckUrl?: string;
  description: string;
  status: "active" | "archived";
  createdAt: string;
}

// Followup Task
export interface FollowupTask {
  id: string;
  companyId: string;
  companyName: string;
  stepNumber: number;
  dueAt: string;
  status: FollowupStatus;
  aiRecommendation: {
    shouldFollowup: boolean;
    reason: string;
    suggestedAngle: string;
  };
}

// Activity Log Item
export interface Activity {
  id: string;
  campaignId?: string;
  companyId?: string;
  companyName?: string;
  type:
    | "company_discovered"
    | "research_completed"
    | "draft_created"
    | "draft_approved"
    | "email_sent"
    | "reply_received"
    | "intent_classified"
    | "stage_changed"
    | "followup_scheduled";
  payload: Record<string, any>;
  createdAt: string;
}

// AI Job
export interface AIJob {
  id: string;
  type: "discover" | "research" | "draft" | "reply_classify";
  status: AIJobStatus;
  step: string;
  progress: number;
  error?: string;
  result?: any;
  createdAt: string;
}

// Integration Status
export interface IntegrationHealth {
  name: string;
  service: "gemini" | "tavily" | "gmail" | "supabase";
  isConfigured: boolean;
  statusText: string;
  lastChecked?: string;
}

// --- Zod Validation Schemas ---

export const CreateCampaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  eventType: z.string().min(2, "Event type is required"),
  audienceSize: z.coerce.number().min(10, "Audience size must be at least 10"),
  location: z.string().min(2, "Location is required"),
  targetAmount: z.coerce.number().min(1000, "Target amount must be at least ₹1,000"),
  preferredIndustries: z.array(z.string()).min(1, "Select at least 1 industry"),
  tiers: z.array(
    z.object({
      name: z.string(),
      amount: z.number(),
      deliverables: z.array(z.string()),
      slots: z.number(),
    })
  ),
  deckUrl: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const DiscoverPromptSchema = z.object({
  campaignId: z.string().uuid(),
  prompt: z.string().min(5, "Search prompt must be at least 5 characters"),
  targetCount: z.number().min(1).max(50).default(10),
});

export const FitScoreBreakdownSchema = z.object({
  fitScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  scoreBreakdown: z.array(
    z.object({
      factor: z.string(),
      points: z.number(),
      maxPoints: z.number(),
      reason: z.string(),
      positive: z.boolean(),
    })
  ),
  summaryReason: z.string(),
});

export const EmailQualitySchema = z.object({
  personalization: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  cta: z.number().min(0).max(100),
  professionalism: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
});

export const ReplyAnalysisSchema = z.object({
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
  summary: z.string(),
  questions: z.array(z.string()),
  requestedInfo: z.array(z.string()),
  nextAction: z.string(),
  urgency: z.enum(["high", "medium", "low"]),
  meetingRequested: z.boolean(),
});
