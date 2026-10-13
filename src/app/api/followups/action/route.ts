import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateSponsorStage, getSponsorById } from "@/lib/data/repositories/sponsors";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, action } = await req.json();
    if (!companyId || !action) {
      return NextResponse.json(
        { error: "companyId and action are required" },
        { status: 400 }
      );
    }

    const company = await getSponsorById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (action === "close") {
      // Closing halts all future follow-up outreach
      const updated = await updateSponsorStage(companyId, "Lost");
      return NextResponse.json({
        success: true,
        message: `${company.name} marked as closed. Follow-up sequence halted.`,
        company: updated,
      });
    }

    if (action === "interested") {
      const updated = await updateSponsorStage(companyId, "Interested");
      return NextResponse.json({
        success: true,
        message: `${company.name} moved to Interested.`,
        company: updated,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute follow-up action" },
      { status: 500 }
    );
  }
}
