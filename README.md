# SponFy — AI Sponsorship Operating System & Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0_App_Router-black?logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-orange)](https://github.com/langchain-ai/langgraphjs)
[![Tests](https://img.shields.io/badge/Tests-174_Passed-success?logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM-darkgreen)](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

SponFy is an enterprise-grade sponsorship operating system built for college hackathons, technical conferences, academic summits, and student developer organizations. Powered by multi-model artificial intelligence, live web research extraction, and human-in-the-loop safety gates, SponFy streamlines the entire sponsorship lifecycle—from automated discovery and explainable fit scoring to deliverability-guaranteed outreach, inbound reply intelligence, meeting scheduling, and pipeline revenue tracking.

---

## Visual Table of Contents

| Section | Visual Type | Focus Area |
| :--- | :--- | :--- |
| **[1. End-to-End System Architecture](#1-end-to-end-system-architecture)** | System Flow Diagram | Global Edge, Serverless Compute, AI Engine, Storage |
| **[2. LangGraph & Multi-Model AI Pipeline](#2-langgraph--multi-model-ai-orchestration-pipeline)** | Orchestration Flowchart | Parallel web search, Llama 3.3 scoring, Gemini extraction |
| **[3. Six-Step Send-Guard Security Engine](#3-six-step-send-guard-security-engine)** | Gate Decision Flowchart | Non-bypassable human approvals, spacing, and quotas |
| **[4. Multi-Layer Deliverability Shield](#4-multi-layer-deliverability-shield)** | Verification Pipeline | DNS MX, SPF/DMARC, disposable filters, and AI check |
| **[5. 7-Factor Fit Scoring Breakdown](#5-transparent-7-factor-fit-scoring-algorithm)** | Mermaid Pie Chart & Matrix | 0–100 explainable sponsor evaluation breakdown |
| **[6. Inbound Reply & Intent Intelligence](#6-real-time-reply-sync--intent-classification-engine)** | NLP Decision Machine | Automation intent classification and question extraction |
| **[7. 4-Touch Follow-Up Cadence & Circuit Breakers](#7-automated-4-touch-follow-up-engine--circuit-breakers)** | Lifecycle Timeline Flow | Scheduled cadence and real-time auto-halting triggers |
| **[8. Meeting Scheduler & Morning Reminders](#8-meeting-calendar-scheduler--overview-reminders)** | Interaction Flowchart | Big calendar multi-slot scheduling and login popups |
| **[9. AES-256-GCM Cryptographic Vault](#9-cryptographic-storage--token-security-vault)** | Sequence Diagram | OAuth token encryption, IV handling, and tamper defense |
| **[10. Platform vs. Custom Architecture Matrix](#10-platform-infrastructure-vs-custom-engineered-components)** | Structured Comparison | Vercel Edge capabilities vs. bespoke SponFy modules |
| **[11. CI/CD DevOps & Test Pipeline](#11-continuous-integration--devops-pipeline)** | Build Pipeline Flow | GitHub Actions, TypeScript verification, and 174 tests |
| **[12. Quickstart & Environment Setup](#12-local-development-quickstart)** | Code Configuration | Step-by-step local bootstrap and environment schema |

---

## 1. End-to-End System Architecture

```mermaid
graph TD
    User["Organizer Client Browser / PWA<br/>(Desktop · Tablet · Mobile)"]

    subgraph VercelEdge ["Vercel Global Edge Network"]
        CDN["Vercel Anycast CDN<br/>(100+ Edge Locations)"]
        EdgeLB["Edge Load Balancer<br/>(Auto Traffic Shaping)"]
        DDoSShield["L3/L4 DDoS Mitigation"]
        EdgeMiddleware["Next.js Edge Middleware<br/>(Session Verification & Routing)"]
    end

    subgraph AppLayer ["Next.js 15 Application & Compute Engine"]
        AppRouter["App Router Server Components<br/>(React 19 Core)"]
        LangGraphCoord["LangGraph Discovery Orchestrator<br/>(Stateful Graph Execution)"]
        SendGuardEngine["Send-Guard Security Engine<br/>(Human Approval · Spacing · Quotas)"]
        DeliverabilityShield["Deliverability & Safety Shield<br/>(MX · SPF · DMARC · AI Validator)"]
        HealthEndpoint["/api/health Probe<br/>(Liveness & Pooler Check)"]
        AuthModule["Auth.js v5<br/>(OAuth 2.0 · Anti-CSRF)"]
    end

    subgraph DistributedCache ["Distributed Cache & Rate Limiting"]
        UpstashRedis["Upstash Serverless Redis<br/>(Global REST Cluster)"]
        MemoryLimiterFallback["In-Memory Cache Fallback<br/>(Graceful Zero-Downtime)"]
    end

    subgraph IntelligenceServices ["AI Models & Extraction APIs"]
        GroqEngine["Groq Cloud API<br/>(Llama 3.3 70B · Fast Quality Scoring)"]
        GeminiEngine["Google Gemini Flash<br/>(Dossier Extraction · Contact Synthesis)"]
        TavilySearch["Tavily Search API<br/>(Live Corporate Web Discovery)"]
        FirecrawlScraper["Firecrawl Web Scraper<br/>(Deep Corporate Website Extraction)"]
    end

    subgraph ExternalChannels ["Outbound Channels & Deliverability"]
        GmailAPI["Google Gmail REST API<br/>(Mailbox Sending · Inbound Thread Sync)"]
        HunterAPI["Hunter.io API<br/>(Contact Email Discovery)"]
        ZeroBounceAPI["ZeroBounce API<br/>(Secondary Email Verification)"]
    end

    subgraph StorageLayer ["Persistence & Cryptographic Tier"]
        PgBouncerPooler["Neon PgBouncer Connection Pooler<br/>(Transaction Multiplexer)"]
        NeonPostgres[("Neon Serverless PostgreSQL<br/>(Primary Relational Store)")]
        CryptoVault["AES-256-GCM Encryption Vault<br/>(Encrypted OAuth Credentials)"]
    end

    %% Edge Connections
    User -->|HTTPS / HTTP/2| CDN
    CDN --> EdgeLB
    EdgeLB --> DDoSShield
    DDoSShield --> EdgeMiddleware
    EdgeMiddleware -->|Authenticated Request| AppRouter
    EdgeMiddleware -->|Static Assets / Cache Hit| User

    %% App Compute Connections
    AppRouter --> LangGraphCoord
    AppRouter --> SendGuardEngine
    AppRouter --> AuthModule
    AppRouter --> HealthEndpoint

    %% Rate Limiting
    SendGuardEngine --> UpstashRedis
    UpstashRedis -.->|Fallback on Disconnect| MemoryLimiterFallback

    %% Intelligence Layer
    LangGraphCoord --> GroqEngine
    LangGraphCoord --> GeminiEngine
    LangGraphCoord --> TavilySearch
    LangGraphCoord --> FirecrawlScraper

    %% Dispatch & Security
    SendGuardEngine --> DeliverabilityShield
    DeliverabilityShield --> HunterAPI
    DeliverabilityShield --> ZeroBounceAPI
    SendGuardEngine -->|Authorized Send| GmailAPI
    GmailAPI -->|Decrypt Tokens| CryptoVault

    %% Database
    AppRouter --> PgBouncerPooler
    PgBouncerPooler --> NeonPostgres
    HealthEndpoint -->|SELECT 1 Test| PgBouncerPooler
```

---

## 2. LangGraph & Multi-Model AI Orchestration Pipeline

SponFy integrates **LangGraph** as an orchestration layer over live discovery and dossier synthesis, executing parallel web research, fast LLM relevance filtering, and deep factual synthesis.

```mermaid
flowchart TD
    StartInput["Organizer Enters Campaign Parameters<br/>(Hackathon Theme, Track Focus, Tech Stack)"] --> StateInit["Initialize Discovery State Graph<br/>(Track Queries, Candidate Map, Audit Logs)"]
    
    StateInit --> ParallelSearch{"Parallel Web Research Fan-Out"}
    
    ParallelSearch -->|API Call| TavilyNode["Tavily Search Node<br/>(Live Developer Grant Queries)"]
    ParallelSearch -->|Crawl Job| FirecrawlNode["Firecrawl Scraper Node<br/>(Corporate DevRel & Sponsorship Pages)"]
    
    TavilyNode --> AggregateResults["Aggregate Raw Company Mentions & Links"]
    FirecrawlNode --> AggregateResults
    
    AggregateResults --> RelevanceFilter["Groq Llama 3.3 70B Fast Evaluator<br/>(Relevance Scoring · Latency &lt; 800ms)"]
    
    RelevanceFilter --> DecisionGate{"Candidate Fit Score &ge; 60?"}
    
    DecisionGate -->|No| DiscardCandidate["Filtered Out<br/>(Low Alignment / No Developer Budget)"]
    DecisionGate -->|Yes| GeminiSynthesizer["Gemini Flash Dossier Synthesis<br/>(Extract Contacts, Budgets, Fact Citations)"]
    
    GeminiSynthesizer --> QualityGuard["Quality Gate Verification<br/>(Check Reference URLs & Deduplicate)"]
    QualityGuard --> PersistDossier[("Persist Dossier & Verified Contacts<br/>Neon PostgreSQL")]
    PersistDossier --> DisplayQueue["Display in Candidate Queue<br/>(/app/discover)"]
```

---

## 3. Six-Step Send-Guard Security Engine

To eliminate unauthorized spam and accidental transmissions, **all outbound emails** must pass through a strict, pure-function validation chain executed entirely on the server.

```mermaid
flowchart TD
    OutboundTrigger["Outbound Send Request Received<br/>(User clicks 'Send Approved Pitch')"] --> Step1{"Step 1: Human Approval Check<br/>Status == 'APPROVED'?"}
    
    Step1 -->|No: draft / sending / sent| Err403["Reject 403 Forbidden<br/>(Unapproved draft cannot be dispatched)"]
    Step1 -->|Yes| Step2{"Step 2: Recipient Address Lock<br/>Matches Stored Verified Contact?"}
    
    Step2 -->|Mismatch Detected| Err409["Reject 409 Conflict<br/>(Client payload address tampering blocked)"]
    Step2 -->|Verified Match| Step3{"Step 3: Suppression List Check<br/>In Workspace Do-Not-Contact / Bounce List?"}
    
    Step3 -->|Suppressed / Bounced| ErrSuppressed["Reject 403 Forbidden<br/>(Suppressed address safety lock)"]
    Step3 -->|Clean Address| Step4{"Step 4: Lifetime Touch Cap<br/>Total touches to company &lt; 3?"}
    
    Step4 -->|Exceeded Cap &ge; 3| ErrCap["Reject 429 Too Many Requests<br/>(Domain reputation touch limit reached)"]
    Step4 -->|Within Cap| Step5{"Step 5: Minimum Spacing Protection<br/>&ge; 3 Days since last touch?"}
    
    Step5 -->|Too Soon &lt; 3 Days| ErrSpacing["Reject 429 Spacing Conflict<br/>(Wait minimum 3 days between touches)"]
    Step5 -->|Spacing Respected| Step6{"Step 6: Rolling Daily Cap<br/>Within rolling 24-hr workspace limit?"}
    
    Step6 -->|Daily Limit Reached| ErrQuota["Reject 429 Quota Exceeded<br/>(Resets at 12:00 AM local organizer time)"]
    Step6 -->|Under Daily Cap| DeliverabilityCheck["Proceed to Deliverability Shield"]
    
    DeliverabilityCheck --> DecryptToken["Decrypt OAuth Token via AES-256-GCM"]
    DecryptToken --> DispatchGmail["Dispatch via Gmail REST API<br/>(Status &rarr; 'sent')"]
```

---

## 4. Multi-Layer Deliverability Shield

Bounces permanently harm domain reputation. SponFy prevents bad sends before they leave the application:

```mermaid
flowchart LR
    CandidateEmail["Recipient Email Address"] --> L1["Layer 1: RFC 5322<br/>Syntax & Octet Validation"]
    L1 --> L2["Layer 2: Burner Filter<br/>Disposable Domain Blacklist"]
    L2 --> L3["Layer 3: DNS MX Records<br/>Direct Nameserver Lookup"]
    L3 --> L4["Layer 4: Policy Audit<br/>SPF & DMARC Verification"]
    L4 --> L5["Layer 5: AI Authenticity<br/>Inbox Pattern & Role Detector"]
    L5 --> VerifiedStatus["✅ Verified Authentic Mailbox<br/>Eligible for Human Approval Queue"]

    L1 -.->|Invalid Syntax| Blocked["❌ Blocked with Reason"]
    L2 -.->|Disposable Domain| Blocked
    L3 -.->|No MX Records| Blocked
    L4 -.->|Failed Policy| Blocked
    L5 -.->|Synthesized Placeholder| Blocked
```

---

## 5. Transparent 7-Factor Fit Scoring Algorithm

Prospective sponsors are scored on an explainable **0–100** scale across seven dimensions before entering the outreach pipeline:

```mermaid
pie title 7-Factor Fit Scoring Weight Distribution
    "Developer Relations Activity" : 20
    "Budget Signals & Corporate Scale" : 20
    "Target Track Alignment" : 20
    "Student Community History" : 15
    "Geographic Relevance" : 10
    "Decision-Maker Reachability" : 10
    "Outreach Freshness" : 5
```

### Scoring Criteria Matrix

| Dimension | Weight | Signals Analyzed | Target Threshold |
| :--- | :---: | :--- | :--- |
| **Developer Relations Activity** | **20%** | Active developer advocates, GitHub initiatives, OSS programs | Recent active hackathon involvement |
| **Budget Signals & Scale** | **20%** | Recent funding rounds, dedicated university grants, hiring | Verified student grant budgets |
| **Target Track Alignment** | **20%** | Semantic match between API/product and hackathon tracks | High relevance to student projects |
| **Student Community History** | **15%** | Track record of sponsoring college clubs, summits, or fellows | Prior university sponsorship evidence |
| **Geographic Relevance** | **10%** | Regional developer hubs, regional hiring campaigns | Event country or global remote policy |
| **Decision-Maker Reachability** | **10%** | Verified DevRel, University Relations, or Tech Recruiting emails | Named contact with public role |
| **Outreach Freshness** | **5%** | Recency of last public sponsorship announcement | Partnership announced in past 6 months |

---

## 6. Real-Time Reply Sync & Intent Classification Engine

SponFy actively listens for incoming replies across connected Gmail threads and passes incoming text through an NLP intent classification pipeline:

```mermaid
flowchart TD
    InboundMsg["Inbound Email Reply Received<br/>(Background Gmail Thread Poller)"] --> ThreadMatch["Match Message to Active Campaign & Sponsor"]
    
    ThreadMatch --> AutoHaltCadence["Auto-Halt Active Follow-Up Cadence<br/>(Prevent redundant automated touches)"]
    
    AutoHaltCadence --> NLPClassifier["AI Intent Classification Engine<br/>(Groq Llama 3.3 70B)"]
    
    NLPClassifier --> CategorySplit{"Classified Intent Category"}
    
    CategorySplit -->|Interested| Cat1["Priority Alert: Interested<br/>- Move to 'In Discussion'<br/>- Suggest Meeting Pitch"]
    CategorySplit -->|Call Requested| Cat2["High-Priority: Meeting Requested<br/>- Trigger Calendar Scheduling Link<br/>- Notify Organizer Immediately"]
    CategorySplit -->|More Info Needed| Cat3["Info Request: Prospectus / Pricing<br/>- Auto-Extract Specific Questions<br/>- Pre-draft Tier Answers"]
    CategorySplit -->|Declined| Cat4["Polite Decline: Not This Year<br/>- Move to 'Lost / Future Pipeline'<br/>- Log feedback & maintain positive rapport"]
    
    Cat1 --> ReplyQueue["Display in Replies Action Center<br/>(/app/replies)"]
    Cat2 --> ReplyQueue
    Cat3 --> ReplyQueue
    Cat4 --> ReplyQueue
```

---

## 7. Automated 4-Touch Follow-Up Engine & Circuit Breakers

A structured 4-touch cadence ensures maximum reply rates while strictly protecting sender reputation. Any inbound activity triggers an immediate circuit breaker.

```mermaid
flowchart TD
    Day0["Day 0: Initial Pitch<br/>Personalized value proposition + event metrics"] --> Wait3Days["Wait 3 Days (Enforce Spacing)"]
    
    Wait3Days --> CheckReply1{"Reply Received?"}
    CheckReply1 -->|Yes| Halt1["⚡ Circuit Breaker Triggered<br/>Halt All Future Follow-ups"]
    CheckReply1 -->|No| Day3["Day 3: Touch 2 (Contextual Demographic Follow-up)<br/>Share attendee hacker skill breakdown"]
    
    Day3 --> Wait4Days["Wait 4 Days (Enforce Spacing)"]
    
    Wait4Days --> CheckReply2{"Reply Received?"}
    CheckReply2 -->|Yes| Halt2["⚡ Circuit Breaker Triggered<br/>Halt All Future Follow-ups"]
    CheckReply2 -->|No| Day7["Day 7: Touch 3 (Milestone Update)<br/>Announce keynoter, tier lock-in, or track deadline"]
    
    Day7 --> Wait5Days["Wait 5 Days (Enforce Spacing)"]
    
    Wait5Days --> CheckReply3{"Reply Received?"}
    CheckReply3 -->|Yes| Halt3["⚡ Circuit Breaker Triggered<br/>Halt All Future Follow-ups"]
    CheckReply3 -->|No| Day12["Day 12: Touch 4 (Polite Closing / Break-up)<br/>Leave door open for future iterations"]
    
    Day12 --> MarkConcluded["Cadence Gracefully Concluded<br/>(Lifetime Touch Cap Reached: 4 touches)"]
```

---

## 8. Meeting Calendar Scheduler & Overview Reminders

Organizers can manage all sponsor meetings through an interactive, full-screen calendar with morning reminder notifications on login.

```mermaid
flowchart TD
    SchedulePage["Navigate to Schedule Page<br/>(/app/schedule)"] --> BigCalendarView["Full-Screen Interactive Calendar<br/>(Monthly View with Date Cell Grid)"]
    
    BigCalendarView --> ClickDate["Click Date Cell<br/>(e.g., October 24, 2026)"]
    ClickDate --> ModalPrompt["Open Meeting Creation Modal<br/>- Meeting Title<br/>- Sponsor / Company Name<br/>- Start & End Time<br/>- Notes & Meeting Link"]
    
    ModalPrompt --> SaveMeeting["Save Schedule<br/>(Multi-meeting capacity per day)"]
    SaveMeeting --> PersistStore["Sync with Local & Remote Store<br/>(Persistent Workspace Records)"]
    
    PersistStore --> DailyReminderCheck{"User Logs In / Opens App<br/>Is there a meeting TODAY?"}
    
    DailyReminderCheck -->|No Meetings Today| NormalDash["Display Standard Dashboard Overview<br/>(/app)"]
    DailyReminderCheck -->|Meeting Scheduled for Today| ReminderPopup["Trigger First-Login Morning Reminder<br/>- Modal popup displaying today's sponsor meetings<br/>- Direct link to meeting URL & company dossier"]
```

---

## 9. Cryptographic Storage & Token Security Vault

All OAuth refresh tokens and sensitive API keys are encrypted at rest using **AES-256-GCM** with authenticated tamper verification.

```mermaid
sequenceDiagram
    autonumber
    actor Organizer
    participant App as SponFy Serverless Engine
    participant Vault as AES-256-GCM Crypto Module
    participant DB as Neon PostgreSQL (Database)
    participant Gmail as Google Gmail API

    Note over Organizer,Gmail: Storing Gmail OAuth Refresh Token
    Organizer->>App: Complete Google OAuth Flow
    App->>Vault: encrypt(token, TOKEN_ENCRYPTION_KEY)
    Vault->>Vault: Generate random 12-byte IV
    Vault->>Vault: Encrypt with AES-256-GCM
    Vault->>Vault: Generate 16-byte Auth Tag
    Vault-->>App: Return "iv:ciphertext:tag"
    App->>DB: Store encrypted string in Account table

    Note over Organizer,Gmail: Dispatching an Approved Email
    Organizer->>App: Click 'Send Approved Pitch'
    App->>DB: Fetch encrypted token string
    App->>Vault: decrypt(encryptedString, TOKEN_ENCRYPTION_KEY)
    Vault->>Vault: Check 16-byte Auth Tag for tampering
    alt Tampering Detected (Ciphertext modified)
        Vault-->>App: Decryption Failure / Tamper Exception
        App-->>Organizer: 500 Cryptographic Tamper Alert (Halt)
    else Integrity Verified
        Vault-->>App: Plaintext OAuth Refresh Token
        App->>Gmail: Request access token & dispatch email
        Gmail-->>App: Email Dispatched Successfully (HTTP 200)
        App-->>Organizer: Send Confirmed (Status updated to 'sent')
    end
```

---

## 10. Platform Infrastructure vs. Custom-Engineered Components

SponFy achieves high availability by cleanly dividing concerns between Vercel's global platform infrastructure and custom-engineered business logic.

```mermaid
graph LR
    subgraph PlatformInfrastructure ["Platform-Provided (Vercel Global)"]
        P1["Anycast Global CDN<br/>(100+ Edge Locations)"]
        P2["Edge Load Balancing<br/>(Auto Request Routing)"]
        P3["Serverless Auto-Scaling<br/>(0 to Hundreds of Instances)"]
        P4["L3/L4 DDoS Mitigation<br/>(Volumetric Attack Defense)"]
        P5["Edge Middleware<br/>(Sub-10ms Session Check)"]
    end

    subgraph CustomEngineered ["Custom-Engineered (SponFy Core)"]
        C1["Send-Guard Security Engine<br/>(Pure-function safety gate)"]
        C2["Deliverability Shield<br/>(MX / SPF / DMARC verification)"]
        C3["LangGraph Discovery Engine<br/>(Stateful multi-model AI graph)"]
        C4["AES-256-GCM Crypto Vault<br/>(Tamper-evident token security)"]
        C5["Midnight Quota Engine<br/>(Rolling 12:00 AM reset calculator)"]
        C6["7-Factor Fit Scoring<br/>(0–100 explainable sponsor rating)"]
    end

    PlatformInfrastructure -->|Low Latency Routing & Protection| CustomEngineered
```

---

## 11. Continuous Integration & DevOps Pipeline

Every pull request and commit to `main` undergoes an automated multi-stage verification pipeline to ensure zero regressions:

```mermaid
flowchart LR
    PushCommit["git push origin main / PR"] --> CIJob["GitHub Actions CI Pipeline"]
    
    subgraph Stages ["Automated Verification Stages"]
        S1["1. npm ci<br/>(Deterministic lockfile)"] --> S2["2. prisma generate<br/>(Type-safe ORM client)"]
        S2 --> S3["3. npm run lint<br/>(ESLint code quality)"]
        S3 --> S4["4. npm run typecheck<br/>(tsc --noEmit strict check)"]
        S4 --> S5["5. npm test<br/>(Vitest: 174 tests across 20 suites)"]
        S5 --> S6["6. npm run build<br/>(Next.js production build)"]
    end

    CIJob --> Stages
    Stages --> DeploySuccess["✅ Vercel Atomic Deployment<br/>(Instant Rollback Capable)"]
    Stages -.->|Any Stage Fails| AlertFail["❌ Build Blocked & Alerted"]
```

---

## 12. Local Development Quickstart

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/subratoghosh/SponFy.git
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
npm test              # Run all 174 Vitest unit, regression & security tests
npm run typecheck     # Verify TypeScript types (tsc --noEmit)
npm run lint          # Run ESLint validation
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Configuration Reference

| Variable | Description | Required in Production |
| :--- | :--- | :---: |
| `SITE_URL` | Canonical origin (e.g. `https://sponfy.vercel.app`) | Yes |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string (`?sslmode=require`) | Yes |
| `DIRECT_URL` | Neon PostgreSQL direct unpooled connection string (for migrations) | Yes |
| `AUTH_SECRET` | 32+ character random secret for signing NextAuth JWT sessions | Yes |
| `TOKEN_ENCRYPTION_KEY` | 64-character hex string for AES-256-GCM token encryption | Yes |
| `ADMIN_EMAILS` | Comma-separated admin emails verified on server side | Yes |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth Client ID for Gmail API & Sign In | Yes |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth Client Secret | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint for distributed rate limiting | Recommended |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST authentication token | Recommended |
| `GROQ_API_KEY` | Groq API key for Llama 3.3 70B fast scoring | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for deep dossier synthesis | Yes |
| `TAVILY_API_KEY` | Tavily Search API key for real-time web discovery | Yes |

---

## License

MIT License. Designed and engineered for student organizers and tech community leaders worldwide.
