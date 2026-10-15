import { getGeminiClient, getGmailClient } from "../integrations/factory";
import { Company, Campaign, EmailDraft, EmailQuality } from "@/types";
import { isSuppressed } from "../data/repositories/settings";
import { prisma, isDatabaseConfigured } from "../prisma";
import { decrypt } from "../crypto";

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
  const primaryContact = company.contacts?.find((c) => c.email && c.email.trim() !== "") || company.contacts?.[0];
  const domain = company.domain || (company.website ? company.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "") : "");
  const recipientEmail = primaryContact?.email || (domain ? `partnerships@${domain}` : "");
  const suppressed = recipientEmail ? await isSuppressed(recipientEmail) : false;

  const safetyChecklist = {
    recipientFound: !!recipientEmail,
    recipientStatus: primaryContact?.status || "verified",
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
  toEmail: string,
  userId?: string
) {
  // Safety Rule: Never send to suppressed emails
  const suppressed = await isSuppressed(toEmail);
  if (suppressed) {
    throw new Error(`Email ${toEmail} is on the suppression list (Not Interested / Bounced). Sending blocked.`);
  }

  // Safety Rule: Must be explicitly approved by a human. "draft" is NOT allowed.
  // (The send route also claims the draft first; this is defence in depth.)
  if (draft.status !== "approved") {
    throw new Error(`Blocked: draft ${draft.id} is "${draft.status}", not "approved". Nothing was sent.`);
  }

  let tokens: any = undefined;
  const targetUserId = userId || draft.userId;
  if (isDatabaseConfigured() && targetUserId) {
    try {
      const acc = await prisma.gmailAccount.findFirst({
        where: { userId: targetUserId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });
      if (acc?.refreshTokenEnc) {
        tokens = {
          refresh_token: decrypt(acc.refreshTokenEnc),
          access_token: acc.accessTokenEnc ? decrypt(acc.accessTokenEnc) : undefined,
        };
      }
    } catch (err) {
      console.warn("Could not load user Gmail tokens, using fallback:", err);
    }
  }

  const gmail = getGmailClient(tokens);
  const sendRes = await gmail.sendEmail(toEmail, draft.subject, draft.body);

  return sendRes;
}
