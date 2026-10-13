# SponFy — Workflow Map & Gap Analysis

This document provides a systematic capability-by-capability evaluation of SponFy's outreach operating system against requirements, based on actual source code inspection and test execution.

---

## State Model Reference
The system enforces strict separation of lifecycle concepts:
1. **Discovery result**: Candidate found by search, transient / session-persisted, **not in pipeline**, never drafted or emailed.
2. **Approved sponsor**: Persisted company record explicitly approved by user for outreach (`stage = QUALIFIED / SPONSOR_APPROVED`).
3. **Email draft**: Message generated specifically for an approved sponsor (`status = DRAFT`).
4. **Approved draft**: Draft reviewed and confirmed by human for dispatch (`status = APPROVED`).
5. **Sent email**: Message confirmed sent via Gmail API (`status = SENT`, `direction = OUTBOUND`).
6. **Reply & Follow-up state**: Communication state following outbound delivery (`REPLIED`, `DUE`, `WAITING`, `HALTED`).

---

## Capabilities Assessment Matrix

| Capability | Status | Primary Files | Evidence / Observations |
| :--- | :--- | :--- | :--- |
| **1. Discover** | **Partial / Broken** | `src/app/api/discover/route.ts`<br>`src/app/(app)/app/discover/page.tsx`<br>`src/components/discover/CandidateList.tsx` | Discovery route currently calls `addSponsor` immediately, persisting all candidates directly into `Company` table before human approval. Results vanish on refresh if unapproved in memory. No clear/dismiss functionality. |
| **2. Approve Companies** | **Missing** | `src/components/discover/CandidateList.tsx`<br>`src/app/api/sponsors/approve/route.ts` (absent) | No checkboxes, bulk select-all, or approval endpoints in Discover. No review modal before approval. Pipeline receives all searched items automatically. |
| **3. Drafts (Approved Only)** | **Partial** | `src/app/api/outreach/draft/route.ts`<br>`src/components/outreach/EmailComposer.tsx`<br>`src/components/outreach/DraftQueueList.tsx` | Single draft generation works with tone and templates, but route lacks `auth()` check and does not enforce sponsor approval. No variable check for "needs attention" blocking. No bulk draft generation or bulk approve. |
| **4. Send** | **Partial** | `src/app/api/outreach/send/route.ts`<br>`src/lib/outreach/send-guard.ts` | Single send is well guarded (human approval, suppression, daily cap, atomic claim). Bulk send endpoint (`/api/outreach/bulk-send`), bulk eligibility preview with exclusion reasons, and resumable batch sending are missing. |
| **5. Replies** | **Partial** | `src/app/api/replies/sync/route.ts`<br>`src/lib/data/repositories/replies.ts` | Polling and Gemini reply classification exist. Lacks `auth()`, falls back to `sponsors[0]` on unmatched sender, does not auto-transition sponsor stage to `Replied`, and does not check thread before follow-up due/send. |
| **6. Follow-ups** | **Partial** | `src/lib/outreach/followups.ts`<br>`src/lib/config/limits.ts`<br>`src/components/followups/FollowupQueue.tsx` | State machine and single draft/send exist with max 2 limit. Follow-up cadence defaults to 4d/7d instead of 2d/2d. Uses static templates rather than Gemini history-aware generation. Lacks bulk generation/send and snooze/close. |
| **7. Analytics** | **Partial** | `src/lib/data/repositories/analytics.ts`<br>`src/app/(app)/app/analytics/page.tsx` | Computes from database/mock records, but `totalSponsors` was polluted by unapproved discovery items. Missing distinct tracking for discovery candidates, send failures, and follow-up limit milestones. |
| **8. Dashboard & Queue** | **Broken** | `src/app/(app)/app/page.tsx`<br>`src/components/dashboard/TodayActionQueue.tsx` | `actionQueue` is hardcoded to empty array `[]` for real users! Does not surface follow-ups due, unapproved drafts, pending sends, new replies, or failed sends from live records. |

---

## Detailed Gap Analysis by Capability

### 1. Discover (`/app/discover`)
- **Current state**: `/api/discover` directly invokes `addSponsor` into Prisma/Memory store. Every candidate immediately becomes a `Company` record with `stage: 'Discovered'`.
- **Required**:
  - Store discovery results separately from `Company` pipeline records.
  - Persist discovery results per session/campaign so they survive refresh (with 7-day expiry).
  - Provide "Dismiss" and "Clear All Results" buttons that do not touch approved sponsors.

### 2. Approve Companies
- **Current state**: No approval step exists in discovery UI.
- **Required**:
  - Individual checkboxes per candidate + "Select All" / "Deselect".
  - Floating/sticky selection bar showing count.
  - "Approve Selected" & "Approve All" actions calling idempotent endpoint.
  - Quick "Review Company" preview dialog before approval.
  - Persist approved companies into `Company` with `stage = QUALIFIED` (or dedicated approved flag) without domain duplicates.

### 3. Drafts (Approved Sponsors Only)
- **Current state**: `/api/outreach/draft` accepts any company ID without checking `auth()` or sponsor approval state.
- **Required**:
  - Server validation: `auth()` required; sponsor must be approved.
  - Unresolved template variable validation: if variables like `{{contactName}}` cannot be resolved, flag draft as `"needs_attention"` and block sending.
  - Batch generation endpoint with bounded concurrency (<15s serverless friendly) and per-draft success/failure reporting.
  - Bulk select & bulk approve in `DraftQueueList.tsx`.

### 4. Send
- **Current state**: `/api/outreach/send` handles single send safely with idempotency claims.
- **Required**:
  - Bulk send route `/api/outreach/bulk-send`.
  - Pre-send eligibility check returning `{ eligibleCount, excluded: [{ company, reason }] }` (checking approved draft, valid contact, daily cap, suppression).
  - Bulk send confirmation dialog displaying exact breakdown before execution.
  - Resumable batch execution with per-item status and retry for failed items only.

### 5. Replies
- **Current state**: Sync exists, but unsecured and does not link stage transitions.
- **Required**:
  - Secure `/api/replies/sync` with `auth()`.
  - Exact contact email / thread matching (remove `sponsors[0]` fallback).
  - Transition sponsor stage to `Replied` (or `Interested` / `Negotiation` based on AI intent).
  - Server-side pre-send check on Gmail thread before generating or sending a follow-up.
  - Automatic throttled sync check on page load.

### 6. Follow-ups
- **Current state**: Cadence in `limits.ts` is 4 and 7 days. Draft generation uses fixed string format.
- **Required**:
  - Update default cadence to 2 days (Follow-up 1) and 2 days (Follow-up 2), with `MIN_DAYS_BETWEEN_TOUCHES = 2`.
  - Gemini-powered follow-up draft generation considering initial pitch, company research, and event updates.
  - Snooze and "Close Prospect" (marks stage `Lost` / `Closed` and halts follow-ups).
  - Bulk follow-up generation and bulk send.

### 7. Analytics
- **Current state**: Basic funnel and KPI metrics exist.
- **Required**:
  - Guarantee metrics reflect only approved sponsors and stored message events.
  - Track discovery candidates found vs approved, emails sent, send failures, and prospects at follow-up limit.

### 8. Dashboard & Notifications ("Today" Queue)
- **Current state**: Non-demo users receive empty queue `[]`.
- **Required**:
  - Compute real action queue items from live user data:
    - Follow-ups due (with direct link to follow-up view)
    - Approved sponsors awaiting drafts
    - Drafts awaiting review & approval
    - Approved drafts ready to send
    - Inbound replies awaiting response
    - Prospects needing decision / reached touch limit
  - Display actual item counts and action CTAs using existing styling.

---

## Action Plan
1. **Schema & Migration (Additive Only)**:
   - Add `DiscoveryResult` model for transient unapproved candidates with 7-day TTL.
   - Add `sponsorApproved Boolean @default(true)` on `Company` to cleanly separate unapproved from approved sponsors while keeping existing records approved.
   - Generate migration SQL file via `prisma migrate diff` without touching database.
2. **Discovery & Approval Engine**:
   - Update `/api/discover` to save into `DiscoveryResult` (not `Company`).
   - Create `/api/discover/results` (GET, DELETE) and `/api/sponsors/approve` (POST).
   - Update Discover UI with checkboxes, preview modal, and bulk approval bar.
3. **Outreach & Draft Safety**:
   - Secure `/api/outreach/draft` with `auth()` and sponsor approval check.
   - Add template variable validation with `needs_attention` status flag.
   - Add bulk approve and batch draft generation.
4. **Bulk Send System**:
   - Create `/api/outreach/bulk-send` with pre-flight eligibility count and batch processor.
   - Add Bulk Send confirmation modal in Outreach.
5. **Replies & Thread Check**:
   - Add server-side thread check before follow-up send.
   - Update reply sync to set `Replied` stage and halt sequences.
6. **Follow-ups Engine Update**:
   - Update default delay to 2 days / 2 days in `limits.ts`.
   - Add AI follow-up generator, snooze, and close actions.
   - Add bulk follow-up actions.
7. **Real Dashboard Action Queue**:
   - Implement real dynamic queue aggregator in `OverviewPage`.
8. **Automated Unit Tests**:
   - Write tests for approval idempotency, discovery isolation, approved-only drafting, bulk send eligibility, and 2-touch follow-up rules.
