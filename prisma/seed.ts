import { PrismaClient, Stage, ContactStatus } from "@prisma/client";
import { DEMO_CAMPAIGN, DEMO_COMPANIES, DEMO_CONTACTS } from "../src/lib/data/seed-data";

const prisma = new PrismaClient();

const STAGE_MAP: Record<string, Stage> = {
  Discovered: "DISCOVERED",
  Researched: "RESEARCHED",
  Qualified: "QUALIFIED",
  "Contact Found": "CONTACT_FOUND",
  "Draft Ready": "DRAFT_READY",
  Approved: "APPROVED",
  Contacted: "CONTACTED",
  Replied: "REPLIED",
  Interested: "INTERESTED",
  Negotiation: "NEGOTIATION",
  Committed: "COMMITTED",
  Lost: "LOST",
};

async function main() {
  console.log("Seeding SponFy database...");

  // 1. Create default demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@sponfy.dev" },
    update: {},
    create: {
      id: "usr-demo-lead",
      name: "SponFy Fest Lead",
      email: "demo@sponfy.dev",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=sponfy",
      dailySendCap: 30,
    },
  });

  // 2. Create demo campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: DEMO_CAMPAIGN.id },
    update: {
      userId: demoUser.id,
      name: DEMO_CAMPAIGN.name,
      eventType: DEMO_CAMPAIGN.eventType,
      audienceSize: DEMO_CAMPAIGN.audienceSize,
      location: DEMO_CAMPAIGN.location,
      targetAmount: DEMO_CAMPAIGN.targetAmount,
      preferredIndustries: DEMO_CAMPAIGN.preferredIndustries,
      tiers: DEMO_CAMPAIGN.tiers as any,
      description: DEMO_CAMPAIGN.description,
    },
    create: {
      id: DEMO_CAMPAIGN.id,
      userId: demoUser.id,
      name: DEMO_CAMPAIGN.name,
      eventType: DEMO_CAMPAIGN.eventType,
      audienceSize: DEMO_CAMPAIGN.audienceSize,
      location: DEMO_CAMPAIGN.location,
      targetAmount: DEMO_CAMPAIGN.targetAmount,
      preferredIndustries: DEMO_CAMPAIGN.preferredIndustries,
      tiers: DEMO_CAMPAIGN.tiers as any,
      description: DEMO_CAMPAIGN.description,
    },
  });

  // 3. Upsert companies
  for (const comp of DEMO_COMPANIES) {
    const domain = comp.website
      ? comp.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase()
      : comp.name.toLowerCase().replace(/\s+/g, "") + ".com";

    const stage: Stage = comp.stage ? STAGE_MAP[comp.stage] || "DISCOVERED" : "DISCOVERED";

    await prisma.company.upsert({
      where: { id: comp.id },
      update: {
        userId: demoUser.id,
        campaignId: campaign.id,
        name: comp.name,
        website: comp.website,
        domain,
        industry: comp.industry,
        stage,
        fitScore: comp.fitScore,
        whyRelevant: comp.description || "",
        pipelineValue: comp.pipelineValue,
      },
      create: {
        id: comp.id,
        userId: demoUser.id,
        campaignId: campaign.id,
        name: comp.name,
        website: comp.website,
        domain,
        industry: comp.industry,
        stage,
        fitScore: comp.fitScore,
        whyRelevant: comp.description || "",
        pipelineValue: comp.pipelineValue,
      },
    });
  }

  // 4. Upsert contacts
  for (const contact of DEMO_CONTACTS) {
    const status: ContactStatus =
      contact.status === "verified"
        ? "VERIFIED"
        : contact.status === "public"
        ? "PUBLIC"
        : "UNKNOWN";

    await prisma.contact.upsert({
      where: { id: contact.id },
      update: {
        userId: demoUser.id,
        companyId: contact.companyId,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        sourceUrl: contact.sourceUrl,
        status,
      },
      create: {
        id: contact.id,
        userId: demoUser.id,
        companyId: contact.companyId,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        sourceUrl: contact.sourceUrl,
        status,
      },
    });
  }

  console.log(
    "Seeding complete. Seeded 1 campaign, %d companies, %d contacts.",
    DEMO_COMPANIES.length,
    DEMO_CONTACTS.length
  );
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
