import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { deleteUserAccount } from "@/lib/data/repositories/admin";

export async function DELETE(
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

  // Cannot delete yourself
  if (id === adminAuth.user.id) {
    return NextResponse.json(
      { error: "Security restriction: You cannot delete your own active administrator account." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const reason = body.reason || "Administrative user account deletion";

  const result = await deleteUserAccount(adminAuth.user.id, id, reason);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "User deletion failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "User account and related access successfully deleted.",
  });
}
