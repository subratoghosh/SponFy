import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDiscoveryResults, deleteDiscoveryResult } from "@/lib/data/repositories/discovery-results";
import { addSponsor, DuplicateCompanyError, getSponsors } from "@/lib/data/repositories/sponsors";
import { Company } from "@/types";
import { z } from "zod";

const ApproveSchema = z.object({
  campaignId: z.string().min(1),
  candidateIds: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV === "test" ? "usr-demo-lead" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = ApproveSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error.format() }, { status: 400 });
    }

    const { campaignId, candidateIds, all } = parsed.data;

    // Load user's discovery results
    const stored = await getDiscoveryResults(userId, campaignId);
    if (stored.length === 0) {
      return NextResponse.json({ error: "No discovery results found to approve", approvedCount: 0 }, { status: 404 });
    }

    const toApprove = all
      ? stored
      : stored.filter((c) => candidateIds?.includes(c.id));

    if (toApprove.length === 0) {
      return NextResponse.json({ error: "No matching discovery candidates selected", approvedCount: 0 }, { status: 400 });
    }

    const approvedCompanies: Company[] = [];
    const alreadyApproved: string[] = [];
    const failed: string[] = [];

    for (const item of toApprove) {
      try {
        const company = await addSponsor({
          userId,
          campaignId,
          name: item.name,
          website: item.website || "",
          industry: item.industry || "Technology",
          description: item.description || "",
          stage: "Qualified", // Enters pipeline as sponsor-approved / qualified
          fitScore: item.fitScore || 85,
          scoreBreakdown: item.scoreBreakdown || [],
          pipelineValue: 0, // Starts at 0 until user enters funding
          signals: item.signals || [],
          confidence: item.confidence || 85,
          researchStatus: "pending",
        });

        approvedCompanies.push(company);
        await deleteDiscoveryResult(item.id, userId);
      } catch (err: any) {
        if (err instanceof DuplicateCompanyError) {
          alreadyApproved.push(item.name);
          // Still clean up from discovery results since it's already in the pipeline
          await deleteDiscoveryResult(item.id, userId);
        } else {
          console.warn("Failed approving company:", item.name, err);
          failed.push(item.name);
        }
      }
    }

    return NextResponse.json({
      success: true,
      approvedCount: approvedCompanies.length,
      alreadyApprovedCount: alreadyApproved.length,
      failedCount: failed.length,
      companies: approvedCompanies,
      alreadyApproved,
      failed,
    });
  } catch (err: any) {
    console.error("Error in /api/sponsors/approve:", err);
    return NextResponse.json({ error: err.message || "Approval failed" }, { status: 500 });
  }
}
