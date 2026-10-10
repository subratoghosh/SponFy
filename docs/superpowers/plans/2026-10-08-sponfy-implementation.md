# SponFy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build SponFy end-to-end as a production-grade AI sponsorship operating system (marketing landing page + authenticated dashboard) featuring cited sponsor research, explainable fit scoring, human-gated email outreach, Gmail integration, reply intent intelligence, and analytics under the Butter & Green design system.

**Architecture:** Next.js (App Router) + TypeScript (strict) + Tailwind CSS + Supabase SSR with RLS. A strict multi-layer architecture separates UI components from repository layers and an integration factory (`lib/integrations/{gemini,tavily,gmail}`) supporting both real API and realistic India-focused mock fallback with clear Demo Mode indicators. LangGraph JS orchestrates Research and Human-in-the-loop Outreach workflows.

**Tech Stack:** Next.js 15+, TypeScript, React 19, Tailwind CSS, Supabase SSR, @google/genai, @langchain/langgraph, googleapis, Recharts, Framer Motion, lucide-react, Zod, next/font (Fraunces, Outfit, Plus Jakarta Sans, Space Grotesk).

**Spec:** [docs/superpowers/specs/2026-10-08-sponfy-design.md](file:///c:/Users/Subrato%20Ghosh/OneDrive/Desktop/SponFy/docs/superpowers/specs/2026-10-08-sponfy-design.md)

## Global Constraints

- Design system tokens strictly from `butgreendesign.md`: Canvas `#FAF4E6`, Card `#FFFFFF`, Deep Green `#0E3B2E`/`#0C382E`, Butter `#FFF0B3`/`#FEE790`, text colors `#0C382E`, `#244D3F`, `#4A6F62`, on-dark `#FFF5D1`, `#D8EAE1`.
- Typography: Fraunces (hero display), Outfit (headings/UI), Plus Jakarta Sans (body), Space Grotesk (numbers/metrics/tabular).
- Zero vanity metrics: No fake open/click tracking; focus on real replies, intent, and committed funds.
- Human-in-the-loop safety: Emails cannot be sent without explicit user review and modal approval.
- Zero-configuration demo mode: Works immediately on `npm run dev` with realistic Indian hackathon sponsor seed data (24 companies, 12 stages, 12 sent emails, 7 replies, 60-day activity).
- UI components must never import Supabase or 3rd-party integration SDKs directly.

## Review Focus

1. **Missing credentials / Unconfigured APIs:** App must never crash or claim unconfigured services are connected; Settings page displays honest status and UI shows "Demo Data" badge.
2. **Human Approval Gate bypass prevention:** Send action must reject any attempt to dispatch drafts with status other than `approved`.
3. **Invalid/Empty reply threads:** Inbound email parser handles missing headers, HTML tags, or unparseable bodies gracefully.
4. **Suppression list enforcement:** Outreach system strictly blocks sends to unsubscribed, bounced, or "Not Interested" addresses.
5. **Mobile & Viewport responsiveness:** Kanban collapses to stage-grouped list, tables become card lists, touch targets maintain 44px minimum.

---

### Task 1: Project Scaffolding, Dependencies, Tokens, and Database Migrations

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `.env.example`, `.gitignore`
- Create: `supabase/migrations/20260101000000_sponfy_schema.sql`

**Interfaces:**
- Produces: Base Next.js app with Butter & Green CSS tokens, next/font bindings (`fraunces`, `outfit`, `plusJakartaSans`, `spaceGrotesk`), and complete Postgres SQL schema with RLS policies.

- [ ] **Step 1: Create `package.json` with all required dependencies**
- [ ] **Step 2: Create TypeScript, Tailwind, PostCSS, and Next.js configuration files**
- [ ] **Step 3: Create `src/app/globals.css` with Butter & Green color tokens, typography variables, utility classes, and card hover micro-physics**
- [ ] **Step 4: Create `src/app/layout.tsx` loading Google Fonts (Fraunces, Outfit, Plus Jakarta Sans, Space Grotesk)**
- [ ] **Step 5: Create `.env.example` and `supabase/migrations/20260101000000_sponfy_schema.sql` with all 16 tables, indexes, and RLS policies**
- [ ] **Step 6: Verify package installation and Next.js build compilation**
- [ ] **Step 7: Commit setup files**

---

### Task 2: Core Domain Types, Zod Schemas, Central Config, and Rich Seed Dataset

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/config/constants.ts`
- Create: `src/lib/config/pipeline.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/data/seed-data.ts`

**Interfaces:**
- Produces: `Company`, `Campaign`, `Contact`, `EmailDraft`, `Message`, `ReplyAnalysis`, `FollowupSequence`, `Activity`, `AIJob` TypeScript types; pipeline stages; intent labels; seed data for "SponFy Hackathon 2026" (24 companies across 12 stages, 12 sent emails, 7 replies, 60 days of activity).

- [ ] **Step 1: Create `src/types/index.ts` with strict TypeScript types and Zod schemas**
- [ ] **Step 2: Create `src/lib/config/constants.ts` and `src/lib/config/pipeline.ts` defining pipeline stages, intent tags, and safety thresholds**
- [ ] **Step 3: Create `src/lib/utils.ts` with currency formatting (₹ Lakhs/Thousands), date formatting, and class merger `cn`**
- [ ] **Step 4: Create `src/lib/data/seed-data.ts` with realistic Indian tech sponsors (Postman, Devfolio, Razorpay, GitHub, Polygon, MongoDB, etc.)**
- [ ] **Step 5: Verify types with `npx tsc --noEmit`**
- [ ] **Step 6: Commit domain types and seed data**

---

### Task 3: Integrations Layer (Gemini, Tavily, Gmail, Encryption) & Real/Mock Factory

**Files:**
- Create: `src/lib/encryption.ts`
- Create: `src/lib/integrations/gemini/index.ts` (Interface + Real + Mock + Zod output schemas)
- Create: `src/lib/integrations/tavily/index.ts` (Interface + Real + Mock + Cited search)
- Create: `src/lib/integrations/gmail/index.ts` (Interface + Real + Mock + OAuth helpers)
- Create: `src/lib/integrations/factory.ts`

**Interfaces:**
- Produces: `getGeminiClient()`, `getTavilyClient()`, `getGmailClient()`, `getIntegrationStatus()` exposing `isConfigured()` and realistic mock generators when API keys are absent.

- [ ] **Step 1: Create `src/lib/encryption.ts` for AES-256 token encryption/decryption**
- [ ] **Step 2: Create Gemini integration in `src/lib/integrations/gemini/index.ts` with structured Zod outputs for fit scoring, drafting, and reply intent**
- [ ] **Step 3: Create Tavily integration in `src/lib/integrations/tavily/index.ts` with realistic query responses and citations**
- [ ] **Step 4: Create Gmail integration in `src/lib/integrations/gmail/index.ts` with OAuth token exchange, send draft, and thread polling**
- [ ] **Step 5: Create `src/lib/integrations/factory.ts` with honest configuration checkers**
- [ ] **Step 6: Commit integration layer**

---

### Task 4: Repository Data Access Layer & State Management

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Create: `src/lib/data/repositories/campaigns.ts`
- Create: `src/lib/data/repositories/sponsors.ts`
- Create: `src/lib/data/repositories/outreach.ts`
- Create: `src/lib/data/repositories/replies.ts`
- Create: `src/lib/data/repositories/analytics.ts`
- Create: `src/lib/data/repositories/settings.ts`

**Interfaces:**
- Produces: Typed async data repository functions that seamlessly read/write from Supabase when configured or in-memory seed data when in Demo Mode.

- [ ] **Step 1: Implement Supabase SSR clients with fallback detection in `src/lib/supabase/`**
- [ ] **Step 2: Implement Campaign and Sponsor repositories with filtering, stage transitions, and research saving**
- [ ] **Step 3: Implement Outreach and Reply repositories with status updates and suppression checks**
- [ ] **Step 4: Implement Analytics and Settings repositories calculating funnel stats, reply rates, and limits**
- [ ] **Step 5: Verify repository methods with mock and seed data**
- [ ] **Step 6: Commit repositories**

---

### Task 5: LangGraph AI Workflows & Server Actions

**Files:**
- Create: `src/lib/workflows/research-graph.ts` (LangGraph Graph 1)
- Create: `src/lib/workflows/outreach-graph.ts` (LangGraph Graph 2 with `interrupt()`)
- Create: `src/app/api/discover/route.ts`
- Create: `src/app/api/research/route.ts`
- Create: `src/app/api/outreach/draft/route.ts`
- Create: `src/app/api/outreach/approve/route.ts`
- Create: `src/app/api/outreach/send/route.ts`
- Create: `src/app/api/replies/sync/route.ts`
- Create: `src/app/api/cron/sync-replies/route.ts`

**Interfaces:**
- Produces: Executable multi-step research and human-gated outreach workflows with progress streaming and approval enforcement.

- [ ] **Step 1: Build LangGraph Research Workflow (Search -> Extract -> Classify -> Score -> Persist)**
- [ ] **Step 2: Build LangGraph Outreach Workflow with Human Approval Gate (`interrupt()`)**
- [ ] **Step 3: Implement Discovery, Research, and Outreach API endpoints with Zod validation**
- [ ] **Step 4: Implement Reply Sync & Analysis API routes secured with rate limits and cron secret**
- [ ] **Step 5: Commit AI workflows and API routes**

---

### Task 6: Design System UI Component Library

**Files:**
- Create: `src/components/ui/button.tsx` (`.btn-butter`, `.btn-green`, `.btn-glass`, `.btn-hero-ghost`)
- Create: `src/components/ui/badge.tsx` (Status badges, pill tags)
- Create: `src/components/ui/card.tsx` (`.feature-card-interactive`, `.hero-card`)
- Create: `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/select.tsx`
- Create: `src/components/ui/dialog.tsx` (Modal with focus trap, backdrop blur)
- Create: `src/components/ui/skeleton.tsx` (Butter shimmer pulse loader)
- Create: `src/components/ui/empty-state.tsx` (4-part anatomy: icon in butter circle, headline, body, CTA)
- Create: `src/components/ui/toast.tsx` (Toast notification system)
- Create: `src/components/ui/tooltip.tsx`

**Interfaces:**
- Produces: Complete accessible, responsive, token-compliant UI component suite following `butgreendesign.md`.

- [ ] **Step 1: Implement Butter Button hierarchy (`.btn-butter`, `.btn-green`, `.btn-glass`, `.btn-hero-ghost`) with tactile hover physics**
- [ ] **Step 2: Implement Input, Textarea, and Select components with butter focus rings**
- [ ] **Step 3: Implement Interactive Cards with lift elevation and soft green shadows**
- [ ] **Step 4: Implement Skeleton loader with butter shimmer gradient and 4-part Empty State component**
- [ ] **Step 5: Implement Dialog Modal with Escape key listener and Toast notifications**
- [ ] **Step 6: Commit UI component library**

---

### Task 7: Marketing Landing Page (`/`) with 9 Sections

**Files:**
- Create: `src/components/landing/Header.tsx` (Sticky pill navbar + mobile hamburger drawer)
- Create: `src/components/landing/Hero.tsx` (Deep green `#0E3B2E` + butter blobs + Fraunces display + interactive line-art + product preview card)
- Create: `src/components/landing/TrustStrip.tsx` (3 pillars)
- Create: `src/components/landing/WorkflowStory.tsx` (5-step scroll storytelling with live micro-UIs)
- Create: `src/components/landing/ShowcaseCarousel.tsx` (White cards on butter canvas)
- Create: `src/components/landing/ApprovalPreview.tsx` (Outreach gate & reply intelligence preview)
- Create: `src/components/landing/AnalyticsPreview.tsx` (Interactive funnel and response stats)
- Create: `src/components/landing/WhySponfy.tsx` (4 honest differentiators)
- Create: `src/components/landing/FAQ.tsx` (Accordion)
- Create: `src/components/landing/CTASection.tsx` & `src/components/landing/Footer.tsx`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Produces: High-converting, fully responsive landing page adhering to Butter & Green design language.

- [ ] **Step 1: Build Header with sticky capsule pill and mobile slide drawer**
- [ ] **Step 2: Build Hero section with Fraunces headline, vector line art, and overlapping live Kanban/Fit score preview**
- [ ] **Step 3: Build Trust Strip and 5-step Workflow Storytelling section**
- [ ] **Step 4: Build Showcase Carousel and Approval/Reply Intelligence interactive preview**
- [ ] **Step 5: Build Analytics Preview, Why SponFy, FAQ accordion, CTA panel, and Footer**
- [ ] **Step 6: Assemble in `src/app/(marketing)/page.tsx` and verify responsive layout on desktop, tablet, and mobile**
- [ ] **Step 7: Commit landing page**

---

### Task 8: App Shell, Layout, Navigation, and Auth Pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx` (Demo 1-click login + Supabase auth)
- Create: `src/components/layout/Sidebar.tsx` (Deep-green sidebar with active pill highlights)
- Create: `src/components/layout/TopBar.tsx` (Campaign switcher, search, Gmail status badge, demo badge, profile menu)
- Create: `src/components/layout/MobileTabBar.tsx` (Bottom navigation for mobile screens)
- Create: `src/app/(app)/app/layout.tsx`

**Interfaces:**
- Produces: Responsive authenticated dashboard shell with persistent navigation, campaign context, and status indicators.

- [ ] **Step 1: Implement Login page with quick demo login and Supabase Auth support**
- [ ] **Step 2: Build Deep Green Sidebar with navigation items, badge counters, and collapse toggle**
- [ ] **Step 3: Build TopBar with Campaign switcher, global search trigger, Gmail connection pill, and Demo badge**
- [ ] **Step 4: Build Mobile Bottom Tab Bar for viewport `<= 767px`**
- [ ] **Step 5: Assemble App Layout in `src/app/(app)/app/layout.tsx`**
- [ ] **Step 6: Commit app shell**

---

### Task 9: Overview Dashboard (`/app`)

**Files:**
- Create: `src/components/dashboard/KPIRow.tsx` (8 metrics with Space Grotesk tabular figures and target progress)
- Create: `src/components/dashboard/TodayActionQueue.tsx` (1-click actionable items)
- Create: `src/components/dashboard/PipelineSummary.tsx`
- Create: `src/components/dashboard/ActivityFeed.tsx`
- Create: `src/components/dashboard/AIInsightCard.tsx`
- Create: `src/app/(app)/app/page.tsx`

**Interfaces:**
- Produces: Executive overview dashboard with real-time campaign stats, Today priority action queue, and AI insights.

- [ ] **Step 1: Build KPIRow with 8 metric cards, count-up animation, and fund progress bar**
- [ ] **Step 2: Build Today Action Queue with one-click actions (Reply, Review Draft, Follow-up)**
- [ ] **Step 3: Build Pipeline Summary, Activity Feed, and AI Campaign Insights Card**
- [ ] **Step 4: Assemble Overview Page in `src/app/(app)/app/page.tsx` with loading skeleton state**
- [ ] **Step 5: Commit overview dashboard**

---

### Task 10: Campaigns Wizard & Discover Studio (`/app/campaigns`, `/app/discover`)

**Files:**
- Create: `src/components/campaigns/CampaignCard.tsx`
- Create: `src/components/campaigns/CreateCampaignModal.tsx` (Multi-step wizard)
- Create: `src/app/(app)/app/campaigns/page.tsx`
- Create: `src/components/discover/DiscoverPromptBox.tsx`
- Create: `src/components/discover/LiveJobProgress.tsx` (Multi-step status checklist)
- Create: `src/components/discover/CandidateList.tsx`
- Create: `src/app/(app)/app/discover/page.tsx`

**Interfaces:**
- Produces: Campaign management and AI sponsor discovery interface with live streaming progress panel.

- [ ] **Step 1: Build Campaign List & Detail views with stats and creation modal wizard**
- [ ] **Step 2: Build Discover Prompt input with pre-filled suggestions**
- [ ] **Step 3: Build Live Job Progress panel streaming AI execution steps**
- [ ] **Step 4: Build Ranked Candidate Table with fit preview and 1-click "Add to Campaign" action**
- [ ] **Step 5: Assemble Discover Page in `src/app/(app)/app/discover/page.tsx`**
- [ ] **Step 6: Commit campaigns and discovery**

---

### Task 11: Sponsors Pipeline Kanban & Table View (`/app/sponsors`)

**Files:**
- Create: `src/components/sponsors/KanbanBoard.tsx`
- Create: `src/components/sponsors/KanbanColumn.tsx`
- Create: `src/components/sponsors/SponsorCard.tsx`
- Create: `src/components/sponsors/SponsorTableView.tsx`
- Create: `src/components/sponsors/SponsorFilters.tsx`
- Create: `src/app/(app)/app/sponsors/page.tsx`

**Interfaces:**
- Produces: Interactive drag-and-drop Kanban board across 12 stages, mobile stage-grouped view, and sortable table with multi-filter bar.

- [ ] **Step 1: Build Sponsor Card with company name, industry tag, fit score badge, pipeline amount, and avatar**
- [ ] **Step 2: Build Kanban Board with drag-and-drop stage updates and mobile fallback**
- [ ] **Step 3: Build Sponsor Table View with tabular data alignment and sorting**
- [ ] **Step 4: Build Filter Bar (Industry, Fit Score, Stage, Search)**
- [ ] **Step 5: Assemble Sponsors Page in `src/app/(app)/app/sponsors/page.tsx`**
- [ ] **Step 6: Commit sponsors pipeline**

---

### Task 12: Sponsor Detail Hub (`/app/sponsors/[id]`)

**Files:**
- Create: `src/components/sponsor-detail/ResearchTab.tsx` (Overview, products, programs, sources with links)
- Create: `src/components/sponsor-detail/FitScoreTab.tsx` ("Why 86?" 7-factor breakdown with +/- reasoning)
- Create: `src/components/sponsor-detail/ContactsTab.tsx` (Verification badges, manual contact adder)
- Create: `src/components/sponsor-detail/OutreachTab.tsx` (Draft view, quality meter, regenerate options)
- Create: `src/components/sponsor-detail/TimelineTab.tsx` (Vertical audit log)
- Create: `src/components/sponsor-detail/NextActionCard.tsx`
- Create: `src/app/(app)/app/sponsors/[id]/page.tsx`

**Interfaces:**
- Produces: Comprehensive 6-tab company dossier with transparent AI reasoning, cited sources, and actionable intelligence.

- [ ] **Step 1: Build Research Tab with structured sections and clickable external source citations**
- [ ] **Step 2: Build Fit Score Tab with "Why 86?" factor bars and positive/negative rationale**
- [ ] **Step 3: Build Contacts Tab with verification badges and manual contact modal**
- [ ] **Step 4: Build Outreach Tab, Timeline Tab, and Next Action Card**
- [ ] **Step 5: Assemble Sponsor Detail Page in `src/app/(app)/app/sponsors/[id]/page.tsx`**
- [ ] **Step 6: Commit sponsor detail hub**

---

### Task 13: Outreach Approval Queue & Email Composer (`/app/outreach`)

**Files:**
- Create: `src/components/outreach/DraftQueueList.tsx`
- Create: `src/components/outreach/EmailComposer.tsx` (Subject, body, tone switcher)
- Create: `src/components/outreach/QualityScorePanel.tsx` (5 dimensions + suggestions)
- Create: `src/components/outreach/SafetyChecklist.tsx` (4 verification checks)
- Create: `src/components/outreach/SendConfirmationDialog.tsx`
- Create: `src/app/(app)/app/outreach/page.tsx`

**Interfaces:**
- Produces: Outreach management hub with draft status stepper (Draft -> Review -> Approved -> Sent), safety gate, and send confirmation dialog.

- [ ] **Step 1: Build Draft Queue List with status filters and quick preview**
- [ ] **Step 2: Build Email Composer with dynamic placeholders and tone regenerator**
- [ ] **Step 3: Build Quality Score Panel and 4-point Safety Checklist**
- [ ] **Step 4: Build Send Confirmation Dialog displaying recipient, subject, and send cap remaining**
- [ ] **Step 5: Assemble Outreach Page in `src/app/(app)/app/outreach/page.tsx`**
- [ ] **Step 6: Commit outreach hub**

---

### Task 14: Replies Inbox & Gemini Reply Intelligence (`/app/replies`)

**Files:**
- Create: `src/components/replies/ThreadList.tsx` (Inbox with intent tags and urgency badges)
- Create: `src/components/replies/ThreadView.tsx` (Full email thread message history)
- Create: `src/components/replies/ReplyAnalysisPanel.tsx` (Intent, confidence, summary, questions, requested info, action button)
- Create: `src/components/replies/ReplyComposerModal.tsx`
- Create: `src/app/(app)/app/replies/page.tsx`

**Interfaces:**
- Produces: Split-view reply intelligence center with automatic intent classification, question extraction, and 1-click next actions.

- [ ] **Step 1: Build Thread List with Intent badges (Interested, Negotiating, Needs Info, etc.) and unread counters**
- [ ] **Step 2: Build Thread View with chronological message bubbles and sender info**
- [ ] **Step 3: Build Gemini Reply Analysis Panel with confidence meter, questions list, and action buttons**
- [ ] **Step 4: Build Reply Composer Modal with AI suggested responses**
- [ ] **Step 5: Assemble Replies Page in `src/app/(app)/app/replies/page.tsx`**
- [ ] **Step 6: Commit replies inbox**

---

### Task 15: Follow-ups Engine & Cadence Manager (`/app/followups`)

**Files:**
- Create: `src/components/followups/SequenceConfigCard.tsx` (Configurable wait days & template angles)
- Create: `src/components/followups/DueTasksList.tsx` (Pending follow-ups with AI recommendation)
- Create: `src/components/followups/FollowupCancelModal.tsx`
- Create: `src/app/(app)/app/followups/page.tsx`

**Interfaces:**
- Produces: Follow-up cadence engine, pending tasks queue, and AI "Should we follow up?" recommendation engine with auto-pause safety.

- [ ] **Step 1: Build Sequence Configuration card (Step 1 wait 4d -> Step 2 wait 7d -> Stop)**
- [ ] **Step 2: Build Due Tasks List with AI recommendation pill ("Follow up now: Postman showed initial interest")**
- [ ] **Step 3: Build 1-click execute and cancel actions**
- [ ] **Step 4: Assemble Follow-ups Page in `src/app/(app)/app/followups/page.tsx`**
- [ ] **Step 5: Commit follow-ups engine**

---

### Task 16: Analytics Dashboard (`/app/analytics`)

**Files:**
- Create: `src/components/analytics/FunnelChart.tsx` (Where sponsors drop off)
- Create: `src/components/analytics/OutreachTrendChart.tsx` (Sent vs Replies over time)
- Create: `src/components/analytics/PipelineValueChart.tsx` (Monetary value by stage)
- Create: `src/components/analytics/IndustryEngagementChart.tsx` (Reply rate by industry)
- Create: `src/components/analytics/FollowupLiftChart.tsx` (Initial vs follow-up conversion)
- Create: `src/components/analytics/IntentDistributionChart.tsx` (Objections & interest pie)
- Create: `src/app/(app)/app/analytics/page.tsx`

**Interfaces:**
- Produces: 6 Question-phrased responsive Recharts with legends, tooltips, animated draw-in, and empty state fallbacks.

- [ ] **Step 1: Build Funnel Chart and Outreach vs Replies Trend Chart**
- [ ] **Step 2: Build Pipeline Value by Stage Chart and Industry Engagement Chart**
- [ ] **Step 3: Build Follow-up Lift Chart and Intent Distribution Pie Chart**
- [ ] **Step 4: Assemble Analytics Page in `src/app/(app)/app/analytics/page.tsx` with export button and date range filters**
- [ ] **Step 5: Commit analytics dashboard**

---

### Task 17: Settings Hub & Integration Status (`/app/settings`)

**Files:**
- Create: `src/components/settings/ProfileSettings.tsx`
- Create: `src/components/settings/GmailConnectionCard.tsx` (OAuth connect + test mode warning)
- Create: `src/components/settings/IntegrationStatusGrid.tsx` (Gemini, Tavily, Gmail, Supabase health cards)
- Create: `src/components/settings/SendingLimitsCard.tsx`
- Create: `src/components/settings/SuppressionListCard.tsx`
- Create: `src/components/settings/DataExportCard.tsx`
- Create: `src/app/(app)/app/settings/page.tsx`

**Interfaces:**
- Produces: Settings page with honest connection statuses, Gmail OAuth test-mode instructions, daily limits, suppression rules, and CSV exports.

- [ ] **Step 1: Build Profile and Organization settings card**
- [ ] **Step 2: Build Gmail Connection card with OAuth flow triggers and honest test-mode disclaimer**
- [ ] **Step 3: Build Integration Status Grid displaying live connection state for each service**
- [ ] **Step 4: Build Daily Send Limits, Suppression List manager, and Data Export card**
- [ ] **Step 5: Assemble Settings Page in `src/app/(app)/app/settings/page.tsx`**
- [ ] **Step 6: Commit settings hub**

---

### Task 18: Quality Audit, Accessibility, README, & 3-Minute Demo Walkthrough

**Files:**
- Create: `README.md` (Setup instructions, env vars, mock-to-real guide, Gmail test mode guide, 3-minute demo script)
- Audit: All pages for loading skeletons, 4-part empty states, error boundaries, 44px touch targets, and contrast

- [ ] **Step 1: Run comprehensive TypeScript typecheck (`npx tsc --noEmit`) and fix any issues**
- [ ] **Step 2: Audit responsive layouts on Desktop (1440px), Tablet (800px), and Mobile (375px)**
- [ ] **Step 3: Verify all 4-part empty states and loading skeletons match Butter & Green tokens**
- [ ] **Step 4: Write complete `README.md` with zero-credentials setup guide, mock/real toggle guide, and 3-minute demo walkthrough**
- [ ] **Step 5: Final commit**
