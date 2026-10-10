# SponFy — Security (security.md)

> No Supabase and no database-level RLS in this project. Isolation is enforced in application code, so these rules are mandatory and must be tested (testing.md §3).

## 1. Secrets
- All keys server-side only (`import "server-only"` in any module touching secrets). Only `NEXT_PUBLIC_*` vars may reach the client, and only `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_DEMO_MODE` exist.
- `.env` is gitignored; `.env.example` has names only. Never hardcode or log keys, tokens, email bodies or AI prompts containing user data.
- `lib/env.ts` validates env at startup with Zod; missing keys put that integration in "Not configured", they never crash the whole app.

## 2. Authorization and data isolation (replaces RLS)
1. Every Server Action and Route Handler begins with `const session = await auth()`; reject if no `session.user.id`.
2. Repositories take `userId` as the **first parameter** and include `userId` in every `where` (reads AND writes).
   - Use `findFirst({ where: { id, userId } })` instead of `findUnique({ where: { id } })` for owned resources.
   - For `update`/`delete`, use `updateMany`/`deleteMany` with `{ id, userId }` and check `count === 1`, or verify ownership first.
3. Child resources (contact, draft, message) must be verified to belong to the user via their own `userId` column, not only via the parent id passed by the client.
4. Never trust IDs from the client: validate with Zod (`z.string().cuid()`), then scope by `userId`.
5. Return 404 (not 403) for resources that exist but belong to someone else.
6. Cron endpoint: require `Authorization: Bearer ${CRON_SECRET}`; compare in constant time.
7. Optional hardening if time permits: Postgres RLS using a per-request `SET app.user_id`; not required for the MVP. Do not claim RLS exists.

## 3. Gmail OAuth
- Separate "Connect Gmail" flow with a signed, short-lived `state` value bound to the user session (CSRF protection). Verify `state` in the callback.
- Scopes only: `gmail.send`, `gmail.readonly`. Request `access_type=offline` and `prompt=consent` to get a refresh token.
- Encrypt refresh/access tokens with AES-256-GCM (`TOKEN_ENCRYPTION_KEY`, random 12-byte IV per record, store iv+tag+ciphertext). Decrypt only inside `lib/integrations/gmail`.
- Provide "Disconnect Gmail": revoke the token with Google and delete the `GmailAccount` row.
- The Google OAuth app is in Testing mode: only added test users can connect. Say so in Settings. `gmail.readonly` is a restricted scope; public launch would require Google verification (out of scope).

## 4. Input validation and output safety
- Validate every request body, query param and form with Zod. Reject unknown keys (`.strict()`).
- Validate every Gemini response with Zod before use. Treat AI output and web content as **untrusted**:
  - Render as text (React escapes). No `dangerouslySetInnerHTML` with AI or Tavily content.
  - Email bodies are sent as plain text (or sanitised minimal HTML), never raw model HTML.
  - Strip/ignore instructions found inside scraped web pages (prompt injection): web text goes into prompts only as delimited data with an instruction that it is untrusted.
- Contact emails: accept only addresses that appear verbatim in a fetched page's text or were typed by the user. Validate format with Zod; never construct addresses by pattern guessing.
- URLs shown as links: allow only `http(s):`, add `rel="noopener noreferrer"`.

## 5. Send safety (backend-enforced, UI is not enough)
`sendDraft(userId, draftId)` re-checks at send time: draft is APPROVED and owned by user; recipient not suppressed/bounced; contact status acceptable (or user explicitly confirmed override stored on the draft); daily cap not exceeded; Gmail account ACTIVE. Any failure → draft FAILED with a human-readable `error`, nothing sent.
Make send idempotent: transition APPROVED → SENDING with a conditional update; if 0 rows updated, abort (prevents double-send on double-click/retry).

## 6. Abuse and cost controls
- Rate-limit AI/job routes per user (simple DB- or memory-based limiter is fine for MVP; document the limitation).
- Cap discovery size (max 50 companies per job), research concurrency (3), and Gemini retries (1).
- Limit request body sizes; truncate scraped text before sending to Gemini.

## 7. Privacy
- Only publicly available business contact info is collected; always keep `sourceUrl`.
- Provide data export (JSON) and account/campaign deletion (cascade).
- Show a one-line notice in Settings explaining what is stored and that emails are sent from the user's own Gmail.
- Seed/mock contacts use placeholder domains only.

## 8. Web hardening
- Security headers via `next.config`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/frame-ancestors, a reasonable CSP (allow Google Fonts only if not using `next/font`; prefer `next/font`).
- Cookies: Auth.js defaults (httpOnly, secure in production, sameSite lax). Don't weaken.
- Dependencies: pin versions, run `npm audit` before the demo, avoid unnecessary packages.

## 9. Logging
Log job failures with `jobId`, step and error class. Never log tokens, API keys, full email bodies or raw AI responses containing personal data.
