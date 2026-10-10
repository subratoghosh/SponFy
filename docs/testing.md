# SponFy — Testing (testing.md)

> Goal: prove the things that would embarrass us in a demo or leak data. Keep it proportionate to a hackathon: few, high-value tests, plus a manual demo checklist.

## 1. Tooling
- **Vitest** for unit/integration tests (services, repositories, validators, scoring, crypto).
- **Playwright** for 2–3 smoke E2E tests in Demo Mode (optional if time is short; the manual checklist is mandatory).
- Scripts: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Integration tests that touch a database use a separate Neon branch/database via `TEST_DATABASE_URL`; never run tests against the main data.

## 2. Must-have unit tests
| Area | What to assert |
|---|---|
| Scoring | Weights sum to 100; breakdown points sum to `fitScore`; score clamped 0–100 |
| Zod schemas | Gemini output schemas accept good fixtures, reject malformed/missing fields |
| Crypto | encrypt→decrypt round-trip; tampered ciphertext fails; different IV each time |
| Send rules | Blocks: unapproved draft, suppressed email, bounced contact, cap reached, UNKNOWN contact without override |
| Follow-up rules | No follow-up after NOT_INTERESTED/bounce; stops on meaningful reply; respects `maxFollowups` |
| Domain dedupe | `https://www.Acme.com/about` and `acme.com` normalise to the same domain |
| Contact rules | `PUBLIC` without `sourceUrl` rejected; guessed-pattern emails rejected |
| Reply matching | Inbound message maps to the right company via `gmailThreadId` |

## 3. Authorization tests (critical, no RLS safety net)
For every repository/service function that takes an id:
1. Create data for user A and user B.
2. Call as user B with A's id → must return null/404 or throw, and must not modify A's data.
Cover at least: campaign, company, contact, draft (approve + send), message, job status, follow-up task, suppression.
Also test: unauthenticated Server Action call is rejected; `/api/cron/sync` rejects missing/incorrect `CRON_SECRET`.

## 4. Integration adapter tests
- Each integration's mock and real implementation satisfy the same TypeScript interface (compile-time) and the mock passes the same contract test suite.
- Real adapters: tested manually only (no live calls in CI). With credentials absent, `isConfigured()` is false and the UI shows "Not configured".

## 5. Job and graph tests
- Research graph with mocked Tavily/Gemini: runs nodes in order, writes `AiJob` progress, retries a failing node once, ends FAILED with a readable error if still failing.
- Outreach flow: draft is created; send is impossible until approval; approval then send succeeds exactly once (double-submit does not send twice).

## 6. Smoke E2E (Demo Mode, Playwright)
1. Landing loads, no console errors, CTA reachable.
2. Demo login → Overview shows KPIs and Today queue.
3. Sponsors → open company → approve a draft → "Sent" state (mock Gmail, labelled demo).

## 7. Manual demo checklist (run before presenting)
- [ ] `npm run build` and `npm run start` succeed; no console errors on landing or dashboard.
- [ ] Demo Mode works with zero credentials; "Demo data" badge visible.
- [ ] Real run: new campaign → discovery streams → research shows sources → score breakdown present.
- [ ] Send a real email from a test-user Gmail to yourself; reply from the recipient; "Sync replies" shows the reply with an analysis and recommended action.
- [ ] Dashboard updates after the reply (KPIs + funnel).
- [ ] Gmail account is added as OAuth **test user**; reconnect flow works.
- [ ] Sending to a suppressed/unknown contact is blocked with a clear message.
- [ ] Refresh mid-job: progress persists.
- [ ] Mobile (375px): landing, Overview, Sponsors list, Outreach editor usable; bottom nav works.
- [ ] Keyboard-only pass: tab through nav, dialogs trap focus, Escape closes.
- [ ] `prefers-reduced-motion` disables non-essential animation.
- [ ] Fallback plan: if live APIs fail on stage, switch to Demo Mode and say so.

## 8. Definition of done (per milestone)
Typecheck, lint, tests for that milestone pass; the feature has loading/empty/error states; BUILD_NOTES.md updated (real vs mocked, unverified, skipped); a commit is tagged.
