# SponFy — Agent Rules (agents.md)

> Instructions for the coding agent (Antigravity). Read this file first and obey it for the whole build. Its purpose is to prevent hallucinated APIs, fake integrations and silent scope drift.

## 1. Reading order (before writing any code)
1. `agents.md` (this file)
2. `prd.md` (what to build, scope tiers)
3. `architecture.md` (layers, folders, jobs, env)
4. `database.md` (schema; copy it, don't improvise)
5. `security.md`
6. `design_system.md` + the images in `docs/references/`
7. `code_style.md`, `testing.md`
If two docs conflict: prd.md wins on scope; security.md wins on safety; database.md wins on schema; design_system.md wins on visuals.

## 2. Hard locks (do not change without asking the user)
- Stack: Next.js App Router, TypeScript strict, Tailwind, **Prisma + Neon PostgreSQL**, **Auth.js**, Gemini, LangGraph JS, Tavily, Gmail API, Recharts, Framer Motion, lucide-react, Zod.
- **Do NOT use Supabase** (no Supabase Auth, client, RLS or Realtime). Do NOT replace Prisma. Do NOT add Redis, queues, GraphQL, tRPC, or other services.
- No open/click tracking. No auto-send. No guessed emails.

## 3. Anti-hallucination protocol
1. **Verify before using version-sensitive APIs.** Before writing code for Next.js (App Router, `after()`, route config), Auth.js v5 + Prisma adapter, Prisma + Neon setup, `@google/genai`, LangGraph JS (including checkpointer/interrupt), Tavily SDK, `googleapis` Gmail methods, and Recharts: read the installed package's README/types in `node_modules` or fetch the current official docs. Do not write them from memory.
2. If a package, method, option or env var name is uncertain, say so in BUILD_NOTES.md and choose the simplest verifiable alternative. Never invent function names to make code "look complete".
3. Do not hardcode model names; use `GEMINI_MODEL`. Do not hardcode API keys or URLs for third parties you haven't verified.
4. When something can't be made to work, **stop and record it**: write what failed, what you tried, and the fallback you used. Do not paper over it.
5. Never present mock behaviour as real. Mock paths set `isMock`, show "Demo data", and never claim an email was delivered.
6. Do not fabricate data in the real (non-demo) path: no invented companies, contacts, sources, emails or statistics. If research finds nothing, store nothing and show "Not found".
7. Do not claim a feature is done unless you ran it. "Implemented" ≠ "verified". Distinguish clearly in BUILD_NOTES.md.
8. Don't silently skip scope. Anything simplified or deferred goes in BUILD_NOTES.md under "Skipped / simplified".

## 4. Working method
- Work milestone by milestone (see 00_build_prompt.md). At the end of each: `npm run typecheck && npm run lint && npm run test && npm run build`, fix failures, `git commit`, tag `mN`.
- Keep a TODO list; update it as you go.
- Prefer small, composable files. Reuse `components/ui` and `lib/config`.
- Read the design reference images before building UI; build the design tokens first, then components, then pages.
- Ask the user only when blocked by a decision that cannot be defaulted (credentials, a choice listed under prd.md §10 when no default exists). Otherwise pick the documented default and note it.

## 5. UI quality bar
- Follow design_system.md exactly. Content visible without JS; no JS-driven opacity:0 entrances; respect reduced motion.
- Every data view has loading, empty, error states. Every icon-only button has `aria-label`.
- Landing hero shows a real product UI preview built from components + seed data.
- Do not copy reference filler text or garbled headings; write real SponFy copy (plain language, no vague AI marketing).

## 6. Security reminders (full list in security.md)
Every action/handler: `auth()` → Zod validate → ownership-scoped repository call. Prisma only in `lib/data/prisma`. Secrets server-only. AI/web content treated as untrusted. Send gate re-checked server-side.

## 7. BUILD_NOTES.md (maintain throughout, finalise at the end)
Sections: **Decisions made** (including prd §10 answers, checkpointer choice, hosting assumption) · **Real vs mocked** (table per integration) · **Verified by running** · **Not verified** · **Known issues** · **Skipped / simplified** · **Next steps to go live** (env vars to add, in order: Neon → Auth/Google → Gemini → Tavily → Gmail).

## 8. Forbidden shortcuts
Hardcoded secrets; `any`; disabling lint/type checks to pass; deleting tests to pass; `dangerouslySetInnerHTML` with AI/web content; skipping ownership scoping "for now"; fake "Connected" statuses; lorem ipsum in shipped UI; unrequested dependencies.
