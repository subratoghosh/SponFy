import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ReplyIntent } from "@/types";

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
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const userId = session?.user?.id;
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
      where.AND = [
        { direction: "INBOUND" },
        {
          OR: [
            { userId },
            {
              company: {
                campaignId: { in: accessibleIds },
              },
            },
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

    const data = messages.map((msg) => ({
      message: {
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
      },
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
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET /api/replies error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}
