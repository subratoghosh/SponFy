import { prisma } from "@/lib/prisma";
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
import { Stage, DraftStatus, Campaign, Company, Contact, EmailDraft, Activity } from "@prisma/client";

export const prismaCampaignsRepo: CampaignsRepository = {
  async list(userId: string): Promise<Campaign[]> {
    return prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  async getById(userId: string, id: string): Promise<Campaign | null> {
    return prisma.campaign.findFirst({
      where: { id, userId },
    });
  },
  async create(userId: string, data: CreateCampaignInput): Promise<Campaign> {
    return prisma.campaign.create({
      data: {
        userId,
        name: data.name,
        eventType: data.eventType,
        audienceSize: data.audienceSize,
        location: data.location,
        targetAmount: data.targetAmount,
        preferredIndustries: data.preferredIndustries,
        tiers: data.tiers || [],
        deckUrl: data.deckUrl,
        description: data.description,
      },
    });
  },
  async update(userId: string, id: string, data: Partial<CreateCampaignInput>): Promise<Campaign> {
    // Ensure ownership
    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Campaign not found or access denied");
    return prisma.campaign.update({
      where: { id },
      data: {
        ...data,
      },
    });
  },
  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.campaign.delete({ where: { id } });
    return true;
  },
};

export const prismaSponsorsRepo: SponsorsRepository = {
  async list(userId: string, campaignId?: string): Promise<Company[]> {
    return prisma.company.findMany({
      where: {
        campaign: { userId },
        ...(campaignId ? { campaignId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },
  async getById(userId: string, id: string): Promise<Company | null> {
    return prisma.company.findFirst({
      where: {
        id,
        campaign: { userId },
      },
      include: {
        contacts: true,
        report: true,
        sources: true,
      },
    });
  },
  async create(userId: string, data: CreateCompanyInput): Promise<Company> {
    // Verify campaign ownership
    const camp = await prisma.campaign.findFirst({ where: { id: data.campaignId, userId } });
    if (!camp) throw new Error("Campaign not found or access denied");

    return prisma.company.create({
      data: {
        userId,
        campaignId: data.campaignId,
        name: data.name,
        domain: data.domain,
        industry: data.industry,
        stage: data.stage || "DISCOVERED",
        fitScore: data.fitScore ?? 50,
        whyRelevant: data.fitReason || null,
        pipelineValue: data.pipelineValue ?? 25000,
      },
    });
  },
  async updateStage(userId: string, id: string, stage: Stage): Promise<Company> {
    const existing = await prisma.company.findFirst({
      where: { id, campaign: { userId } },
    });
    if (!existing) throw new Error("Company not found or access denied");

    return prisma.company.update({
      where: { id },
      data: { stage },
    });
  },
  async update(userId: string, id: string, data: Partial<Company>): Promise<Company> {
    const existing = await prisma.company.findFirst({
      where: { id, campaign: { userId } },
    });
    if (!existing) throw new Error("Company not found or access denied");

    const { id: _id, userId: _uid, campaignId: _cid, ...rest } = data;
    return prisma.company.update({
      where: { id },
      data: rest as any,
    });
  },
  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.company.findFirst({
      where: { id, campaign: { userId } },
    });
    if (!existing) return false;
    await prisma.company.delete({ where: { id } });
    return true;
  },
};

export const prismaContactsRepo: ContactsRepository = {
  async listByCompany(userId: string, companyId: string): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        companyId,
        company: { campaign: { userId } },
      },
    });
  },
  async getById(userId: string, id: string): Promise<Contact | null> {
    return prisma.contact.findFirst({
      where: {
        id,
        company: { campaign: { userId } },
      },
    });
  },
  async create(userId: string, data: CreateContactInput): Promise<Contact> {
    const comp = await prisma.company.findFirst({
      where: { id: data.companyId, campaign: { userId } },
    });
    if (!comp) throw new Error("Company not found or access denied");

    return prisma.contact.create({
      data: {
        userId,
        companyId: data.companyId,
        name: data.name,
        role: data.title,
        email: data.email,
        sourceUrl: data.sourceUrl,
      },
    });
  },
  async update(userId: string, id: string, data: Partial<Contact>): Promise<Contact> {
    const existing = await prisma.contact.findFirst({
      where: { id, company: { campaign: { userId } } },
    });
    if (!existing) throw new Error("Contact not found or access denied");

    const { id: _id, userId: _uid, companyId: _cid, ...rest } = data;
    return prisma.contact.update({
      where: { id },
      data: rest,
    });
  },
  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.contact.findFirst({
      where: { id, company: { campaign: { userId } } },
    });
    if (!existing) return false;
    await prisma.contact.delete({ where: { id } });
    return true;
  },
};

export const prismaOutreachRepo: OutreachRepository = {
  async listDrafts(userId: string, companyId?: string): Promise<EmailDraft[]> {
    return prisma.emailDraft.findMany({
      where: {
        company: { campaign: { userId } },
        ...(companyId ? { companyId } : {}),
      },
      include: {
        company: true,
        contact: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  async getDraftById(userId: string, id: string): Promise<EmailDraft | null> {
    return prisma.emailDraft.findFirst({
      where: {
        id,
        company: { campaign: { userId } },
      },
      include: {
        company: true,
        contact: true,
      },
    });
  },
  async createDraft(userId: string, data: CreateDraftInput): Promise<EmailDraft> {
    const comp = await prisma.company.findFirst({
      where: { id: data.companyId, campaign: { userId } },
    });
    if (!comp) throw new Error("Company not found or access denied");

    return prisma.emailDraft.create({
      data: {
        userId,
        companyId: data.companyId,
        contactId: data.contactId,
        subject: data.subject,
        body: data.body,
        quality: { overall: data.qualityScore ?? 80, feedback: data.qualityFeedback || null } as any,
        status: "DRAFT",
        kind: "INITIAL",
      },
    });
  },
  async updateDraftStatus(userId: string, id: string, status: DraftStatus): Promise<EmailDraft> {
    const existing = await prisma.emailDraft.findFirst({
      where: { id, company: { campaign: { userId } } },
    });
    if (!existing) throw new Error("Draft not found or access denied");

    return prisma.emailDraft.update({
      where: { id },
      data: { status },
    });
  },
  async updateDraft(userId: string, id: string, data: Partial<EmailDraft>): Promise<EmailDraft> {
    const existing = await prisma.emailDraft.findFirst({
      where: { id, company: { campaign: { userId } } },
    });
    if (!existing) throw new Error("Draft not found or access denied");

    const { id: _id, userId: _uid, companyId: _cid, ...rest } = data;
    return prisma.emailDraft.update({
      where: { id },
      data: rest as any,
    });
  },
};

export const prismaRepliesRepo: RepliesRepository = {
  async listReplies(userId: string, limit: number = 50): Promise<any[]> {
    return prisma.replyAnalysis.findMany({
      where: {
        userId,
      },
      include: {
        message: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
  async getReplyById(userId: string, id: string): Promise<any | null> {
    return prisma.replyAnalysis.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        message: true,
      },
    });
  },
  async createAnalysis(userId: string, messageId: string, analysis: any): Promise<any> {
    const msg = await prisma.message.findFirst({
      where: { id: messageId, userId },
    });
    if (!msg) throw new Error("Message not found or access denied");

    return prisma.replyAnalysis.create({
      data: {
        userId,
        messageId,
        intent: analysis.intent || "INTERESTED",
        sentiment: String(analysis.sentiment || "positive"),
        confidence: Math.round(Number(analysis.confidence || 90)),
        summary: analysis.summary || "",
        questions: (analysis.questions as any) || [],
        requestedInfo: Array.isArray(analysis.requestedInfo)
          ? analysis.requestedInfo.join(", ")
          : analysis.requestedInfo || null,
        nextAction: analysis.nextAction || "",
        urgency: String(analysis.urgency || "MEDIUM"),
        meetingRequested: analysis.meetingRequested ?? false,
      },
    });
  },
};

export const prismaActivitiesRepo: ActivitiesRepository = {
  async listRecent(userId: string, campaignId?: string, limit: number = 20): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: {
        userId,
        ...(campaignId ? { company: { campaignId } } : {}),
      },
      include: {
        company: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
  async record(userId: string, act: any): Promise<Activity> {
    return prisma.activity.create({
      data: {
        userId,
        companyId: act.companyId || null,
        type: act.type,
        payload: act.payload || act.metadata || { title: act.title, description: act.description },
      },
    });
  },
};

export const prismaRepositories: RepositoryBundle = {
  campaigns: prismaCampaignsRepo,
  sponsors: prismaSponsorsRepo,
  contacts: prismaContactsRepo,
  outreach: prismaOutreachRepo,
  replies: prismaRepliesRepo,
  activities: prismaActivitiesRepo,
};
