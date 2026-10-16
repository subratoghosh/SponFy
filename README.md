# SponFy — AI Sponsorship Operating System & Intelligence Platform

SponFy is an enterprise-grade sponsorship operating system built for college hackathons, technical conferences, academic summits, and student developer organizations. Powered by multi-model artificial intelligence, live web research extraction, and human-in-the-loop safety gates, SponFy streamlines the entire sponsorship lifecycle—from automated discovery and explainable fit scoring to deliverability-guaranteed outreach, inbound reply intelligence, and pipeline revenue tracking.

---

## Brand Architecture & Visual System

SponFy is constructed around a custom Butter and Forest Green design language:
*   **Palette Definition**: Deep forest green (`#0C382E`), warm butter canvas (`#FAF4E6`), muted sage secondary tones (`#244D3F`), and butter cream highlights (`#FFF0B3`).
*   **Typography Hierarchy**: Classical Fraunces serif for display titles, Inter and Plus Jakarta Sans for dense tabular interfaces, and Outfit for numerical badges.
*   **Micro-Physics & Motion**: Dynamic element physics powered by Framer Motion, featuring smooth card tilts, floating ambient gradients, and responsive hover transitions.
*   **Accessible Visual Clarity**: High contrast ratios compliant with WCAG AAA standards across all forms, pipeline boards, and research dossiers.

---

## System Architecture Diagram

```mermaid
graph TD
    Client["Client / Browser / PWA<br/>(Desktop, Tablet, Mobile)"]

    subgraph Vercel Global Edge Network [Platform-Provided Edge Infrastructure]
        CDN["Vercel Anycast Global CDN<br/>(100+ Global Edge Locations)"]
        EdgeLB["Edge Load Balancer<br/>(Automatic Traffic Distribution)"]
        DDoSShield["L3/L4 DDoS Mitigation<br/>(Vercel Network Layer)"]
        EdgeMiddleware["Next.js Edge Middleware<br/>(Session Verification · Path Routing)"]
    end

    subgraph Application & Compute Layer [Next.js 15 App Router Serverless Functions]
        ServerlessApp["Next.js Application Engine<br/>(Server Components · React 19)"]
        RateLimiter["Distributed Rate Limiting Gateway<br/>(Sliding Window Algorithm)"]
        SendGuardEngine["Send-Guard Security Engine<br/>(Approval Gate · 12 AM Reset · Spacing)"]
        ZeroBounceShield["Zero-Bounce Deliverability Shield<br/>(DNS · MX · SPF · DMARC · AI Validator)"]
        HealthEndpoint["/api/health<br/>(Readiness & Liveness Probe)"]
        AuthModule["Auth.js v5 (NextAuth)<br/>(OAuth 2.0 · Anti-CSRF · Secure Cookies)"]
    end

    subgraph Distributed Cache & Rate Limiting Tier
        UpstashRedis["Upstash Serverless Redis<br/>(Global REST Cluster)"]
        MemoryLimiterFallback["In-Memory Cache Fallback<br/>(Zero-Downtime Graceful Degradation)"]
    end

    subgraph External AI & Research Pipeline
        GroqEngine["Groq Cloud API<br/>(Llama 3.3 70B · Fast Quality Scoring)"]
        GeminiEngine["Google Gemini Flash<br/>(Dossier Extraction · Contact Synthesis)"]
        TavilySearch["Tavily Search API<br/>(Live Corporate Web Discovery)"]
        FirecrawlScraper["Firecrawl Web Scraper<br/>(Deep Corporate Website Extraction)"]
    end

    subgraph Communication & External APIs
        GmailAPI["Google Gmail REST API<br/>(Mailbox Sending · Inbound Thread Sync)"]
        HunterAPI["Hunter.io API<br/>(Contact Email Discovery)"]
        ZeroBounceAPI["ZeroBounce API<br/>(Secondary Email Verification)"]
    end

    subgraph Data & Storage Layer
        PgBouncerPooler["Neon PgBouncer Connection Pooler<br/>(Transaction Mode Multiplexer)"]
        NeonPostgres[("Neon Serverless PostgreSQL<br/>(Primary Relational Store)")]
        PrismaORM["Prisma Client ORM<br/>(Parameterized Query Engine)"]
        CryptoVault["AES-256-GCM Encryption Vault<br/>(OAuth Token Store)"]
    end

    %% Client and Edge connections
    Client -->|HTTPS / HTTP/2| CDN
    CDN --> EdgeLB
    EdgeLB --> DDoSShield
    DDoSShield --> EdgeMiddleware
    EdgeMiddleware -->|Authenticated Request| ServerlessApp
    EdgeMiddleware -->|Static Assets / Cache Hit| Client

    %% App to Security and Services
    ServerlessApp --> RateLimiter
    RateLimiter -->|Distributed Check| UpstashRedis
    UpstashRedis -.->|Fallback on Disconnect| MemoryLimiterFallback
    RateLimiter --> SendGuardEngine
    SendGuardEngine --> ZeroBounceShield
    ServerlessApp --> HealthEndpoint
    ServerlessApp --> AuthModule

    %% External Research & Intelligence
    ServerlessApp --> GroqEngine
    ServerlessApp --> GeminiEngine
    ServerlessApp --> TavilySearch
    ServerlessApp --> FirecrawlScraper

    %% Communication layer
    SendGuardEngine -->|Authorized Direct Send| GmailAPI
    ZeroBounceShield --> HunterAPI
    ZeroBounceShield --> ZeroBounceAPI
    GmailAPI -->|Encrypted Credential Retrieval| CryptoVault

    %% Data Layer
    ServerlessApp --> PrismaORM
    PrismaORM --> PgBouncerPooler
    PgBouncerPooler --> NeonPostgres
    HealthEndpoint -->|SELECT 1 Test| PgBouncerPooler
```

---

## System Design Components: Platform-Provided vs. Custom-Engineered

SponFy combines native Vercel enterprise infrastructure with custom-engineered backend systems to achieve sub-second response times, complete multi-tenant isolation, and 99.99% operational uptime.

### 1. Platform-Provided Infrastructure (Vercel Global Network)

*   **Anycast Global CDN**: Automatically routes user requests across 100+ edge nodes worldwide, terminating TLS connections at the edge closest to the visitor for minimal latency.
*   **Edge Load Balancing**: Distributes incoming HTTP requests dynamically across scalable serverless execution workers, eliminating single-instance server bottlenecks.
*   **Automatic Serverless Scaling**: Auto-scales application execution from zero to hundreds of concurrent serverless container instances on demand, handling sudden traffic spikes during hackathon application windows.
*   **Layer 3 & Layer 4 DDoS Mitigation**: Absorbs malicious volumetric attacks and packet floods at the edge before traffic reaches application runtime containers.
*   **Edge Middleware Layer**: Executes routing logic and session authentication checks at the network edge with near-zero cold-start latency.
*   **Automated Zero-Downtime Deployments**: Manages atomic blue/green deployments with instant rollback capabilities linked directly to GitHub commits.

### 2. Custom-Engineered System Components (Built Into SponFy)

*   **Neon Serverless PostgreSQL with PgBouncer Pooling**: Configured with a dedicated pooled connection string (`DATABASE_URL`) for serverless query multiplexing and a direct non-pooled connection string (`DIRECT_URL`) for safe Prisma schema migrations.
*   **Hybrid Distributed Rate Limiter**: Implemented using `@upstash/ratelimit` over global Redis with a local in-memory sliding-window fallback, ensuring rate protection remains active even if external Redis limits are reached.
*   **Non-Bypassable Send-Guard Engine**: A pure-function server-side safety engine enforcing human approvals, suppression checks, duplicate contact locks, spacing rules, and rolling daily send limits.
*   **Automated 12:00 AM Quota Reset**: Dynamically calculates workspace send volumes against rolling calendar midnight timestamps, cleanly resetting outreach quotas every day at 12:00 AM local organizer time.
*   **Zero-Bounce Multi-Layer Deliverability Shield**: Runs RFC 5322 syntax validation, disposable domain filtering, direct DNS Mail Exchanger (MX) record lookups, SPF/DMARC inspection, and Gemini AI authentic inbox validation before any outbound transmission.
*   **Multi-Model AI Orchestration Pipeline**: Uses Groq (Llama 3.3 70B) for instant candidate relevance verification and draft email quality grading (<800ms response time), while reserving Gemini for deep multi-source research dossiers.
*   **AES-256-GCM Token Encryption Vault**: Stores all third-party Gmail OAuth refresh tokens, access credentials, and webhook secrets using authenticated AES-256-GCM encryption with randomized initialization vectors.
*   **Tenant Data Scoping & Role-Based Authorization**: Every database query across campaigns, sponsors, contacts, and outreach drafts enforces strict user-level tenancy and admin access controls.

---

## Comprehensive Security Architecture & Defense Controls

Security in SponFy is treated as a core architectural constraint rather than an afterthought. Every layer implements defense-in-depth principles:

### 1. HTTP Security Headers & Network Defense (in `next.config.ts`)

*   **Content-Security-Policy (CSP)**: Hardened with explicit, strict origin allowlists:
    *   `default-src 'self'`: Restricts all unspecified loading targets to the local origin.
    *   `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: Permits Next.js client hydration and dynamic module chunks while preventing unauthorized external scripts.
    *   `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Restricts styling to local CSS bundles and Google Fonts stylesheets.
    *   `font-src 'self' https://fonts.gstatic.com data:`: Loads typography strictly from verified Google Fonts CDN origins.
    *   `img-src 'self' data: blob: https:`: Allows user avatars, sponsor logos, and verified external brand icons over secure HTTPS.
    *   `connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://vitals.vercel-insights.com wss://*.neon.tech https://*.neon.tech https://*.upstash.io`: Restricts API communication exclusively to Google OAuth, Vercel Insights, Neon PostgreSQL WebSockets, and Upstash Redis.
    *   `frame-src 'self' https://accounts.google.com`: Restricts iframe mounting to local views and Google OAuth authentication frames.
    *   `object-src 'none'`: Completely disables plugin execution (Flash, Java, Silverlight) to block object-based vectors.
    *   `base-uri 'self'`: Prevents `<base>` tag injection attacks.
    *   `frame-ancestors 'none'`: Enforces clickjacking protection directly in the CSP header.
*   **Strict-Transport-Security (HSTS)**: Configured with `max-age=63072000; includeSubDomains; preload` (2 years), forcing all modern browsers to interact exclusively over encrypted HTTPS connections.
*   **X-Frame-Options: DENY**: Forbids browsers from embedding any SponFy route in `<frame>`, `<iframe>`, `<embed>`, or `<object>` elements.
*   **X-Content-Type-Options: nosniff**: Prevents browsers from MIME-sniffing a response away from the declared content type.
*   **Referrer-Policy: strict-origin-when-cross-origin**: Strips sensitive path information from the HTTP Referer header when navigating cross-origin.
*   **Permissions-Policy**: Restricts access to sensitive browser hardware APIs with `camera=(), microphone=(), geolocation=()`.

### 2. Cryptographic Storage & Token Security

*   **AES-256-GCM Encryption**: Third-party OAuth tokens (e.g. Gmail API refresh tokens) are never stored in plaintext. They are encrypted using AES-256 in Galois/Counter Mode (GCM).
*   **12-Byte Initialization Vector**: Every encrypted record generates a cryptographically random, non-repeating 12-byte IV.
*   **16-Byte Authentication Tag**: Tamper-detection is guaranteed; any ciphertext modification causes immediate decryption failure before data is processed.
*   **Key Isolation**: The encryption key (`TOKEN_ENCRYPTION_KEY`) is stored strictly in server-side environment variables and is never exposed to the client bundle.

### 3. Non-Bypassable Human-in-the-Loop Send Gate

To eliminate accidental spam or unreviewed AI hallucinations, SponFy implements a six-step server-side guard sequence in `src/lib/outreach/send-guard.ts`:
*   **Step 1: Human Approval Requirement**: Outbound messages must be explicitly marked as `APPROVED` by a human organizer. Drafts with status `draft`, `sending`, or `sent` are rejected with `403 Forbidden` or `409 Conflict`.
*   **Step 2: Recipient Address Lock**: The recipient address is always resolved from the stored verified company contact, never from client-submitted payload overrides. Any mismatch between client display and server record triggers an immediate `409 Conflict`.
*   **Step 3: Suppression List Enforcement**: Addresses matching the workspace Do-Not-Contact list or global bounce lists are blocked with `403 Forbidden`.
*   **Step 4: Lifetime Touch Cap**: Companies receive at most 1 initial outreach email + 2 polite follow-ups (3 touches total). Subsequent attempts are halted to preserve domain sender reputation.
*   **Step 5: Minimum Spacing Protection**: A mandatory 3-day minimum spacing window is enforced between touches to the same company. This prevents multiple student teammates from pitching the same sponsor simultaneously.
*   **Step 6: Rolling Daily Send Cap**: Limits total outbound emails sent per workspace within the rolling 24-hour window, returning `429 Too Many Requests` when limits are reached.

### 4. Zero-Bounce Deliverability Shield

Cold email bounces permanently damage domain reputation. SponFy prevents bounces before transmission:
*   **RFC 5322 Regex Validation**: Verifies email formatting, length, and octet constraints.
*   **Disposable Domain Blocker**: Maintains a real-time blacklist of known burner and temporary mail services (Mailinator, GuerrillaMail, 10MinuteMail, etc.).
*   **Live DNS MX Record Lookup**: Queries authoritative nameservers to confirm that the recipient domain has active Mail Exchanger (MX) records configured. If no MX records exist, the send is blocked.
*   **SPF & DMARC Verification**: Checks DNS TXT records for SPF (`v=spf1`) and DMARC (`v=dmarc1`) policies to assess domain authentication posture.
*   **AI Double-Check for Authentic Inboxes**: Queries Gemini/Groq to distinguish authentic corporate email addresses from pattern-guessed placeholders (e.g., detecting if a generic `partnerships@` address was synthesized without a corresponding public department).

### 5. Session Defense, CSRF & Multi-Tenant Isolation

*   **Auth.js v5 (NextAuth)**: Session state is signed and encrypted using JWT tokens signed by `AUTH_SECRET`.
*   **Secure Cookie Attributes**: Session cookies enforce `httpOnly: true`, `sameSite: "lax"`, and the `__Secure-` prefix in production environments.
*   **Double-Submit Anti-CSRF Protection**: Stateful CSRF tokens protect all state-changing endpoints (`POST`, `PUT`, `DELETE`).
*   **Tenant Data Scoping**: All Prisma queries filter records by `userId` or workspace association. A user logged into Campaign A cannot view, edit, or execute drafts created by another user.
*   **Server-Side Admin Verification**: Admin privileges are verified against a cryptographically hashed, server-side list of `ADMIN_EMAILS` rather than client-manipulable JWT claims.

### 6. Safe Error Handling & Diagnostic Boundaries

*   **Zero Stack Trace Leaks**: Production error boundaries (`error.tsx` and `global-error.tsx`) render user-friendly, branded recovery interfaces without leaking internal error messages or file paths.
*   **Diagnostic Incident Digests**: Unhandled server errors log an internal unique incident digest hash (`error.digest`), allowing engineers to correlate logs without exposing database connection details to clients.
*   **Sanitized Health Endpoint**: The `/api/health` probe runs internal `SELECT 1` queries to verify database connectivity, returning high-level operational status (`healthy` / `degraded`) while stripping all connection strings, credentials, and hostnames.

---

## Core Application Modules & Capabilities

### 1. Cited AI Web Research & Discovery (`/app/discover`)

*   **Targeted Track Queries**: Organizers enter hackathon themes (e.g. "DevTools offering developer grants", "Fintech APIs sponsoring student prizes in India").
*   **Live Multi-Source Extraction**: Orchestrates Tavily search queries and Firecrawl scrapers to crawl corporate sponsorship pages, previous student community sponsorships, and developer grant programs.
*   **Citations on Every Fact**: Every discovered sponsor dossier includes direct reference URLs, verified contact points, and confirmed sponsorship history—eliminating hallucinated companies.

### 2. Transparent 7-Factor Fit Scoring (`/app/sponsors/[id]`)

SponFy evaluates prospective sponsors using a 0–100 algorithm calculated across seven dimensions:
*   **Developer Relations Activity (20%)**: Active developer advocates, GitHub community initiatives, and community program engagement.
*   **Budget Signals & Corporate Scale (20%)**: Recent funding rounds, dedicated university grant budgets, and active hiring campaigns.
*   **Target Track Alignment (20%)**: Semantic match between the sponsor's technical product and the hackathon's focus areas.
*   **Student Community History (15%)**: Documented history of supporting college hackathons, university clubs, or open-source fellowships.
*   **Geographic Relevance (10%)**: Regional presence, local offices, or target developer hiring in the event's geographic region.
*   **Decision-Maker Reachability (10%)**: Presence of verified, active technical contacts or university relations personnel.
*   **Outreach Freshness (5%)**: Timeline since the sponsor's last community partnership announcement.

### 3. Human Approval Outreach Queue (`/app/outreach`)

*   **Contextual Email Pitch Generation**: AI models draft tailored outreach messages referencing the sponsor's specific developer tools, past sponsored events, and concrete hackathon metrics.
*   **Real-Time Email Quality Scoring**: Evaluates email drafts across five parameters (Personalization, Relevance, Clarity, Call-to-Action, and Professionalism), displaying an interactive 0–100 score with actionable feedback.
*   **Attention Requirement Flags**: Flags drafts containing unresolved bracketed placeholders (e.g. `[Insert Metric]`) or unverified claims, blocking transmission until reviewed.
*   **One-Click Approval & Direct Send**: Approving a pitch dispatches the message directly from the organizer's connected Gmail inbox via the Gmail API, maintaining existing email threads and professional deliverability.

### 4. Real-Time Gmail Thread Sync & Intent Classification (`/app/replies`)

*   **Bidirectional Gmail Sync**: Background sync jobs monitor the organizer's inbox for incoming sponsor replies.
*   **Intent Classification Engine**: Classifies incoming messages into discrete actionable categories:
    *   `Interested`: The sponsor expresses enthusiasm for the partnership.
    *   `Call Requested`: The sponsor requests a meeting or call link.
    *   `More Info Needed`: The sponsor requests a sponsorship prospectus or attendee breakdown.
    *   `Declined`: The sponsor is unable to support this iteration.
*   **Automated Question Extraction**: Parses questions asked by the sponsor (e.g., "What are your tier prices?" or "Can we provide a custom prize category?") and prepares one-click draft responses.

### 5. Automated 4-Touch Follow-up Engine (`/app/followups`)

*   **Polite Multi-Touch Cadences**: Automates a structured 4-touch follow-up workflow:
    *   *Day 0*: Initial personalized pitch.
    *   *Day 3*: Contextual follow-up highlighting hackathon attendee demographics.
    *   *Day 7*: Milestone update (e.g., announcing speaker confirmations or registration milestones).
    *   *Day 12*: Polite closing / break-up email leaving the door open for future events.
*   **Automatic Cadence Halting**: Instantly halts all future scheduled touches if an incoming reply is detected, if the company moves to a negotiation stage, or if an opt-out is received.

### 6. Sponsorship Analytics & Revenue Intelligence (`/app/analytics`)

*   **Committed vs. Pipeline Revenue**: Tracks actual confirmed sponsor cash and cloud credit commitments against total pipeline value.
*   **Stage Velocity Tracking**: Monitors average days spent across each pipeline stage (Discovered, Contacted, In Discussion, Committed, Lost).
*   **Zero Vanity Metrics**: Focuses on actionable operational metrics (reply rate, meeting conversion rate, and average sponsorship package size) rather than vanity email opens.

---

## Progressive Web App (PWA) Capabilities

SponFy is configured as an installable Progressive Web App:
*   **Web App Manifest (`src/app/manifest.ts`)**: Configures application branding, high-resolution adaptive icons (`192x192` and `512x512`), theme color (`#0C382E`), and standalone display mode.
*   **Service Worker Architecture (`public/sw.js`)**: Pre-caches primary application shells, styling bundles, and brand assets for instant offline boot times.
*   **Resilient Offline Fallback Screen**: When network connectivity is lost, the application seamlessly presents an offline diagnostic screen that monitors network recovery and restores application state automatically upon reconnection.

---

## Continuous Integration & DevOps

### 1. GitHub Actions Workflow (`.github/workflows/ci.yml`)

Every pull request and push to `main` executes an automated CI validation pipeline:
*   **Clean Dependency Installation**: Executes `npm ci` strictly against `package-lock.json`.
*   **Prisma Client Generation**: Compiles the type-safe Prisma database client.
*   **ESLint Inspection**: Runs `npm run lint` to enforce project code standards.
*   **TypeScript Strict Verification**: Runs `npm run typecheck` (`tsc --noEmit`) to verify strict type safety across all components and server functions.
*   **Automated Vitest Test Suite**: Runs 130+ unit, integration, and security regression tests (`npm test`).
*   **Next.js Production Build**: Compiles all 69 static and dynamic application routes (`npm run build`).

### 2. Multi-Stage Production Containerization (`Dockerfile`)

For teams deploying to private container environments (AWS ECS, Google Cloud Run, or Kubernetes):
*   **Stage 1 (`deps`)**: Installs production dependencies on `node:22-alpine`.
*   **Stage 2 (`builder`)**: Compiles the Next.js standalone server bundle.
*   **Stage 3 (`runner`)**: Configures an unprivileged system user (`nextjs:nodejs`), mounts static assets, and exposes port `3000` with zero secrets baked into the image.

---

## Production Deployment Matrix

Refer to [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for the exhaustive 11-step production deployment manual.

### Required Environment Variables

```env
# Canonical Site URL (Used for metadataBase, sitemap, robots, OpenGraph)
SITE_URL="https://sponfy.vercel.app"
NEXT_PUBLIC_APP_URL="https://sponfy.vercel.app"
NEXT_PUBLIC_DEMO_MODE="false"

# Neon Serverless PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth.js Authentication Secrets
AUTH_SECRET="generate-a-32-character-random-secret-via-openssl"
TOKEN_ENCRYPTION_KEY="64-character-hex-string-for-aes-256-gcm-encryption"
CRON_SECRET="generate-a-random-secret-token-for-background-crons"

# Admin Access Control (Server-Verified Admin Email Addresses)
ADMIN_EMAILS="admin@sponfy.dev,organizer@sponfy.dev"

# Google Cloud OAuth 2.0 & Gmail API
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="https://sponfy.vercel.app/api/integrations/gmail/callback"

# Distributed Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# AI & Web Discovery Providers
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
GEMINI_API_KEY="your_gemini_api_key_here"
TAVILY_API_KEY="your_tavily_api_key_here"
```

---

## Local Development Quickstart

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/SponFy.git
cd SponFy
npm ci
```

### 2. Configure Local Environment
```bash
cp .env.example .env.local
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Execute Verification Suite
```bash
npm test              # Run 130+ Vitest unit & regression tests
npm run typecheck     # Verify TypeScript types (tsc --noEmit)
npm run lint          # Run ESLint validation
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Operational Health Check

SponFy includes built-in operational probes for monitoring:
*   **Liveness / Readiness Probe**: `GET /api/health` returns HTTP 200 with JSON diagnostics confirming database pooler responsiveness without leaking connection details.
*   **Search Engine Directives**: `GET /robots.txt` and `GET /sitemap.xml` dynamically serve valid crawler policies.
*   **Security Header Inspection**: `curl -I http://localhost:3000` verifies active HSTS, CSP, X-Frame-Options, and Referrer-Policy headers.

---

## License

MIT License. Designed and engineered for student organizers and tech community leaders worldwide.
