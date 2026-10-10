# SponFy - AI Sponsorship Operating System Design Specification

## 1. System Overview & Vision

**SponFy** is an intelligent sponsorship operating system built for college fest conveners, hackathon organizers, university technical clubs, and student communities. It transforms the chaotic, repetitive, and unreliable manual sponsor hunt into an automated, cited, explainable, and human-supervised pipeline.

### Core Product Tenets
1. **Automate the Grunt Work**: Automated discovery, multi-source web research, fit scoring, email drafting, reply classification, and follow-up sequencing.
2. **Personalize, Never Spam**: Zero generic spamming; emails are tailored to company developer/student programs, past sponsorship history, and audience synergy.
3. **Human Approves Every Send**: Hard gate preventing autonomous sends. Human must explicitly review, check safety parameters, and approve each message.
4. **Explainable & Cited AI**: Every fit score has a mathematical factor breakdown with rationale; every research claim links directly to its source URL.
5. **Zero Vanity Metrics**: No unreliable open/click trackers; focus exclusively on genuine thread replies, intent classifications, meeting requests, and committed sponsorship amounts.
6. **Graceful Demo Fallback**: Immediate turnkey capability out of the box with zero environment configuration, rendering rich India-centric demo data ("SponFy Hackathon 2026") with clear demo badges.

---

## 2. Design System & Visual Language (Butter & Green)

Adheres strictly to the canonical tokens, typography, radii, spacing, button hierarchy, card physics, motion, and empty/loading states defined in `butgreendesign.md`.

### 2.1 Color Palette & Tokens
* **Page Canvas Background**: `--butter-bg` (`#FAF4E6`) - Warm organic cream canvas.
* **Surface Panels & Cards**:
  * Standard Card: `--butter-card` (`#FFFFFF`)
  * Elevated Panel: `--butter-panel` (`#FFFDF6`)
* **Forest Greens (Primary Brand & Typography)**:
  * `--green-dark`: `#0C382E` (Primary typography, borders, headers)
  * `--green-deep`: `#08261E` (Darkest anchor green)
  * `--green-hero`: `#0E3B2E` (Hero section background, dark banner panels)
  * `--green-mid`: `#164E3E` (Button hovers, secondary highlights)
  * `--green-light`: `#2A6F5A` (Subheaders, status indicators)
  * `--green-accent`: `#428E75` (Text highlights on dark backgrounds)
  * `--green-sage`: `#8EBDAA` (Muted icons and decorative borders on dark)
* **Butter Golds (Actions & Accents)**:
  * `--butter-cream`: `#FFF0B3` (Primary CTA button `.btn-butter`, badges, vector stroke)
  * `--butter-gold`: `#FEE790` (Active/hover state for butter buttons)
  * `--butter-warm`: `#F6EED8` (Table alternate row striping, subtle dividers)
* **Text On Dark**:
  * `--text-hero-main`: `#FFF5D1`
  * `--text-hero-sub`: `#D8EAE1`
* **Semantic Tones**:
  * Success: `#16A34A` (bg: `rgba(22, 163, 74, 0.12)`, border: `rgba(22, 163, 74, 0.35)`)
  * Warning: `#D97706` (bg: `rgba(217, 119, 6, 0.12)`, border: `rgba(217, 119, 6, 0.35)`)
  * Error: `#DC2626` (bg: `rgba(220, 38, 38, 0.10)`, border: `rgba(220, 38, 38, 0.30)`)
  * Info: `#0284C7` (bg: `rgba(2, 132, 199, 0.12)`, border: `rgba(2, 132, 199, 0.30)`)

### 2.2 Typography Scale (via `next/font`)
* **Hero Display Headline**: `Fraunces` (Serif display, weight 900, `clamp(38px, 5.2vw, 64px)`)
* **Section Titles & UI Headings**: `Outfit` (Geometric sans, weights 700-800)
* **Body & UI Elements**: `Plus Jakarta Sans` (Clean, hyper-legible sans, weights 500-600)
* **Numbers, Metrics, Currencies**: `Space Grotesk` (Monospace/tabular figures, weight 800)

### 2.3 Radii & Elevation
* Radii: `10px` (sm), `14px` (md), `20px` (lg), `24px` (xl), `30px` (pill).
* Card Micro-physics: `.feature-card-interactive` elevates `translateY(-4px)` to `translateY(-8px)` with soft green drop shadow (`0 18px 40px -8px rgba(12, 56, 46, 0.16)`) and sharpens 1px border.
* Hero Motif: Abstract network/data line-art vector strokes in butter (`#FFF0B3` with opacity 0.20), lighting up on hover.

---

## 3. Technology Stack & Multi-Layer Architecture

### 3.1 Core Technologies
* **Framework**: Next.js 15+ (App Router), React 19, TypeScript (strict mode).
* **Styling & Icons**: Tailwind CSS, CSS variables, `lucide-react` (stroke 1.5 for large, 2.0 for UI).
* **Animation & Charts**: Framer Motion (page transitions, micro-physics), Recharts (responsive analytics).
* **Database & ORM**: PostgreSQL + Prisma ORM (`@prisma/client`, `@neondatabase/serverless`) on Neon Serverless.
* **AI & Graph Execution**:
  * Gemini API (`@google/genai`) with structured JSON schema outputs validated by Zod.
  * LangGraph JS (`@langchain/langgraph`) for stateful, multi-step agent workflows.
  * Tavily Search API for targeted web and sponsorship research.
  * Gmail API via `googleapis` with OAuth 2.0 and token encryption.

### 3.2 Layered Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 UI Components & Client Pages                │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             Server Actions & Route Handlers (Zod)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           Repository Layer (lib/data/repositories)          │
│         (Data abstraction: Prisma ORM vs Mock Seed)         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐ ┌─────────────▼───────────────┐
│     Prisma Client (Neon)    │ │     Integrations Layer      │
│   (Postgres Serverless Pool)│ │  (lib/integrations/factory) │
└─────────────────────────────┘ ├─────────────────────────────┤
                                │ • Gemini (Real / Mock)      │
                                │ • Tavily (Real / Mock)      │
                                │ • Gmail (Real / Mock)       │
                                └─────────────────────────────┘
```

UI components NEVER import database clients or 3rd-party integration SDKs directly. All operations pass through repository abstractions and integration factories that inspect environment credentials.

---

## 4. Database Schema & Migration Specification

All tables include `user_id uuid references auth.users(id) on delete cascade` and enforce RLS policies:
`CREATE POLICY "Users access own data" ON <table> FOR ALL USING (auth.uid() = user_id);`

### Tables
1. **`profiles`**: `id` (uuid, PK, references auth.users), `full_name` (text), `organization` (text), `avatar_url` (text), `daily_send_limit` (int, default 30), `created_at` (timestamptz).
2. **`campaigns`**: `id` (uuid, PK), `user_id` (uuid), `name` (text), `event_type` (text), `audience_size` (int), `location` (text), `target_amount` (numeric), `preferred_industries` (text[]), `tiers` (jsonb), `deck_url` (text), `description` (text), `status` (text), `created_at` (timestamptz).
3. **`companies`**: `id` (uuid, PK), `user_id` (uuid), `campaign_id` (uuid), `name` (text), `website` (text), `industry` (text), `description` (text), `stage` (text: *Discovered, Researched, Qualified, Contact Found, Draft Ready, Approved, Contacted, Replied, Interested, Negotiation, Committed, Lost*), `fit_score` (int 0-100), `score_breakdown` (jsonb), `pipeline_value` (numeric), `signals` (jsonb), `confidence` (numeric), `research_status` (text), `created_at` (timestamptz), `updated_at` (timestamptz).
4. **`research_reports`**: `id` (uuid, PK), `company_id` (uuid), `user_id` (uuid), `sections` (jsonb: overview, products, audience, initiatives, programs, sponsorship_angles), `recommended_angle` (text), `created_at` (timestamptz).
5. **`sources`**: `id` (uuid, PK), `company_id` (uuid), `user_id` (uuid), `url` (text), `title` (text), `snippet` (text), `created_at` (timestamptz).
6. **`contacts`**: `id` (uuid, PK), `company_id` (uuid), `user_id` (uuid), `name` (text), `role` (text), `email` (text), `status` (text: *verified, public, needs_verification, unknown*), `source_url` (text), `created_at` (timestamptz).
7. **`email_drafts`**: `id` (uuid, PK), `company_id` (uuid), `contact_id` (uuid), `user_id` (uuid), `subject` (text), `body` (text), `quality` (jsonb: personalization, relevance, clarity, cta, professionalism, overall, suggestions[]), `status` (text: *draft, approved, sent, failed*), `approved_at` (timestamptz), `created_at` (timestamptz).
8. **`messages`**: `id` (uuid, PK), `draft_id` (uuid), `user_id` (uuid), `gmail_message_id` (text), `gmail_thread_id` (text), `direction` (text: *outbound, inbound*), `from_email` (text), `to_email` (text), `subject` (text), `body` (text), `sent_at` (timestamptz).
9. **`reply_analyses`**: `id` (uuid, PK), `message_id` (uuid), `user_id` (uuid), `intent` (text: *Interested, Positive, Needs Info, Negotiating, Not Interested, Maybe Later, Out of Office, Unclear*), `sentiment` (text: *positive, neutral, negative*), `confidence` (numeric), `summary` (text), `questions` (jsonb), `requested_info` (text[]), `next_action` (text), `urgency` (text: *high, medium, low*), `meeting_requested` (boolean), `created_at` (timestamptz).
10. **`followup_sequences`**: `id` (uuid, PK), `user_id` (uuid), `campaign_id` (uuid), `name` (text), `steps` (jsonb: array of {step_number, wait_days, template_angle}), `is_active` (boolean).
11. **`followup_tasks`**: `id` (uuid, PK), `user_id` (uuid), `company_id` (uuid), `sequence_id` (uuid), `step_number` (int), `due_at` (timestamptz), `status` (text: *pending, completed, skipped, cancelled*), `ai_recommendation` (jsonb).
12. **`activities`**: `id` (uuid, PK), `user_id` (uuid), `company_id` (uuid), `campaign_id` (uuid), `type` (text), `payload` (jsonb), `created_at` (timestamptz).
13. **`ai_jobs`**: `id` (uuid, PK), `user_id` (uuid), `type` (text), `status` (text: *queued, processing, completed, failed*), `step` (text), `progress` (int 0-100), `error` (text), `result` (jsonb), `created_at` (timestamptz), `updated_at` (timestamptz).
14. **`gmail_accounts`**: `id` (uuid, PK), `user_id` (uuid), `email` (text), `encrypted_tokens` (text), `is_connected` (boolean), `last_synced_at` (timestamptz).
15. **`suppressions`**: `id` (uuid, PK), `user_id` (uuid), `email` (text), `domain` (text), `reason` (text: *unsubscribed, bounced, not_interested, manual*), `created_at` (timestamptz).
16. **`insights`**: `id` (uuid, PK), `user_id` (uuid), `campaign_id` (uuid), `text` (text), `category` (text), `generated_at` (timestamptz).

---

## 5. AI Workflows & LangGraph Graphs

### 5.1 LangGraph Graph 1: Company Research & Scoring
```
[Start] ──> [Tavily Web Search] ──> [Extract Structured Facts]
                                            │
                                            ▼
[Persist & Stream] <── [Calculate Fit Score] <── [Classify Industry & Programs]
```
* **Search Node**: Executes 4 targeted queries: Developer/student programs, past hackathon sponsorships, tech stack/products, verified partnership contact pages. Stores all source URLs.
* **Extraction Node**: Gathers company summary, target developer demographics, products, open community programs.
* **Fit Scoring Node**: Evaluates 7 weighted criteria:
  1. Industry Relevance (20 pts)
  2. Audience Overlap (20 pts)
  3. Product & Developer Synergy (15 pts)
  4. Event Relevance (15 pts)
  5. Student/Campus Program History (15 pts)
  6. Financial/Sponsorship Capability (10 pts)
  7. Geographic Alignment (5 pts)
  * Outputs exact numerical score (0-100), confidence percentage, and structured `score_breakdown` with positive and negative reasoning.
* **State Updates**: Progress is persisted to `ai_jobs` and streamed to the client UI.

### 5.2 LangGraph Graph 2: Outreach Generation & Human Gate
```
[Start] ──> [Draft Email with Gemini] ──> [Email Quality Evaluation]
                                                      │
                                                      ▼
[Gmail API Send] <── (Resume on Approval) <── [INTERRUPT: Human Approval Gate]
```
* **Drafting Node**: Takes campaign deck, tier pricing, student audience profile, company research angle, and contact role. Produces crisp, non-cliché outreach email.
* **Quality Score Node**: Scores on 5 dimensions (Personalization, Relevance, Clarity, CTA, Professionalism) and outputs 1-3 concrete improvement suggestions.
* **Interrupt Node**: Invokes LangGraph's native `interrupt()` function. Workflow pauses.
* **Human Approval**: The UI shows the draft in the Outreach Approval Queue with a 4-point Safety Checklist:
  * Recipient email verification status
  * Explicit sponsorship ask & tier included
  * Suppression / Do-Not-Contact check
  * Daily send limit check
* **Send Execution**: Only when the user clicks "Approve & Send" in the confirmation modal does the server action resume the graph and dispatch via Gmail API.

---

## 6. Page Specifications & User Interface

### 6.1 Landing Page (`/`)
1. **Sticky Pill Header**: SponFy wordmark with butter accent, navigation pills (Product, Workflow, Showcase, Analytics, FAQ), "Log in" link, and primary `.btn-butter` ("Start a campaign").
2. **Hero Section**: Deep forest green (`#0E3B2E`) with organic butter blob gradients and interactive network line-art vector. Display headline in `Fraunces`: *"Find, research and win event sponsors — with AI that asks before it sends."* Subheadline tailored to student organizers. Dual CTA ("Start a campaign" + "See how it works"). Overlapping live preview card showing a realistic Kanban lead card and "Why 86?" fit score card.
3. **Trust Strip**: 3 golden pillars with subtle dividers:
   * *Human approves every email*
   * *Every claim has a verified source*
   * *Real thread replies, not vanity opens*
4. **5-Step Workflow Storytelling**: Interactive scroll section with live micro-UIs:
   * 01. Discover Leads
   * 02. Deep Cited Research
   * 03. Explainable Fit Scoring
   * 04. Human-Supervised Outreach
   * 05. Reply Intelligence & Follow-ups
5. **Showcase Carousel**: White rounded cards on butter canvas displaying curated company dossiers (e.g. Postman, Devfolio, Razorpay, GitHub Campus, MongoDB).
6. **Approval & Reply Intelligence Showcase**: Interactive comparison of the draft approval gate and the inbound reply analyzer.
7. **Analytics Preview**: Funnel visualization and response distribution chart animated on scroll.
8. **Why SponFy (4 Honest Differentiators)**:
   * No made-up emails
   * Human gatekeeper
   * Sourced intelligence
   * Zero open-tracking vanity
9. **FAQ Accordion**: Gmail safety, Google OAuth test mode, data privacy, refund policy.
10. **CTA Banner & Footer**: Dark green panel with butter button and full sitemap footer.

### 6.2 Authenticated Dashboard (`/app`)
* **Shell**: Deep-green collapsible sidebar, campaign switcher dropdown, global search bar, Gmail connection status badge, demo data indicator, user avatar. On mobile: bottom floating tab bar.
* **Overview (`/app`)**:
  * 8 Metric KPIs (Prospects, Qualified, Contacted, Sent, Reply Rate, Positive Replies, Meetings, Committed Funds vs Target Progress Bar).
  * "Today" Action Queue with 1-click action buttons (e.g., "Postman requested meeting - Reply now", "Approve Devfolio draft", "3 follow-ups due").
  * Pipeline distribution mini-chart & Recent Activity Feed.
  * AI Campaign Insights Card (data-driven tactical recommendations).
* **Discover (`/app/discover`)**:
  * Natural language prompt search box (e.g. *"Find 25 cloud and devtool companies sponsoring Indian student hackathons with ₹50k+ budgets"*).
  * Live streaming job progress panel with multi-step checklist (Searching -> Collecting sources -> Analyzing -> Scoring).
  * Ranked candidates table with 1-click "Add to Campaign".
* **Sponsors Pipeline (`/app/sponsors`)**:
  * Interactive Drag & Drop Kanban stage board (12 stages) + Sortable/Filterable Table view.
  * Filters: Industry, Fit Score range, Stage, Research Status.
* **Sponsor Detail (`/app/sponsors/[id]`)**:
  * 6 Structured Tabs:
    1. **Research**: Overview, products, student/dev programs, recent initiatives, sponsorship angle, sources list with clickable links.
    2. **Fit Score**: "Why 86?" interactive breakdown with positive/negative points and rationale.
    3. **Contacts**: Listed contacts with verification badges (`verified`, `public`, `needs_verification`, `unknown`) and source links.
    4. **Outreach**: Generated email drafts, quality score meters, tone regenerator.
    5. **Timeline**: Chronological audit trail of all discoveries, edits, approvals, emails, and replies.
    6. **Next Best Action**: AI decision card suggesting the optimal next step.
* **Outreach Approval Queue (`/app/outreach`)**:
  * Filter drafts by status (Draft, Awaiting Review, Approved, Sent).
  * Email Composer & Tone Switcher (Professional, Enthusiastic, Value-First, Short).
  * Safety Checklist & Stepper: Draft -> Review -> Approved -> Sent.
  * Confirmation modal before send.
* **Replies Inbox (`/app/replies`)**:
  * Split-view: Left side thread list with intent tags; Right side active thread and Gemini Reply Intelligence panel (Intent, Confidence, Summary, Questions asked, Requested info, Suggested next action).
* **Follow-ups Engine (`/app/followups`)**:
  * Configurable cadence (Step 1: 4 days, Step 2: 7 days, Stop).
  * Pending task queue with AI "Should we follow up?" recommendation engine.
* **Analytics (`/app/analytics`)**:
  * 6 Question-phrased charts:
    1. *Where are sponsors dropping off in the funnel?* (Conversion Funnel)
    2. *How is outreach volume translating into replies?* (Sent vs Replies Area Chart)
    3. *What is the monetary value across each pipeline stage?* (Pipeline Stage Bar Chart)
    4. *Which industries show the highest engagement?* (Industry Reply Rate Radar/Bar)
    5. *How much extra response do follow-ups generate?* (Follow-up Lift Chart)
    6. *What are the most common sponsor reply objections & interests?* (Intent Breakdown Pie)
* **Settings (`/app/settings`)**:
  * Profile & Organization details.
  * Gmail OAuth Connect with honest test-mode disclaimer.
  * Integration connection status cards (Gemini, Tavily, Gmail, Neon PostgreSQL) showing live health.
  * Daily send cap configuration (default: 30).
  * Suppression list management (Add/Remove blocked domains).
  * CSV/JSON Data export.

---

## 7. Verification & Quality Assurance Plan

1. **Type Safety & Lint**: Strict TypeScript with no `any` types; Zod validation for all API inputs and AI structured outputs.
2. **Demo Mode Integrity**: Runs standalone with `npm run dev` with mock engines when environment variables are omitted; realistic demo seed dataset ("SponFy Hackathon 2026").
3. **Accessibility**: Minimum 4.5:1 contrast, 44px touch targets on mobile, full keyboard navigation, ARIA labels on icon buttons, reduced-motion fallbacks.
4. **State Coverage**: Loading skeletons with butter shimmer, 4-part empty states (icon in butter circle, headline, body, CTA), error states with retry buttons.
