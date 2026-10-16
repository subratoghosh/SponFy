import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";
import { evaluateEmailQuality } from "@/lib/services/quality-evaluator";

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
    const { companyName, industry, campaignName, audienceSize, subject, emailBody } = body || {};

    if (!subject || !emailBody) {
      return NextResponse.json({ error: "subject and emailBody are required" }, { status: 400 });
    }

    const quality = await evaluateEmailQuality({
      companyName: companyName || "Sponsor",
      industry,
      campaignName,
      audienceSize,
      subject,
      body: emailBody,
    });

    return NextResponse.json({
      success: true,
      quality,
    });
  } catch (err: any) {
    console.error("[api/outreach/evaluate-quality error]:", err);
    return NextResponse.json({ error: err.message || "Failed to evaluate email quality" }, { status: 500 });
  }
}
