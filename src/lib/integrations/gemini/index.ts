import {
  Company,
  Campaign,
  EmailDraft,
  EmailQuality,
  ScoreFactor,
  ReplyAnalysis,
} from "@/types";

export interface IGeminiClient {
  isConfigured(): boolean;
  scoreCompanyFit(
    companyName: string,
    industry: string,
    description: string,
    campaign: Campaign
  ): Promise<{
    fitScore: number;
    confidence: number;
    scoreBreakdown: ScoreFactor[];
    summaryReason: string;
  }>;
  generateOutreachDraft(
    company: Company,
    campaign: Campaign,
    tone?: "professional" | "enthusiastic" | "value_first" | "short"
  ): Promise<{
    subject: string;
    body: string;
    quality: EmailQuality;
  }>;
  classifyReply(
    emailSubject: string,
    emailBody: string,
    companyName: string
  ): Promise<ReplyAnalysis>;
  generateNextAction(
    company: Company,
    latestReply?: ReplyAnalysis
  ): Promise<{
    nextAction: string;
    reason: string;
    urgency: "high" | "medium" | "low";
  }>;
  generateCampaignInsights(
    campaign: Campaign,
    companies: Company[]
  ): Promise<string[]>;
}

// Real Implementation
export class RealGeminiClient implements IGeminiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  private async generateWithFallback(
    prompt: string,
    responseMimeType: string = "application/json"
  ) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.8-flash",
    ];

    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType,
            },
          });
          const text = response.text || "{}";
          return JSON.parse(text);
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          // If model doesn't exist, don't retry it
          if (msg.includes("404") || msg.includes("NOT_FOUND")) {
            break;
          }
          // If transient overload or 503, brief backoff
          if (attempt < 2 && (msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE") || msg.includes("demand"))) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      }
    }

    const isHighDemand =
      lastError?.message?.includes("503") ||
      lastError?.message?.includes("high demand") ||
      lastError?.message?.includes("UNAVAILABLE");

    if (isHighDemand) {
      throw new Error(
        "Gemini AI is currently experiencing high demand. Please try again shortly or generate using an existing saved template."
      );
    }
    throw new Error(`Gemini request failed: ${lastError?.message || "Unknown error"}`);
  }

  async scoreCompanyFit(
    companyName: string,
    industry: string,
    description: string,
    campaign: Campaign
  ) {
    try {
      const prompt = `You are a sponsorship analytics expert. Evaluate the sponsorship fit between company "${companyName}" (${industry}: ${description}) and event "${campaign.name}" (Type: ${campaign.eventType}, Audience: ${campaign.audienceSize} students in ${campaign.location}, Target: ₹${campaign.targetAmount}).
Return strict JSON with:
{
  "fitScore": <number 0-100>,
  "confidence": <number 0-100>,
  "scoreBreakdown": [
    {"factor": "Industry Relevance", "points": <number>, "maxPoints": 20, "reason": "<string>", "positive": <bool>},
    {"factor": "Audience Overlap", "points": <number>, "maxPoints": 20, "reason": "<string>", "positive": <bool>},
    {"factor": "Product Synergy", "points": <number>, "maxPoints": 15, "reason": "<string>", "positive": <bool>},
    {"factor": "Event Type Match", "points": <number>, "maxPoints": 15, "reason": "<string>", "positive": <bool>},
    {"factor": "Student Program History", "points": <number>, "maxPoints": 15, "reason": "<string>", "positive": <bool>},
    {"factor": "Financial Capability", "points": <number>, "maxPoints": 10, "reason": "<string>", "positive": <bool>},
    {"factor": "Geographic Alignment", "points": <number>, "maxPoints": 5, "reason": "<string>", "positive": <bool>}
  ],
  "summaryReason": "<one sentence overview>"
}`;

      return await this.generateWithFallback(prompt);
    } catch (err: any) {
      console.error("Real Gemini fit scoring failed:", err);
      throw new Error(`Gemini fit scoring failed: ${err?.message || err}`);
    }
  }

  async generateOutreachDraft(
    company: Company,
    campaign: Campaign,
    tone: "professional" | "enthusiastic" | "value_first" | "short" = "professional"
  ) {
    try {
      const prompt = `Draft a personalized sponsorship pitch email for company "${company.name}" regarding our event "${campaign.name}" (${campaign.audienceSize} students in ${campaign.location}).
Tone: ${tone}.
Return strict JSON:
{
  "subject": "<compelling subject line without spam keywords>",
  "body": "<personalized body text referencing their developer/student programs>",
  "quality": {
    "personalization": <0-100>,
    "relevance": <0-100>,
    "clarity": <0-100>,
    "cta": <0-100>,
    "professionalism": <0-100>,
    "overall": <0-100>,
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  }
}`;

      return await this.generateWithFallback(prompt);
    } catch (err: any) {
      console.error("Real Gemini drafting failed:", err);
      throw new Error(`Gemini drafting failed: ${err?.message || err}`);
    }
  }

  async classifyReply(
    emailSubject: string,
    emailBody: string,
    companyName: string
  ): Promise<ReplyAnalysis> {
    try {
      const prompt = `Classify this inbound email reply from "${companyName}".
Subject: ${emailSubject}
Body: ${emailBody}
Return strict JSON matching:
{
  "intent": "Interested" | "Positive" | "Needs Info" | "Negotiating" | "Not Interested" | "Maybe Later" | "Out of Office" | "Unclear",
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": <0-100>,
  "summary": "<one sentence summary>",
  "questions": ["<question asked by sponsor>"],
  "requestedInfo": ["<info needed>"],
  "nextAction": "<recommended response action>",
  "urgency": "high" | "medium" | "low",
  "meetingRequested": <boolean>
}`;

      const parsed = await this.generateWithFallback(prompt);
      return {
        id: `rep-${Date.now()}`,
        messageId: `msg-${Date.now()}`,
        companyId: "",
        ...parsed,
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error("Real Gemini reply classification failed:", err);
      throw new Error(`Gemini reply classification failed: ${err?.message || err}`);
    }
  }

  async generateNextAction(company: Company, latestReply?: ReplyAnalysis) {
    const mock = new MockGeminiClient();
    return mock.generateNextAction(company, latestReply);
  }

  async generateCampaignInsights(campaign: Campaign, companies: Company[]) {
    const mock = new MockGeminiClient();
    return mock.generateCampaignInsights(campaign, companies);
  }
}

// Mock Implementation for Zero-Config Demo Mode
export class MockGeminiClient implements IGeminiClient {
  isConfigured(): boolean {
    return false;
  }

  async scoreCompanyFit(
    companyName: string,
    industry: string,
    description: string,
    campaign: Campaign
  ) {
    const isDevTool = industry.toLowerCase().includes("developer") || industry.toLowerCase().includes("cloud");
    const fitScore = isDevTool ? 92 : 84;

    return {
      fitScore,
      confidence: 94,
      scoreBreakdown: [
        {
          factor: "Industry Relevance",
          points: isDevTool ? 20 : 16,
          maxPoints: 20,
          reason: `High affinity between ${industry} and ${campaign.eventType} audience`,
          positive: true,
        },
        {
          factor: "Audience Overlap",
          points: 19,
          maxPoints: 20,
          reason: `${campaign.audienceSize} student engineers match target demographic`,
          positive: true,
        },
        {
          factor: "Product Synergy",
          points: 14,
          maxPoints: 15,
          reason: `${companyName} developer APIs/tools offer natural track challenge integration`,
          positive: true,
        },
        {
          factor: "Event Type Match",
          points: 14,
          maxPoints: 15,
          reason: `Regular sponsor of national conferences and partner campaigns`,
          positive: true,
        },
        {
          factor: "Student Program History",
          points: 13,
          maxPoints: 15,
          reason: `Active student ambassador and academic credit programs in India`,
          positive: true,
        },
        {
          factor: "Financial Capability",
          points: 8,
          maxPoints: 10,
          reason: `Tier-appropriate budget aligned with ₹50k - ₹1.5L packages`,
          positive: true,
        },
        {
          factor: "Geographic Alignment",
          points: 4,
          maxPoints: 5,
          reason: `National outreach targeting ${campaign.location}`,
          positive: true,
        },
      ],
      summaryReason: `${companyName} exhibits strong category alignment with active community programs and high willingness to sponsor relevant partner campaigns.`,
    };
  }

  async generateOutreachDraft(
    company: Company,
    campaign: Campaign,
    tone: "professional" | "enthusiastic" | "value_first" | "short" = "professional"
  ) {
    const contactName = company.contacts?.[0]?.name || "Team";
    const subject = `Partnering with ${company.name} at ${campaign.name} (${campaign.audienceSize} Student Builders)`;

    let body = `Hi ${contactName},\n\nHope this finds you well!\n\nI'm reaching out because ${company.name}'s developer community programs continue to inspire student builders across India.\n\nWe are organizing ${campaign.name}, bringing together ${campaign.audienceSize} top engineering students in ${campaign.location}. Our participants will be building high-impact full-stack and AI projects over 36 intense hours.\n\nGiven ${company.name}'s expertise in ${company.industry}, we would love to invite you as our Official Partner to host a dedicated track and engage directly with top technical talent.\n\nYou can review our event details here: ${campaign.deckUrl || "https://sponfy.dev/deck.pdf"}\n\nWould you be open to a quick 10-minute sync this week to explore collaboration?\n\nWarm regards,\nOrganizer Team\n${campaign.name}`;

    if (tone === "short") {
      body = `Hi ${contactName},\n\nWe're hosting ${campaign.name} (${campaign.audienceSize} engineers in ${campaign.location}) and would love to collaborate with ${company.name} on a dedicated challenge track.\n\nDeck: ${campaign.deckUrl || "https://sponfy.dev/deck.pdf"}\n\nCould we connect for 5 mins this Thursday?\n\nBest,\nOrganizer Team`;
    }

    return {
      subject,
      body,
      quality: {
        personalization: 94,
        relevance: 95,
        clarity: 93,
        cta: 92,
        professionalism: 96,
        overall: 94,
        suggestions: [
          "Include a note about specific colleges participating in Western India.",
          "Add mention of expected mentor availability for your track.",
        ],
      },
    };
  }

  async classifyReply(
    emailSubject: string,
    emailBody: string,
    companyName: string
  ): Promise<ReplyAnalysis> {
    const isInterested = emailBody.toLowerCase().includes("interested") || emailBody.toLowerCase().includes("call") || emailBody.toLowerCase().includes("meet");

    return {
      id: `rep-${Date.now()}`,
      messageId: `msg-${Date.now()}`,
      companyId: "",
      intent: isInterested ? "Interested" : "Needs Info",
      sentiment: "positive",
      confidence: 96,
      summary: `${companyName} expressed enthusiasm and requested attendee demographic details + meeting slot.`,
      questions: ["Could you send over the student demographic breakdown?"],
      requestedInfo: ["Demographic sheet", "MoU / Invoice"],
      nextAction: "Schedule a Google Meet and attach the sponsorship brochure",
      urgency: "high",
      meetingRequested: isInterested,
      createdAt: new Date().toISOString(),
    };
  }

  async generateNextAction(company: Company, latestReply?: ReplyAnalysis) {
    if (latestReply?.intent === "Interested" || latestReply?.intent === "Positive") {
      return {
        nextAction: "Schedule Intro Meeting",
        reason: "Sponsor confirmed interest; move quickly to lock in sponsorship tier before budget cycle closes.",
        urgency: "high" as const,
      };
    }
    if (company.stage === "Contacted") {
      return {
        nextAction: "Send Gentle Follow-up (Day 4)",
        reason: "Initial pitch sent 4 days ago with high fit score (90+). Follow-up sequence ready.",
        urgency: "medium" as const,
      };
    }
    return {
      nextAction: "Review Draft & Approve Send",
      reason: "Personalized pitch ready with 94+ quality score.",
      urgency: "medium" as const,
    };
  }

  async generateCampaignInsights(campaign: Campaign, companies: Company[]): Promise<string[]> {
    return [
      "Developer Tools and Cloud companies in your pipeline have an 82% positive reply rate — 2.4x higher than FMCG brands.",
      "Outreach pitches sent between 10:00 AM and 11:30 AM IST showed a 40% faster reply turnaround from DevRel managers.",
      "Postman and Razorpay have active negotiations totaling ₹1.6 Lakhs; closing both achieves 52% of your ₹5,00,000 target.",
    ];
  }
}
