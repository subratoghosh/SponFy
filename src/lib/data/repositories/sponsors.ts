import { Company, PipelineStage, Contact, SourceItem } from "@/types";
import { DEMO_COMPANIES } from "../seed-data";

let sponsorsStore: Company[] = [...DEMO_COMPANIES];

export async function getSponsors(campaignId?: string): Promise<Company[]> {
  if (campaignId) {
    return sponsorsStore.filter((c) => c.campaignId === campaignId);
  }
  return [...sponsorsStore];
}

export async function getSponsorById(id: string): Promise<Company | null> {
  const found = sponsorsStore.find((c) => c.id === id);
  return found || null;
}

export async function updateSponsorStage(id: string, stage: PipelineStage): Promise<Company | null> {
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
