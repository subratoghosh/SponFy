import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { disconnectGmailAccount } from "@/lib/data/repositories/settings";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    await disconnectGmailAccount(userId);
    return NextResponse.json({ success: true, connected: false });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to disconnect Gmail account" },
      { status: 500 }
    );
  }
}
