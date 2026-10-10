import {
  Campaign,
  Company,
  Contact,
  EmailDraft,
  ReplyAnalysis,
  Activity,
  AiJob,
  GmailAccount,
  Suppression,
  Stage,
  DraftStatus,
} from "@prisma/client";

export interface CreateCampaignInput {
  name: string;
  eventType: string;
  audienceSize: number;
  location: string;
  targetAmount: number;
  preferredIndustries: string[];
  tiers?: any;
  deckUrl?: string | null;
  description?: string;
}

export interface CreateCompanyInput {
  campaignId: string;
  name: string;
  domain: string;
  industry: string;
  stage?: Stage;
  fitScore?: number;
  fitReason?: string | null;
  pipelineValue?: number;
}

export interface CreateContactInput {
  companyId: string;
  name: string;
  title: string;
  email: string;
  linkedinUrl?: string | null;
  sourceUrl?: string | null;
}

export interface CreateDraftInput {
  companyId: string;
  contactId: string;
  subject: string;
  body: string;
  qualityScore?: number;
  qualityFeedback?: string | null;
}

export interface CampaignsRepository {
  list(userId: string): Promise<Campaign[]>;
  getById(userId: string, id: string): Promise<Campaign | null>;
  create(userId: string, data: CreateCampaignInput): Promise<Campaign>;
  update(userId: string, id: string, data: Partial<CreateCampaignInput>): Promise<Campaign>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface SponsorsRepository {
  list(userId: string, campaignId?: string): Promise<Company[]>;
  getById(userId: string, id: string): Promise<Company | null>;
  create(userId: string, data: CreateCompanyInput): Promise<Company>;
  updateStage(userId: string, id: string, stage: Stage): Promise<Company>;
  update(userId: string, id: string, data: Partial<Company>): Promise<Company>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface ContactsRepository {
  listByCompany(userId: string, companyId: string): Promise<Contact[]>;
  getById(userId: string, id: string): Promise<Contact | null>;
  create(userId: string, data: CreateContactInput): Promise<Contact>;
  update(userId: string, id: string, data: Partial<Contact>): Promise<Contact>;
  delete(userId: string, id: string): Promise<boolean>;
}

export interface OutreachRepository {
  listDrafts(userId: string, companyId?: string): Promise<EmailDraft[]>;
  getDraftById(userId: string, id: string): Promise<EmailDraft | null>;
  createDraft(userId: string, data: CreateDraftInput): Promise<EmailDraft>;
  updateDraftStatus(userId: string, id: string, status: DraftStatus): Promise<EmailDraft>;
  updateDraft(userId: string, id: string, data: Partial<EmailDraft>): Promise<EmailDraft>;
}

export interface RepliesRepository {
  listReplies(userId: string, limit?: number): Promise<any[]>;
  getReplyById(userId: string, id: string): Promise<any | null>;
  createAnalysis(userId: string, messageId: string, analysis: Partial<ReplyAnalysis>): Promise<ReplyAnalysis>;
}

export interface ActivitiesRepository {
  listRecent(userId: string, campaignId?: string, limit?: number): Promise<Activity[]>;
  record(userId: string, activity: { companyId?: string; type: string; title: string; description?: string; metadata?: any }): Promise<Activity>;
}

export interface RepositoryBundle {
  campaigns: CampaignsRepository;
  sponsors: SponsorsRepository;
  contacts: ContactsRepository;
  outreach: OutreachRepository;
  replies: RepliesRepository;
  activities: ActivitiesRepository;
}
