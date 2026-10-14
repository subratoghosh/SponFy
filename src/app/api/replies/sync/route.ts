import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGmailClient, getGeminiClient } from "@/lib/integrations/factory";
import { recordInboundReply, getInboundThreads } from "@/lib/data/repositories/replies";
import { getSponsors, updateSponsorStage } from "@/lib/data/repositories/sponsors";
import { addSuppression } from "@/lib/data/repositories/settings";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gmail = getGmailClient();
    const gemini = getGeminiClient();

    const polledMessages = await gmail.pollReplies();
    const sponsors = await getSponsors();

    const processed = [];
    for (const msg of polledMessages) {
      // Find matching sponsor by fromEmail in contact list
      const sponsor = sponsors.find((s) =>
        s.contacts?.some(
          (c) => c.email && c.email.toLowerCase() === msg.fromEmail.toLowerCase()
        )
      );

      // Never default to an arbitrary sponsor if no match is found
      if (sponsor) {
        // AI Intent Classification
        const analysis = await gemini.classifyReply(msg.subject, msg.body, sponsor.name);

        // Update company stage & suppression according to intent
        if (analysis.intent === "Not Interested") {
          await addSuppression(msg.fromEmail, "not_interested");
          await updateSponsorStage(sponsor.id, "Lost");
        } else if (
          analysis.intent === "Interested" ||
          analysis.intent === "Positive"
        ) {
          await updateSponsorStage(sponsor.id, "Interested");
        } else if (analysis.intent === "Negotiating") {
          await updateSponsorStage(sponsor.id, "Negotiation");
        } else {
          await updateSponsorStage(sponsor.id, "Replied");
        }

        const recorded = await recordInboundReply(
          sponsor.id,
          {
            companyId: sponsor.id,
            fromEmail: msg.fromEmail,
            toEmail: msg.toEmail,
            subject: msg.subject,
            body: msg.body,
            gmailMessageId: msg.gmailMessageId,
            gmailThreadId: msg.gmailThreadId,
          },
          {
            companyId: sponsor.id,
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence,
            summary: analysis.summary,
            questions: analysis.questions,
            requestedInfo: analysis.requestedInfo,
            nextAction: analysis.nextAction,
            urgency: analysis.urgency,
            meetingRequested: analysis.meetingRequested,
          }
        );
        processed.push(recorded);
      }
    }

    // 2. Scan and process bounces
    const bounces = await gmail.scanBounces();
    const bounceRecords = [];
    for (const b of bounces) {
      if (b.isHardBounce) {
        await addSuppression(b.recipientEmail, "bounced");
        // Mark matching sponsor as Lost
        const matchingSponsor = sponsors.find((s) =>
          s.contacts?.some(
            (c) => c.email && c.email.toLowerCase() === b.recipientEmail.toLowerCase()
          )
        );
        if (matchingSponsor) {
          await updateSponsorStage(matchingSponsor.id, "Lost");
        }
        bounceRecords.push({
          email: b.recipientEmail,
          suppressed: true,
          reason: b.bounceReason,
        });
      }
    }

    const allThreads = await getInboundThreads();

    return NextResponse.json({
      success: true,
      syncedCount: processed.length,
      bouncesDetected: bounceRecords.length,
      bounces: bounceRecords,
      threads: allThreads,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Reply sync failed" },
      { status: 500 }
    );
  }
}
