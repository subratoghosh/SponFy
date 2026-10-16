import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { recordUserHeartbeat } from "@/lib/activity/heartbeat";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  let path: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.path === "string") path = body.path.slice(0, 200);
  } catch {
    // Body is optional
  }

  await recordUserHeartbeat(userId, path);
  return NextResponse.json({ success: true });
}
