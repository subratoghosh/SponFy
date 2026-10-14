-- Migration: 20261015_email_safety_verification_tracking
-- Additive non-destructive migration for Email Verification and Engagement Tracking

CREATE TABLE IF NOT EXISTS "email_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subStatus" TEXT,
    "score" INTEGER,
    "isDeliverable" BOOLEAN NOT NULL DEFAULT false,
    "isDisposable" BOOLEAN NOT NULL DEFAULT false,
    "isAcceptAll" BOOLEAN NOT NULL DEFAULT false,
    "rawResponse" JSONB DEFAULT '{}',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "email_tracking_events" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_tracking_events_pkey" PRIMARY KEY ("id")
);

-- Unique index on email for verification lookups
CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_email_key" ON "email_verifications"("email");

-- Indices for performance
CREATE INDEX IF NOT EXISTS "email_verifications_email_idx" ON "email_verifications"("email");
CREATE INDEX IF NOT EXISTS "email_verifications_status_idx" ON "email_verifications"("status");
CREATE INDEX IF NOT EXISTS "email_verifications_expiresAt_idx" ON "email_verifications"("expiresAt");

CREATE INDEX IF NOT EXISTS "email_tracking_events_messageId_idx" ON "email_tracking_events"("messageId");
CREATE INDEX IF NOT EXISTS "email_tracking_events_type_idx" ON "email_tracking_events"("type");
CREATE INDEX IF NOT EXISTS "email_tracking_events_createdAt_idx" ON "email_tracking_events"("createdAt");
