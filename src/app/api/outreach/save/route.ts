import { NextResponse } from "next/server";
import { getDraftById, saveDraft } from "@/lib/data/repositories/outreach";
import { requireAuth, verifyCompanyOwnership } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. Server-side authentication
  const authRes = await requireAuth();
  if (!authRes.success) {
    return authRes.response;
  }
  const userId = authRes.context.userId;

  // 2. Distributed rate limiting
  const rateLimit = await checkRateLimit("draft", userId);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    let bodyData: any;
    try {
      bodyData = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { id, subject, body } = bodyData || {};
    if (!id || typeof subject !== "string" || typeof body !== "string") {
      return NextResponse.json(
        { error: "id, subject and body are required and must be valid strings" },
        { status: 400 }
      );
    }

    // Input bounds validation
    if (subject.length > 200 || body.length > 10000) {
      return NextResponse.json(
        { error: "Draft subject or body exceeds maximum permitted length" },
        { status: 400 }
      );
    }

    const existing = await getDraftById(id);
    if (!existing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // 3. IDOR Ownership Check: Verify that the associated company belongs to this user
    const company = await verifyCompanyOwnership(existing.companyId, userId);
    if (!company) {
      return NextResponse.json(
        { error: "Forbidden. You do not own the company associated with this draft.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Only subject/body can change here. Status/approval stay server-controlled.
    const saved = await saveDraft({
      id,
      companyId: existing.companyId,
      subject: subject.trim(),
      body: body.trim(),
      userId,
    });

    return NextResponse.json({ success: true, draft: saved });
  } catch (err: any) {
    console.error("[API outreach/save error]:", err);
    return NextResponse.json({ error: err.message || "Save failed" }, { status: 409 });
  }
}
