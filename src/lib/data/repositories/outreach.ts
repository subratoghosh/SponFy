import { EmailDraft, Message, DraftStatus } from "@/types";
import { DEMO_DRAFTS, DEMO_MESSAGES } from "../seed-data";
import { getSponsors, updateSponsorStage } from "./sponsors";

let draftsStore: EmailDraft[] = [...DEMO_DRAFTS];
let messagesStore: Message[] = [...DEMO_MESSAGES];

export async function getDrafts(status?: DraftStatus): Promise<EmailDraft[]> {
  if (status) {
    return draftsStore.filter((d) => d.status === status);
  }
  return [...draftsStore];
}

export async function getDraftById(id: string): Promise<EmailDraft | null> {
  const found = draftsStore.find((d) => d.id === id);
  return found || null;
}

export async function getDraftByCompanyId(companyId: string): Promise<EmailDraft | null> {
  const found = draftsStore.find((d) => d.companyId === companyId);
  return found || null;
}

export async function saveDraft(draft: Omit<EmailDraft, "id" | "createdAt">): Promise<EmailDraft> {
  const existingIdx = draftsStore.findIndex((d) => d.companyId === draft.companyId);
  if (existingIdx !== -1) {
    draftsStore[existingIdx] = {
      ...draftsStore[existingIdx],
      ...draft,
    };
    return draftsStore[existingIdx];
  }

  const newDraft: EmailDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  draftsStore.unshift(newDraft);
  return newDraft;
}

export async function approveDraft(id: string): Promise<EmailDraft | null> {
  const idx = draftsStore.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  draftsStore[idx] = {
    ...draftsStore[idx],
    status: "approved",
    approvedAt: new Date().toISOString(),
  };

  // Move company to Approved stage
  await updateSponsorStage(draftsStore[idx].companyId, "Approved");
  return draftsStore[idx];
}

export async function recordSentMessage(draftId: string, toEmail: string, gmailMessageId?: string, threadId?: string): Promise<Message | null> {
  const draft = draftsStore.find((d) => d.id === draftId);
  if (!draft) return null;

  draft.status = "sent";

  const message: Message = {
    id: `msg-${Date.now()}`,
    draftId,
    companyId: draft.companyId,
    gmailMessageId: gmailMessageId || `gmail-${Date.now()}`,
    gmailThreadId: threadId || `thread-${Date.now()}`,
    direction: "outbound",
    fromEmail: "organizer@sponfy.dev",
    toEmail,
    subject: draft.subject,
    body: draft.body,
    sentAt: new Date().toISOString(),
  };

  messagesStore.unshift(message);
  await updateSponsorStage(draft.companyId, "Contacted");
  return message;
}

export async function getMessages(companyId?: string): Promise<Message[]> {
  if (companyId) {
    return messagesStore.filter((m) => m.companyId === companyId);
  }
  return [...messagesStore];
}
