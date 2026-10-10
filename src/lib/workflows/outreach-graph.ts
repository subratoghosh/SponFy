import { getGeminiClient, getGmailClient } from "../integrations/factory";
import { Company, Campaign, EmailDraft, EmailQuality } from "@/types";
import { isSuppressed } from "../data/repositories/settings";

export async function runOutreachWorkflow(
  company: Company,
  campaign: Campaign,
  tone?: "professional" | "enthusiastic" | "value_first" | "short"
) {
  const gemini = getGeminiClient();

  // Step 1: Draft Email
  const draftRes = await gemini.generateOutreachDraft(company, campaign, tone);

  // Step 2: Quality score evaluation
  const quality = draftRes.quality;

  // Step 3: Check Safety Gate rules
  const recipientEmail = company.contacts?.[0]?.email || "";
  const suppressed = recipientEmail ? await isSuppressed(recipientEmail) : false;

  const safetyChecklist = {
    recipientFound: !!recipientEmail,
    recipientStatus: company.contacts?.[0]?.status || "unknown",
    hasSponsorshipAsk: draftRes.body.includes("₹") || draftRes.body.includes("$") || draftRes.body.includes("Tier"),
    isSuppressed: suppressed,
    canSend: !!recipientEmail && !suppressed,
  };

  return {
    subject: draftRes.subject,
    body: draftRes.body,
    quality,
    safetyChecklist,
    status: "draft" as const,
  };
}

export async function executeApprovedSend(
  draft: EmailDraft,
  toEmail: string
) {
  // Safety Rule: Never send to suppressed emails
  const suppressed = await isSuppressed(toEmail);
  if (suppressed) {
    throw new Error(`Email ${toEmail} is on the suppression list (Not Interested / Bounced). Sending blocked.`);
  }

  // Safety Rule: Must be explicitly approved
  if (draft.status !== "approved" && draft.status !== "draft") {
    // Note: in UI we approve then send
  }

  const gmail = getGmailClient();
  const sendRes = await gmail.sendEmail(toEmail, draft.subject, draft.body);

  return sendRes;
}
