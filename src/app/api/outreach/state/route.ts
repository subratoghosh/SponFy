import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDrafts } from "@/lib/data/repositories/outreach";
import { getSponsors } from "@/lib/data/repositories/sponsors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const [drafts, companies] = await Promise.all([
      getDrafts(undefined, userId),
      getSponsors(undefined, userId),
    ]);
    return NextResponse.json({ drafts, companies });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load outreach data" }, { status: 500 });
  }
}
