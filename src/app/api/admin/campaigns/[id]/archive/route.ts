import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { updateCampaign, getCampaignById } from "@/lib/data/repositories/campaigns";
import { recordAuditLog } from "@/lib/data/repositories/admin";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminAuth = await verifyAdminSession();
  if (!adminAuth.authorized || !adminAuth.user) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required" },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const { archived } = body;

  const campaign = await getCampaignById(id);
  if (!campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    );
  }

  const newStatus = archived ? "archived" : "active";
  const updated = await updateCampaign(id, { status: newStatus });

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update campaign status" },
      { status: 500 }
    );
  }

  await recordAuditLog(
    adminAuth.user.id,
    archived ? "campaign_archived" : "campaign_restored",
    "campaign",
    id,
    { campaignName: campaign.name, previousStatus: campaign.status, newStatus }
  );

  return NextResponse.json({
    success: true,
    campaign: updated,
    message: `Campaign ${archived ? "archived" : "restored"} successfully.`,
  });
}
