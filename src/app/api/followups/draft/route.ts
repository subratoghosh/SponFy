import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadFollowups } from "@/lib/outreach/followup-service";
import { buildFollowupDraft } from "@/lib/outreach/followups";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { createDraft } from "@/lib/data/repositories/outreach";
import { getUserProfile } from "@/lib/data/repositories/settings";

/**
 * Creates a follow-up DRAFT for a company whose follow-up window is open.
 * Supports both single ({ companyId }) and batch ({ companyIds }).
 * It never sends anything: a human still has to approve it, and /api/outreach/send
 * re-checks every safety rule when it is sent.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const companyIds: string[] = body.companyIds || (body.companyId ? [body.companyId] : []);

    if (companyIds.length === 0) {
      return NextResponse.json({ error: "companyId or companyIds required" }, { status: 400 });
    }

    const allFollowups = await loadFollowups();
    const profile = await getUserProfile();
    const results: any[] = [];
    const errors: any[] = [];

    for (const companyId of companyIds) {
      const item = allFollowups.find((i) => i.companyId === companyId);
      if (!item) {
        errors.push({ companyId, error: "This company has not been contacted yet." });
        continue;
      }

      // If a draft is already pending, return it
      if (item.state === "draft_ready" && item.pendingDraft) {
        results.push({ draft: item.pendingDraft, existing: true });
        continue;
      }

      // Check halt conditions
      if (item.state !== "due" || !item.nextTouch) {
        errors.push({ companyId, error: item.reason, state: item.state });
        continue;
      }

      const company = await getSponsorById(companyId);
      if (!company) {
        errors.push({ companyId, error: "Company not found" });
        continue;
      }

      const campaign = await getCampaignById(company.campaignId);
      if (!campaign) {
        errors.push({ companyId, error: "Campaign not found" });
        continue;
      }

      // Follow up with the same person who received the previous touch
      const contact = company.contacts?.find(
        (c) => c.email && c.email.toLowerCase() === item.recipientEmail.toLowerCase()
      );
      if (!contact) {
        errors.push({
          companyId,
          error: `${item.recipientEmail} is no longer a contact on file for ${company.name}.`,
        });
        continue;
      }

      const { subject, body: draftBody } = buildFollowupDraft({
        item,
        campaign,
        signature: profile.signature || profile.fullName,
      });

      const draft = await createDraft({
        companyId,
        contactId: contact.id,
        subject,
        body: draftBody,
        quality: {
          personalization: 85,
          relevance: 90,
          clarity: 95,
          cta: 90,
          professionalism: 95,
          overall: 91,
          suggestions: [
            `Follow-up ${item.nextTouch - 1} reference to previous note. Review before approving.`,
          ],
        },
        status: "draft",
      });

      results.push({ draft, existing: false });
    }

    if (body.companyId && results.length === 1) {
      return NextResponse.json({ success: true, draft: results[0].draft, existing: results[0].existing });
    }

    if (body.companyId && errors.length > 0 && results.length === 0) {
      const err = errors[0];
      const status =
        err.error === "This company has not been contacted yet." ||
        err.error === "Company not found"
          ? 404
          : 409;
      return NextResponse.json({ error: err.error, state: err.state }, { status });
    }

    return NextResponse.json({
      success: true,
      createdCount: results.filter((r) => !r.existing).length,
      existingCount: results.filter((r) => r.existing).length,
      results,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Could not create follow-up" },
      { status: 500 }
    );
  }
}
