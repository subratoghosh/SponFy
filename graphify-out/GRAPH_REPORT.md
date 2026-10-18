# Graph Report - SponFy  (2026-10-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1562 nodes · 5153 edges · 73 communities (62 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `24aa6ac3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TopBar.tsx
- replies/page.tsx
- react
- Input
- Skeleton
- rate-limit.ts
- discovery-graph.ts
- isDatabaseConfigured
- verification/index.ts
- next
- utils.ts
- bulk-send/route.ts
- cn
- discover/page.tsx
- Button
- sponsors.ts
- workflow-integration.test.ts
- src/app/layout.tsx
- mock/index.ts
- button.tsx
- Campaign
- prisma.ts
- package.json
- sponsors/page.tsx
- outreach/page.tsx
- dependencies
- admin.ts
- showcase.ts
- auth-guard.ts
- Company
- types/index.ts
- AdminAnalyticsView.tsx
- lib/auth.ts
- verifyAdminSession
- prisma/index.ts
- factory.ts
- compilerOptions
- research-graph.ts
- workflow-routes-and-safety.test.ts
- gmail/index.ts
- AdminOverviewView.tsx
- getSponsors
- settings.ts
- memory-store.ts
- devDependencies
- services/scoring.ts
- scripts
- generate-pwa-icons.mjs
- open/route.ts
- contact-discovery.ts
- vitest
- AdminUsersView.tsx
- data/index.ts
- replies.ts
- foundation.test.ts
- SponFy Product & Architecture Specification
- RealGmailClient
- callback/route.ts
- (marketing)/showcase/page.tsx
- rules
- @prisma/client
- faq/page.tsx
- SponsorsRepository
- CampaignsRepository
- ContactsRepository
- OutreachRepository
- GrokRelevanceVerifier
- next.config.ts
- postinstall.js
- tailwindcss
- postcss.config.mjs
- sw.js
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `react` - 164 edges
2. `isDatabaseConfigured()` - 150 edges
3. `next` - 147 edges
4. `Button` - 133 edges
5. `lucide-react` - 119 edges
6. `cn()` - 71 edges
7. `requireAuth()` - 64 edges
8. `Company` - 59 edges
9. `auth` - 57 edges
10. `useToast()` - 47 edges

## Surprising Connections (you probably didn't know these)
- `freshDraftForUncontactedCompany()` --calls--> `getMessages()`  [EXTRACTED]
  tests/outreach-safety.test.ts → src/lib/data/repositories/outreach.ts
- `freshDraftForUncontactedCompany()` --calls--> `createDraft()`  [EXTRACTED]
  tests/outreach-safety.test.ts → src/lib/data/repositories/outreach.ts
- `freshDraftForUncontactedCompany()` --calls--> `getSponsors()`  [EXTRACTED]
  tests/outreach-safety.test.ts → src/lib/data/repositories/sponsors.ts
- `Next.js 15, Prisma ORM & Neon Serverless Stack` --conceptually_related_to--> `SponFy Product & Architecture Specification`  [INFERRED]
  README.md → docs/superpowers/specs/2026-10-08-sponfy-design.md
- `Props` --references--> `Campaign`  [EXTRACTED]
  src/components/admin/AdminCampaignsView.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SponFy Architecture Specification Triad** — readme_sponfy_engine, docs_superpowers_specs_2026_10_08_sponfy_design_spec, docs_superpowers_plans_2026_10_08_sponfy_implementation_plan [EXTRACTED 1.00]

## Communities (73 total, 11 thin omitted)

### Community 0 - "TopBar.tsx"
Cohesion: 0.05
Nodes (58): AdminLayout(), metadata, AppLayout(), GetAppPage(), metadata, PLATFORMS, MarketingLayout(), ActivityHeartbeat() (+50 more)

### Community 1 - "replies/page.tsx"
Cohesion: 0.09
Nodes (55): RFC-5545, DELETE(), PATCH(), runtime, UpdateMeetingSchema, CreateMeetingSchema, GET(), POST() (+47 more)

### Community 2 - "react"
Cohesion: 0.06
Nodes (34): lucide-react, react, GlobalError(), IntelligencePage(), metadata, FEATURE_MODULES, LandingPage(), metadata (+26 more)

### Community 3 - "Input"
Cohesion: 0.10
Nodes (39): CampaignOption, OrganisationMember, PendingRequest, TeamMember, LoginForm(), LoginPage(), SignupForm(), SignupPage() (+31 more)

### Community 4 - "Skeleton"
Cohesion: 0.08
Nodes (27): AdminLoading(), AnalyticsLoading(), CampaignsLoading(), DiscoverLoading(), FollowupsLoading(), FollowupsLoading(), AppOverviewLoading(), RepliesLoading() (+19 more)

### Community 5 - "rate-limit.ts"
Cohesion: 0.10
Nodes (37): POST(), POST(), runtime, POST(), runtime, POST(), runtime, dynamic (+29 more)

### Community 6 - "discovery-graph.ts"
Cohesion: 0.10
Nodes (35): @google/genai, POST(), runtime, createDiscoveryGraph(), DiscoveryGraphAnnotation, DiscoveryGraphStateType, DiscoveryResultPayload, generateCandidatesNode() (+27 more)

### Community 7 - "isDatabaseConfigured"
Cohesion: 0.11
Nodes (32): zod, POST(), decisionSchema, PATCH(), POST(), GET(), modeSchema, POST() (+24 more)

### Community 8 - "verification/index.ts"
Cohesion: 0.11
Nodes (17): @upstash/redis, HunterVerifier, memoryCache, TieredVerificationService, IEmailVerifier, NormalizedVerificationStatus, VerificationProvider, VerificationResult (+9 more)

### Community 9 - "next"
Cohesion: 0.09
Nodes (20): next, POST(), DELETE(), GET(), POST(), runtime, POST(), runtime (+12 more)

### Community 10 - "utils.ts"
Cohesion: 0.12
Nodes (25): AnalyticsCharts, AnalyticsPage(), CampaignsPage(), CreateCampaignModal, StatusFilter, ViewMode, CampaignCard(), ActivityFeed() (+17 more)

### Community 11 - "bulk-send/route.ts"
Cohesion: 0.19
Nodes (29): GET(), POST(), EligibilityItem, GET(), needsReviewCount(), runtime, POST(), runtime (+21 more)

### Community 12 - "cn"
Cohesion: 0.15
Nodes (25): FollowupsPage(), SettingsPage(), AnalyticsCharts(), AnalyticsChartsProps, BRAND_COLORS, AttentionCard(), FollowupQueue(), SimpleRow() (+17 more)

### Community 13 - "discover/page.tsx"
Cohesion: 0.12
Nodes (23): RFC-4180, POST(), DiscoverPage(), CandidateItem, CandidateList(), CandidateListProps, DiscoveryAnalyticsModal(), DiscoveryAnalyticsModalProps (+15 more)

### Community 14 - "Button"
Cohesion: 0.11
Nodes (22): AppSectionError(), metadata, PrivacyPolicyPage(), metadata, TermsOfServicePage(), metadata, WhyUsPage(), StartFirstCampaignModal() (+14 more)

### Community 15 - "sponsors.ts"
Cohesion: 0.13
Nodes (26): DELETE(), detectUnresolvedPlaceholders(), generateSingleDraft(), GET(), POST(), DELETE(), approveDraft(), DB_TO_DRAFT_STATUS (+18 more)

### Community 16 - "workflow-integration.test.ts"
Cohesion: 0.14
Nodes (21): POST(), dynamic, GET(), SYSTEM_LIMITS, createDraft(), loadFollowups(), buildFollowupDraft(), computeFollowups() (+13 more)

### Community 17 - "src/app/layout.tsx"
Cohesion: 0.12
Nodes (20): dynamic, GET(), HEAD(), startTime, fraunces, inter, jakarta, metadata (+12 more)

### Community 18 - "mock/index.ts"
Cohesion: 0.09
Nodes (24): prisma, STAGE_MAP, activities, campaigns, companies, contacts, drafts, mockActivitiesRepo (+16 more)

### Community 19 - "button.tsx"
Cohesion: 0.19
Nodes (18): SponsorDetailPage(), TeamManagementPage(), OnboardingPendingPage(), RequestStatusData, BulkSendModal(), BulkSendModalProps, ContactsTab(), FitScoreTab() (+10 more)

### Community 20 - "Campaign"
Cohesion: 0.13
Nodes (9): StartFirstCampaignModalProps, DiscoveryResultRecord, IGeminiClient, MockGeminiClient, RealGeminiClient, FitScoreResult, Campaign, EmailQuality (+1 more)

### Community 21 - "prisma.ts"
Cohesion: 0.14
Nodes (17): createAccessRequestSchema, GET(), getEmptyAnalytics(), runtime, GET(), runtime, prisma, CampaignAccessResult (+9 more)

### Community 22 - "package.json"
Cohesion: 0.08
Nodes (24): name, private, version, @auth/prisma-adapter, autoprefixer, clsx, eslint, eslint-config-next (+16 more)

### Community 23 - "sponsors/page.tsx"
Cohesion: 0.17
Nodes (18): next-auth, swr, SponsorsPipelinePage(), BulkDraftModal(), ItemStatus, GenerateDraftModal(), KanbanBoard(), SponsorFilters() (+10 more)

### Community 24 - "outreach/page.tsx"
Cohesion: 0.16
Nodes (17): OutreachLoading(), BulkDraftModal, BulkSendModal, OutreachContent(), OutreachPage(), SendConfirmationDialog, DraftQueueList(), DraftQueueListProps (+9 more)

### Community 25 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @auth/prisma-adapter, clsx, framer-motion, @google/genai, googleapis, @langchain/core, @langchain/langgraph (+15 more)

### Community 26 - "admin.ts"
Cohesion: 0.15
Nodes (16): AdminAnalyticsPage(), AdminAnalyticsView, metadata, GET(), buildFunnel(), buildIndustryPerformance(), CONTACTED_STAGES, getAdminAnalytics() (+8 more)

### Community 27 - "showcase.ts"
Cohesion: 0.14
Nodes (19): DELETE(), PATCH(), UpdateShowcaseSchema, POST(), ReorderSchema, CreateShowcaseSchema, GET(), POST() (+11 more)

### Community 28 - "auth-guard.ts"
Cohesion: 0.12
Nodes (13): RFC-1918, GET(), GET(), runtime, requireRole(), AuthContext, AuthResult, getClientIp() (+5 more)

### Community 29 - "Company"
Cohesion: 0.20
Nodes (14): BulkDraftModalProps, GenerateDraftModalProps, KanbanBoardProps, KanbanColumn(), KanbanColumnProps, SponsorCard(), SponsorCardProps, SponsorTableViewProps (+6 more)

### Community 30 - "types/index.ts"
Cohesion: 0.10
Nodes (20): AccountMode, AIJobStatus, CampaignAssignment, CampaignMember, ContactStatus, CreateCampaignSchema, DiscoverPromptSchema, EmailQualitySchema (+12 more)

### Community 31 - "AdminAnalyticsView.tsx"
Cohesion: 0.14
Nodes (15): recharts, AdminCampaignsPage(), metadata, AdminSettingsPage(), metadata, AdminAnalyticsView(), BRAND_COLORS, Props (+7 more)

### Community 32 - "lib/auth.ts"
Cohesion: 0.13
Nodes (16): POST(), dynamic, runtime, POST(), DemoAuthUser, demoAuthUsersRef, handlers, JWT (+8 more)

### Community 33 - "verifyAdminSession"
Cohesion: 0.21
Nodes (14): PATCH(), PATCH(), DELETE(), PATCH(), AdminAuthResult, getAdminEmails(), verifyAdminSession(), deleteUserAccount() (+6 more)

### Community 34 - "prisma/index.ts"
Cohesion: 0.14
Nodes (13): prismaActivitiesRepo, prismaCampaignsRepo, prismaContactsRepo, prismaOutreachRepo, prismaRepliesRepo, prismaSponsorsRepo, ActivitiesRepository, CreateCampaignInput (+5 more)

### Community 35 - "factory.ts"
Cohesion: 0.14
Nodes (7): getFirecrawlClient(), isValidGeminiApiKey(), FirecrawlSearchResult, IFirecrawlClient, MockFirecrawlClient, RealFirecrawlClient, IntegrationHealth

### Community 36 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 37 - "research-graph.ts"
Cohesion: 0.16
Nodes (9): @langchain/langgraph, getTavilyClient(), ITavilyClient, MockTavilyClient, RealTavilyClient, ResearchState, runResearchWorkflow(), ResearchSections (+1 more)

### Community 38 - "workflow-routes-and-safety.test.ts"
Cohesion: 0.23
Nodes (10): DELETE(), GET(), ApproveSchema, POST(), clearDiscoveryResults(), db, deleteDiscoveryResult(), deleteDiscoveryResults() (+2 more)

### Community 39 - "gmail/index.ts"
Cohesion: 0.12
Nodes (6): RFC-2047, BounceEvent, IGmailClient, MockGmailClient, RFC-5321, RFC-5322

### Community 40 - "AdminOverviewView.tsx"
Cohesion: 0.19
Nodes (13): AdminActivityPage(), metadata, AdminOverviewPage(), metadata, ACTION_FILTERS, AdminActivityView(), Props, AdminOverviewView() (+5 more)

### Community 41 - "getSponsors"
Cohesion: 0.42
Nodes (10): GET(), OverviewPage(), AnalyticsPreview(), analyticsRepository, getAnalyticsData(), campaignsStoreRef, getCampaigns(), getDrafts() (+2 more)

### Community 42 - "settings.ts"
Cohesion: 0.13
Nodes (13): getSuppressions(), gmailStatusStoreRef, profileStoreRef, removeSuppression(), settingsRepository, suppressionsStoreRef, updateUserProfile(), GmailConnectionStatus (+5 more)

### Community 43 - "memory-store.ts"
Cohesion: 0.21
Nodes (10): PATCH(), readSchema, GET(), g, memoryStore(), demoNotificationsRef, getNotificationsForUser(), getUnreadNotificationCount() (+2 more)

### Community 44 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, eslint-config-next, postcss, prisma, tailwindcss, @types/node (+6 more)

### Community 45 - "services/scoring.ts"
Cohesion: 0.27
Nodes (10): FitScoreTier, getScoreTier(), QUALIFY_THRESHOLD, SCORE_TIERS, SCORING_DIMENSIONS, SCORING_FACTORS, SCORING_WEIGHTS, ScoringFactorWeight (+2 more)

### Community 46 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:generate, db:migrate, db:push, db:studio, dev, lint (+4 more)

### Community 47 - "generate-pwa-icons.mjs"
Cohesion: 0.18
Nodes (7): buildSvg(), __dirname, __filename, generate(), publicIconsDir, rootDir, targets

### Community 48 - "open/route.ts"
Cohesion: 0.22
Nodes (7): engagementEvents, PIXEL_GIF, runtime, StoredEngagementEvent, decrypt(), encrypt(), getEncryptionKey()

### Community 49 - "contact-discovery.ts"
Cohesion: 0.24
Nodes (8): DISPOSABLE_DOMAINS, getDnsResolver(), ROLE_ACCOUNTS, StrictVerificationResult, RFC-5321, RFC-5322, ContactDiscoveryResult, Contact

### Community 50 - "vitest"
Cohesion: 0.29
Nodes (6): vitest, DiscoverPromptBox(), DiscoverPromptBoxProps, parseCountFromPrompt(), updateCountInPrompt(), WORD_TO_NUMBER

### Community 51 - "AdminUsersView.tsx"
Cohesion: 0.29
Nodes (8): AdminUsersPage(), metadata, AdminHeaderProps, AdminUsersView(), Props, getAdminUsers(), AccountStatus, AdminUser

### Community 52 - "data/index.ts"
Cohesion: 0.22
Nodes (8): getRepositories(), repositories, mockRepositories, prismaRepositories, clientEnvSchema, env, isDemoMode(), serverEnvSchema

### Community 53 - "replies.ts"
Cohesion: 0.33
Nodes (8): POST(), DB_TO_INTENT, getInboundThreads(), INTENT_TO_DB, recordInboundReply(), replyAnalysesStoreRef, addSuppression(), getGeminiClient()

### Community 54 - "foundation.test.ts"
Cohesion: 0.31
Nodes (7): KANBAN_COLUMNS, PIPELINE_STAGES, STAGE_CONFIGS, StageConfig, decrypt(), encrypt(), getEncryptionKey()

### Community 55 - "SponFy Product & Architecture Specification"
Cohesion: 0.22
Nodes (7): Warm Editorial Design Tokens, SponFy 10-Task Implementation Roadmap, 12-Stage Sponsor Pipeline Architecture, SponFy Product & Architecture Specification, Local Quickstart & Demo Mode, SponFy Sponsorship Engine, Next.js 15, Prisma ORM & Neon Serverless Stack

### Community 57 - "callback/route.ts"
Cohesion: 0.36
Nodes (6): GET(), runtime, GET(), runtime, updateGmailStatus(), getGmailClient()

### Community 58 - "(marketing)/showcase/page.tsx"
Cohesion: 0.39
Nodes (6): metadata, ShowcasePage(), ShowcaseCarousel(), ShowcaseCarouselProps, getVisibleShowcaseCompanies(), ShowcaseCompany

### Community 59 - "rules"
Cohesion: 0.29
Nodes (6): extends, rules, @next/next/no-html-link-for-pages, react/no-unescaped-entities, @typescript-eslint/no-explicit-any, next/core-web-vitals

### Community 60 - "@prisma/client"
Cohesion: 0.29
Nodes (4): @prisma/client, prisma, INTENT_CONFIGS, IntentConfig

### Community 61 - "faq/page.tsx"
Cohesion: 0.38
Nodes (5): FAQPage(), metadata, FAQ(), FAQItem, faqs

### Community 67 - "next.config.ts"
Cohesion: 0.50
Nodes (3): cspHeader, nextConfig, securityHeaders

## Knowledge Gaps
- **425 isolated node(s):** `GuidedStep`, `InstallAppButtonProps`, `PullToRefreshProps`, `NavItem`, `StatusFilter` (+420 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 534 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `TopBar.tsx`, `replies/page.tsx`, `react`, `Input`, `rate-limit.ts`, `discovery-graph.ts`, `isDatabaseConfigured`, `utils.ts`, `bulk-send/route.ts`, `cn`, `discover/page.tsx`, `Button`, `sponsors.ts`, `workflow-integration.test.ts`, `src/app/layout.tsx`, `button.tsx`, `prisma.ts`, `package.json`, `sponsors/page.tsx`, `outreach/page.tsx`, `admin.ts`, `showcase.ts`, `auth-guard.ts`, `Company`, `AdminAnalyticsView.tsx`, `lib/auth.ts`, `verifyAdminSession`, `workflow-routes-and-safety.test.ts`, `AdminOverviewView.tsx`, `getSponsors`, `memory-store.ts`, `open/route.ts`, `AdminUsersView.tsx`, `replies.ts`, `callback/route.ts`, `(marketing)/showcase/page.tsx`, `faq/page.tsx`, `next.config.ts`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **What connects `GuidedStep`, `InstallAppButtonProps`, `PullToRefreshProps` to the rest of the system?**
  _425 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TopBar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05028305028305028 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `TopBar.tsx`, `replies/page.tsx`, `Input`, `Skeleton`, `utils.ts`, `cn`, `discover/page.tsx`, `Button`, `src/app/layout.tsx`, `button.tsx`, `package.json`, `sponsors/page.tsx`, `outreach/page.tsx`, `Company`, `AdminAnalyticsView.tsx`, `AdminOverviewView.tsx`, `getSponsors`, `vitest`, `AdminUsersView.tsx`, `(marketing)/showcase/page.tsx`, `faq/page.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `replies/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0869215291750503 - nodes in this community are weakly interconnected._
- **Why does `isDatabaseConfigured()` connect `isDatabaseConfigured` to `replies/page.tsx`, `Input`, `rate-limit.ts`, `discovery-graph.ts`, `next`, `utils.ts`, `bulk-send/route.ts`, `discover/page.tsx`, `sponsors.ts`, `workflow-integration.test.ts`, `src/app/layout.tsx`, `prisma.ts`, `admin.ts`, `showcase.ts`, `auth-guard.ts`, `lib/auth.ts`, `verifyAdminSession`, `workflow-routes-and-safety.test.ts`, `AdminOverviewView.tsx`, `getSponsors`, `settings.ts`, `memory-store.ts`, `AdminUsersView.tsx`, `data/index.ts`, `replies.ts`, `callback/route.ts`, `(marketing)/showcase/page.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.059395801331285206 - nodes in this community are weakly interconnected._