import { prisma, isDatabaseConfigured } from "@/lib/prisma";

// Minimum gap between recorded heartbeats for one user, so page hops don't spam the table
const HEARTBEAT_THROTTLE_MS = 2 * 60 * 1000;

/**
 * Records user activity: bumps users.lastActiveAt and appends a "heartbeat" row
 * to user_activity_logs. Admin analytics derive active users and sessions from these.
 */
export async function recordUserHeartbeat(userId: string, path?: string): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true },
    });
    if (!user) return;

    const now = new Date();
    if (user.lastActiveAt && now.getTime() - user.lastActiveAt.getTime() < HEARTBEAT_THROTTLE_MS) {
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: now },
      }),
      prisma.userActivityLog.create({
        data: {
          userId,
          action: "heartbeat",
          metadata: path ? { path } : {},
        },
      }),
    ]);
  } catch (err) {
    console.warn("recordUserHeartbeat failed:", err);
  }
}
