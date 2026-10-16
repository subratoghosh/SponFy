# SponFy Production Deployment Guide — Vercel & GitHub

This guide details the complete production deployment architecture, security configuration, and operational lifecycle for **SponFy** on Vercel via GitHub continuous deployment.

---

## 1. Local Setup & Verification

### Prerequisites
- Node.js 20.x or 22.x LTS
- npm (v10+)
- Neon Serverless PostgreSQL or local PostgreSQL instance (optional for Demo Mode)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/<owner>/sponfy.git
cd sponfy

# Clean install from committed lockfile
npm ci

# Configure local environment
cp .env.example .env.local

# Generate Prisma Client
npm run postinstall

# Run local test suite
npm test

# Run TypeScript checks and ESLint
npm run typecheck
npm run lint

# Start local Next.js dev server
npm run dev
```

The application runs at `http://localhost:3000`.

---

## 2. Environment Variables Matrix

Configure these variables in **Vercel Project Settings → Environment Variables**.

| Variable | Environment | Required | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Prod, Prev, Dev | **Yes** (in production mode) | Neon PostgreSQL pooled connection string (`sslmode=require`) |
| `DIRECT_URL` | Prod, Prev, Dev | **Yes** (for migrations) | Neon direct non-pooled connection string |
| `SITE_URL` | Prod | **Yes** | Canonical site URL (e.g. `https://sponfy.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Prod, Prev, Dev | **Yes** | Base application URL for client-side links |
| `NEXT_PUBLIC_DEMO_MODE` | Prod: `false`, Prev: `true` | **Yes** | Controls whether database or demo memory store is used |
| `AUTH_SECRET` | Prod, Prev, Dev | **Yes** | 32+ character random secret for Auth.js session encryption (`openssl rand -base64 32`) |
| `TOKEN_ENCRYPTION_KEY` | Prod, Prev, Dev | **Yes** | 32-byte (64 hex characters) AES-256-GCM key (`openssl rand -hex 32`) |
| `CRON_SECRET` | Prod, Prev | **Yes** | Bearer secret for `/api/cron/sync-replies` scheduled executions |
| `ADMIN_EMAILS` | Prod, Prev, Dev | Recommended | Comma-separated list of server-verified admin email addresses |
| `GOOGLE_CLIENT_ID` / `AUTH_GOOGLE_ID` | Prod, Prev, Dev | **Yes** (for Google auth) | Google Cloud OAuth 2.0 Web Application Client ID |
| `GOOGLE_CLIENT_SECRET` / `AUTH_GOOGLE_SECRET` | Prod, Prev, Dev | **Yes** (for Google auth) | Google Cloud OAuth 2.0 Web Application Client Secret |
| `GOOGLE_REDIRECT_URI` | Prod, Prev, Dev | **Yes** (for Gmail send) | Gmail OAuth redirect URI: `https://<domain>/api/integrations/gmail/callback` |
| `UPSTASH_REDIS_REST_URL` | Prod, Prev | Recommended | Upstash Redis REST URL for multi-region rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Prod, Prev | Recommended | Upstash Redis REST Token |
| `GROQ_API_KEY` | Prod, Prev, Dev | Optional | Groq API key for fast LLM relevance and email quality scoring |
| `GEMINI_API_KEY` | Prod, Prev, Dev | Optional | Google Gemini API key for sponsor research & dossier generation |
| `TAVILY_API_KEY` | Prod, Prev, Dev | Optional | Tavily live web search API for sponsor discovery |
| `FIRECRAWL_API_KEY` | Prod, Prev, Dev | Optional | Deep website scraping API |
| `HUNTER_API_KEY` | Prod, Prev, Dev | Optional | Hunter.io contact discovery & verification API |
| `ZEROBOUNCE_API_KEY` | Prod, Prev, Dev | Optional | ZeroBounce deliverability validation API |

---

## 3. Vercel Project & GitHub Integration Settings

1. **Connect Repository**:
   - In Vercel, click **Add New → Project** and import the SponFy GitHub repository.
2. **Framework & Root Directory**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave default)
3. **Build & Output Settings**:
   - Build Command: `next build` (or leave default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default; Vercel automatically runs `postinstall: prisma generate`)
4. **Production Branch**:
   - Set to `main`. Every push or PR merged into `main` automatically triggers a zero-downtime production deployment.

---

## 4. Production vs. Preview Environment Separation

| Setting | Production (`main` branch) | Preview (Pull Requests) |
| :--- | :--- | :--- |
| **Domain** | Stable production URL (`https://sponfy.vercel.app` or custom domain) | Ephemeral URL (`https://sponfy-<hash>-<team>.vercel.app`) |
| **`SITE_URL`** | `https://sponfy.vercel.app` (stable canonical URL) | Same `https://sponfy.vercel.app` (canonical links always point to prod) |
| **`NEXT_PUBLIC_DEMO_MODE`** | `false` (real Neon PostgreSQL) | `true` or isolated branch database |
| **Database** | Production Neon branch (`main`) | Neon Preview Branch (isolated per PR) or In-Memory Demo Store |
| **OAuth Redirects** | `https://sponfy.vercel.app/api/auth/callback/google` | Needs wildcard URI or use demo mode on previews |
| **Deployment Protection** | Public access | Vercel Password Protection or Vercel Authentication enabled |

---

## 5. Canonical URL Configuration Before Custom Domain

Until a custom domain is attached:
- SponFy dynamically resolves canonical URLs via `src/lib/config/site.ts`.
- The canonical resolver checks `SITE_URL` first, then `NEXT_PUBLIC_APP_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, falling back to `https://sponfy.vercel.app`.
- **CRITICAL**: The ephemeral `VERCEL_URL` (which changes every commit) is **never** used as the canonical URL. This prevents search engines from indexing temporary preview branches as duplicate content.

---

## 6. SEO, Robots & Sitemap Verification

SponFy includes native Next.js 15 metadata and crawler directives:

- **Robots.txt (`/robots.txt`)**:
  - Generated via `src/app/robots.ts`.
  - Public marketing routes (`/`, `/showcase`, `/why-us`, `/workflow`, `/intelligence`, `/analytics`, `/faq`, `/get-app`, `/privacy`, `/terms`) are allowed.
  - Authenticated and sensitive paths (`/app/*`, `/admin/*`, `/api/*`, `/login`, `/signup`) are strictly disallowed from crawler indexing.
- **Sitemap.xml (`/sitemap.xml`)**:
  - Generated via `src/app/sitemap.ts`.
  - Contains only public marketing pages with priority and change frequencies.
  - Completely excludes user-specific data, sponsor records, and draft outreach.
- **Verification**:
  - Test locally: Visit `http://localhost:3000/robots.txt` and `http://localhost:3000/sitemap.xml`.
  - Test production: Visit `https://<production-url>/robots.txt` and verify `Sitemap: https://<production-url>/sitemap.xml`.

---

## 7. Security & Monitoring Architecture

### HTTP Security Headers (in `next.config.ts`)
- **Content-Security-Policy (CSP)**:
  - Restricted to `'self'`, Google OAuth endpoints (`accounts.google.com`), Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Vercel Web Vitals (`vitals.vercel-insights.com`), and secure Neon WebSockets (`wss://*.neon.tech`).
- **Strict-Transport-Security (HSTS)**: `max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options**: `DENY` (clickjacking protection)
- **X-Content-Type-Options**: `nosniff` (MIME sniffing prevention)
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`

### Health Check Endpoint (`/api/health`)
- Returns `200 OK` with JSON diagnostics:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-16T11:30:00.000Z",
    "uptimeSeconds": 3600,
    "environment": "production",
    "storage": {
      "mode": "postgresql_neon",
      "database": "connected"
    },
    "version": "0.1.0"
  }
  ```
- Tests database connectivity with `SELECT 1` without revealing credentials or connection details.
- Suitable for Vercel, UptimeRobot, BetterUptime, or Pingdom synthetic checks.

---

## 8. GitHub Actions CI

The automated CI workflow (`.github/workflows/ci.yml`) runs on all pull requests and pushes to `main`:
1. **Clean Installation**: Runs `npm ci` against `package-lock.json`.
2. **Prisma Generation**: Generates `@prisma/client`.
3. **Linting**: Runs `npm run lint`.
4. **TypeScript Verification**: Runs `npm run typecheck` (`tsc --noEmit`).
5. **Unit & Regression Suite**: Runs 130+ Vitest tests (`npm test`).
6. **Production Build**: Compiles all 67 routes (`npm run build`).

---

## 9. Database Migrations & Rollback Procedures

### Applying Schema Changes Safely
1. Always test migrations locally:
   ```bash
   npm run db:migrate
   ```
2. For production Neon database, run schema migrations using `DIRECT_URL`:
   ```bash
   npx prisma migrate deploy
   ```
3. Never drop columns or rename tables in a single step. Follow the **Expand and Contract** pattern:
   - *Phase 1*: Add new nullable column/table.
   - *Phase 2*: Deploy application code that reads and writes both.
   - *Phase 3*: Backfill data.
   - *Phase 4*: Deploy code reading only the new column.
   - *Phase 5*: Drop old column.

### Rollback Procedure
If a production issue occurs:
1. In Vercel Dashboard, go to **Deployments**.
2. Locate the previous working deployment and click **Instant Rollback**.
3. Revert the problematic commit on GitHub:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

---

## 10. Steps to Transition to a Custom Domain

When ready to attach a custom domain (e.g. `sponfy.com` or `app.sponfy.com`):

1. **Add Domain in Vercel**:
   - Go to **Project Settings → Domains**.
   - Enter your domain (`sponfy.com`).
   - Configure DNS records (A record pointing to `76.76.21.21` or CNAME pointing to `cname.vercel-dns.com`).
2. **Update Environment Variables**:
   - Set `SITE_URL="https://sponfy.com"`
   - Set `NEXT_PUBLIC_APP_URL="https://sponfy.com"`
3. **Update Google Cloud Console**:
   - Add `https://sponfy.com` to **Authorized JavaScript Origins**.
   - Add `https://sponfy.com/api/auth/callback/google` to **Authorized Redirect URIs**.
   - Add `https://sponfy.com/api/integrations/gmail/callback` to **Authorized Redirect URIs**.
4. **Redeploy**:
   - Trigger a redeployment in Vercel. SponFy will automatically use the new domain for canonical URLs, sitemaps, robots.txt, and metadata.

---

## 11. Optional Docker Instructions (Self-Hosting / Containerization)

> **Note**: Vercel uses native zero-config deployment. Docker is **not** required for Vercel.

If deploying to AWS ECS, GCP Cloud Run, or a private VPS:

```bash
# Build the production container image
docker build -t sponfy:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" \
  -e AUTH_SECRET="your-32-char-auth-secret-here" \
  -e TOKEN_ENCRYPTION_KEY="your-32-byte-hex-encryption-key" \
  -e SITE_URL="https://yourdomain.com" \
  sponfy:latest
```
