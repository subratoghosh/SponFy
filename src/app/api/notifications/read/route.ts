import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/security/auth-guard";
import { markNotificationsAsRead } from "@/lib/data/repositories/notifications";

const readSchema = z.object({
  notificationId: z.string().optional(),
});

export async function PATCH(req: Request) {
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }

  const userId = authRes.context.userId;

  try {
    let notificationId: string | undefined = undefined;
    const text = await req.text();
    if (text) {
      const json = JSON.parse(text);
      const parsed = readSchema.safeParse(json);
      if (parsed.success) {
        notificationId = parsed.data.notificationId;
      }
    }

    const result = await markNotificationsAsRead(userId, notificationId);

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("[Notifications Read API] Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read." },
      { status: 500 }
    );
  }
}
