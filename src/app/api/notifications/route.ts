import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
} from "@/lib/data/repositories/notifications";

export async function GET(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(userId, limit),
      getUnreadNotificationCount(userId),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to load notifications." },
      { status: 500 }
    );
  }
}
