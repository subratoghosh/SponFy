import { NextResponse } from "next/server";
import { discoverRealCompanyContact } from "@/lib/services/contact-discovery";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { requireAuth, verifyCompanyOwnership } from "@/lib/security/auth-guard";
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
    const { companyId } = body || {};

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const company = await getSponsorById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const owned = await verifyCompanyOwnership(companyId, userId);
    if (!owned) {
      return NextResponse.json({ error: "Forbidden. You do not own this company.", code: "FORBIDDEN" }, { status: 403 });
    }

    const result = await discoverRealCompanyContact(
      company.id,
      company.name,
      company.website,
      userId
    );

    return NextResponse.json({
      success: result.found,
      contact: result.contact,
      verification: result.verification,
      reason: result.reason,
    });
  } catch (err: any) {
    console.error("[api/sponsors/discover-contact error]:", err);
    return NextResponse.json({ error: err.message || "Contact discovery failed" }, { status: 500 });
  }
}
