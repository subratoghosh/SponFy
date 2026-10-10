import {
  CampaignsRepository,
  SponsorsRepository,
  ContactsRepository,
  OutreachRepository,
  RepliesRepository,
  ActivitiesRepository,
  RepositoryBundle,
  CreateCampaignInput,
  CreateCompanyInput,
  CreateContactInput,
  CreateDraftInput,
} from "../types";
import {
  DEMO_CAMPAIGN,
  DEMO_COMPANIES,
  DEMO_CONTACTS,
  DEMO_DRAFTS,
  DEMO_ACTIVITIES,
  DEMO_REPLIES,
} from "../seed-data";
import { Stage, DraftStatus, Campaign, Company, Contact, EmailDraft, Activity } from "@prisma/client";

// In-memory collections for session lifetime
let campaigns: any[] = [
  {
    ...DEMO_CAMPAIGN,
    userId: "usr-demo-lead",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let companies: any[] = DEMO_COMPANIES.map((c) => ({
  ...c,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

let contacts: any[] = DEMO_CONTACTS.map((c) => ({
  ...c,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

let drafts: any[] = DEMO_DRAFTS.map((d) => ({
  ...d,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

let activities: any[] = DEMO_ACTIVITIES.map((a) => ({
  ...a,
  userId: "usr-demo-lead",
  createdAt: new Date(a.createdAt),
}));

export const mockCampaignsRepo: CampaignsRepository = {
  async list(_userId: string): Promise<Campaign[]> {
    return [...campaigns];
  },
  async getById(_userId: string, id: string): Promise<Campaign | null> {
    return campaigns.find((c) => c.id === id) || null;
  },
  async create(userId: string, data: CreateCampaignInput): Promise<Campaign> {
    const created: any = {
      id: `camp-${Date.now()}`,
      userId,
      ...data,
      tiers: data.tiers || [],
      deckUrl: data.deckUrl || null,
      description: data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    campaigns.unshift(created);
    return created;
  },
  async update(_userId: string, id: string, data: Partial<CreateCampaignInput>): Promise<Campaign> {
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Campaign not found");
    campaigns[idx] = { ...campaigns[idx], ...data, updatedAt: new Date() };
    return campaigns[idx];
  },
  async delete(_userId: string, id: string): Promise<boolean> {
    campaigns = campaigns.filter((c) => c.id !== id);
    return true;
  },
};

export const mockSponsorsRepo: SponsorsRepository = {
  async list(_userId: string, campaignId?: string): Promise<Company[]> {
    if (campaignId) {
      return companies.filter((c) => c.campaignId === campaignId);
    }
    return [...companies];
  },
  async getById(_userId: string, id: string): Promise<Company | null> {
    return companies.find((c) => c.id === id) || null;
  },
  async create(_userId: string, data: CreateCompanyInput): Promise<Company> {
    const created: any = {
      id: `comp-${Date.now()}`,
      stage: data.stage || "DISCOVERED",
      fitScore: data.fitScore ?? 50,
      fitReason: data.fitReason || null,
      pipelineValue: data.pipelineValue ?? 25000,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    companies.unshift(created);
    return created;
  },
  async updateStage(_userId: string, id: string, stage: Stage): Promise<Company> {
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Company not found");
    companies[idx] = { ...companies[idx], stage, updatedAt: new Date() };
    return companies[idx];
  },
  async update(_userId: string, id: string, data: Partial<Company>): Promise<Company> {
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Company not found");
    companies[idx] = { ...companies[idx], ...data, updatedAt: new Date() };
    return companies[idx];
  },
  async delete(_userId: string, id: string): Promise<boolean> {
    companies = companies.filter((c) => c.id !== id);
    return true;
  },
};

export const mockContactsRepo: ContactsRepository = {
  async listByCompany(_userId: string, companyId: string): Promise<Contact[]> {
    return contacts.filter((c) => c.companyId === companyId);
  },
  async getById(_userId: string, id: string): Promise<Contact | null> {
    return contacts.find((c) => c.id === id) || null;
  },
  async create(_userId: string, data: CreateContactInput): Promise<Contact> {
    const created: any = {
      id: `cont-${Date.now()}`,
      status: "VALID",
      linkedinUrl: data.linkedinUrl || null,
      sourceUrl: data.sourceUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    contacts.push(created);
    return created;
  },
  async update(_userId: string, id: string, data: Partial<Contact>): Promise<Contact> {
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Contact not found");
    contacts[idx] = { ...contacts[idx], ...data, updatedAt: new Date() };
    return contacts[idx];
  },
  async delete(_userId: string, id: string): Promise<boolean> {
    contacts = contacts.filter((c) => c.id !== id);
    return true;
  },
};

export const mockOutreachRepo: OutreachRepository = {
  async listDrafts(_userId: string, companyId?: string): Promise<EmailDraft[]> {
    if (companyId) return drafts.filter((d) => d.companyId === companyId);
    return [...drafts];
  },
  async getDraftById(_userId: string, id: string): Promise<EmailDraft | null> {
    return drafts.find((d) => d.id === id) || null;
  },
  async createDraft(_userId: string, data: CreateDraftInput): Promise<EmailDraft> {
    const created: any = {
      id: `drf-${Date.now()}`,
      status: "DRAFT",
      kind: "INITIAL",
      qualityScore: data.qualityScore ?? 85,
      qualityFeedback: data.qualityFeedback || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    drafts.unshift(created);
    return created;
  },
  async updateDraftStatus(_userId: string, id: string, status: DraftStatus): Promise<EmailDraft> {
    const idx = drafts.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Draft not found");
    drafts[idx] = { ...drafts[idx], status, updatedAt: new Date() };
    return drafts[idx];
  },
  async updateDraft(_userId: string, id: string, data: Partial<EmailDraft>): Promise<EmailDraft> {
    const idx = drafts.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Draft not found");
    drafts[idx] = { ...drafts[idx], ...data, updatedAt: new Date() };
    return drafts[idx];
  },
};

export const mockRepliesRepo: RepliesRepository = {
  async listReplies(_userId: string, limit: number = 50): Promise<any[]> {
    return DEMO_REPLIES.slice(0, limit);
  },
  async getReplyById(_userId: string, id: string): Promise<any | null> {
    return DEMO_REPLIES.find((r) => r.id === id) || null;
  },
  async createAnalysis(_userId: string, _messageId: string, analysis: any): Promise<any> {
    return {
      id: `ana-${Date.now()}`,
      createdAt: new Date(),
      ...analysis,
    };
  },
};

export const mockActivitiesRepo: ActivitiesRepository = {
  async listRecent(_userId: string, _campaignId?: string, limit: number = 20): Promise<Activity[]> {
    return activities.slice(0, limit);
  },
  async record(userId: string, act: any): Promise<Activity> {
    const created: any = {
      id: `act-${Date.now()}`,
      userId,
      companyId: act.companyId || null,
      type: act.type,
      title: act.title,
      description: act.description || null,
      metadata: act.metadata || null,
      createdAt: new Date(),
    };
    activities.unshift(created);
    return created;
  },
};

export const mockRepositories: RepositoryBundle = {
  campaigns: mockCampaignsRepo,
  sponsors: mockSponsorsRepo,
  contacts: mockContactsRepo,
  outreach: mockOutreachRepo,
  replies: mockRepliesRepo,
  activities: mockActivitiesRepo,
};
