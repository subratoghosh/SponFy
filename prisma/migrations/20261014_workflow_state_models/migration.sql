-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "sponsorApproved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "email_drafts" ADD COLUMN     "attentionReason" TEXT,
ADD COLUMN     "needsAttention" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "discovery_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "domain" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "whyRelevant" TEXT,
    "sponsorshipType" TEXT,
    "fitScore" INTEGER,
    "pipelineValue" INTEGER NOT NULL DEFAULT 0,
    "signals" JSONB NOT NULL DEFAULT '[]',
    "confidence" INTEGER,
    "researchStatus" "ResearchStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "scoreBreakdown" JSONB,
    "query" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discovery_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discovery_results_userId_campaignId_idx" ON "discovery_results"("userId", "campaignId");

-- CreateIndex
CREATE INDEX "discovery_results_expiresAt_idx" ON "discovery_results"("expiresAt");

-- AddForeignKey
ALTER TABLE "discovery_results" ADD CONSTRAINT "discovery_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovery_results" ADD CONSTRAINT "discovery_results_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

