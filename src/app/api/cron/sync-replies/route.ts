import { NextResponse } from "next/server";
import crypto from "crypto";

function isValidCronSecret(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const provided = authHeader.slice(7).trim();
  const secret = process.env.CRON_SECRET || "super-secret-cron-token-for-reply-sync";
  const providedBuf = Buffer.from(provided, "utf8");
  const secretBuf = Buffer.from(secret, "utf8");
  if (providedBuf.length !== secretBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, secretBuf);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!isValidCronSecret(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Forward to internal sync handler
    const cronSecret = process.env.CRON_SECRET || "super-secret-cron-token-for-reply-sync";
    const syncRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/replies/sync`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cronSecret}`,
      },
    });
    const data = await syncRes.json();
    return NextResponse.json({ cronExecuted: true, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cron sync error" }, { status: 500 });
  }
}
