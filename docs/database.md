# SponFy — Database (database.md)

> PostgreSQL on Neon, accessed only through Prisma in `lib/data/prisma/*`. This file contains the canonical schema. If code needs a field that isn't here, update this file and the migration together — never add undocumented columns.

## Conventions
- Every domain table has `userId` (owner) with `onDelete: Cascade` from `User`.
- IDs: `cuid()` strings. Timestamps: `createdAt`, `updatedAt`.
- Money: INR as `Int` (whole rupees).
- JSON columns have a Zod schema in `lib/data/types.ts`; never read JSON without parsing it.
- Enums mirror `lib/config/*`. Change both together.
- Indexes on `(userId, campaignId)`, `(userId, stage)`, `gmailThreadId`, and foreign keys used in filters.

## prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
// NOTE: if the installed Prisma major version moves datasource URLs to prisma.config.ts
// or requires a driver adapter for Neon, follow that version's official docs instead.

enum UserRole { USER ADMIN }
enum Stage { DISCOVERED RESEARCHED QUALIFIED CONTACT_FOUND DRAFT_READY APPROVED CONTACTED REPLIED INTERESTED NEGOTIATION COMMITTED LOST }
enum ContactStatus { VERIFIED PUBLIC NEEDS_VERIFICATION UNKNOWN }
enum DraftStatus { DRAFT APPROVED SENDING SENT FAILED }
enum DraftKind { INITIAL FOLLOWUP REPLY }
enum Direction { OUTBOUND INBOUND }
enum Intent { INTERESTED POSITIVE NEEDS_INFO NEGOTIATING NOT_INTERESTED MAYBE_LATER OUT_OF_OFFICE UNCLEAR }
enum JobType { DISCOVERY RESEARCH OUTREACH REPLY_ANALYSIS INSIGHTS }
enum JobStatus { QUEUED RUNNING COMPLETED FAILED }
enum TaskStatus { PENDING DRAFTED SENT CANCELLED SKIPPED }
enum GmailStatus { ACTIVE REVOKED }
enum ResearchStatus { NOT_STARTED RUNNING DONE FAILED }

// ---------- Auth.js (standard adapter models) ----------
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  orgName       String?
  orgType       String?
  onboarded     Boolean   @default(false)
  dailySendCap  Int       @default(30)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  campaigns     Campaign[]
  companies     Company[]
  contacts      Contact[]
  drafts        EmailDraft[]
  messages      Message[]
  analyses      ReplyAnalysis[]
  sequences     FollowupSequence[]
  tasks         FollowupTask[]
  activities    Activity[]
  jobs          AiJob[]
  suppressions  Suppression[]
  insights      Insight[]
  gmailAccount  GmailAccount?
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ---------- Domain ----------
model Campaign {
  id                  String   @id @default(cuid())
  userId              String
  name                String
  eventType           String
  audienceSize        Int
  location            String
  targetAmount        Int
  preferredIndustries String[]
  tiers               Json     @default("[]")   // [{name, amount, perks[]}]
  deckUrl             String?
  description         String?
  archived            Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  companies Company[]
  insights  Insight[]
  jobs      AiJob[]
  @@index([userId])
}

model Company {
  id              String         @id @default(cuid())
  userId          String
  campaignId      String
  name            String
  website         String?
  domain          String?                       // normalised, for dedupe
  industry        String?
  description     String?
  whyRelevant     String?
  sponsorshipType String?
  stage           Stage          @default(DISCOVERED)
  fitScore        Int?
  scoreBreakdown  Json?                         // [{factor, points, maxPoints, reason, positive}]
  pipelineValue   Int            @default(0)
  signals         Json           @default("[]") // [{label, url?, date?}] recent public signals
  confidence      Int?                          // 0-100
  researchStatus  ResearchStatus @default(NOT_STARTED)
  nextAction      Json?                         // {action, reason, generatedAt}
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign   Campaign        @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  report     ResearchReport?
  sources    Source[]
  contacts   Contact[]
  drafts     EmailDraft[]
  activities Activity[]
  sequences  FollowupSequence[]
  @@unique([campaignId, domain])
  @@index([userId, campaignId])
  @@index([userId, stage])
}

model ResearchReport {
  id               String   @id @default(cuid())
  companyId        String   @unique
  userId           String
  sections         Json     // {overview, products[], audience, recentInitiatives[], programs[], opportunities[], publicContactInfo}
  recommendedAngle String?
  createdAt        DateTime @default(now())
  company          Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model Source {
  id        String   @id @default(cuid())
  companyId String
  userId    String
  url       String
  title     String?
  snippet   String?
  createdAt DateTime @default(now())
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  @@index([companyId])
}

model Contact {
  id         String        @id @default(cuid())
  userId     String
  companyId  String
  name       String?
  role       String?
  email      String?
  status     ContactStatus @default(UNKNOWN)
  sourceUrl  String?                      // REQUIRED when status = PUBLIC (enforced in service)
  bounced    Boolean       @default(false)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  company    Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  drafts     EmailDraft[]
  @@index([userId, companyId])
}

model EmailDraft {
  id         String      @id @default(cuid())
  userId     String
  companyId  String
  contactId  String?
  kind       DraftKind   @default(INITIAL)
  subject    String
  body       String      @db.Text
  quality    Json?       // {personalization, relevance, clarity, cta, professionalism, overall, suggestions[]}
  status     DraftStatus @default(DRAFT)
  approvedAt DateTime?
  sentAt     DateTime?
  error      String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  company    Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  contact    Contact?    @relation(fields: [contactId], references: [id], onDelete: SetNull)
  messages   Message[]
  @@index([userId, status])
  @@index([companyId])
}

model Message {
  id             String    @id @default(cuid())
  userId         String
  companyId      String?
  draftId        String?
  gmailMessageId String?   @unique
  gmailThreadId  String?
  direction      Direction
  fromEmail      String?
  toEmail        String?
  subject        String?
  body           String    @db.Text
  isMock         Boolean   @default(false)
  sentAt         DateTime
  createdAt      DateTime  @default(now())
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  draft          EmailDraft? @relation(fields: [draftId], references: [id], onDelete: SetNull)
  analysis       ReplyAnalysis?
  @@index([userId, gmailThreadId])
  @@index([companyId])
}

model ReplyAnalysis {
  id               String   @id @default(cuid())
  userId           String
  messageId        String   @unique
  intent           Intent
  sentiment        String
  confidence       Int
  summary          String
  questions        Json     @default("[]")
  requestedInfo    String?
  nextAction       String
  urgency          String
  meetingRequested Boolean  @default(false)
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  message          Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model FollowupSequence {
  id          String   @id @default(cuid())
  userId      String
  companyId   String
  steps       Json     // [{waitDays, kind}] default [{4},{7}]
  maxFollowups Int     @default(2)
  active      Boolean  @default(true)
  stoppedReason String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  tasks       FollowupTask[]
  @@index([userId, active])
}

model FollowupTask {
  id          String     @id @default(cuid())
  userId      String
  sequenceId  String
  dueAt       DateTime
  status      TaskStatus @default(PENDING)
  recommendation Json?   // {shouldFollowUp, reason}
  draftId     String?
  createdAt   DateTime   @default(now())
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  sequence    FollowupSequence @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  @@index([userId, status, dueAt])
}

model Activity {
  id        String   @id @default(cuid())
  userId    String
  companyId String?
  type      String   // e.g. company_discovered, research_completed, contact_added, draft_approved, email_sent, reply_received, stage_changed
  payload   Json     @default("{}")
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   Company? @relation(fields: [companyId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
  @@index([companyId, createdAt])
}

model AiJob {
  id         String    @id @default(cuid())
  userId     String
  campaignId String?
  companyId  String?
  type       JobType
  status     JobStatus @default(QUEUED)
  step       String?
  progress   Int       @default(0)   // 0-100
  counts     Json?                   // {found, researched, scored}
  error      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign   Campaign? @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  @@index([userId, status])
}

model GmailAccount {
  id               String      @id @default(cuid())
  userId           String      @unique
  email            String
  refreshTokenEnc  String      @db.Text   // AES-256-GCM, see lib/crypto.ts
  accessTokenEnc   String?     @db.Text
  expiresAt        DateTime?
  scopes           String
  status           GmailStatus @default(ACTIVE)
  lastSyncAt       DateTime?
  createdAt        DateTime    @default(now())
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Suppression {
  id        String   @id @default(cuid())
  userId    String
  email     String
  reason    String   // not_interested | bounced | manual
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, email])
}

model Insight {
  id          String   @id @default(cuid())
  userId      String
  campaignId  String
  text        String   @db.Text
  basis       Json?    // {sentCount, repliesCount} the insight was computed from
  generatedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  @@index([userId, campaignId])
}

model ShowcaseCompany {
  id               String   @id @default(cuid())
  name             String
  websiteUrl       String
  logoUrl          String?
  industry         String
  shortDescription String   @db.Text
  sortOrder        Int      @default(0)
  isVisible        Boolean  @default(true)
  isPartner        Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([isVisible, sortOrder])
  @@map("showcase_companies")
}

model AdminLog {
  id         String   @id @default(cuid())
  adminEmail String
  action     String
  targetType String?
  targetId   String?
  details    Json?
  createdAt  DateTime @default(now())

  @@index([adminEmail, createdAt])
  @@index([action])
  @@map("admin_logs")
}
```

## Key invariants (enforce in services, not just the DB)
1. `Contact.status = PUBLIC` requires `sourceUrl`.
2. A draft can move to SENDING only from APPROVED. Any edit to subject/body/recipient resets APPROVED → DRAFT.
3. Send is blocked if recipient is in `Suppression`, `Contact.bounced`, or daily cap reached (count of OUTBOUND messages for `userId` since local midnight ≥ `dailySendCap`).
4. Stage changes always create an `Activity`.
5. NOT_INTERESTED reply → company stage LOST, add `Suppression`, cancel active sequences.
6. Gmail tokens are only ever stored via `lib/crypto.ts`.

## Seed (prisma/seed.ts and mock repositories share one source: `lib/data/seed-data.ts`)
Campaign "SponFy Hackathon 2026" with ~24 companies across all stages (realistic names of well-known developer-tool/cloud/fintech/SaaS/EdTech companies are acceptable as demo data but must be labelled demo and contacts must use `example.com`-style placeholder emails, never real people), ~12 sent messages, ~7 inbound replies with analyses covering all intents, 60 days of activity with a believable upward trend.
