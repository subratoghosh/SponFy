# SPONFY — SETUP & MANUAL TEST PLAN (PRODUCTION-READY SAFETY & DELIVERABILITY)

This document provides exact, step-by-step instructions for configuring real API credentials, running safe schema migrations, and executing authorized verification tests without risking production data or burning unnecessary API credits.

---

## 1. External Services Configuration

### 1.1 Hunter.io (Layer 1 Email Verification)
- **Account Setup**: Go to [hunter.io](https://hunter.io) → Sign up / Log in → Navigate to **API** section in your dashboard.
- **API Key**: Generate a standard API key with permission to access `email-verifier` and `email-finder`.
- **Environment Variable**:
  ```env
  HUNTER_API_KEY=your_actual_hunter_key_here
  ```
- **Local Configuration**: Add to your local `.env` (ignored by git).
- **Vercel Production**: Project Settings → Environment Variables → Add `HUNTER_API_KEY` (Production & Preview).
- **Credit-Optimized Testing**:
  - Test syntax checking first locally (`tests/email-safety-and-verification.test.ts` consumes 0 credits).
  - Verify a single email manually through `/api/outreach/eligibility`. All results are cached locally for 7 days.

### 1.2 ZeroBounce (Layer 2 Selective Secondary Verification)
- **Account Setup**: Go to [zerobounce.net](https://www.zerobounce.net) → Dashboard → **API - Keys & Documentation**.
- **API Key**: Generate an API Key (v2).
- **Environment Variable**:
  ```env
  ZEROBOUNCE_API_KEY=your_actual_zerobounce_key_here
  ```
- **Local & Vercel**: Add `ZEROBOUNCE_API_KEY` to `.env` and Vercel Project Environment Variables.
- **Credit Optimization**:
  - SponFy will **NOT** call ZeroBounce on every email.
  - ZeroBounce is only queried if Hunter returns `accept_all`, `unknown`, or `risky`.

### 1.3 Google Cloud & Gmail OAuth (Outreach & Bounce Detection)
- **Google Cloud Console**:
  1. Open [Google Cloud Console](https://console.cloud.google.com).
  2. Create or select your project.
  3. Enable **Gmail API** under *APIs & Services* → *Library*.
  4. Configure **OAuth Consent Screen**:
     - User Type: External.
     - Scopes required:
       - `https://www.googleapis.com/auth/gmail.send`
       - `https://www.googleapis.com/auth/gmail.readonly`
       - `https://www.googleapis.com/auth/userinfo.email`
  5. Create **OAuth Client ID** (Web application):
     - **Authorized redirect URIs**:
       - Local: `http://localhost:3000/api/integrations/gmail/callback`
       - Production: `https://your-domain.vercel.app/api/integrations/gmail/callback`
- **Environment Variables**:
  ```env
  GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your_client_secret
  GMAIL_REDIRECT_URI=http://localhost:3000/api/integrations/gmail/callback
  ```
- **Token Security**: Tokens are encrypted using AES-256-GCM via `TOKEN_ENCRYPTION_KEY` before database persistence.

---

## 2. Safe Database Migration (Neon PostgreSQL)

> [!IMPORTANT]
> Never wipe or reset existing database records. The migration below is strictly additive.

### Safe Migration Procedure:
1. **Create Neon Branch / Snapshot** (Recommended):
   - In Neon Console, create a branch of your production database as a backup.
2. **Review Additive Migration File**:
   - Location: `prisma/migrations/20261015_email_safety_verification_tracking/migration.sql`
   - Content: Creates `email_verifications` and `email_tracking_events` with non-conflicting indexes.
3. **Apply Additive Schema Migration**:
   ```bash
   npx prisma migrate deploy
   ```
   *(Or execute `prisma/migrations/20261015_email_safety_verification_tracking/migration.sql` in Neon SQL editor).*

---

## 3. Step-by-Step Manual Test Plan (With Real Credentials)

### Test 1: Real Hunter & ZeroBounce Connection
1. Set `HUNTER_API_KEY` in `.env`.
2. Visit `/app/settings` → **Gmail OAuth & AI Keys**.
3. Confirm status badges show `Connected & Active` for Hunter and ZeroBounce.
4. Run a test verification query:
   ```bash
   curl -X GET "http://localhost:3000/api/outreach/eligibility"
   ```

### Test 2: Pre-Send Eligibility Gate (`Check Eligibility`)
1. In SponFy, navigate to **Outreach** (`/app/outreach`).
2. Click **Check Eligibility & Review** (or **Review Send**).
3. Verify the modal displays the 3 distinct categories:
   - **Ready to Send**: Approved drafts with deliverable emails.
   - **Needs Review**: Catch-all domains or unverified addresses.
   - **Blocked**: Placeholders (e.g. `{{name}}`), invalid emails, suppressed recipients, or daily send cap exceeded.
4. Confirm that clicking **Send Eligible Emails** only dispatches eligible messages and updates live recipient counts.

### Test 3: Authorized Gmail Send to Self
1. Connect your personal Gmail account via `/app/settings`.
2. Add your own email as a sponsor contact on a test company.
3. Generate and approve a single draft addressed to yourself.
4. Run Check Eligibility → Dispatch.
5. Verify your personal inbox receives the email from your authorized sender.
6. Verify `/app` overview and sender health cards reflect the sent email.

### Test 4: Gmail Bounce Detection & Suppression Test
1. Send an authorized test email to an invalid domain address (e.g. `nonexistent-user-123456@gmail.com`).
2. Once Google's `mailer-daemon` returns a Delivery Status Notification (DSN), trigger sync:
   ```bash
   curl -X POST "http://localhost:3000/api/replies/sync"
   ```
3. Verify the response includes `bouncesDetected: 1` and the address is automatically appended to the suppression list.
4. Verify subsequent drafts to this address are immediately classified as **Blocked**.

---

## 4. Environment Variables Checklist

| Variable | Required For | Where to set |
|---|---|---|
| `HUNTER_API_KEY` | Layer 1 Email Finding & Verification | `.env`, Vercel |
| `ZEROBOUNCE_API_KEY` | Layer 2 Secondary Verification | `.env`, Vercel |
| `GOOGLE_CLIENT_ID` | Gmail OAuth authentication | `.env`, Vercel |
| `GOOGLE_CLIENT_SECRET` | Gmail OAuth token exchange | `.env`, Vercel |
| `GMAIL_REDIRECT_URI` | OAuth callback matching | `.env`, Vercel |
| `TOKEN_ENCRYPTION_KEY` | AES-256-GCM token storage | `.env`, Vercel |
| `DATABASE_URL` | Cloud PostgreSQL Storage | `.env`, Vercel |
