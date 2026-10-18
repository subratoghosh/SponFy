import { Meeting, MeetingMode, MeetingStatus } from "@/types";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

function getInitialDemoMeetings(): Meeting[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0); // 4:00 PM IST/local

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);
  yesterday.setHours(11, 30, 0, 0);

  return [
    {
      id: "meet-demo-1",
      userId: "usr-demo-lead",
      companyId: "comp-postman",
      companyName: "Postman",
      campaignId: "camp-sponfy-2026",
      contactName: "Ali Mustufa",
      contactEmail: "ali.mustufa@postman.com",
      replyMessageId: "msg-postman-in",
      title: "SponFy x Postman sponsorship discussion",
      startsAt: tomorrow.toISOString(),
      durationMins: 30,
      mode: "video",
      location: "https://meet.google.com/qrs-tuvw-xyz",
      notes: "Discuss Gold Tier (₹75k) deliverables and onsite Postman workshop schedule.",
      status: "scheduled",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "meet-demo-2",
      userId: "usr-demo-lead",
      companyId: "comp-razorpay",
      companyName: "Razorpay",
      campaignId: "camp-sponfy-2026",
      contactName: "Vikram Sharma",
      contactEmail: "devrel@razorpay.com",
      replyMessageId: "msg-razorpay-in",
      title: "SponFy x Razorpay Fintech Track Sync",
      startsAt: yesterday.toISOString(),
      durationMins: 45,
      mode: "video",
      location: "https://meet.google.com/abc-defg-hij",
      notes: "Reviewed ₹60,000 counter-offer and agreed on API starter kit inclusion.",
      status: "completed",
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
  ];
}

const meetingsStoreRef = memoryStore<Meeting[]>("meetings", () => process.env.NODE_ENV === "test" ? getInitialDemoMeetings() : []);

function mapPrismaMeeting(m: any): Meeting {
  return {
    id: m.id,
    userId: m.userId,
    companyId: m.companyId,
    companyName: m.companyName,
    campaignId: m.campaignId || undefined,
    contactName: m.contactName || undefined,
    contactEmail: m.contactEmail || undefined,
    replyMessageId: m.replyMessageId || undefined,
    title: m.title,
    startsAt: m.startsAt instanceof Date ? m.startsAt.toISOString() : new Date(m.startsAt).toISOString(),
    durationMins: m.durationMins,
    mode: (m.mode as MeetingMode) || "video",
    location: m.location || "",
    notes: m.notes || undefined,
    status: (m.status as MeetingStatus) || "scheduled",
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString(),
  };
}

export async function getMeetings(userId: string, campaignId?: string): Promise<Meeting[]> {
  if (typeof window !== "undefined") {
    try {
      const url = campaignId
        ? `/api/meetings?campaignId=${encodeURIComponent(campaignId)}`
        : "/api/meetings";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Client fetch /api/meetings failed:", e);
    }
    return [];
  }

  if (isDatabaseConfigured()) {
    try {
      let where: any = {};
      if (campaignId) {
        if (userId) {
          const { getCampaignAccess } = await import("@/lib/security/campaign-access");
          const access = await getCampaignAccess(userId, campaignId);
          if (!access.allowed) {
            return [];
          }
        }
        where.campaignId = campaignId;
      } else if (userId) {
        const userCampaigns = await prisma.campaign.findMany({
          where: {
            OR: [
              { userId },
              {
                members: {
                  some: {
                    userId,
                    status: "ACTIVE",
                  },
                },
              },
            ],
          },
          select: { id: true },
        });
        const accessibleIds = userCampaigns.map((c) => c.id);
        where.OR = [
          { userId },
          { campaignId: { in: accessibleIds } },
        ];
      }
      const records = await (prisma as any).meeting.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { startsAt: "asc" },
      });
      return records.map(mapPrismaMeeting);
    } catch (err) {
      console.warn("Prisma getMeetings failed, falling back to memory store:", err);
    }
  }

  // Memory fallback with user filtering
  return meetingsStoreRef.value
    .filter((m) => {
      const isOwner = m.userId === userId || (m.userId === "usr-demo-lead" && (userId?.includes("demo") || userId === "usr-demo-lead" || process.env.NODE_ENV === "test"));
      if (!isOwner) return false;
      if (campaignId && m.campaignId && m.campaignId !== campaignId) return false;
      return true;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export async function getMeetingById(id: string, userId: string): Promise<Meeting | null> {
  if (isDatabaseConfigured()) {
    try {
      const record = await (prisma as any).meeting.findFirst({
        where: { id },
      });
      if (!record) return null;
      if (record.userId === userId) {
        return mapPrismaMeeting(record);
      }
      if (record.campaignId) {
        const { getCampaignAccess } = await import("@/lib/security/campaign-access");
        const access = await getCampaignAccess(userId, record.campaignId);
        if (access.allowed) {
          return mapPrismaMeeting(record);
        }
      }
      return null;
    } catch (err) {
      console.warn("Prisma getMeetingById failed, falling back to memory store:", err);
    }
  }

  const found = meetingsStoreRef.value.find(
    (m) => m.id === id && (m.userId === userId || (m.userId === "usr-demo-lead" && (userId.includes("demo") || userId === "usr-demo-lead")))
  );
  return found || null;
}

export interface CreateMeetingParams {
  userId: string;
  companyId: string;
  companyName: string;
  campaignId?: string;
  contactName?: string;
  contactEmail?: string;
  replyMessageId?: string;
  title: string;
  startsAt: string;
  durationMins: number;
  mode: MeetingMode;
  location: string;
  notes?: string;
  status?: MeetingStatus;
}

export async function createMeeting(data: CreateMeetingParams): Promise<Meeting> {
  const newMeeting: Meeting = {
    id: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: data.userId,
    companyId: data.companyId,
    companyName: data.companyName,
    campaignId: data.campaignId,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    replyMessageId: data.replyMessageId,
    title: data.title,
    startsAt: new Date(data.startsAt).toISOString(),
    durationMins: data.durationMins,
    mode: data.mode,
    location: data.location,
    notes: data.notes,
    status: data.status || "scheduled",
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured()) {
    try {
      const created = await (prisma as any).meeting.create({
        data: {
          id: newMeeting.id,
          userId: newMeeting.userId,
          companyId: newMeeting.companyId,
          companyName: newMeeting.companyName,
          campaignId: newMeeting.campaignId,
          contactName: newMeeting.contactName,
          contactEmail: newMeeting.contactEmail,
          replyMessageId: newMeeting.replyMessageId,
          title: newMeeting.title,
          startsAt: new Date(newMeeting.startsAt),
          durationMins: newMeeting.durationMins,
          mode: newMeeting.mode,
          location: newMeeting.location,
          notes: newMeeting.notes,
          status: newMeeting.status,
        },
      });
      return mapPrismaMeeting(created);
    } catch (err) {
      console.warn("Prisma createMeeting failed, persisting to memory store:", err);
    }
  }

  meetingsStoreRef.value.push(newMeeting);
  return newMeeting;
}

export async function updateMeeting(
  id: string,
  userId: string,
  patch: Partial<Omit<Meeting, "id" | "userId" | "createdAt">>
): Promise<Meeting | null> {
  if (isDatabaseConfigured()) {
    try {
      const existing = await (prisma as any).meeting.findFirst({
        where: { id },
      });
      if (!existing) return null;

      let allowed = existing.userId === userId;
      if (!allowed && existing.campaignId) {
        const { requireCampaignAccess } = await import("@/lib/security/campaign-access");
        const access = await requireCampaignAccess(userId, existing.campaignId, "ORGANISER");
        allowed = access.allowed;
      }
      if (!allowed) return null;

      const dataToUpdate: any = {};
      if (patch.title !== undefined) dataToUpdate.title = patch.title;
      if (patch.startsAt !== undefined) dataToUpdate.startsAt = new Date(patch.startsAt);
      if (patch.durationMins !== undefined) dataToUpdate.durationMins = patch.durationMins;
      if (patch.mode !== undefined) dataToUpdate.mode = patch.mode;
      if (patch.location !== undefined) dataToUpdate.location = patch.location;
      if (patch.notes !== undefined) dataToUpdate.notes = patch.notes;
      if (patch.status !== undefined) dataToUpdate.status = patch.status;
      if (patch.contactName !== undefined) dataToUpdate.contactName = patch.contactName;
      if (patch.contactEmail !== undefined) dataToUpdate.contactEmail = patch.contactEmail;

      const updated = await (prisma as any).meeting.update({
        where: { id: existing.id },
        data: dataToUpdate,
      });
      return mapPrismaMeeting(updated);
    } catch (err) {
      console.warn("Prisma updateMeeting failed, updating memory store:", err);
    }
  }

  const idx = meetingsStoreRef.value.findIndex(
    (m) => m.id === id && (m.userId === userId || (m.userId === "usr-demo-lead" && (userId.includes("demo") || userId === "usr-demo-lead")))
  );
  if (idx === -1) return null;

  const current = meetingsStoreRef.value[idx];
  const updated: Meeting = {
    ...current,
    ...patch,
    startsAt: patch.startsAt ? new Date(patch.startsAt).toISOString() : current.startsAt,
  };
  meetingsStoreRef.value[idx] = updated;
  return updated;
}

export async function cancelMeeting(id: string, userId: string): Promise<Meeting | null> {
  return updateMeeting(id, userId, { status: "cancelled" });
}
