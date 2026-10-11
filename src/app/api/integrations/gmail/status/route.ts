import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGmailStatus } from "@/lib/data/repositories/settings";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const status = await getGmailStatus(userId);
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, error: err?.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
