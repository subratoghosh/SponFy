# SponFy — Build Prompt (00_build_prompt.md)

You are the lead engineer and designer building **SponFy**, an AI sponsorship operating system for college fests, hackathons, clubs and student communities (find sponsors → research with sources → explainable fit score → personalised email → human approval → Gmail send → reply intelligence → follow-ups → analytics).

## Step 0 — Read the project docs (mandatory, in this order)
`docs/agents.md` → `docs/prd.md` → `docs/architecture.md` → `docs/database.md` → `docs/security.md` → `docs/design_system.md` (+ view every image in `docs/references/`) → `docs/code_style.md` → `docs/testing.md`.
Follow `agents.md` rules throughout. They exist to stop invented APIs and fake integrations. Locked stack: Next.js + TypeScript + Tailwind, **Prisma + Neon PostgreSQL**, **Auth.js**, Gemini, LangGraph JS, Tavily, Gmail API. **No Supabase.**

Before coding, reply with: (a) a 10-line summary of what you will build, (b) the answers you are adopting for prd.md §10, (c) a list of version-sensitive packages you will verify in docs/`node_modules` first. Then continue without waiting for approval.

## Milestones (complete in order; after each run typecheck + lint + test + build, fix, commit, tag)
**M1 Foundation** — Next.js app, Tailwind theme from design tokens, fonts, `lib/config/*`, `lib/env.ts`, Prisma schema from database.md + first migration, Neon wiring (pooled + direct URL), Auth.js (Google, JWT sessions, Prisma adapter), middleware, repository interfaces with Prisma + in-memory mock implementations, `lib/data/seed-data.ts` + `prisma/seed.ts`, Demo Mode (works with zero credentials), `.env.example`, `lib/crypto.ts`, base `components/ui` kit (buttons, cards, badges, dialog, toast, skeleton, empty state), app shell (sidebar, top bar, mobile bottom nav).
**M2 Landing website** — all sections in design_system.md §6, responsive, animated per §9, hero with real product-UI preview from seed data, real copy.
**M3 Campaigns + sponsors** — campaign list/create wizard/detail; Sponsors kanban + table; company detail tabs shell; contacts CRUD with status rules; activities/timeline.
**M4 Discovery + research** — adapters (Tavily/Gemini real + mock), `AiJob` flow with polling, Discover page with live step list, research UI (sections + sources + confidence), fit score + "Why N" breakdown, `research.graph`.
**M5 Outreach** — draft generation, quality score, editor, safety checklist, approval dialog + stepper, Gmail OAuth connect/disconnect, Gmail send (idempotent), `outreach.graph` (or the documented DB-gate fallback).
**M6 Replies + follow-ups** — thread sync (button + cron endpoint), bounce detection, reply analysis, next best action, follow-up sequences with safeguards, Replies page, company timeline.
**M7 Analytics + Overview** — KPIs, the seven charts from prd.md §6.10 (each titled as a question), Today action queue, insights card (≥10 sent), Settings page (integration status, send cap, suppression list, export).
**M8 Polish + verification** — states audit, responsive audit (375/768/1280), accessibility pass, security review against security.md, authorization tests, README with setup + how to switch each integration from mock to real + Gmail test-mode steps + a 3-minute demo script, final `BUILD_NOTES.md`.

## Non-negotiables
- Human approval before every send; backend re-checks at send time.
- Never invent contact emails or fabricate data in the real path; always store source URLs.
- No open/click tracking anywhere; no Supabase; Prisma only inside `lib/data/prisma`.
- Mock mode is clearly labelled; never claim an integration works unless you ran it with real credentials.
- Content visible without JS; honour reduced motion; WCAG AA.

## Final deliverable
`npm run dev` runs the full product in Demo Mode with zero credentials. With real keys added in the documented order (Neon → Google auth → Gemini → Tavily → Gmail) the same UI works against real services without rewriting components. `BUILD_NOTES.md` honestly lists what is real, mocked, unverified and skipped.
