import { NextResponse } from "next/server";
import { approveDraft, getDrafts, getDraftById } from "@/lib/data/repositories/outreach";
import { requireAuth, verifyCompanyOwnership } from "@/lib/security/auth-guard";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Server-side authentication
    const authRes = await requireAuth();
    if (!authRes.success) {
      return authRes.response;
    }
    const userId = authRes.context.userId;

    // 2. Rate limiting
    const rateLimit = await checkRateLimit("draft", userId);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const { draftId, draftIds, all } = await req.json();

    // Bulk Mode
    if (Array.isArray(draftIds) || all) {
      const allDrafts = await getDrafts(undefined, userId);
      const targets = all
        ? allDrafts.filter((d) => d.status === "draft")
        : allDrafts.filter((d) => draftIds?.includes(d.id) && d.status === "draft");

      const approved = [];
      const blocked = [];

      for (const d of targets) {
        if ((d as any).needsAttention) {
          blocked.push({ id: d.id, reason: (d as any).attentionReason || "Unresolved placeholders in draft" });
          continue;
        }

        // Verify company ownership for each draft
        const owned = await verifyCompanyOwnership(d.companyId, userId);
        if (!owned) {
          blocked.push({ id: d.id, reason: "Unauthorized: company ownership mismatch" });
          continue;
        }

        try {
          const app = await approveDraft(d.id);
          if (app) approved.push(app);
        } catch (err: any) {
          blocked.push({ id: d.id, reason: err.message || "Approval failed" });
        }
      }

      return NextResponse.json({
        success: true,
        approvedCount: approved.length,
        blockedCount: blocked.length,
        approved,
        blocked,
      });
    }

    // Single Mode
    if (!draftId) {
      return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // 3. IDOR Resource Ownership Check
    const ownedCompany = await verifyCompanyOwnership(draft.companyId, userId);
    if (!ownedCompany) {
      return NextResponse.json(
        { error: "Forbidden. You do not own the company associated with this draft.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    if ((draft as any).needsAttention) {
      return NextResponse.json(
        {
          error: (draft as any).attentionReason || "Draft contains unresolved placeholders. Review and edit before approving.",
          code: "needs_attention",
        },
        { status: 422 }
      );
    }

    let approved;
    try {
      approved = await approveDraft(draftId);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Cannot approve this draft" }, { status: 409 });
    }

    return NextResponse.json({ success: true, draft: approved });
  } catch (err: any) {
    console.error("[outreach/approve error]:", err);
    return NextResponse.json({ error: err.message || "Approval failed" }, { status: 500 });
  }
}
