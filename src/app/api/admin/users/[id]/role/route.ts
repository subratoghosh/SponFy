import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { updateUserRole } from "@/lib/data/repositories/admin";
import { UserRole } from "@/types";

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
  const { role } = body;
  const allowedRoles: UserRole[] = ["USER", "ORGANISER", "EXECUTIVE", "ADMIN"];
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Invalid role value. Must be USER, ORGANISER, EXECUTIVE, or ADMIN." },
      { status: 400 }
    );
  }

  // Prevent self-demotion
  if (id === adminAuth.user.id && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Security restriction: You cannot demote your own administrator account." },
      { status: 400 }
    );
  }

  const result = await updateUserRole(id, role as UserRole, adminAuth.user.id);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Role update failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User role updated to ${role}.`,
  });
}
