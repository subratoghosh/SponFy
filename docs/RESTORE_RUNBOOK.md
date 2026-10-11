# SponFy Database Backup & Restore Runbook (Neon PostgreSQL)

> **Platform:** Neon Serverless PostgreSQL  
> **Storage Architecture:** Page-server architecture with continuous Write-Ahead Log (WAL) archiving  
> **Default Retention Window:** 7 days (Free tier) / 30 days (Launch & Scale plans)  
> **Restore Status:** Documented & Verified architecture; branch-based non-destructive recovery verified.

---

## 1. Neon Backup Mechanics

Unlike traditional PostgreSQL databases that rely on slow, scheduled daily snapshot dumps, Neon's storage engine continuously archives WAL records to an internal distributed storage system.

1. **Continuous Backup (Zero Backup Windows):**
   - Every transaction committed to the primary branch is persisted and WAL-streamed in real time.
   - Point-in-Time Restore (PITR) allows rolling back to any timestamp or LSN (Log Sequence Number) within the project's history retention window down to the exact second.

2. **Copy-on-Write Branching:**
   - Branches in Neon are lightweight, metadata-driven copies created instantly.
   - Restores are tested on isolated branches without copying gigabytes of storage or impacting production workloads.

---

## 2. Taking a Manual Restore Point (Branch Snapshot)

Before performing major database migrations, schema pushes (`npx prisma db push`), or platform updates:

### Method A: Via Neon CLI
```bash
# 1. Install Neon CLI if not already present
npm install -g neonctl

# 2. Authenticate
neonctl auth

# 3. Create a snapshot branch from main
neonctl branches create \
  --name pre-migration-snapshot-$(date +%Y%m%d%H%M%S) \
  --parent main
```

### Method B: Via Neon Web Console
1. Navigate to the **Neon Project Console** > **Branches**.
2. Click **New Branch**.
3. Set **Branch Name** (e.g. `backup-main-20261011`).
4. Select **Parent Branch** as `main`.
5. Select **Point in Time**: Choose **Current time (HEAD)**.
6. Click **Create Branch**.

---

## 3. Step-by-Step: Testing a Restore on an Isolated Branch

To verify database recoverability without touching production data:

### Step 1: Identify Target Timestamp or LSN
Identify the point in time before the failure/corruption occurred:
- Example timestamp: `2026-10-11T14:30:00Z`

### Step 2: Create Recovery Branch
In the Neon Console or via CLI:
```bash
neonctl branches create \
  --name restore-test-20261011 \
  --parent main \
  --timestamp "2026-10-11T14:30:00Z"
```

### Step 3: Extract the Branched Connection String
Neon provisions a dedicated pooled and direct connection string for the branch:
```bash
# Get connection string for the restored branch
neonctl connection-string restore-test-20261011
```
Example returned connection string:
```
postgresql://neondb_owner:***@ep-restore-test-1234.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Verify Data Integrity on Restored Branch
Point Prisma at the test branch temporarily in `.env.test` or via CLI environment override:
```bash
# Verify schema state and table row counts
DATABASE_URL="postgresql://neondb_owner:***@ep-restore-test-1234.us-east-1.aws.neon.tech/neondb?sslmode=require" \
npx prisma studio --port 5556
```
Or run automated data verification query:
```bash
DATABASE_URL="postgresql://neondb_owner:***@ep-restore-test-1234.us-east-1.aws.neon.tech/neondb?sslmode=require" \
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
async function check() {
  const users = await db.user.count();
  const campaigns = await db.campaign.count();
  const companies = await db.company.count();
  console.log('Restored Branch Counts:', { users, campaigns, companies });
  await db.\$disconnect();
}
check();
"
```

### Step 5: Clean Up Test Branch
Once verified, delete the test branch so it does not count against your branch limits:
```bash
neonctl branches delete restore-test-20261011
```

---

## 4. Full Production Restore Runbook (Promoting a Restored Branch)

If production data was corrupted or lost and you must restore the production application:

1. **Create the Recovery Branch at the Target PITR Timestamp:**
   ```bash
   neonctl branches create --name restored-main --parent main --timestamp "YYYY-MM-DDTHH:MM:SSZ"
   ```

2. **Option A: Swap Connection Strings (Zero Downtime, Recommended):**
   - Copy the connection string of the `restored-main` branch.
   - Update `DATABASE_URL` and `DIRECT_URL` in your production environment (Vercel / Hosting dashboard).
   - Redeploy or trigger automatic environment variable reload.

3. **Option B: Set as Default Branch in Neon:**
   - In Neon Console > **Branches** > `restored-main` > **Set as default branch**.
   - Rename existing broken `main` to `archived-corrupted-main`.
   - Rename `restored-main` to `main`.

---

## 5. Logical SQL Backup (`pg_dump` & `pg_restore`)

For offsite disaster recovery backups stored independently of Neon:

### Exporting Full Database Dump:
```bash
pg_dump "$DIRECT_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file=sponfy_backup_$(date +%Y%m%d).dump
```

### Restoring from Dump:
```bash
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$DIRECT_URL" \
  sponfy_backup_20261011.dump
```
