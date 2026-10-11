import { NextResponse } from "next/server";
import { getGmailClient, getGeminiClient } from "@/lib/integrations/factory";
import { recordInboundReply, getInboundThreads } from "@/lib/data/repositories/replies";
import { getSponsors } from "@/lib/data/repositories/sponsors";
import { addSuppression } from "@/lib/data/repositories/settings";

import { auth } from "@/lib/auth";
import { checkRateLimit, createRateLimitResponse, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import crypto from "crypto";

function isValidCronBearer(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const provided = authHeader.slice(7).trim();
  const secret = process.env.CRON_SECRET || "super-secret-cron-token-for-reply-sync";
  const providedBuf = Buffer.from(provided, "utf8");
  const secretBuf = Buffer.from(secret, "utf8");
  if (providedBuf.length !== secretBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, secretBuf);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isCron = isValidCronBearer(req.headers.get("authorization"));

    if (!session?.user?.id && !isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.id) {
      const rl = checkRateLimit(
        `sync:${session.user.id}`,
        RATE_LIMIT_CONFIGS.sync.limit,
        RATE_LIMIT_CONFIGS.sync.windowSeconds
      );
      if (!rl.allowed) {
        return createRateLimitResponse(rl.reset);
      }
    }

    const gmail = getGmailClient();
    const gemini = getGeminiClient();

    const polledMessages = await gmail.pollReplies();
    const sponsors = await getSponsors();

    const processed = [];
    for (const msg of polledMessages) {
      // Find matching sponsor by fromEmail or thread
      const sponsor = sponsors.find((s) =>
        s.contacts?.some((c) => c.email.toLowerCase() === msg.fromEmail.toLowerCase())
      ) || sponsors[0];

      if (sponsor) {
        // AI Intent Classification
        const analysis = await gemini.classifyReply(msg.subject, msg.body, sponsor.name);

        // Auto-suppress if Not Interested
        if (analysis.intent === "Not Interested") {
          await addSuppression(msg.fromEmail, "not_interested");
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

    const allThreads = await getInboundThreads();

    return NextResponse.json({
      success: true,
      syncedCount: processed.length,
      threads: allThreads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
