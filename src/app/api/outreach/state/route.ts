import { NextResponse } from "next/server";
import { getDrafts } from "@/lib/data/repositories/outreach";
import { getSponsors } from "@/lib/data/repositories/sponsors";

// The Outreach page reads drafts through the server so that approve / send / save
// (which all run on the server) and what the page shows always agree. Without a database
// the browser and the server each keep their OWN in-memory copy, so reading client-side
// made approvals invisible.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [drafts, companies] = await Promise.all([getDrafts(), getSponsors()]);
    return NextResponse.json({ drafts, companies });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load outreach data" }, { status: 500 });
  }
}
