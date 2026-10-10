import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "super-secret-cron-token-for-reply-sync";

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Forward to internal sync handler
    const syncRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/replies/sync`, {
      method: "POST",
    });
    const data = await syncRes.json();
    return NextResponse.json({ cronExecuted: true, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cron sync error" }, { status: 500 });
  }
}
