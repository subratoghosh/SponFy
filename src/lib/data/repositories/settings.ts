import { UserProfile, SuppressionEntry, GmailConnectionStatus } from "@/types";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";

const profileStoreRef = memoryStore<UserProfile>("profile", () => ({
  fullName: "SponFy Fest Lead",
  organization: "SponFy Hackathon 2026",
  email: "lead@sponfy.dev",
  avatarUrl: "",
  title: "Head of Corporate Relations",
  signature: "Best regards,\nOrganizing Team, SponFy Hackathon 2026",
  dailySendLimit: 30,
}));

const gmailStatusStoreRef = memoryStore<GmailConnectionStatus>("gmailStatus", () => ({
  connected: false,
  isMock: true,
}));

const suppressionsStoreRef = memoryStore<SuppressionEntry[]>("suppressions", () => [
  {
    id: "sup-1",
    email: "declined@algorand.foundation",
    domain: "algorand.foundation",
    reason: "not_interested",
    createdAt: "2026-08-25T16:00:00Z",
  },
]);

export async function getUserProfile(): Promise<UserProfile> {
  if (isDatabaseConfigured()) {
    try {
      const u = await prisma.user.findFirst();
      if (u) {
        return {
          fullName: u.name || "",
          organization: u.orgName || "",
          email: u.email || "",
          avatarUrl: u.image || "",
          title: "Sponsorship Lead",
          signature: u.name ? `Best regards,\n${u.name}` : "Best regards,\nSponsorship Lead",
          dailySendLimit: u.dailySendCap || 30,
        };
      }
    } catch (err) {
      console.warn("Prisma getUserProfile failed, falling back to memory store:", err);
    }
  }

  return { ...profileStoreRef.value };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  if (isDatabaseConfigured()) {
    try {
      const u = await prisma.user.findFirst();
      if (u) {
        await prisma.user.update({
          where: { id: u.id },
          data: {
            name: updates.fullName,
            orgName: updates.organization,
            image: updates.avatarUrl,
            dailySendCap: updates.dailySendLimit,
          },
        });
      }
    } catch (err) {
      console.warn("Prisma updateUserProfile failed, falling back to memory store:", err);
    }
  }

  profileStoreRef.value = { ...profileStoreRef.value, ...updates };
  return { ...profileStoreRef.value };
}

export async function getSuppressions(): Promise<SuppressionEntry[]> {
  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.suppression.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (records.length > 0) {
        return records.map((s) => ({
          id: s.id,
          email: s.email,
          domain: s.email.includes("@") ? s.email.split("@")[1] : undefined,
          reason: s.reason,
          createdAt: s.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Prisma getSuppressions failed, falling back to memory store:", err);
    }
  }

  return [...suppressionsStoreRef.value];
}

export async function addSuppression(email: string, reason: string = "manual"): Promise<SuppressionEntry> {
  const domain = email.includes("@") ? email.split("@")[1] : undefined;

  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";

      const created = await prisma.suppression.create({
        data: {
          userId,
          email,
          reason,
        },
      });
      return {
        id: created.id,
        email: created.email,
        domain,
        reason: created.reason,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma addSuppression failed, falling back to memory store:", err);
    }
  }

  const entry: SuppressionEntry = {
    id: `sup-${Date.now()}`,
    email,
    domain,
    reason,
    createdAt: new Date().toISOString(),
  };
  suppressionsStoreRef.value.unshift(entry);
  return entry;
}

export async function removeSuppression(id: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.suppression.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn("Prisma removeSuppression failed, falling back to memory store:", err);
    }
  }

  suppressionsStoreRef.value = suppressionsStoreRef.value.filter((s) => s.id !== id);
  return true;
}

export async function getGmailStatus(userId?: string): Promise<GmailConnectionStatus> {
  if (isDatabaseConfigured()) {
    try {
      const acc = await prisma.gmailAccount.findFirst({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: "desc" },
      });
      if (acc) {
        return {
          connected: acc.status === "ACTIVE",
          email: acc.email,
          lastSyncAt: acc.lastSyncAt ? acc.lastSyncAt.toISOString() : undefined,
          isMock: false,
        };
      }
    } catch (err) {
      console.warn("Prisma getGmailStatus failed, falling back to memory store:", err);
    }
  }

  return { ...gmailStatusStoreRef.value };
}

export async function disconnectGmailAccount(userId?: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      if (userId) {
        await prisma.gmailAccount.deleteMany({
          where: { userId },
        });
      } else {
        await prisma.gmailAccount.deleteMany({});
      }
    } catch (err) {
      console.warn("Prisma disconnectGmailAccount failed:", err);
    }
  }
  gmailStatusStoreRef.value = {
    connected: false,
    email: undefined,
    lastSyncAt: undefined,
    isMock: false,
  };
  return true;
}

export async function updateGmailStatus(status: Partial<GmailConnectionStatus>): Promise<GmailConnectionStatus> {
  gmailStatusStoreRef.value = { ...gmailStatusStoreRef.value, ...status };
  return { ...gmailStatusStoreRef.value };
}

export async function isSuppressed(email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  const domain = normEmail.includes("@") ? normEmail.split("@")[1] : "";

  if (isDatabaseConfigured()) {
    try {
      const found = await prisma.suppression.findFirst({
        where: {
          email: normEmail,
        },
      });
      if (found) return true;
    } catch (err) {
      console.warn("Prisma isSuppressed check failed:", err);
    }
  }

  return suppressionsStoreRef.value.some(
    (s) => s.email.toLowerCase() === normEmail || (s.domain && s.domain.toLowerCase() === domain)
  );
}

export const settingsRepository = {
  getProfile: getUserProfile,
  updateProfile: updateUserProfile,
  getSuppressionList: getSuppressions,
  getUserProfile,
  updateUserProfile,
  getSuppressions,
  addSuppression,
  removeSuppression,
  getGmailStatus,
  updateGmailStatus,
  disconnectGmail: disconnectGmailAccount,
  isSuppressed,
};
