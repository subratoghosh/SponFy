import { EmailDraft, Message, DraftStatus } from "@/types";
import { DEMO_DRAFTS, DEMO_MESSAGES } from "../seed-data";
import { updateSponsorStage } from "./sponsors";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DraftStatus as DbDraftStatus, Direction } from "@prisma/client";

let draftsStore: EmailDraft[] = [...DEMO_DRAFTS];
let messagesStore: Message[] = [...DEMO_MESSAGES];

const DRAFT_STATUS_TO_DB: Record<string, DbDraftStatus> = {
  draft: "DRAFT",
  approved: "APPROVED",
  sending: "SENDING",
  sent: "SENT",
  failed: "FAILED",
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  SENDING: "SENDING",
  SENT: "SENT",
  FAILED: "FAILED",
};

const DB_TO_DRAFT_STATUS: Record<string, DraftStatus> = {
  DRAFT: "draft",
  APPROVED: "approved",
  SENDING: "draft",
  SENT: "sent",
  FAILED: "failed",
};

export async function getDrafts(status?: DraftStatus): Promise<EmailDraft[]> {
  if (isDatabaseConfigured()) {
    try {
      const dbStatus = status ? DRAFT_STATUS_TO_DB[status] : undefined;
      const records = await prisma.emailDraft.findMany({
        where: dbStatus ? { status: dbStatus } : undefined,
        orderBy: { createdAt: "desc" },
      });
      if (records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          companyId: r.companyId,
          contactId: r.contactId || undefined,
          subject: r.subject,
          body: r.body,
          quality: (r.quality as any) || {},
          status: DB_TO_DRAFT_STATUS[r.status] || "draft",
          approvedAt: r.approvedAt ? r.approvedAt.toISOString() : undefined,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Prisma getDrafts failed, falling back to memory store:", err);
    }
  }

  if (status) {
    return draftsStore.filter((d) => d.status === status);
  }
  return [...draftsStore];
}

export async function getDraftById(id: string): Promise<EmailDraft | null> {
  if (isDatabaseConfigured()) {
    try {
      const r = await prisma.emailDraft.findUnique({
        where: { id },
      });
      if (r) {
        return {
          id: r.id,
          companyId: r.companyId,
          contactId: r.contactId || undefined,
          subject: r.subject,
          body: r.body,
          quality: (r.quality as any) || {},
          status: DB_TO_DRAFT_STATUS[r.status] || "draft",
          approvedAt: r.approvedAt ? r.approvedAt.toISOString() : undefined,
          createdAt: r.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Prisma getDraftById failed, falling back to memory store:", err);
    }
  }

  const found = draftsStore.find((d) => d.id === id);
  return found || null;
}

export async function getDraftsByCompanyId(companyId: string): Promise<EmailDraft[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.emailDraft.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
      });
      if (records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          companyId: r.companyId,
          contactId: r.contactId || undefined,
          subject: r.subject,
          body: r.body,
          quality: (r.quality as any) || {},
          status: DB_TO_DRAFT_STATUS[r.status] || "draft",
          approvedAt: r.approvedAt ? r.approvedAt.toISOString() : undefined,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Prisma getDraftsByCompanyId failed, falling back to memory store:", err);
    }
  }

  return draftsStore.filter((d) => d.companyId === companyId);
}

export async function getDraftByCompanyId(companyId: string): Promise<EmailDraft | null> {
  const drafts = await getDraftsByCompanyId(companyId);
  return drafts[0] || null;
}

export async function saveDraft(
  draft: Partial<EmailDraft> & { companyId: string; subject: string; body: string }
): Promise<EmailDraft> {
  if (draft.id) {
    const existing = await getDraftById(draft.id);
    if (existing) {
      const updated = await updateDraft(draft.id, draft);
      return updated || (draft as EmailDraft);
    }
  }
  return createDraft({
    companyId: draft.companyId,
    contactId: draft.contactId,
    subject: draft.subject,
    body: draft.body,
    quality: draft.quality || {
      personalization: 85,
      relevance: 85,
      clarity: 90,
      cta: 85,
      professionalism: 90,
      overall: 87,
      suggestions: [],
    },
    status: draft.status || "draft",
  });
}

export async function createDraft(
  draft: Omit<EmailDraft, "id" | "createdAt" | "approvedAt">
): Promise<EmailDraft> {
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";

      const created = await prisma.emailDraft.create({
        data: {
          userId,
          companyId: draft.companyId,
          contactId: draft.contactId,
          subject: draft.subject,
          body: draft.body,
          quality: draft.quality as any,
          status: DRAFT_STATUS_TO_DB[draft.status] || "DRAFT",
        },
      });
      return {
        id: created.id,
        companyId: created.companyId,
        contactId: created.contactId || undefined,
        subject: created.subject,
        body: created.body,
        quality: (created.quality as any) || {},
        status: DB_TO_DRAFT_STATUS[created.status] || "draft",
        approvedAt: created.approvedAt ? created.approvedAt.toISOString() : undefined,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma createDraft failed, falling back to memory store:", err);
    }
  }

  const newDraft: EmailDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  draftsStore.unshift(newDraft);
  return newDraft;
}

export async function updateDraft(
  id: string,
  updates: Partial<EmailDraft>
): Promise<EmailDraft | null> {
  if (isDatabaseConfigured()) {
    try {
      const dbStatus = updates.status ? DRAFT_STATUS_TO_DB[updates.status] : undefined;
      const updated = await prisma.emailDraft.update({
        where: { id },
        data: {
          subject: updates.subject,
          body: updates.body,
          quality: updates.quality ? (updates.quality as any) : undefined,
          status: dbStatus,
          approvedAt: updates.approvedAt ? new Date(updates.approvedAt) : undefined,
        },
      });
      return {
        id: updated.id,
        companyId: updated.companyId,
        contactId: updated.contactId || undefined,
        subject: updated.subject,
        body: updated.body,
        quality: (updated.quality as any) || {},
        status: DB_TO_DRAFT_STATUS[updated.status] || "draft",
        approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : undefined,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma updateDraft failed, falling back to memory store:", err);
    }
  }

  const idx = draftsStore.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  draftsStore[idx] = {
    ...draftsStore[idx],
    ...updates,
  };
  return draftsStore[idx];
}

export async function approveDraft(id: string): Promise<EmailDraft | null> {
  if (isDatabaseConfigured()) {
    try {
      const updated = await prisma.emailDraft.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });
      await updateSponsorStage(updated.companyId, "Approved");
      return {
        id: updated.id,
        companyId: updated.companyId,
        contactId: updated.contactId || undefined,
        subject: updated.subject,
        body: updated.body,
        quality: (updated.quality as any) || {},
        status: "approved",
        approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : undefined,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma approveDraft failed, falling back to memory store:", err);
    }
  }

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

export async function recordSentMessage(
  draftId: string,
  toEmail: string,
  gmailMessageId?: string,
  threadId?: string
): Promise<Message | null> {
  const draft = await getDraftById(draftId);
  if (!draft) return null;

  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";

      await prisma.emailDraft.update({
        where: { id: draftId },
        data: { status: "SENT" },
      });

      const msg = await prisma.message.create({
        data: {
          userId,
          draftId,
          companyId: draft.companyId,
          gmailMessageId: gmailMessageId || `gmail-${Date.now()}`,
          gmailThreadId: threadId || `thread-${Date.now()}`,
          direction: "OUTBOUND",
          fromEmail: "organizer@sponfy.dev",
          toEmail,
          subject: draft.subject,
          body: draft.body,
          sentAt: new Date(),
        },
      });

      await updateSponsorStage(draft.companyId, "Contacted");

      return {
        id: msg.id,
        draftId: msg.draftId || undefined,
        companyId: msg.companyId || draft.companyId,
        gmailMessageId: msg.gmailMessageId || undefined,
        gmailThreadId: msg.gmailThreadId || undefined,
        direction: "outbound",
        fromEmail: msg.fromEmail || "",
        toEmail: msg.toEmail || "",
        subject: msg.subject || "",
        body: msg.body,
        sentAt: msg.sentAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma recordSentMessage failed, falling back to memory store:", err);
    }
  }

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
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.message.findMany({
        where: companyId ? { companyId } : undefined,
        orderBy: { sentAt: "desc" },
      });
      if (records.length > 0) {
        return records.map((m) => ({
          id: m.id,
          draftId: m.draftId || undefined,
          companyId: m.companyId || "",
          gmailMessageId: m.gmailMessageId || undefined,
          gmailThreadId: m.gmailThreadId || undefined,
          direction: m.direction === "INBOUND" ? "inbound" : "outbound",
          fromEmail: m.fromEmail || "",
          toEmail: m.toEmail || "",
          subject: m.subject || "",
          body: m.body,
          sentAt: m.sentAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Prisma getMessages failed, falling back to memory store:", err);
    }
  }

  if (companyId) {
    return messagesStore.filter((m) => m.companyId === companyId);
  }
  return [...messagesStore];
}
