import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAdminSession } from "@/lib/admin/auth";
import {
  updateShowcaseCompany,
  deleteShowcaseCompany,
} from "@/lib/data/repositories/showcase";

const UpdateShowcaseSchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters").optional(),
  websiteUrl: z.string().trim().url("Must be a valid URL").optional(),
  logoUrl: z
    .string()
    .trim()
    .url("Logo must be a valid https URL")
    .startsWith("https://", "Logo URL must use https://")
    .nullable()
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().min(2).optional(),
  shortDescription: z
    .string()
    .trim()
    .min(10)
    .max(300)
    .optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  isPartner: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await verifyAdminSession();
  if (!adminAuth.authorized || !adminAuth.user) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required" },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing company ID" }, { status: 400 });
  }

  try {
    const json = await request.json();
    const parsed = UpdateShowcaseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = { ...parsed.data };
    if (updates.logoUrl === "") {
      updates.logoUrl = null;
    }

    const updated = await updateShowcaseCompany(id, updates, adminAuth.user.email);
    if (!updated) {
      return NextResponse.json({ error: "Showcase company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Update showcase company failed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await verifyAdminSession();
  if (!adminAuth.authorized || !adminAuth.user) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required" },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing company ID" }, { status: 400 });
  }

  try {
    const success = await deleteShowcaseCompany(id, adminAuth.user.email);
    if (!success) {
      return NextResponse.json({ error: "Showcase company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Company deleted" });
  } catch (err: any) {
    console.error("Delete showcase company failed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
