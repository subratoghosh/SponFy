import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { updateUserStatus } from "@/lib/data/repositories/admin";

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
  const { status, reason } = body;

  if (!status || !["ACTIVE", "SUSPENDED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value. Must be ACTIVE or SUSPENDED." },
      { status: 400 }
    );
  }

  const success = await updateUserStatus(id, status, adminAuth.user.id, reason);
  if (!success) {
    return NextResponse.json(
      { error: "User not found or status update failed." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User status updated to ${status}.`,
  });
}
