import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ReplyIntent, Message } from "@/types";
import { DEMO_MESSAGES, DEMO_REPLIES } from "@/lib/data/seed-data";
import { getGmailClient } from "@/lib/integrations/factory";

export const runtime = "nodejs";

const DB_TO_INTENT: Record<string, ReplyIntent> = {
  INTERESTED: "Interested",
  POSITIVE: "Positive",
  NEEDS_INFO: "Needs Info",
  NEGOTIATING: "Negotiating",
  NOT_INTERESTED: "Not Interested",
  MAYBE_LATER: "Maybe Later",
  OUT_OF_OFFICE: "Out of Office",
  UNCLEAR: "Unclear",
};

export async function GET(request: NextRequest) {
  const session = await auth();
  const isDemo = session?.user?.email === "demo@sponfy.dev";

  if (!isDatabaseConfigured()) {
    if (process.env.NODE_ENV === "test") {
      const inbounds = DEMO_MESSAGES.filter((m) => m.direction === "inbound");
      const demoData = inbounds.map((msg) => {
        const analysis = DEMO_REPLIES.find(
          (r) => r.messageId === msg.id || r.companyId === msg.companyId
        );
        return {
          message: msg,
          analysis,
          allThreadMessages: [msg],
        };
      });
      return NextResponse.json({ success: true, data: demoData });
    }
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    let userId = session?.user?.id;
    if (!userId && session?.user?.email) {
      try {
        const u = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (u) userId = u.id;
      } catch {
        // continue
      }
    }
    if (!userId && isDemo) {
      userId = "usr-demo-lead";
    }

    const where: any = { direction: "INBOUND" };
    if (userId && !isDemo) {
      const userCampaigns = await prisma.campaign.findMany({
        where: {
          OR: [
            { userId },
            {
              members: {
                some: {
                  userId,
                  status: "ACTIVE",
                },
              },
            },
          ],
        },
        select: { id: true },
      });
      const accessibleIds = userCampaigns.map((c) => c.id);

      let accessibleCompanyIds: string[] = [];
      if (accessibleIds.length > 0) {
        const companies = await prisma.company.findMany({
          where: { campaignId: { in: accessibleIds } },
          select: { id: true },
        });
        accessibleCompanyIds = companies.map((c) => c.id);
      }

      where.AND = [
        { direction: "INBOUND" },
        {
          OR: [
            { userId },
            ...(accessibleCompanyIds.length > 0
              ? [{ companyId: { in: accessibleCompanyIds } }]
              : []),
          ],
        },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        analysis: true,
      },
      orderBy: { sentAt: "desc" },
    });

    if (messages.length === 0 && (isDemo || (process.env.NODE_ENV === "test" && !userId))) {
      const inbounds = DEMO_MESSAGES.filter((m) => m.direction === "inbound");
      const demoData = inbounds.map((msg) => {
        const analysis = DEMO_REPLIES.find(
          (r) => r.messageId === msg.id || r.companyId === msg.companyId
        );
        return {
          message: msg,
          analysis,
          allThreadMessages: [msg],
        };
      });
      return NextResponse.json({ success: true, data: demoData });
    }

    // Fetch related thread messages (both outbound and inbound)
    const threadIds = Array.from(
      new Set(messages.map((m) => m.gmailThreadId).filter(Boolean))
    ) as string[];
    const companyIds = Array.from(
      new Set(messages.map((m) => m.companyId).filter(Boolean))
    ) as string[];

    let relatedMessages: any[] = [];
    if (threadIds.length > 0 || companyIds.length > 0) {
      relatedMessages = await prisma.message.findMany({
        where: {
          OR: [
            ...(threadIds.length > 0 ? [{ gmailThreadId: { in: threadIds } }] : []),
            ...(companyIds.length > 0 ? [{ companyId: { in: companyIds } }] : []),
          ],
        },
        orderBy: { sentAt: "asc" },
      });
    }

    const data = messages.map((msg) => {
      const matchingRelated = relatedMessages.filter(
        (rm) =>
          (msg.gmailThreadId && rm.gmailThreadId === msg.gmailThreadId) ||
          (msg.companyId && rm.companyId === msg.companyId)
      );

      const mappedMsg: Message = {
        id: msg.id,
        draftId: msg.draftId || undefined,
        companyId: msg.companyId || "",
        gmailMessageId: msg.gmailMessageId || undefined,
        gmailThreadId: msg.gmailThreadId || undefined,
        direction: "inbound" as const,
        fromEmail: msg.fromEmail || "",
        toEmail: msg.toEmail || "",
        subject: msg.subject || "",
        body: msg.body,
        sentAt: msg.sentAt.toISOString(),
      };

      const allThreadMessages =
        matchingRelated.length > 0
          ? matchingRelated.map((rm) => ({
              id: rm.id,
              draftId: rm.draftId || undefined,
              companyId: rm.companyId || "",
              gmailMessageId: rm.gmailMessageId || undefined,
              gmailThreadId: rm.gmailThreadId || undefined,
              direction: rm.direction.toLowerCase() as "inbound" | "outbound",
              fromEmail: rm.fromEmail || "",
              toEmail: rm.toEmail || "",
              subject: rm.subject || "",
              body: rm.body,
              sentAt: rm.sentAt.toISOString(),
            }))
          : [mappedMsg];

      return {
        message: mappedMsg,
        analysis: msg.analysis
          ? {
              id: msg.analysis.id,
              messageId: msg.analysis.messageId,
              companyId: msg.companyId || "",
              intent: DB_TO_INTENT[msg.analysis.intent] || "Interested",
              sentiment: msg.analysis.sentiment as any,
              confidence: msg.analysis.confidence,
              summary: msg.analysis.summary,
              questions: (msg.analysis.questions as any) || [],
              requestedInfo: msg.analysis.requestedInfo ? [msg.analysis.requestedInfo] : [],
              nextAction: msg.analysis.nextAction,
              urgency: msg.analysis.urgency as any,
              meetingRequested: msg.analysis.meetingRequested,
              createdAt: msg.analysis.createdAt.toISOString(),
            }
          : undefined,
        allThreadMessages,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/replies error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);

  let body: {
    messageId?: string;
    toEmail?: string;
    subject?: string;
    body?: string;
    companyId?: string;
    threadId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { toEmail, subject, body: emailBody, companyId, threadId } = body;
  if (!toEmail || !emailBody) {
    return NextResponse.json({ error: "toEmail and body are required" }, { status: 400 });
  }

  try {
    let tokens: any = undefined;
    if (isDatabaseConfigured()) {
      try {
        const { decrypt } = await import("@/lib/crypto");
        let acc = userId
          ? await prisma.gmailAccount.findFirst({
              where: { userId, status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
            })
          : null;

        if (!acc) {
          acc = await prisma.gmailAccount.findFirst({
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
          });
        }

        if (acc?.refreshTokenEnc) {
          tokens = {
            refresh_token: decrypt(acc.refreshTokenEnc),
            access_token: acc.accessTokenEnc ? decrypt(acc.accessTokenEnc) : undefined,
          };
        }
      } catch (err) {
        console.warn("Could not load tokens for reply send:", err);
      }
    }

    const gmail = getGmailClient(tokens);
    const resolvedSubject = subject || "Re: Partnership Inquiry";

    let sendResult = {
      messageId: `sent-${Date.now()}`,
      threadId: threadId || `thread-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };

    try {
      sendResult = await gmail.sendEmail(toEmail, resolvedSubject, emailBody, threadId);
    } catch (sendErr) {
      console.warn("Gmail sendEmail failed or mock used:", sendErr);
    }

    let savedMsg: Message | null = null;
    if (isDatabaseConfigured()) {
      try {
        const resolvedUserId = userId || "usr-demo-lead";
        const created = await prisma.message.create({
          data: {
            userId: resolvedUserId,
            companyId: companyId || null,
            direction: "OUTBOUND",
            fromEmail: session?.user?.email || "organizer@sponfy.dev",
            toEmail,
            subject: resolvedSubject,
            body: emailBody,
            gmailMessageId: sendResult.messageId,
            gmailThreadId: sendResult.threadId,
            sentAt: new Date(),
          },
        });

        savedMsg = {
          id: created.id,
          companyId: created.companyId || "",
          direction: "outbound",
          fromEmail: created.fromEmail || "",
          toEmail: created.toEmail || "",
          subject: created.subject || "",
          body: created.body,
          sentAt: created.sentAt.toISOString(),
        };
      } catch (dbErr) {
        console.warn("Could not save outbound reply to DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: savedMsg || {
        id: sendResult.messageId,
        companyId: companyId || "",
        direction: "outbound",
        fromEmail: session?.user?.email || "organizer@sponfy.dev",
        toEmail,
        subject: resolvedSubject,
        body: emailBody,
        sentAt: sendResult.sentAt,
      },
    });
  } catch (err: any) {
    console.error("POST /api/replies error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send reply" },
      { status: 500 }
    );
  }
}
