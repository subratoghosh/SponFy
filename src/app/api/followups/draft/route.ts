import { NextResponse } from "next/server";
import { loadFollowups } from "@/lib/outreach/followup-service";
import { buildFollowupDraft } from "@/lib/outreach/followups";
import { getSponsorById } from "@/lib/data/repositories/sponsors";
import { getCampaignById } from "@/lib/data/repositories/campaigns";
import { createDraft } from "@/lib/data/repositories/outreach";
import { getUserProfile } from "@/lib/data/repositories/settings";

/**
 * Creates a follow-up DRAFT for a company whose follow-up window is open.
 * It never sends anything: a human still has to approve it, and /api/outreach/send
 * re-checks every safety rule when it is sent.
 */
export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const item = (await loadFollowups()).find((i) => i.companyId === companyId);
    if (!item) return NextResponse.json({ error: "This company has not been contacted yet." }, { status: 404 });

    if (item.state === "draft_ready" && item.pendingDraft) {
      return NextResponse.json({ success: true, draft: item.pendingDraft, existing: true });
    }
    if (item.state !== "due" || !item.nextTouch) {
      return NextResponse.json({ error: item.reason, state: item.state }, { status: 409 });
    }

    const company = await getSponsorById(companyId);
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    const campaign = await getCampaignById(company.campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    // Follow up with the same person who got the first email, never a different address.
    const contact = company.contacts?.find((c) => c.email.toLowerCase() === item.recipientEmail.toLowerCase());
    if (!contact) {
      return NextResponse.json(
        { error: `${item.recipientEmail} is no longer a contact on file for ${company.name}. Add the contact again first.` },
        { status: 409 }
      );
    }

    const profile = await getUserProfile();
    const { subject, body } = buildFollowupDraft({
      item,
      campaign,
      signature: profile.signature || profile.fullName,
    });

    const draft = await createDraft({
      companyId,
      contactId: contact.id,
      subject,
      body,
      quality: {
        personalization: 0,
        relevance: 0,
        clarity: 0,
        cta: 0,
        professionalism: 0,
        overall: 0,
        suggestions: ["Template follow-up: not AI-scored. Read it and edit before approving."],
      },
      status: "draft",
    });

    return NextResponse.json({ success: true, draft });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not create follow-up" }, { status: 500 });
  }
}
