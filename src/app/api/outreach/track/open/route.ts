import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

// In-memory engagement events store for open & click events
interface StoredEngagementEvent {
  id: string;
  type: "open" | "click";
  messageId: string;
  metadata?: any;
  createdAt: string;
}

const engagementEvents: StoredEngagementEvent[] = [];

// Transparent 1x1 GIF buffer
const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("t");

    if (token) {
      engagementEvents.push({
        id: `open-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "open",
        messageId: token,
        createdAt: new Date().toISOString(),
      });
    }

    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    });
  } catch (err) {
    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: { "Content-Type": "image/gif" },
    });
  }
}
