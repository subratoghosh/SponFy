import { ReplyAnalysis, Message, ReplyIntent } from "@/types";
import { DEMO_REPLY_ANALYSES, DEMO_MESSAGES } from "../seed-data";
import { updateSponsorStage } from "./sponsors";

let replyAnalysesStore: ReplyAnalysis[] = [...DEMO_REPLY_ANALYSES];

export async function getReplyAnalyses(): Promise<ReplyAnalysis[]> {
  return [...replyAnalysesStore];
}

export async function getReplyAnalysisByMessageId(messageId: string): Promise<ReplyAnalysis | null> {
  const found = replyAnalysesStore.find((r) => r.messageId === messageId);
  return found || null;
}

export async function getInboundThreads(): Promise<
  Array<{
    message: Message;
    analysis?: ReplyAnalysis;
  }>
> {
  const inbounds = DEMO_MESSAGES.filter((m) => m.direction === "inbound");
  return inbounds.map((msg) => {
    const analysis = replyAnalysesStore.find((r) => r.messageId === msg.id || r.companyId === msg.companyId);
    return {
      message: msg,
      analysis,
    };
  });
}

export async function recordInboundReply(
  companyId: string,
  message: Omit<Message, "id" | "direction" | "sentAt">,
  analysis: Omit<ReplyAnalysis, "id" | "messageId" | "createdAt">
): Promise<{ message: Message; analysis: ReplyAnalysis }> {
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
    createdAt: new Date().toISOString(),
  };

  replyAnalysesStore.unshift(newAnalysis);

  // Auto-advance company stage based on intent
  if (analysis.intent === "Interested" || analysis.intent === "Positive") {
    await updateSponsorStage(companyId, "Interested");
  } else if (analysis.intent === "Negotiating") {
    await updateSponsorStage(companyId, "Negotiation");
  } else if (analysis.intent === "Not Interested") {
    await updateSponsorStage(companyId, "Lost");
  } else {
    await updateSponsorStage(companyId, "Replied");
  }

  return { message: newMsg, analysis: newAnalysis };
}
