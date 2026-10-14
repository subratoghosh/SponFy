import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getDrafts } from "@/lib/data/repositories/outreach";
import { getSponsors } from "@/lib/data/repositories/sponsors";
import { requireAuth } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse>;
export async function GET(): Promise<NextResponse>;
export async function GET(request?: Request): Promise<NextResponse> {
  try {
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;

    const rateLimit = await checkRateLimit("read", userId);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    let campaignId: string | undefined = undefined;
    if (request?.url) {
      try {
        const { searchParams } = new URL(request.url);
        campaignId = searchParams.get("campaignId") || undefined;
      } catch {
        // invalid URL or test environment
      }
    }

    // Concurrently fetch drafts and companies scoped strictly to authenticated user
    const [drafts, companies] = await Promise.all([
      getDrafts(undefined, userId),
      getSponsors(campaignId, userId),
    ]);

    return NextResponse.json({
      success: true,
      drafts,
      companies,
      totalDrafts: drafts.length,
      totalCompanies: companies.length,
    });
  } catch (err: any) {
    console.error("[API outreach/state error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load outreach data" }, { status: 500 });
  }
}
