import { EmailDraft, Message, DraftStatus } from "@/types";
import { DEMO_DRAFTS, DEMO_MESSAGES } from "../seed-data";
import { memoryStore } from "@/lib/data/memory-store";
import { updateSponsorStage } from "./sponsors";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DraftStatus as DbDraftStatus, Direction } from "@prisma/client";

const draftsStoreRef = memoryStore<EmailDraft[]>("drafts", () => [...DEMO_DRAFTS]);
const messagesStoreRef = memoryStore<Message[]>("messages", () => [...DEMO_MESSAGES]);

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
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
};

export async function getDrafts(status?: DraftStatus, userId?: string): Promise<EmailDraft[]> {
  if (isDatabaseConfigured()) {
    try {
      const dbStatus = status ? DRAFT_STATUS_TO_DB[status] : undefined;
      const where: any = {};
      if (dbStatus) where.status = dbStatus;
      if (userId) where.userId = userId;
      const records = await prisma.emailDraft.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: "desc" },
      });
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
    } catch (err) {
      console.warn("Prisma getDrafts failed:", err);
      return [];
    }
  }

  if (process.env.NODE_ENV === "test") {
    let list = draftsStoreRef.value;
    if (status) {
      list = list.filter((d) => d.status === status);
    }
    return [...list];
  }

  return [];
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

  const found = draftsStoreRef.value.find((d) => d.id === id);
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

  return draftsStoreRef.value.filter((d) => d.companyId === companyId);
}

export async function getDraftByCompanyId(companyId: string): Promise<EmailDraft | null> {
  const drafts = await getDraftsByCompanyId(companyId);
  return drafts[0] || null;
}

export async function saveDraft(
  draft: Partial<EmailDraft> & { companyId: string; subject: string; body: string; userId?: string }
): Promise<EmailDraft> {
  if (draft.id) {
    const existing = await getDraftById(draft.id);
    if (existing) {
      const updated = await updateDraft(draft.id, draft);
      return updated || (draft as EmailDraft);
    }
  }
  return createDraft({
    userId: draft.userId,
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
    // New drafts always start unapproved; approval only happens via approveDraft.
    status: "draft",
  });
}

export async function createDraft(
  draft: Omit<EmailDraft, "id" | "createdAt" | "approvedAt"> & { userId?: string }
): Promise<EmailDraft> {
  if (isDatabaseConfigured()) {
    try {
      let resolvedUserId = draft.userId;
      if (!resolvedUserId) {
        const comp = await prisma.company.findUnique({ where: { id: draft.companyId }, select: { userId: true } });
        resolvedUserId = comp?.userId;
      }
      const finalUserId = resolvedUserId || "usr-demo-lead";

      const created = await prisma.emailDraft.create({
        data: {
          userId: finalUserId,
          companyId: draft.companyId,
          contactId: draft.contactId,
          subject: draft.subject,
          body: draft.body,
          quality: draft.quality as any,
          status: "DRAFT", // new drafts are never pre-approved
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
    status: "draft", // new drafts are never pre-approved
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  draftsStoreRef.value.unshift(newDraft);
  return newDraft;
}

export async function updateDraft(
  id: string,
  updates: Partial<EmailDraft>
): Promise<EmailDraft | null> {
  // Human-in-the-loop rule: what gets sent must be exactly what was approved.
  // Editing the subject/body of an approved draft sends it back for re-approval,
  // and drafts that are sending/sent can no longer be edited at all.
  const current = await getDraftById(id);
  if (current) {
    const contentChanged =
      (updates.subject !== undefined && updates.subject !== current.subject) ||
      (updates.body !== undefined && updates.body !== current.body);
    if (contentChanged && (current.status === "sending" || current.status === "sent")) {
      throw new Error("This email has already been sent and can no longer be edited.");
    }
    if (current.status === "sending" || current.status === "sent") {
      // Never let a client move a sent draft back to draft/approved.
      updates = { ...updates, status: current.status };
    } else if (contentChanged && current.status === "approved") {
      updates = { ...updates, status: "draft", approvedAt: undefined };
    } else if (updates.status === "approved" && current.status !== "approved") {
      // Approval only happens through approveDraft (the /api/outreach/approve route).
      updates = { ...updates, status: current.status };
    }
  }
  const clearApproval = !!current && current.status === "approved" && updates.status === "draft";

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
          approvedAt: clearApproval
            ? null
            : updates.approvedAt
            ? new Date(updates.approvedAt)
            : undefined,
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

  const idx = draftsStoreRef.value.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  draftsStoreRef.value[idx] = {
    ...draftsStoreRef.value[idx],
    ...updates,
    ...(clearApproval ? { approvedAt: undefined } : {}),
  };
  return draftsStoreRef.value[idx];
}

export async function deleteDraft(id: string, userId?: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.emailDraft.deleteMany({
        where: {
          id,
          ...(userId ? { userId } : {}),
        },
      });
      return true;
    } catch (err) {
      console.warn("Prisma deleteDraft failed, falling back to memory store:", err);
    }
  }

  const idx = draftsStoreRef.value.findIndex((d) => d.id === id);
  if (idx !== -1) {
    draftsStoreRef.value.splice(idx, 1);
    return true;
  }
  return false;
}

export async function approveDraft(id: string): Promise<EmailDraft | null> {
  const current = await getDraftById(id);
  if (!current) return null;
  if (current.status === "approved") return current; // idempotent (double click)
  if (current.status === "sending" || current.status === "sent") {
    throw new Error("This email has already been sent; it cannot be approved again.");
  }

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

  const idx = draftsStoreRef.value.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  draftsStoreRef.value[idx] = {
    ...draftsStoreRef.value[idx],
    status: "approved",
    approvedAt: new Date().toISOString(),
  };

  // Move company to Approved stage
  await updateSponsorStage(draftsStoreRef.value[idx].companyId, "Approved");
  return draftsStoreRef.value[idx];
}

/**
 * Atomically moves an APPROVED draft to SENDING. Returns false if someone else
 * already claimed it (double click, two teammates) or it is not approved.
 * Database errors are thrown, never silently replaced by the memory store,
 * so a broken DB can never turn into an unguarded send.
 */
export async function claimDraftForSending(id: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    const res = await prisma.emailDraft.updateMany({
      where: { id, status: "APPROVED" },
      data: { status: "SENDING" },
    });
    return res.count === 1;
  }

  // Memory store: check-and-set with no await in between, so it is atomic in JS.
  const idx = draftsStoreRef.value.findIndex((d) => d.id === id);
  if (idx === -1 || draftsStoreRef.value[idx].status !== "approved") return false;
  draftsStoreRef.value[idx] = { ...draftsStoreRef.value[idx], status: "sending" };
  return true;
}

/** Puts a claimed draft back to APPROVED after a failed send so the organizer can retry. */
export async function releaseDraftClaim(id: string): Promise<void> {
  if (isDatabaseConfigured()) {
    await prisma.emailDraft.updateMany({
      where: { id, status: "SENDING" },
      data: { status: "APPROVED" },
    });
    return;
  }
  const idx = draftsStoreRef.value.findIndex((d) => d.id === id);
  if (idx !== -1 && draftsStoreRef.value[idx].status === "sending") {
    draftsStoreRef.value[idx] = { ...draftsStoreRef.value[idx], status: "approved" };
  }
}

export async function deleteDraftsByCompanyId(companyId: string): Promise<number> {
  if (isDatabaseConfigured()) {
    try {
      const res = await prisma.emailDraft.deleteMany({
        where: {
          companyId,
          status: { in: ["DRAFT", "APPROVED"] },
        },
      });
      return res.count;
    } catch (err) {
      console.warn("Prisma deleteDraftsByCompanyId failed:", err);
    }
  }

  const initialLen = draftsStoreRef.value.length;
  draftsStoreRef.value = draftsStoreRef.value.filter(
    (d) => !(d.companyId === companyId && (d.status === "draft" || d.status === "approved"))
  );
  return initialLen - draftsStoreRef.value.length;
}

/**
 * Returns today's 12:00:00 AM (Midnight) Date object for daily quota resets
 */
export function getTodayMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/** Number of outbound emails sent since `since` (defaults to today's 12:00 AM reset). */
export async function countOutboundSince(since?: Date, userId?: string): Promise<number> {
  const windowStart = since || getTodayMidnight();

  if (isDatabaseConfigured()) {
    try {
      const where: any = {
        direction: "OUTBOUND",
        sentAt: { gte: windowStart },
      };
      if (userId) {
        where.userId = userId;
      }
      return await prisma.message.count({ where });
    } catch (err) {
      console.warn("Prisma countOutboundSince failed, fallback to filter:", err);
    }
  }

  const all = await getMessages(undefined, userId);
  return all.filter((m) => m.direction === "outbound" && new Date(m.sentAt).getTime() >= windowStart.getTime()).length;
}

export async function recordSentMessage(
  draftId: string,
  toEmail: string,
  gmailMessageId?: string,
  threadId?: string,
  userId?: string
): Promise<Message | null> {
  const draft = await getDraftById(draftId);
  if (!draft) return null;

  if (isDatabaseConfigured()) {
    try {
      let resolvedUserId = userId || (draft as any).userId;
      if (!resolvedUserId) {
        const d = await prisma.emailDraft.findUnique({ where: { id: draftId }, select: { userId: true } });
        resolvedUserId = d?.userId;
      }
      const finalUserId = resolvedUserId || "usr-demo-lead";

      await prisma.emailDraft.update({
        where: { id: draftId },
        data: { status: "SENT" },
      });

      const msg = await prisma.message.create({
        data: {
          userId: finalUserId,
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

  const sentIdx = draftsStoreRef.value.findIndex((d) => d.id === draftId);
  if (sentIdx !== -1) draftsStoreRef.value[sentIdx] = { ...draftsStoreRef.value[sentIdx], status: "sent" };

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

  messagesStoreRef.value.unshift(message);
  await updateSponsorStage(draft.companyId, "Contacted");
  return message;
}

export async function getMessages(companyId?: string, userId?: string): Promise<Message[]> {
  if (isDatabaseConfigured()) {
    try {
      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (userId) where.userId = userId;

      const records = await prisma.message.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { sentAt: "desc" },
      });
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
    } catch (err) {
      console.warn("Prisma getMessages failed, falling back to memory store:", err);
    }
  }

  if (process.env.NODE_ENV === "test") {
    if (companyId) {
      return messagesStoreRef.value.filter((m) => m.companyId === companyId);
    }
    return [...messagesStoreRef.value];
  }

  return [];
}
