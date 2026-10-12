import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAdminSession } from "@/lib/admin/auth";
import { reorderShowcaseCompanies } from "@/lib/data/repositories/showcase";

const ReorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1, "Must provide array of company IDs"),
});

export async function POST(request: NextRequest) {
  const adminAuth = await verifyAdminSession();
  if (!adminAuth.authorized || !adminAuth.user) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required" },
      { status: 403 }
    );
  }

  try {
    const json = await request.json();
    const parsed = ReorderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await reorderShowcaseCompanies(parsed.data.orderedIds, adminAuth.user.email);
    return NextResponse.json({ success: true, message: "Showcase companies reordered" });
  } catch (err: any) {
    console.error("Reorder showcase companies failed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
