import { Message, ReplyAnalysis, ReplyIntent } from "@/types";
import { DEMO_MESSAGES, DEMO_REPLIES } from "../seed-data";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { Direction, Intent } from "@prisma/client";
import { memoryStore } from "@/lib/data/memory-store";

const replyAnalysesStoreRef = memoryStore<ReplyAnalysis[]>("replyAnalyses", () => [...DEMO_REPLIES]);

const INTENT_TO_DB: Record<string, Intent> = {
  Interested: "INTERESTED",
  Positive: "POSITIVE",
  "Needs Info": "NEEDS_INFO",
  Negotiating: "NEGOTIATING",
  "Not Interested": "NOT_INTERESTED",
  "Maybe Later": "MAYBE_LATER",
  "Out of Office": "OUT_OF_OFFICE",
  Unclear: "UNCLEAR",
  INTERESTED: "INTERESTED",
  POSITIVE: "POSITIVE",
  NEEDS_INFO: "NEEDS_INFO",
  NEGOTIATING: "NEGOTIATING",
  NOT_INTERESTED: "NOT_INTERESTED",
  MAYBE_LATER: "MAYBE_LATER",
  OUT_OF_OFFICE: "OUT_OF_OFFICE",
  UNCLEAR: "UNCLEAR",
};

const DB_TO_INTENT: Record<string, ReplyIntent> = {
  INTERESTED: "Interested",
  POSITIVE: "Positive",
  NEEDS_INFO: "Needs Info",
  NEGOTIATING: "Negotiating",
  NOT_INTERESTED: "Not Interested",
  MAYBE_LATER: "Maybe Later",
  OUT_OF_OFFICE: "Out of Office",
  UNCLEAR: "Unclear",
};

export async function getReplyAnalyses(companyId?: string): Promise<ReplyAnalysis[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.replyAnalysis.findMany({
        where: companyId
          ? {
              message: { companyId },
            }
          : undefined,
        include: {
          message: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return records.map((r) => ({
        id: r.id,
        messageId: r.messageId,
        companyId: r.message.companyId || "",
        intent: DB_TO_INTENT[r.intent] || "Interested",
        sentiment: r.sentiment as any,
        confidence: r.confidence,
        summary: r.summary,
        questions: (r.questions as any) || [],
        requestedInfo: r.requestedInfo ? [r.requestedInfo] : [],
        nextAction: r.nextAction,
        urgency: r.urgency as any,
        meetingRequested: r.meetingRequested,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Prisma getReplyAnalyses failed:", err);
      return [];
    }
  }

  if (companyId) {
    return replyAnalysesStoreRef.value.filter((r) => r.companyId === companyId);
  }
  return [...replyAnalysesStoreRef.value];
}

export async function getInboundThreads(): Promise<{ message: Message; analysis?: ReplyAnalysis }[]> {
  if (isDatabaseConfigured()) {
    try {
      const messages = await prisma.message.findMany({
        where: { direction: "INBOUND" },
        include: {
          analysis: true,
        },
        orderBy: { sentAt: "desc" },
      });

      return messages.map((msg) => ({
        message: {
          id: msg.id,
          draftId: msg.draftId || undefined,
          companyId: msg.companyId || "",
          gmailMessageId: msg.gmailMessageId || undefined,
          gmailThreadId: msg.gmailThreadId || undefined,
          direction: "inbound",
          fromEmail: msg.fromEmail || "",
          toEmail: msg.toEmail || "",
          subject: msg.subject || "",
          body: msg.body,
          sentAt: msg.sentAt.toISOString(),
        },
        analysis: msg.analysis
          ? {
              id: msg.analysis.id,
              messageId: msg.analysis.messageId,
              companyId: msg.companyId || "",
              intent: DB_TO_INTENT[msg.analysis.intent] || "Interested",
              sentiment: msg.analysis.sentiment as any,
              confidence: msg.analysis.confidence,
              summary: msg.analysis.summary,
              questions: (msg.analysis.questions as any) || [],
              requestedInfo: msg.analysis.requestedInfo ? [msg.analysis.requestedInfo] : [],
              nextAction: msg.analysis.nextAction,
              urgency: msg.analysis.urgency as any,
              meetingRequested: msg.analysis.meetingRequested,
              createdAt: msg.analysis.createdAt.toISOString(),
            }
          : undefined,
      }));
    } catch (err) {
      console.warn("Prisma getInboundThreads failed:", err);
      return [];
    }
  }

  const inbounds = DEMO_MESSAGES.filter((m) => m.direction === "inbound");
  return inbounds.map((msg) => {
    const analysis = replyAnalysesStoreRef.value.find((r) => r.messageId === msg.id || r.companyId === msg.companyId);
    return {
      message: msg,
      analysis,
    };
  });
}

export async function recordInboundReply(
  companyId: string,
  message: Omit<Message, "id" | "direction" | "sentAt">,
  analysis: Omit<ReplyAnalysis, "id" | "messageId" | "createdAt"> | (Omit<ReplyAnalysis, "id" | "messageId" | "createdAt" | "companyId"> & { companyId?: string })
): Promise<{ message: Message; analysis: ReplyAnalysis }> {
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";

      const newMsg = await prisma.message.create({
        data: {
          userId,
          companyId,
          gmailMessageId: message.gmailMessageId,
          gmailThreadId: message.gmailThreadId,
          direction: "INBOUND",
          fromEmail: message.fromEmail,
          toEmail: message.toEmail,
          subject: message.subject,
          body: message.body,
          sentAt: new Date(),
        },
      });

      const dbIntent: Intent = INTENT_TO_DB[analysis.intent] || "INTERESTED";
      const newAnalysis = await prisma.replyAnalysis.create({
        data: {
          userId,
          messageId: newMsg.id,
          intent: dbIntent,
          sentiment: String(analysis.sentiment || "positive"),
          confidence: Math.round(Number(analysis.confidence || 90)),
          summary: analysis.summary || "",
          questions: (analysis.questions as any) || [],
          requestedInfo: Array.isArray(analysis.requestedInfo) ? analysis.requestedInfo.join(", ") : String(analysis.requestedInfo || ""),
          nextAction: analysis.nextAction || "",
          urgency: String(analysis.urgency || "MEDIUM"),
          meetingRequested: analysis.meetingRequested || false,
        },
      });

      return {
        message: {
          id: newMsg.id,
          companyId,
          direction: "inbound",
          fromEmail: newMsg.fromEmail || "",
          toEmail: newMsg.toEmail || "",
          subject: newMsg.subject || "",
          body: newMsg.body,
          sentAt: newMsg.sentAt.toISOString(),
        },
        analysis: {
          id: newAnalysis.id,
          messageId: newAnalysis.messageId,
          companyId,
          intent: DB_TO_INTENT[newAnalysis.intent] || "Interested",
          sentiment: newAnalysis.sentiment as any,
          confidence: newAnalysis.confidence,
          summary: newAnalysis.summary,
          questions: (newAnalysis.questions as any) || [],
          requestedInfo: newAnalysis.requestedInfo ? [newAnalysis.requestedInfo] : [],
          nextAction: newAnalysis.nextAction,
          urgency: newAnalysis.urgency as any,
          meetingRequested: newAnalysis.meetingRequested,
          createdAt: newAnalysis.createdAt.toISOString(),
        },
      };
    } catch (err) {
      console.warn("Prisma recordInboundReply failed, falling back to memory store:", err);
    }
  }

  const newMsg: Message = {
    ...message,
    id: `msg-${Date.now()}`,
    direction: "inbound",
    sentAt: new Date().toISOString(),
  };

  const newAnalysis: ReplyAnalysis = {
    ...analysis,
    id: `rep-${Date.now()}`,
    messageId: newMsg.id,
    companyId,
    createdAt: new Date().toISOString(),
  };

  replyAnalysesStoreRef.value.unshift(newAnalysis);

  return {
    message: newMsg,
    analysis: newAnalysis,
  };
}
