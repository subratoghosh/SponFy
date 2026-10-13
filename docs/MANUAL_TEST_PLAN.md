# SponFy Workflow End-to-End Manual Test Plan

This document outlines the step-by-step manual test script for verifying the complete outreach lifecycle:
**Discovery -> Selection & Approval -> Duplicate Prevention -> Draft Generation -> Edit & Approval -> Bulk Send Confirmation -> Partial Failure & Retry -> Reply Detection -> Follow-up Cadence (2-touch limit) -> Close Prospect -> Real Analytics & Dashboard Counts**.

> [!CAUTION]
> **Database Safety Notice:** Before applying any migrations or running tests against your live database, create a backup or branch on Neon.

---

## 1. Migration Instructions (For You to Run)

### Step 1.1: Take a Neon Branch / Backup
Before running migrations on Neon serverless PostgreSQL:
1. Navigate to your [Neon Console](https://console.neon.tech).
2. Under your Project, go to **Branches**.
3. Create a snapshot backup branch named `backup-pre-workflow-state` from `main`.

### Step 1.2: Inspect the Migration SQL
Review the additive, backwards-compatible migration generated at:
[`prisma/migrations/20261014_workflow_state_models/migration.sql`](file:///c:/Users/Subrato%20Ghosh/OneDrive/Desktop/SponFy/prisma/migrations/20261014_workflow_state_models/migration.sql)

**Summary of SQL Effects on Existing Data:**
- `CREATE TABLE "discovery_results"`: Creates a separate table for transient search results with a 7-day TTL (`expiresAt`). Existing company/sponsor records are untouched.
- `ALTER TABLE "companies" ADD COLUMN "sponsorApproved" BOOLEAN NOT NULL DEFAULT true`: Backwards-compatible; all existing sponsors in your pipeline remain approved.
- `ALTER TABLE "email_drafts" ADD COLUMN "needsAttention" BOOLEAN NOT NULL DEFAULT false`, `ADD COLUMN "attentionReason" TEXT`: Existing drafts default to false and remain valid.
- Safe indexes are added for performant lookups (`userId`, `campaignId`, `domain`, `expiresAt`).

### Step 1.3: Apply the Migration
Run the Prisma deployment command in your terminal connected to your database:
```bash
npx prisma migrate deploy
```
*(Optionally verify table schema in Neon Console or with `npx prisma validate`)*

---

## 2. Environment Variables & Settings

No new mandatory environment variables are required. Existing configurations are preserved:
- `DATABASE_URL` & `DIRECT_URL`: Neon PostgreSQL connection strings
- `AUTH_SECRET`: Auth.js encryption secret
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`: Google OAuth credentials
- `GEMINI_API_KEY`: Google Gemini API key
- `TAVILY_API_KEY`: Tavily search API key (optional for web search)
- `FIRECRAWL_API_KEY`: Firecrawl web scraper key (optional)

**Cadence Configuration Note:**
- The default cadence for follow-ups is now **2 days** after initial send and **2 days** after follow-up 1 (configured in [`src/lib/config/limits.ts`](file:///c:/Users/Subrato%20Ghosh/OneDrive/Desktop/SponFy/src/lib/config/limits.ts)).

---

## 3. Step-by-Step Manual Test Script

### Step 1: Discovery Session Isolation
- **Action**: Navigate to `/app/discover`. Select or create a campaign. Enter a search prompt (e.g., "Developer tooling companies sponsoring hackathons in India") with target count `5` and click **Discover Sponsors**.
- **Expected Result**: 
  - Discovery results appear as candidate cards showing Name, Industry, Fit Score, and "Why Relevant".
  - Results are saved into transient `discovery_results` with 7-day TTL.
  - Refresh the page: the discovered candidates remain visible.
  - Check the Overview Dashboard (`/app`) and Sponsors Tracker (`/app/sponsors`): **zero** new unapproved companies appear in the pipeline or sponsor counts.
- **What indicates a bug**: If unapproved companies appear on the Sponsors Tracker or Overview before being explicitly approved.

---

### Step 2: Select & Approve Companies (Human-in-the-Loop)
- **Action**:
  - In `/app/discover`, check 2 companies using their checkboxes.
  - Click **Approve Selected (2)** on the floating action bar.
- **Expected Result**:
  - A confirmation toast shows "Approved 2 sponsor(s)".
  - Only those 2 approved companies enter the pipeline in `/app/sponsors` (in `Qualified` stage with `sponsorApproved: true`).
  - The remaining 3 unapproved companies stay in Discover and can be cleared using **Clear Results**.
- **What indicates a bug**: If all 5 companies enter the pipeline even though only 2 were selected, or if cleared results delete approved sponsors.

---

### Step 3: Duplicate Approval Prevention (Idempotency)
- **Action**:
  - In `/app/discover`, run a search that includes the same company domain already approved, or approve the same company again.
- **Expected Result**:
  - System recognizes the normalized domain (e.g. `acme.com`).
  - Toast displays that the company is already approved.
  - No duplicate row is created in the `companies` table.
- **What indicates a bug**: Duplicate cards for the same company domain appear in `/app/sponsors`.

---

### Step 4: Draft Generation (Approved Only)
- **Action**:
  - Go to `/app/outreach`.
  - Click **Draft Pitch** or select custom template.
  - In case a template has missing variables (e.g. `{{contactName}}`), verify draft status.
- **Expected Result**:
  - Server verifies company has `sponsorApproved === true`.
  - If a template placeholder cannot be filled, the draft receives a yellow warning badge: `Needs Attention: Unresolved template placeholders` and the **Approve Draft** button is disabled.
- **What indicates a bug**: If drafts can be generated for unapproved discovery candidates, or if an unresolved placeholder draft can be approved.

---

### Step 5: Edit & Approve Draft
- **Action**:
  - In `/app/outreach`, edit the subject or body to resolve any placeholder.
  - Click **Save Changes**.
  - Click **Approve Draft**.
- **Expected Result**:
  - Draft status updates to `approved`.
  - Saving changes on an already approved draft resets its status back to `draft`, requiring re-approval.
- **What indicates a bug**: If editing an approved draft leaves it marked as `approved`.

---

### Step 6: Bulk Send Confirmation with Exact Counts
- **Action**:
  - In `/app/outreach`, click **Send All Approved** in the page header.
- **Expected Result**:
  - The `BulkSendModal` opens.
  - Pre-flight eligibility check runs: displays exact count of eligible drafts vs. excluded drafts with clear human-readable reasons (e.g., missing contact email, suppressed, daily cap).
  - Displays remaining daily cap allowance.
  - Sends only after user clicks **Confirm and Send**.
- **What indicates a bug**: If sending begins without the confirmation dialog, or if excluded emails (e.g. missing recipient) are dispatched.

---

### Step 7: Atomic Send & Retry on Failure
- **Action**:
  - Click **Confirm and Send** in `BulkSendModal`.
  - (To simulate network error: disconnect network or use an invalid recipient).
- **Expected Result**:
  - Each draft is claimed atomically (`claimDraftForSending` updates draft status to `SENDING`).
  - Successfully sent messages update draft status to `sent`, record Gmail messageId/threadId, and transition company stage to `Contacted`.
  - Any failed send releases the claim, reports readable error reason, and allows retrying ONLY the failed ones without resending successes.
- **What indicates a bug**: Double-clicking send results in duplicate emails sent to the sponsor.

---

### Step 8: Reply Detection & Automatic Sequence Halting
- **Action**:
  - Go to `/app/replies` and click **Sync Replies** (or send a test reply from the sponsor contact address).
- **Expected Result**:
  - Inbound reply is matched by contact email.
  - AI classifies reply intent (e.g., Interested, Not Interested, Positive).
  - If `Not Interested`, contact is added to suppression and company stage moves to `Lost`.
  - If `Interested`, company stage moves to `Interested`.
  - Follow-up sequence for that company is immediately HALTED.
- **What indicates a bug**: If a follow-up draft is suggested or allowed for a company that already replied.

---

### Step 9: Follow-up Due After 2 Days (Cadence Check)
- **Action**:
  - Go to `/app/followups`.
  - For a contacted company with no reply sent within 2 days:
- **Expected Result**:
  - If `< 2 days`: Company displays under "Emailed, waiting for the window" with exact countdown (e.g., "Opens in 1 day(s)").
  - If `>= 2 days`: Company automatically moves to "Needs your attention" with status `Follow-up due`.
- **What indicates a bug**: If follow-up shows as due on day 1 or requires a background cron job to be marked due.

---

### Step 10: Follow-up 1 & Follow-up 2 (2-Touch Limit)
- **Action**:
  - Click **Draft follow-up** for due company.
  - Approve and send Follow-up 1.
  - Company moves to waiting for 2 days.
  - After 2 more days, Follow-up 2 is drafted, approved, and sent.
- **Expected Result**:
  - After Follow-up 2 is sent (3 total touches: 1 initial + 2 follow-ups), the sequence halts permanently.
  - Company moves to "Halted or finished" with badge `Sequence finished` and reason: "All 3 touches used (1 initial + 2 follow-ups). We stop here."
  - Server send guard permanently blocks any further automated follow-up.
- **What indicates a bug**: If a 3rd follow-up (4th email) can be drafted or sent.

---

### Step 11: Close Prospect Action
- **Action**:
  - On any attention card in `/app/followups`, click **Close Prospect**.
- **Expected Result**:
  - Company stage transitions to `Lost`.
  - Follow-up sequence is halted and card moves to "Halted or finished".
- **What indicates a bug**: If closing a prospect leaves follow-up due in the queue.

---

### Step 12: Real Analytics & Dashboard Action Queue
- **Action**:
  - Navigate to `/app` (Overview Dashboard) and `/app/analytics`.
- **Expected Result**:
  - Overview KPI metrics reflect actual counts: Discovered, Contacted, Replied, Committed, Funds Raised.
  - "Today's High-Priority Action Queue" surfaces real items:
    - Follow-ups due
    - Drafts awaiting approval
    - Approved emails ready to dispatch
    - Inbound replies / meetings requested
    - Prospects at limit
  - If all queues are clear, displays the friendly empty state with zero counts (never random mock numbers for active campaigns).
- **What indicates a bug**: Discovered companies inflating the "Contacted" or "Sent" counts, or negative conversion rates.
