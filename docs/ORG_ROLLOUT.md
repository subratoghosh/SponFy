# SponFy Organization Multi-Tenant System: Rollout Guide

This document outlines the operational deployment runbook for migrating the SponFy database and application to support the Organization Multi-Tenant Model.

---

## 1. Safety & Architecture Guarantees

1. **Strictly Additive**: The migration adds new enum values, new tables (`organisations`, `organisation_members`, `campaign_members`, `access_requests`, `notifications`), and nullable columns on `campaigns` and `users`. Zero existing tables or columns are dropped or renamed.
2. **Existing Users Preserved**: Existing users are given `accountMode = 'INDIVIDUAL'` and `onboardingStatus = 'NOT_STARTED'` (or keep their current state). They are not forced into an organisation and can continue using their personal workspaces without disruption.
3. **Existing Campaigns Preserved**: Existing campaigns remain with `organisationId = NULL`. In code and database, null means individual/personal. Only the campaign creator has access to individual campaigns.
4. **Zero Data Deletion**: No data is deleted, converted, or reassigned.

---

## 2. Pre-Deployment: Neon Backup Branch

Before executing any migration against production, create an instant copy-on-write Neon backup branch:

```bash
# 1. Create a point-in-time recovery backup branch on Neon
neon branches create --name pre-org-model-backup --parent main

# 2. Verify backup branch status in Neon Console
neon branches list
```

---

## 3. Deployment Sequence (In Exact Order)

Execute the following commands sequentially:

### Step 1: Apply Additive Migration
```bash
# Apply pending additive migrations to the database
npx prisma migrate deploy
```

### Step 2: Validate Schema Consistency
```bash
# Verify schema parity between datamodel and production database
npx prisma validate
```

### Step 3: Deploy Application Code
Deploy the application build containing the multi-tenant authorization helpers, scoped onboarding flows, and dashboards:
```bash
# Production build & startup
npm run build
npm run start
```

---

## 4. Verification & Health Checks

Run the following sanity checks against your staging/production deployment:

1. **Existing Individual User Verification**:
   - Sign in with an existing user account.
   - Confirm existing campaigns, contacts, drafts, and sponsors appear unchanged.
   - Confirm they can view and edit individual campaigns as before.

2. **Organization Creation Flow**:
   - As an organizer, go to `/onboarding/organiser` -> "Organise a new campaign".
   - Submit the organization and campaign creation form.
   - Verify in database:
     - `organisations` record exists with the creator's user ID.
     - `organisation_members` record exists with `role = 'ORGANISER'`, `status = 'ACTIVE'`.
     - `campaigns` record has `organisationId` set to the new organisation ID.
     - `users` record has `accountMode = 'ORGANISER'`, `onboardingStatus = 'COMPLETE'`.

3. **Executive Application & Approval**:
   - Sign in with a new user and select Executive at `/onboarding`.
   - Search the newly created organisation via `/onboarding/executive`.
   - Submit an access request.
   - Verify request appears in the Organiser's `/app/team` -> "Access Requests" tab.
   - Approve the request; verify the Executive sees the approved workspace.
   - Assign campaigns via `/app/team` -> "Assign Campaigns".

4. **Multi-Executive Duplicate Guard**:
   - Confirm that if two Executives attempt to send an outreach email to the same contact or company in the same campaign, the second send is blocked with `409 Conflict`.

5. **Last Active Organizer Guard**:
   - Go to `/app/team` as the sole organizer.
   - Verify the remove button is disabled, and API rejects removal with `400 CANNOT_REMOVE_LAST_ORGANIZER`.

---

## 5. Rollback Plan (Zero Data Loss)

If application rollback is required, follow these steps to preserve all user data:

### Phase A: Application Rollback
Revert the application deployment to the previous stable release commit. Because the schema changes are purely additive (all new columns nullable or defaulted), the previous codebase will run without error against the migrated database.

### Phase B: Database Schema Rollback (If Required)
If you must roll back schema changes, do **NOT** drop tables directly. Instead, archive the tables or switch Neon branches back to the backup branch created in Section 2:

```bash
# Option 1: Instant Neon Branch Rollback (if no critical data was created)
neon branches set-primary pre-org-model-backup

# Option 2: Additive Soft Reversion (if you wish to keep production primary)
# Simply leave tables intact; old application code does not read them.
```
