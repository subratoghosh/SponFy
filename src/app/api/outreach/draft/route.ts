import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runOutreachWorkflow } from "@/lib/workflows/outreach-graph";
import { getSponsorById, getSponsors } from "@/lib/data/repositories/sponsors";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { saveDraft, getDraftsByCompanyId, deleteDraft, getDraftById } from "@/lib/data/repositories/outreach";
import { getCustomTemplates, interpolateTemplate } from "@/lib/data/repositories/templates";
import { evaluateEmailQuality } from "@/lib/services/quality-evaluator";
import { Company, Campaign } from "@/types";

function detectUnresolvedPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  return matches ? Array.from(new Set(matches)) : [];
}

async function generateSingleDraft({
  company,
  campaign,
  tone = "professional",
  templateId,
  userEmail,
  userName,
  draftId,
  userId,
}: {
  company: Company;
  campaign: Campaign;
  tone?: string;
  templateId?: string;
  userEmail?: string;
  userName?: string;
  draftId?: string;
  userId?: string;
}) {
  // Check if template requested
  if (templateId) {
    const templates = getCustomTemplates(userEmail);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      const subject = interpolateTemplate(tmpl.subject, {
        companyName: company.name,
        contactName: company.contacts?.[0]?.name,
        eventName: campaign.name,
        audienceSize: campaign.audienceSize?.toString(),
        organizerName: userName || "Event Organizer",
        industry: company.industry,
        fitScore: company.fitScore,
      });

      const body = interpolateTemplate(tmpl.body, {
        companyName: company.name,
        contactName: company.contacts?.[0]?.name,
        eventName: campaign.name,
        audienceSize: campaign.audienceSize?.toString(),
        organizerName: userName || "Event Organizer",
        industry: company.industry,
        fitScore: company.fitScore,
      });

      const unresolved = [
        ...detectUnresolvedPlaceholders(subject),
        ...detectUnresolvedPlaceholders(body),
      ];

      const needsAttention = unresolved.length > 0;
      const attentionReason = needsAttention
        ? `Unresolved placeholders: ${unresolved.join(", ")}`
        : undefined;

      const quality = await evaluateEmailQuality({
        companyName: company.name,
        industry: company.industry,
        campaignName: campaign.name,
        audienceSize: campaign.audienceSize,
        subject,
        body,
      });

      if (needsAttention) {
        quality.suggestions.unshift("Fill unresolved placeholders before approving");
      }

      const saved = await saveDraft({
        id: draftId,
        userId,
        companyId: company.id,
        contactId: company.contacts?.[0]?.id,
        subject,
        body,
        quality,
        status: "draft",
        needsAttention,
        attentionReason,
      });

      return { draft: saved, needsAttention, unresolved };
    }
  }

  // AI Generated Draft
  const result = await runOutreachWorkflow(company, campaign, tone as any);

  // Truly unique, dynamic AI evaluation using Groq Cloud
  const quality = await evaluateEmailQuality({
    companyName: company.name,
    industry: company.industry,
    campaignName: campaign.name,
    audienceSize: campaign.audienceSize,
    subject: result.subject,
    body: result.body,
  });

  const saved = await saveDraft({
    id: draftId,
    userId,
    companyId: company.id,
    contactId: company.contacts?.[0]?.id,
    subject: result.subject,
    body: result.body,
    quality,
    status: "draft",
    needsAttention: false,
  });

  return { draft: saved, safetyChecklist: result.safetyChecklist };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 draft requests/minute/user
    const { checkRateLimit, createRateLimitResponse } = await import("@/lib/security/rate-limit");
    const rateLimit = await checkRateLimit("draft", userId);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const { verifyCompanyOwnership } = await import("@/lib/security/auth-guard");

    const body = await req.json();
    const { companyId, companyIds, campaignId, tone = "professional", templateId, regenerate } = body;

    // Batch Generation Mode
    if (Array.isArray(companyIds) && companyIds.length > 0) {
      const generated: any[] = [];
      const failed: any[] = [];

      // Concurrency bound of 3
      const chunks: string[][] = [];
      for (let i = 0; i < companyIds.length; i += 3) {
        chunks.push(companyIds.slice(i, i + 3));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (cId) => {
            try {
              const company = await getSponsorById(cId);
              if (!company) {
                failed.push({ companyId: cId, reason: "Company not found" });
                return;
              }

              // Enforce: only approved sponsors can have drafts
              if (company.stage === "Discovered" && (company as any).sponsorApproved === false) {
                failed.push({ companyId: cId, name: company.name, reason: "Sponsor is not approved yet" });
                return;
              }

              const campaign = await getCampaignById(campaignId || company.campaignId);
              if (!campaign) {
                failed.push({ companyId: cId, name: company.name, reason: "Campaign not found" });
                return;
              }

              // Check existing draft
              const existing = await getDraftsByCompanyId(cId);
              if (!regenerate && existing.length > 0) {
                generated.push({ companyId: cId, companyName: company.name, draft: existing[0], alreadyExisted: true });
                return;
              }

              const res = await generateSingleDraft({
                company,
                campaign,
                tone,
                templateId,
                userEmail: session?.user?.email || undefined,
                userName: session?.user?.name || undefined,
                draftId: existing[0]?.id,
                userId,
              });

              generated.push({ companyId: cId, companyName: company.name, draft: res.draft });
            } catch (err: any) {
              failed.push({ companyId: cId, reason: err?.message || "Generation error" });
            }
          })
        );
      }

      return NextResponse.json({
        success: true,
        count: generated.length,
        generated,
        failed,
      });
    }

    // Single Company Mode
    if (!companyId) {
      return NextResponse.json({ error: "companyId or companyIds required" }, { status: 400 });
    }

    const company = await getSponsorById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // IDOR Ownership Check
    const owned = await verifyCompanyOwnership(companyId, userId);
    if (!owned) {
      return NextResponse.json(
        { error: "Forbidden. You do not own this company.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Enforce: only approved sponsors can have drafts
    if (company.stage === "Discovered" && (company as any).sponsorApproved === false) {
      return NextResponse.json(
        { error: "Drafts can only be created for approved sponsors. Approve this company first." },
        { status: 403 }
      );
    }

    const campaign = await getCampaignById(campaignId || company.campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Reuse existing draft unless explicitly regenerating
    const existingDrafts = await getDraftsByCompanyId(companyId);
    if (!regenerate && existingDrafts.length > 0) {
      return NextResponse.json({
        success: true,
        draft: existingDrafts[0],
        alreadyExisted: true,
      });
    }

    const existingDraftId = existingDrafts[0]?.id;

    const result = await generateSingleDraft({
      company,
      campaign,
      tone,
      templateId,
      userEmail: session?.user?.email || undefined,
      userName: session?.user?.name || undefined,
      draftId: existingDraftId,
      userId,
    });

    return NextResponse.json({
      success: true,
      draft: result.draft,
      safetyChecklist: (result as any).safetyChecklist,
      needsAttention: (result as any).needsAttention,
    });
  } catch (err: any) {
    const isAiError =
      err?.message?.includes("Gemini") ||
      err?.message?.includes("demand") ||
      err?.message?.includes("quota") ||
      err?.message?.includes("UNAVAILABLE");

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Drafting failed",
        isAiError,
        canUseTemplate: true,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    const { verifyCompanyOwnership } = await import("@/lib/security/auth-guard");
    const owned = await verifyCompanyOwnership(companyId, userId);
    if (!owned) {
      return NextResponse.json({ error: "Forbidden. You do not own this company." }, { status: 403 });
    }

    const drafts = await getDraftsByCompanyId(companyId);
    return NextResponse.json({ success: true, draft: drafts[0] || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load draft" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("id");
    if (!draftId) {
      return NextResponse.json({ error: "draftId (id) is required" }, { status: 400 });
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (draft.status === "sent" || draft.status === "sending") {
      return NextResponse.json({ error: "Cannot reject a draft that has already been dispatched" }, { status: 400 });
    }

    await deleteDraft(draftId, userId);
    return NextResponse.json({ success: true, message: "Draft rejected and deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete draft" }, { status: 500 });
  }
}

