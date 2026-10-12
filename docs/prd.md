# SponFy — Product Requirements Document (prd.md)

> Source of truth for WHAT we build. If another doc conflicts with this one on scope, this file wins.
> Stack decision (locked): Next.js + TypeScript + Tailwind, **PostgreSQL on Neon via Prisma**, **Auth.js**, Gemini, LangGraph JS, Tavily, Gmail API. **No Supabase.**

## 1. One-line pitch
SponFy is an AI sponsorship operating system for college fests, hackathons, clubs and student communities: it finds sponsors, researches them with cited sources, scores fit with an explanation, drafts personalised emails, requires human approval, sends via Gmail, reads replies, classifies them, recommends the next action, runs follow-ups and shows campaign analytics.

## 2. Users
- **Primary:** student organisers / event teams (non-technical, time-poor, India-based, amounts in INR).
- **Not in scope:** agencies, multi-user team workspaces (later).

## 3. Principles (non-negotiable)
1. Automate repetitive work (research, sorting, drafting, follow-ups).
2. Personalise, never spam. Each email must reference company-specific research.
3. **Human approves every send.** No code path sends email without an APPROVED draft.
4. Every AI judgement is explainable and sourced (source URLs stored and shown).
5. **Never invent contact emails.** Only publicly listed emails, with the source URL. Otherwise status UNKNOWN.
6. Replies, meetings and committed sponsors matter more than opens/clicks.
7. Be honest: unconfigured integrations show "Not configured" / "Demo data". Never fake "connected".

## 4. Core journey
Landing → Sign in (Google) → Onboarding (org profile → connect Gmail → first campaign) → Campaign brief → Discover → Review ranked companies → Research detail (+ "Why this score") → Add/verify contact → Generate draft → Quality score → Edit → Approve → Send via Gmail → Sync replies → AI classification + next best action → Follow-up / move stage → Analytics.

## 5. Scope tiers
### Tier 1 — MVP (must work end-to-end)
1. Landing website
2. Auth (Google sign-in via Auth.js)
3. Campaign create/edit (name, event type, audience size, location, target amount, industries, sponsorship tiers, deck link)
4. Sponsor discovery (Tavily + Gemini → structured candidates)
5. AI research per company (sections + sources + confidence)
6. Explainable fit score (0–100 with per-factor breakdown)
7. Contact management (manual add/edit + publicly found contacts with status)
8. AI email generation + quality score
9. Human approval gate with safety checklist
10. Gmail send (OAuth, store message + thread IDs)
11. Reply sync (poll threads, match by thread ID)
12. Dashboard analytics (KPIs + core charts)

### Tier 2 — Differentiators
1. Reply intelligence (intent, sentiment, questions, requested info, urgency, meeting flag)
2. Next best action per company + "Today" action queue on Overview
3. Follow-up sequences with safeguards
4. Company relationship timeline
5. Email quality score with concrete suggestions
6. Campaign insights card (only when enough data)

### Tier 3 — Future (do NOT build now)
Open/click tracking, Gmail Pub/Sub push, team workspaces, deck generation, calendar booking, third-party contact enrichment, billing.

## 6. Functional requirements

### 6.1 Campaign
Fields: name, eventType, audienceSize, location, targetAmount (INR), preferredIndustries[], tiers (name, amount, perks), deckUrl, description. A campaign is the context for all AI prompts.

### 6.2 Discovery
Input: free-text prompt + campaign context. Output: N company candidates (name, website, industry, description, why relevant, sponsorship type, programs, source URLs, confidence). Runs as an `AiJob` with visible steps: Searching → Collecting sources → Analysing → Scoring → Complete. Results stream into the list as they finish (client polls job status).
Dedupe by normalised domain within a campaign.

### 6.3 Research + Fit score
Per company: overview, products, industry, target audience, recent initiatives, community/developer programs, sponsorship opportunities, recommended outreach angle, public contact info, sources, confidence.
Fit score = weighted sum of factors (industry relevance, audience overlap, product relevance, event relevance, community/student-program history, sponsorship capability, geography). Store `scoreBreakdown` as `[{factor, points, maxPoints, reason, positive}]`. UI shows "Why this scored N" with + / − lines. Weights live in one config file.
Companies scoring ≥ configurable threshold (default 70) auto-advance to QUALIFIED; user can override.

### 6.4 Contacts
Status: VERIFIED (user confirmed), PUBLIC (found on an official page, sourceUrl required), NEEDS_VERIFICATION, UNKNOWN. Preferred roles: Sponsorship, Partnerships, Marketing, Community, DevRel, BizDev. Sending to NEEDS_VERIFICATION/UNKNOWN requires explicit user confirmation in the safety checklist.

### 6.5 Drafts and approval
Draft structure: subject, personalised intro, why relevant, event overview, specific sponsorship ask (referencing campaign tiers), value to the company, clear CTA, closing. Regenerate with tone/angle options. Quality score: personalization, relevance, clarity, CTA, professionalism, overall + 1–3 suggestions.
Status flow: DRAFT → APPROVED → SENDING → SENT (or FAILED). Edits after approval reset to DRAFT.
Safety checklist before Approve: recipient status, contains a sponsorship ask, recipient not suppressed, daily send cap not exceeded.

### 6.6 Gmail
Connect via OAuth (scopes: gmail.send, gmail.readonly). Send approved drafts; store gmailMessageId + gmailThreadId. Reply detection by polling threads (manual "Sync replies" button + secured cron endpoint). Bounce detection from delivery-failure messages. **No open/click tracking in this build; do not show open or click rates anywhere.** Google OAuth app runs in Testing mode (team added as test users) — state this in Settings.

### 6.7 Reply intelligence
Intent: INTERESTED, POSITIVE, NEEDS_INFO, NEGOTIATING, NOT_INTERESTED, MAYBE_LATER, OUT_OF_OFFICE, UNCLEAR. Also sentiment, confidence, summary, questions asked, requested info, next action, urgency, meetingRequested. UI offers a one-click action (Draft reply / Schedule follow-up / Move to Negotiation).

### 6.8 Follow-ups
Default: wait 4d → follow-up 1 → wait 7d → follow-up 2 → stop; max configurable. Rules: stop on any meaningful reply; never after NOT_INTERESTED or bounce; manual cancel; AI gives a "should we follow up?" recommendation with reason. Follow-up drafts also go through approval (no auto-send).

### 6.9 Pipeline
Stages: DISCOVERED, RESEARCHED, QUALIFIED, CONTACT_FOUND, DRAFT_READY, APPROVED, CONTACTED, REPLIED, INTERESTED, NEGOTIATION, COMMITTED, LOST. Kanban (drag) + table. Mobile: stage-grouped list with a stage dropdown. Each company has `pipelineValue` (INR) feeding "pipeline vs target".

### 6.10 Analytics
KPIs: total prospects, qualified, emails sent, reply rate, positive reply rate, meetings, active negotiations, committed, pipeline ₹ vs target.
Charts (each answers a question): Funnel (where do we lose sponsors?), Replies over time (is outreach working?), Pipeline value by stage (will we hit target?), Reply rate by industry (which category to focus on?), Campaign comparison (which pitch works?), Follow-up lift (do follow-ups help?), Activity timeline. Insights card only when ≥ 10 sent emails.

### 6.11 Settings
Profile/org, Gmail connection, integration status (Connected / Not configured per service), send limits (daily cap default 30), follow-up defaults, suppression list, data export (JSON).

### 6.12 Admin Console (/admin)
Role-based routing (`role: ADMIN` vs `USER`). Admin access is verified server-side only via `ADMIN_EMAILS` environment variable. Non-admins requesting `/admin` receive a 404. Logged-in admins are redirected to `/admin` and never see `/app` shell. Platform overview shows aggregate metrics only (admins cannot read private campaigns or email content). All admin mutations are logged in `AdminLog`.

### 6.13 Showcase Companies (Landing Page)
Landing page showcase section is powered by `ShowcaseCompany` database model (name, websiteUrl, logoUrl with https requirement and initials avatar fallback, industry, shortDescription, sortOrder, isVisible, isPartner). Admin CRUD under `/admin/showcase` with Zod validation, order controls, visibility toggles, and instant cache revalidation. Truthfully labelled ("Types of companies sponsors approach").

## 7. Demo Mode (required)
`NEXT_PUBLIC_DEMO_MODE=true` or missing credentials → mock adapters + seeded campaign "SponFy Hackathon 2026" (Hackathon, 800 students, Surat, target ₹5,00,000; Developer tools, Cloud, Fintech, SaaS, EdTech) with ~24 companies across all stages, ~12 sent emails, ~7 replies with analyses, 60 days of activity. "Demo data" badge visible. App must run with `npm run dev` and zero credentials (SQLite is NOT used; mock repositories serve data in-memory when `DATABASE_URL` is absent — see architecture.md).

## 8. Non-goals
No auto-send, no scraping of private data, no guessed emails, no tracking pixels, no multi-tenant orgs, no payments.

## 9. Success criteria (hackathon demo, ≤ 3 min)
Create campaign → discover → research streams live → explainable score → approve personalised email → send → reply arrives → AI classifies + recommends action → dashboard updates. Must also work fully in Demo Mode as a fallback.

## 10. Open decisions (answer in M1, record in BUILD_NOTES.md)
1. Sign-in: Google only (default) vs add email magic link.
2. Hosting: Vercel (default). Affects job duration limits (see architecture.md §7).
3. Gemini model name: set via `GEMINI_MODEL` env var; do not hardcode.
