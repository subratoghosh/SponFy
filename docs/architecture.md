# SponFy — Architecture (architecture.md)

> HOW the system is structured. Locked stack: Next.js (App Router) + TypeScript (strict) + Tailwind, PostgreSQL on **Neon**, **Prisma**, **Auth.js (next-auth v5)**, Gemini, LangGraph JS, Tavily, Gmail API (`googleapis`), Recharts, Framer Motion, lucide-react, Zod.
> Anything not listed needs a written justification in BUILD_NOTES.md before adding.

## 1. Layers (strict, one-directional)
```
UI components (server components by default)
   ↓ calls
Server Actions / Route Handlers (auth + Zod validation + authorization)
   ↓ calls
Services (lib/services/*)  ← business rules, orchestration
   ↓ calls
Repositories (lib/data/*)  ← the ONLY place Prisma is imported
   ↓
Prisma → Neon Postgres        |   (Demo Mode) in-memory mock repositories
Integrations (lib/integrations/*) are called by services only.
```
Rules:
- UI never imports Prisma or integration clients.
- Every repository function takes `userId` as its first argument and scopes every query by it (see security.md).
- Repositories have an interface; `lib/data/index.ts` returns Prisma or mock implementation based on env.

## 2. Folder structure
```
/app
  (marketing)/page.tsx                 landing
  (auth)/login/page.tsx
  onboarding/page.tsx
  app/                                  authenticated shell (layout.tsx = sidebar + topbar)
    page.tsx                            Overview
    campaigns/ (page, new, [id])
    discover/page.tsx
    sponsors/ (page, [id])
    outreach/ (page, [id])
    replies/page.tsx
    follow-ups/page.tsx
    analytics/page.tsx
    settings/page.tsx
  api/
    auth/[...nextauth]/route.ts
    gmail/connect/route.ts              starts OAuth
    gmail/callback/route.ts
    gmail/sync/route.ts                 manual sync (auth required)
    jobs/[id]/route.ts                  job status polling
    jobs/discover/route.ts              start discovery job
    jobs/research/route.ts              start research job (one company)
    cron/sync/route.ts                  secured by CRON_SECRET
/components
  ui/ (Button, Card, Badge, Dialog, Toast, Skeleton, EmptyState, ...)
  marketing/ app-shell/ campaigns/ sponsors/ outreach/ replies/ analytics/
/lib
  auth.ts                               Auth.js config
  env.ts                                Zod-validated env (server) + public env
  config/ (nav.ts, stages.ts, intents.ts, scoring.ts, limits.ts)
  data/ (index.ts, types.ts, prisma/*.ts, mock/*.ts)
  services/ (campaigns, discovery, research, scoring, outreach, gmail, replies, followups, analytics)
  integrations/
    gemini/ (index.ts interface+factory, real.ts, mock.ts, schemas.ts, prompts/*.ts)
    tavily/ (index.ts, real.ts, mock.ts)
    gmail/  (index.ts, real.ts, mock.ts)
  graphs/ (research.graph.ts, outreach.graph.ts)
  crypto.ts                             AES-256-GCM encrypt/decrypt for tokens
  db.ts                                 Prisma client singleton
/prisma  schema.prisma, migrations/, seed.ts
/docs    (these files + references/)
```

## 3. Integration adapter pattern
Each integration exports:
```ts
export interface TavilyClient { search(q: SearchInput): Promise<SearchResult[]> }
export function isConfigured(): boolean
export function getTavily(): TavilyClient  // real if configured and not demo, else mock
```
- Mock implementations return realistic India-relevant data and are clearly flagged (`isMock: true` surfaces a "Demo data" badge).
- `GET /api/integrations/status` returns honest per-service status for the Settings page.
- Never write a mock that pretends to succeed on a real action (e.g. mock Gmail "send" must record `isMock` and never claim real delivery).

## 4. Authentication (Auth.js)
- `next-auth` v5 with `@auth/prisma-adapter`, **JWT session strategy** (so middleware works on the edge without Prisma).
- Provider: Google (basic `openid email profile` only for sign-in).
- **Gmail is a separate "Connect Gmail" OAuth flow** (incremental scopes `gmail.send`, `gmail.readonly`, `access_type=offline`, `prompt=consent`). Tokens go to `GmailAccount`, encrypted. Do not put Gmail scopes in the sign-in provider.
- Middleware protects `/app/**` and `/onboarding`. Every Server Action and Route Handler re-checks `auth()` itself (middleware is not authorization).
- Verify exact Auth.js v5 + Prisma adapter setup against current official docs before writing it. Do not rely on memory.

## 5. Database access (Neon + Prisma)
- Two connection strings: `DATABASE_URL` (Neon **pooled** host, used at runtime) and `DIRECT_URL` (direct host, used for migrations).
- Use the setup Prisma's current docs recommend for Neon/serverless (including driver adapter if required by the installed Prisma version). Check the installed version's docs; do not guess config syntax.
- `lib/db.ts` exports a singleton client (guard against hot-reload duplication).
- Migrations via `prisma migrate dev` locally and `prisma migrate deploy` in deploy. Seed via `prisma/seed.ts`.
- **No Supabase, no RLS.** Isolation is enforced in the repository layer (security.md §2).

## 6. AI architecture
- **Gemini** (`@google/genai`), model from `GEMINI_MODEL`. Always request structured JSON and validate with Zod; on validation failure retry once with the error message, then fail the job step gracefully. Never render raw model output as HTML.
- **LangGraph JS — exactly two graphs:**
  1. `research.graph`: search(Tavily) → extract → classify → score → persist. Per-node retry. Writes progress to `AiJob` after each node.
  2. `outreach.graph`: draft → qualityScore → **interrupt (await human approval)** → send. Needs a checkpointer so state survives between request and approval. Use a Postgres checkpointer on Neon if the installed LangGraph packages provide one; **verify the package name and API in current docs**. If it can't be made reliable in time, fall back to persisting draft state in `EmailDraft.status` and make the "interrupt" the DB status gate (approval simply enables the send step). Record the choice in BUILD_NOTES.md.
- **Plain Gemini calls (no graph):** discovery candidate extraction, reply classification, next-best-action, campaign insights, follow-up recommendation.
- **Tavily:** queries for sponsorship/partnership pages, developer & student programs, recent hackathon/campus activity, official contact/partnership pages. Store every URL in `Source`.

## 7. Long-running jobs (serverless-safe)
- Start job → create `AiJob(status=QUEUED)` → return `jobId` immediately → work runs in a route handler with `export const maxDuration = …` and `after()`/background continuation as supported by the installed Next version (verify).
- **Chunk work per company** so each invocation is short: discovery = 1 job; research = one job per company, started in a small parallel batch (e.g. 3 at a time).
- Client polls `GET /api/jobs/[id]` every ~1.5 s while RUNNING (no websockets, no extra realtime service). State is always read from `AiJob`, so refresh does not lose progress.
- A job stuck RUNNING > 10 min is marked FAILED by the next poll.

## 8. Gmail flow
- Send: build RFC 2822 message → `users.messages.send` → store `gmailMessageId`, `gmailThreadId`, set draft SENT, create `Message` (OUTBOUND) + `Activity`.
- Follow-ups reuse the same `threadId` (and `In-Reply-To`/`References` headers) so they thread properly.
- Sync: for each open thread, `users.threads.get`; any INBOUND message not yet stored → create `Message`, run reply analysis, update company stage, create `Activity`, cancel pending follow-ups if meaningful.
- Bounce: inbound from `mailer-daemon`/delivery-status patterns → mark contact bounced, add to `Suppression`, stop sequences.
- Refresh tokens handled server-side; on `invalid_grant` mark `GmailAccount.status = REVOKED` and show a reconnect banner.
- Honest limits: no open/click tracking; Testing-mode OAuth (test users only).

## 9. Scheduling
- `/api/cron/sync` (header `Authorization: Bearer ${CRON_SECRET}`) syncs replies and enqueues due follow-up *drafts*. Configure Vercel Cron (or any scheduler) separately. Manual "Sync replies" button always works.

## 10. Analytics
- Computed server-side by `lib/services/analytics.ts` using Prisma `groupBy`/aggregates scoped by `userId` (+ optional `campaignId`). No client-side aggregation of raw rows. Cache per request only.

## 11. Environment variables (`.env.example`)
```
DATABASE_URL=            # Neon pooled
DIRECT_URL=              # Neon direct (migrations)
AUTH_SECRET=             # openssl rand -base64 32
AUTH_URL=                # app base URL (if required by Auth.js version)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
GOOGLE_GMAIL_REDIRECT_URI=
GEMINI_API_KEY=
GEMINI_MODEL=
TAVILY_API_KEY=
TOKEN_ENCRYPTION_KEY=    # 32 bytes base64, for Gmail tokens
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEMO_MODE=true
```
`lib/env.ts` validates server vars with Zod and exposes `isConfigured` helpers. Server secrets must never be imported into client components (use `import "server-only"`).

## 12. Demo Mode mechanics
`NEXT_PUBLIC_DEMO_MODE=true` OR no `DATABASE_URL` → mock repositories (seed data in memory, resettable) and mock integrations. Auth in Demo Mode: a clearly labelled "Continue as demo user" button that sets a demo session (disabled in production builds unless the demo flag is on). Data written in Demo Mode is in-memory only and the UI says so.
