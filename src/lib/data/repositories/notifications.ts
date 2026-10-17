import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";
import { NotificationItem } from "@/types";

export const demoNotificationsRef = memoryStore<NotificationItem[]>(
  "notifications",
  () => [
    {
      id: "notif-demo-1",
      userId: "usr-demo-organiser",
      type: "access_request",
      title: "New Team Access Request",
      body: "Sneha Roy requested to join InnovateX 2026 as Organiser.",
      href: "/app/team",
      readAt: null,
      createdAt: new Date().toISOString(),
    },
  ]
);

/**
 * Retrieves the latest notifications for a specific user, ordered newest first.
 */
export async function getNotificationsForUser(
  userId: string,
  limit = 20
): Promise<NotificationItem[]> {
  if (!userId) return [];

  if (isDatabaseConfigured()) {
    try {
      const records = await (prisma as any).notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return records.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        title: r.title,
        body: r.body,
        href: r.href || null,
        readAt: r.readAt ? r.readAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error("[NotificationsRepo] Error fetching notifications:", err);
      return [];
    }
  }

  // Demo in-memory fallback
  return demoNotificationsRef.value
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Returns the count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) return 0;

  if (isDatabaseConfigured()) {
    try {
      const count = await (prisma as any).notification.count({
        where: {
          userId,
          readAt: null,
        },
      });
      return count;
    } catch (err) {
      console.error("[NotificationsRepo] Error counting unread notifications:", err);
      return 0;
    }
  }

  return demoNotificationsRef.value.filter(
    (n) => n.userId === userId && !n.readAt
  ).length;
}

/**
 * Marks one or all notifications as read for a given user.
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationId?: string
): Promise<{ success: boolean; count: number }> {
  if (!userId) return { success: false, count: 0 };

  const now = new Date();

  if (isDatabaseConfigured()) {
    try {
      const whereClause: any = { userId };
      if (notificationId) {
        whereClause.id = notificationId;
      } else {
        whereClause.readAt = null;
      }

      const res = await (prisma as any).notification.updateMany({
        where: whereClause,
        data: { readAt: now },
      });

      return { success: true, count: res.count };
    } catch (err) {
      console.error("[NotificationsRepo] Error marking notifications read:", err);
      return { success: false, count: 0 };
    }
  }

  // Demo mode
  let updated = 0;
  demoNotificationsRef.value = demoNotificationsRef.value.map((n) => {
    if (n.userId === userId && (!notificationId || n.id === notificationId) && !n.readAt) {
      updated++;
      return { ...n, readAt: now.toISOString() };
    }
    return n;
  });

  return { success: true, count: updated };
}

/**
 * Creates and persists a notification for a user.
 */
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
}): Promise<NotificationItem> {
  const now = new Date();

  if (isDatabaseConfigured()) {
    try {
      const record = await (prisma as any).notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          href: data.href || null,
        },
      });

      return {
        id: record.id,
        userId: record.userId,
        type: record.type,
        title: record.title,
        body: record.body,
        href: record.href || null,
        readAt: record.readAt ? record.readAt.toISOString() : null,
        createdAt: record.createdAt.toISOString(),
      };
    } catch (err) {
      console.error("[NotificationsRepo] Error creating notification:", err);
    }
  }

  // In-memory fallback
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: data.userId,
    type: data.type,
    title: data.title,
    body: data.body,
    href: data.href || null,
    readAt: null,
    createdAt: now.toISOString(),
  };

  demoNotificationsRef.value.unshift(newNotif);
  return newNotif;
}
