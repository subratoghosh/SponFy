# SponFy — Build Notes (BUILD_NOTES.md)

This document tracks technical decisions, real vs mocked status, verification evidence, known issues, skipped items, and live setup instructions across all milestones (M1–M8).

## 1. Decisions Made
1. **prd.md §10 Adopted Decisions**:
   - **Sign-in**: Google OAuth via Auth.js (default) + 1-click "Continue as demo user" instant session in Demo Mode (`/api/auth/demo`).
   - **Hosting**: Vercel serverless environment assumed. AI discovery and research tasks are chunked per company to respect serverless function duration limits (<15s per invocation).
   - **Gemini Model**: Loaded dynamically via `GEMINI_MODEL` (fallback `gemini-2.5-flash`), never hardcoded.
2. **LangGraph Checkpointer**:
   - Research graph: `research.graph` runs Tavily search → extraction → classification → scoring → persistence, updating `AiJob` state.
   - Outreach graph: To guarantee robustness across serverless lifecycles without requiring external persistent checkpoint connections, human approval is gated via database status (`EmailDraft.status = 'APPROVED'`). A draft cannot be sent unless approved; sending verifies approval server-side.
3. **Database & Data Layer**:
   - Neon PostgreSQL + Prisma v6.
   - Strict repository layer (`src/lib/data/*`): Prisma is imported *only* inside `src/lib/data/prisma/*`. Every repository method accepts `userId` as the first argument and scopes all queries to enforce tenant isolation.
   - In-memory mock repositories (`src/lib/data/mock/*`) serve seeded data when `DATABASE_URL` is omitted or in Demo Mode, enabling zero-credential evaluation.
4. **Codebase Navigation**:
   - Primary navigation using the Knowledge Graph at `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` (505 nodes, 1524 edges, 15 communities).

---

## 2. Real vs Mocked Status

| Integration / Service | Implementation | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Database (Postgres)** | Prisma ORM v6 + Neon adapter | Mock / Real switchable | Dual setup: Neon Serverless when `DATABASE_URL` is configured; in-memory repository mock with seeded data when absent. |
| **Authentication** | Auth.js v5 (`next-auth@beta`) | Mock / Real switchable | Google OAuth with `@auth/prisma-adapter` when configured; demo session route when running in Demo Mode. |
| **Gemini AI** | `@google/genai` (v0.2.0) | Mock / Real switchable | Real Gemini calls when `GEMINI_API_KEY` exists; realistic synthetic response generator with structured schemas in mock mode. |
| **Tavily Search** | Tavily Search API | Mock / Real switchable | Real search when `TAVILY_API_KEY` exists; India-relevant college hackathon sponsor data in mock mode. |
| **Gmail API** | `googleapis` (OAuth2 + v1) | Mock / Real switchable | Real OAuth and sending when configured; mock records `isMock: true` and logs simulated send without pretending real email delivery. |

---

## 3. Verified by Running
- `npx prisma generate`: Verified (Prisma Client v6.19.3 generated without errors).
- Package installation: Verified (`@auth/prisma-adapter`, `@prisma/adapter-neon`, `@neondatabase/serverless`, `vitest`, `ws`).
- Graphify navigation graph: Verified (`graphify-out/graph.json` with 505 nodes and 15 communities).

---

## 4. Not Verified
- Live remote Neon PostgreSQL query execution (pending external database provisioning; using in-memory mock repositories).
- Live Google OAuth & Gmail send against real Gmail servers (requires live client ID and secret).

---

## 5. Known Issues
1. In development on Windows with strict peer dependencies, `vitest` runs with legacy peer resolution due to `@types/node` version range.
2. Next.js 15 route parameters must be awaited as Promises in dynamic route handlers and pages.

---

## 6. Skipped / Simplified
- Open/click tracking: Intentionally excluded per non-negotiables in PRD.
- Auto-sending: Strictly prohibited per non-negotiables; all sends require human approval.

---

## 7. Next Steps to Go Live
To transition from Demo Mode to fully real production services, add the following environment variables in order:
1. **Neon PostgreSQL**: Set `DATABASE_URL` (pooled connection string) and `DIRECT_URL` (direct connection string), then run `npx prisma migrate deploy`.
2. **Auth.js / Google Auth**: Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`.
3. **Google Gemini**: Set `GEMINI_API_KEY` and optional `GEMINI_MODEL` (e.g., `gemini-2.5-flash`).
4. **Tavily Search**: Set `TAVILY_API_KEY`.
5. **Gmail API**: Set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI`, and `TOKEN_ENCRYPTION_KEY` (32-byte hex string for AES-256-GCM).
