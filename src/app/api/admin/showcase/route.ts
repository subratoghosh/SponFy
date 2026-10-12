import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyAdminSession } from "@/lib/admin/auth";
import {
  getAllShowcaseCompanies,
  createShowcaseCompany,
} from "@/lib/data/repositories/showcase";

const CreateShowcaseSchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters"),
  websiteUrl: z.string().trim().url("Must be a valid URL starting with http:// or https://"),
  logoUrl: z
    .string()
    .trim()
    .url("Logo must be a valid https URL")
    .startsWith("https://", "Logo URL must use https://")
    .nullable()
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().min(2, "Industry must be specified"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must not exceed 300 characters"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  isPartner: z.boolean().default(false),
});

export async function GET() {
  const adminAuth = await verifyAdminSession();
  if (!adminAuth.authorized || !adminAuth.user) {
    return NextResponse.json(
      { error: "Forbidden: Administrator role required" },
      { status: 403 }
    );
  }

  const companies = await getAllShowcaseCompanies();
  return NextResponse.json({ success: true, data: companies });
}

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
    const parsed = CreateShowcaseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, websiteUrl, logoUrl, industry, shortDescription, sortOrder, isVisible, isPartner } =
      parsed.data;

    const created = await createShowcaseCompany(
      {
        name,
        websiteUrl,
        logoUrl: logoUrl ? logoUrl : null,
        industry,
        shortDescription,
        sortOrder,
        isVisible,
        isPartner,
      },
      adminAuth.user.email
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    console.error("Create showcase company failed:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
