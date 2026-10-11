import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { addSponsor, addContact } from "@/lib/data/repositories/sponsors";
import { parseCSV, mapCSVToCompanyInputs, ParsedCompanyInput } from "@/lib/csv/parser";
import { DuplicateCompanyError } from "@/lib/outreach/duplicates";
import { PipelineStage } from "@/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const contentType = req.headers.get("content-type") || "";

    let companyInputs: ParsedCompanyInput[] = [];
    let campaignId: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      campaignId = (formData.get("campaignId") as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
      }

      const fileText = await file.text();
      const { rows } = parseCSV(fileText);
      companyInputs = mapCSVToCompanyInputs(rows);
    } else {
      const body = await req.json();
      campaignId = body.campaignId;

      if (body.csvText) {
        const { rows } = parseCSV(body.csvText);
        companyInputs = mapCSVToCompanyInputs(rows);
      } else if (Array.isArray(body.companies)) {
        companyInputs = body.companies;
      }
    }

    if (!companyInputs || companyInputs.length === 0) {
      return NextResponse.json(
        { error: "No valid company records found in the uploaded file" },
        { status: 400 }
      );
    }

    // Resolve or create user's target campaign
    let targetCampaignId = campaignId;

    if (isDatabaseConfigured()) {

      if (!targetCampaignId) {
        const existingCampaign = await prisma.campaign.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        if (existingCampaign) {
          targetCampaignId = existingCampaign.id;
        } else {
          // Create default workspace campaign for the user
          const newCampaign = await prisma.campaign.create({
            data: {
              userId,
              name: `${session.user?.name || "Active"} Sponsorship Campaign`,
              eventType: "Technical Hackathon & Fest",
              audienceSize: 1500,
              location: "Campus Auditorium",
              targetAmount: 500000,
              preferredIndustries: ["Developer Tools", "AI & Cloud", "Fintech"],
              tiers: [
                { name: "Title Sponsor", minAmount: 150000, perks: ["Keynote", "Branded Track", "Hiring Booth"] },
                { name: "Track Partner", minAmount: 50000, perks: ["Dedicated Problem Statement", "Swag Kits"] },
              ],
            },
          });
          targetCampaignId = newCampaign.id;
        }
      }
    } else {
      targetCampaignId = targetCampaignId || "camp-sponfy-2026";
    }

    const added: any[] = [];
    const skipped: { name: string; reason: string }[] = [];

    const VALID_STAGES: Record<string, PipelineStage> = {
      discovered: "Discovered",
      researched: "Researched",
      qualified: "Qualified",
      contacted: "Contacted",
      replied: "Replied",
      interested: "Interested",
      negotiation: "Negotiation",
      committed: "Committed",
      lost: "Lost",
    };

    for (const item of companyInputs) {
      if (!item.name || item.name.trim().length === 0) continue;

      const stageKey = (item.stage || "discovered").toLowerCase().replace(/[^a-z]/g, "");
      const resolvedStage: PipelineStage = VALID_STAGES[stageKey] || "Discovered";

      try {
        const company = await addSponsor({
          campaignId: targetCampaignId!,
          name: item.name.trim(),
          website: item.website || "",
          industry: item.industry || "General Technology",
          description: item.description || "Imported from sponsor CSV directory",
          stage: resolvedStage,
          fitScore: item.fitScore || 80,
          pipelineValue: item.pipelineValue || 0,
          confidence: 85,
          signals: ["CSV Import Lead", "Manual Directory Record"],
          scoreBreakdown: [
            { factor: "Imported Record", points: 20, maxPoints: 20, reason: "Manual organization lead roster", positive: true },
          ],
          researchStatus: "pending",
        });

        // Add contact if present in CSV row
        if (item.contactName || item.contactEmail) {
          try {
            await addContact(company.id, {
              name: item.contactName || "Primary Point of Contact",
              email: item.contactEmail || "",
              role: item.contactRole || "Sponsorship / Partnerships Lead",
              status: item.contactEmail ? "verified" : "unknown",
            });
          } catch (contactErr) {
            console.warn("Failed to attach contact during CSV import:", contactErr);
          }
        }

        added.push(company);
      } catch (err) {
        if (err instanceof DuplicateCompanyError) {
          skipped.push({ name: item.name, reason: "Already exists in this campaign's pipeline" });
          continue;
        }
        console.error("Error inserting company from CSV:", item.name, err);
        skipped.push({ name: item.name, reason: "Database write error" });
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: added.length,
      skippedCount: skipped.length,
      campaignId: targetCampaignId,
      added,
      skipped,
    });
  } catch (err: any) {
    console.error("CSV Import error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
