import { NextResponse } from "next/server";
import { verifyEmailStrictly } from "@/lib/integrations/verification/strict-verifier";
import { requireAuth } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;

    const rateLimit = await checkRateLimit("relevance", userId);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const body = await req.json();
    const { email, companyName } = body || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await verifyEmailStrictly(email, { companyName });

    return NextResponse.json({
      success: true,
      verification: result,
    });
  } catch (err: any) {
    console.error("[api/verification/check error]:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
