import { Company, PipelineStage, Contact } from "@/types";
import { DEMO_COMPANIES } from "../seed-data";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { Stage, ContactStatus, ResearchStatus } from "@prisma/client";

let sponsorsStore: Company[] = [...DEMO_COMPANIES];

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
  DISCOVERED: "DISCOVERED",
  RESEARCHED: "RESEARCHED",
  QUALIFIED: "QUALIFIED",
  CONTACT_FOUND: "CONTACT_FOUND",
  DRAFT_READY: "DRAFT_READY",
  APPROVED: "APPROVED",
  CONTACTED: "CONTACTED",
  REPLIED: "REPLIED",
  INTERESTED: "INTERESTED",
  NEGOTIATION: "NEGOTIATION",
  COMMITTED: "COMMITTED",
  LOST: "LOST",
};

const PIPELINE_STAGE_MAP: Record<string, PipelineStage> = {
  DISCOVERED: "Discovered",
  RESEARCHED: "Researched",
  QUALIFIED: "Qualified",
  CONTACT_FOUND: "Contact Found",
  DRAFT_READY: "Draft Ready",
  APPROVED: "Approved",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  INTERESTED: "Interested",
  NEGOTIATION: "Negotiation",
  COMMITTED: "Committed",
  LOST: "Lost",
};

export async function getSponsors(campaignId?: string): Promise<Company[]> {
  if (isDatabaseConfigured()) {
    try {
      const companies = await prisma.company.findMany({
        where: campaignId ? { campaignId } : undefined,
        include: {
          contacts: true,
          report: true,
          sources: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (companies.length > 0) {
        return companies.map((c) => ({
          id: c.id,
          name: c.name,
          website: c.website || "",
          industry: c.industry || "",
          description: c.description || "",
          campaignId: c.campaignId,
          stage: PIPELINE_STAGE_MAP[c.stage] || "Discovered",
          fitScore: c.fitScore ?? 0,
          scoreBreakdown: (c.scoreBreakdown as any) || [],
          pipelineValue: c.pipelineValue,
          signals: (c.signals as any) || [],
          confidence: c.confidence ?? 0,
          researchStatus: (c.researchStatus === "DONE" ? "completed" : c.researchStatus === "FAILED" ? "failed" : "pending") as any,
          contacts: c.contacts.map((con) => ({
            id: con.id,
            companyId: con.companyId,
            name: con.name || "",
            role: con.role || "",
            email: con.email || "",
            status: (con.status === "VERIFIED" ? "verified" : con.status === "PUBLIC" ? "public" : "unknown") as any,
            sourceUrl: con.sourceUrl || undefined,
            createdAt: con.createdAt.toISOString(),
          })),
          sources: c.sources.map((s) => ({
            url: s.url,
            title: s.title || "",
            snippet: s.snippet || "",
          })),
          researchReport: c.report
            ? {
                sections: (c.report.sections as any) || {},
                recommendedAngle: c.report.recommendedAngle || "",
              }
            : undefined,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Prisma getSponsors failed, falling back to memory store:", err);
    }
  }

  if (campaignId) {
    return sponsorsStore.filter((c) => c.campaignId === campaignId);
  }
  return [...sponsorsStore];
}

export async function getSponsorById(id: string): Promise<Company | null> {
  if (isDatabaseConfigured()) {
    try {
      const c = await prisma.company.findUnique({
        where: { id },
        include: {
          contacts: true,
          report: true,
          sources: true,
        },
      });

      if (c) {
        return {
          id: c.id,
          name: c.name,
          website: c.website || "",
          industry: c.industry || "",
          description: c.description || "",
          campaignId: c.campaignId,
          stage: PIPELINE_STAGE_MAP[c.stage] || "Discovered",
          fitScore: c.fitScore ?? 0,
          scoreBreakdown: (c.scoreBreakdown as any) || [],
          pipelineValue: c.pipelineValue,
          signals: (c.signals as any) || [],
          confidence: c.confidence ?? 0,
          researchStatus: (c.researchStatus === "DONE" ? "completed" : c.researchStatus === "FAILED" ? "failed" : "pending") as any,
          contacts: c.contacts.map((con) => ({
            id: con.id,
            companyId: con.companyId,
            name: con.name || "",
            role: con.role || "",
            email: con.email || "",
            status: (con.status === "VERIFIED" ? "verified" : con.status === "PUBLIC" ? "public" : "unknown") as any,
            sourceUrl: con.sourceUrl || undefined,
            createdAt: con.createdAt.toISOString(),
          })),
          sources: c.sources.map((s) => ({
            url: s.url,
            title: s.title || "",
            snippet: s.snippet || "",
          })),
          researchReport: c.report
            ? {
                sections: (c.report.sections as any) || {},
                recommendedAngle: c.report.recommendedAngle || "",
              }
            : undefined,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Prisma getSponsorById failed, falling back to memory store:", err);
    }
  }

  const found = sponsorsStore.find((c) => c.id === id);
  return found || null;
}

export async function updateSponsorStage(id: string, stage: PipelineStage): Promise<Company | null> {
  if (isDatabaseConfigured()) {
    try {
      const dbStage = STAGE_MAP[stage] || "DISCOVERED";
      const updated = await prisma.company.update({
        where: { id },
        data: { stage: dbStage },
      });
      return {
        ...updated,
        website: updated.website || "",
        industry: updated.industry || "",
        stage: PIPELINE_STAGE_MAP[updated.stage] || stage,
        fitScore: updated.fitScore ?? 0,
        confidence: updated.confidence ?? 0,
        scoreBreakdown: (updated.scoreBreakdown as any) || [],
        signals: (updated.signals as any) || [],
        description: updated.description || "",
        researchStatus: (updated.researchStatus === "DONE" ? "completed" : updated.researchStatus === "FAILED" ? "failed" : "pending") as any,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma updateSponsorStage failed, falling back to memory store:", err);
    }
  }

  const idx = sponsorsStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  sponsorsStore[idx] = {
    ...sponsorsStore[idx],
    stage,
    updatedAt: new Date().toISOString(),
  };
  return sponsorsStore[idx];
}

export async function updateSponsor(id: string, updates: Partial<Company>): Promise<Company | null> {
  if (isDatabaseConfigured()) {
    try {
      const dbStage = updates.stage ? STAGE_MAP[updates.stage] : undefined;
      const dbResearchStatus: ResearchStatus | undefined =
        updates.researchStatus === "completed"
          ? "DONE"
          : updates.researchStatus === "failed"
          ? "FAILED"
          : updates.researchStatus === "pending"
          ? "RUNNING"
          : undefined;

      const updated = await prisma.company.update({
        where: { id },
        data: {
          name: updates.name,
          website: updates.website,
          industry: updates.industry,
          description: updates.description,
          stage: dbStage,
          fitScore: updates.fitScore,
          scoreBreakdown: updates.scoreBreakdown ? (updates.scoreBreakdown as any) : undefined,
          pipelineValue: updates.pipelineValue,
          signals: updates.signals ? (updates.signals as any) : undefined,
          confidence: updates.confidence,
          researchStatus: dbResearchStatus,
        },
      });
      return {
        ...updated,
        website: updated.website || "",
        industry: updated.industry || "",
        stage: PIPELINE_STAGE_MAP[updated.stage] || "Discovered",
        fitScore: updated.fitScore ?? 0,
        confidence: updated.confidence ?? 0,
        scoreBreakdown: (updated.scoreBreakdown as any) || [],
        signals: (updated.signals as any) || [],
        description: updated.description || "",
        researchStatus: (updated.researchStatus === "DONE" ? "completed" : updated.researchStatus === "FAILED" ? "failed" : "pending") as any,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma updateSponsor failed, falling back to memory store:", err);
    }
  }

  const idx = sponsorsStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  sponsorsStore[idx] = {
    ...sponsorsStore[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return sponsorsStore[idx];
}

export async function addSponsor(company: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> {
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";
      const dbStage = company.stage ? STAGE_MAP[company.stage] || "DISCOVERED" : "DISCOVERED";
      const created = await prisma.company.create({
        data: {
          userId,
          campaignId: company.campaignId,
          name: company.name,
          website: company.website,
          industry: company.industry,
          description: company.description || "",
          stage: dbStage,
          fitScore: company.fitScore || 0,
          scoreBreakdown: (company.scoreBreakdown as any) || [],
          pipelineValue: company.pipelineValue || 0,
          signals: (company.signals as any) || [],
          confidence: company.confidence || 0,
          researchStatus: "NOT_STARTED",
        },
      });
      return {
        ...created,
        website: created.website || "",
        industry: created.industry || "",
        stage: PIPELINE_STAGE_MAP[created.stage] || "Discovered",
        fitScore: created.fitScore ?? 0,
        confidence: created.confidence ?? 0,
        scoreBreakdown: (created.scoreBreakdown as any) || [],
        signals: (created.signals as any) || [],
        description: created.description || "",
        researchStatus: "pending",
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma addSponsor failed, falling back to memory store:", err);
    }
  }

  const newCompany: Company = {
    ...company,
    id: `comp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sponsorsStore.unshift(newCompany);
  return newCompany;
}

export async function addContact(companyId: string, contact: Omit<Contact, "id" | "companyId" | "createdAt">): Promise<Contact | null> {
  if (isDatabaseConfigured()) {
    try {
      const user = await prisma.user.findFirst();
      const userId = user?.id || "usr-demo-lead";
      const dbStatus: ContactStatus =
        contact.status === "verified"
          ? "VERIFIED"
          : contact.status === "public"
          ? "PUBLIC"
          : "UNKNOWN";

      const created = await prisma.contact.create({
        data: {
          userId,
          companyId,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          status: dbStatus,
          sourceUrl: contact.sourceUrl,
        },
      });
      return {
        id: created.id,
        companyId: created.companyId,
        name: created.name || "",
        role: created.role || "",
        email: created.email || "",
        status: (created.status === "VERIFIED" ? "verified" : created.status === "PUBLIC" ? "public" : "unknown") as any,
        sourceUrl: created.sourceUrl || undefined,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma addContact failed, falling back to memory store:", err);
    }
  }

  const company = sponsorsStore.find((c) => c.id === companyId);
  if (!company) return null;

  const newContact: Contact = {
    ...contact,
    id: `con-${Date.now()}`,
    companyId,
    createdAt: new Date().toISOString(),
  };

  if (!company.contacts) {
    company.contacts = [];
  }
  company.contacts.push(newContact);
  return newContact;
}
