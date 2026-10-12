# Graph Report - SponFy  (2026-10-10)

## Corpus Check
- 116 files · ~58,358 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .example 1, (none) 1, .prisma 1)

## Summary
- 505 nodes · 1524 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 1,200 input · 450 output

## Community Hubs (Navigation)
- Next.js UI & Lucide Icons Core
- API Routes & Prisma Database Engine
- Analytics Charts & Settings Views
- Build Tooling & Dev Dependencies
- Sponsor Discovery & Outreach Workspaces
- Gmail API & Reply Intelligence Inbox
- LangGraph Workflows & Activity Timeline
- Google Gemini AI & Agent Integrations
- Kanban Board & Sponsor Pipeline CRM
- TypeScript Compiler Configuration
- Runtime Dependencies & Libraries
- Butter & Green Design Architecture & Specs
- Global Styles & Root Typography Layout
- AES-256 Token Encryption & Security
- PostCSS Styling Pipeline

## God Nodes (most connected - your core abstractions)
1. `react` - 75 edges
2. `Button` - 65 edges
3. `lucide-react` - 59 edges
4. `cn()` - 48 edges
5. `Company` - 46 edges
6. `next` - 33 edges
7. `isDatabaseConfigured()` - 32 edges
8. `toast()` - 18 edges
9. `useToast()` - 18 edges
10. `Campaign` - 18 edges
11. `computeFitScore()` - 16 edges
12. `ShowcaseCompany` - 14 edges
13. `verifyAdminSession()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Next.js 15, Prisma ORM & Neon Serverless Stack` --conceptually_related_to--> `SponFy Product & Architecture Specification`  [INFERRED]
  README.md → docs/superpowers/specs/2026-10-08-sponfy-design.md
- `SponsorCardProps` --references--> `Company`  [EXTRACTED]
  src/components/sponsors/SponsorCard.tsx → src/types/index.ts
- `AnalyticsPage()` --calls--> `AnalyticsCharts()`  [EXTRACTED]
  src/app/(app)/app/analytics/page.tsx → src/components/analytics/AnalyticsCharts.tsx
- `AnalyticsPage()` --calls--> `toast()`  [EXTRACTED]
  src/app/(app)/app/analytics/page.tsx → src/components/ui/toast.tsx
- `AnalyticsPage()` --calls--> `getAnalyticsData()`  [EXTRACTED]
  src/app/(app)/app/analytics/page.tsx → src/lib/data/repositories/analytics.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SponFy Architecture Specification Triad** — readme_sponfy_engine, docs_superpowers_specs_2026_10_08_sponfy_design_spec, docs_superpowers_plans_2026_10_08_sponfy_implementation_plan [EXTRACTED 1.00]

## Communities (15 total, 1 thin omitted)

### Community 0 - "Next.js UI & Lucide Icons Core"
Cohesion: 0.07
Nodes (54): nextConfig, lucide-react, next, react, AnalyticsPage(), CampaignsPage(), FollowupsPage(), AppLayout() (+46 more)

### Community 1 - "API Routes & Prisma Database Engine"
Cohesion: 0.06
Nodes (62): @prisma/client, POST(), POST(), POST(), POST(), POST(), POST(), analyticsRepository (+54 more)

### Community 2 - "Analytics Charts & Settings Views"
Cohesion: 0.10
Nodes (39): SettingsPage(), AnalyticsCharts(), INDUSTRY_CONVERSION_DATA, INTENT_DATA, SENT_VS_REPLIES_DATA, STAGE_VALUES_DATA, CreateCampaignModal(), CreateCampaignModalProps (+31 more)

### Community 3 - "Build Tooling & Dev Dependencies"
Cohesion: 0.04
Nodes (44): devDependencies, autoprefixer, postcss, prisma, tailwindcss, @types/node, @types/react, @types/react-dom (+36 more)

### Community 4 - "Sponsor Discovery & Outreach Workspaces"
Cohesion: 0.10
Nodes (31): DiscoverPage(), OutreachPage(), SponsorDetailPage(), CandidateList(), CandidateListProps, DiscoverPromptBox(), LiveJobProgress(), LiveJobProgressProps (+23 more)

### Community 5 - "Gmail API & Reply Intelligence Inbox"
Cohesion: 0.08
Nodes (20): googleapis, RepliesPage(), ReplyAnalysisPanel(), ReplyComposerModalProps, ThreadList(), ThreadListProps, ThreadView(), ThreadViewProps (+12 more)

### Community 6 - "LangGraph Workflows & Activity Timeline"
Cohesion: 0.09
Nodes (23): @langchain/langgraph, ActivityFeed(), TimelineTab(), getTavilyClient(), ITavilyClient, MockTavilyClient, RealTavilyClient, formatTimeAgo() (+15 more)

### Community 7 - "Google Gemini AI & Agent Integrations"
Cohesion: 0.13
Nodes (9): @google/genai, ReplyAnalysisPanelProps, IGeminiClient, MockGeminiClient, RealGeminiClient, Campaign, EmailQuality, ReplyAnalysis (+1 more)

### Community 8 - "Kanban Board & Sponsor Pipeline CRM"
Cohesion: 0.20
Nodes (15): SponsorsPipelinePage(), KanbanBoard(), KanbanBoardProps, KanbanColumn(), KanbanColumnProps, SponsorCard(), SponsorCardProps, SponsorFilters() (+7 more)

### Community 9 - "TypeScript Compiler Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "Runtime Dependencies & Libraries"
Cohesion: 0.11
Nodes (18): dependencies, clsx, framer-motion, @google/genai, googleapis, @langchain/core, @langchain/langgraph, lucide-react (+10 more)

### Community 11 - "Butter & Green Design Architecture & Specs"
Cohesion: 0.22
Nodes (7): Warm Editorial Design Tokens, SponFy 10-Task Implementation Roadmap, 12-Stage Sponsor Pipeline Architecture, SponFy Product & Architecture Specification, Local Quickstart & Demo Mode, SponFy Sponsorship Engine, Next.js 15, Prisma ORM & Neon Serverless Stack

### Community 12 - "Global Styles & Root Typography Layout"
Cohesion: 0.25
Nodes (5): fraunces, jakarta, metadata, outfit, space

### Community 13 - "AES-256 Token Encryption & Security"
Cohesion: 0.60
Nodes (3): decrypt(), encrypt(), getEncryptionKey()

## Knowledge Gaps
- **144 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 169 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Next.js UI & Lucide Icons Core` to `Analytics Charts & Settings Views`, `Build Tooling & Dev Dependencies`, `Sponsor Discovery & Outreach Workspaces`, `Gmail API & Reply Intelligence Inbox`, `LangGraph Workflows & Activity Timeline`, `Google Gemini AI & Agent Integrations`, `Kanban Board & Sponsor Pipeline CRM`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Next.js UI & Lucide Icons Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06885964912280702 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Next.js UI & Lucide Icons Core` to `API Routes & Prisma Database Engine`, `Build Tooling & Dev Dependencies`, `Sponsor Discovery & Outreach Workspaces`, `Kanban Board & Sponsor Pipeline CRM`, `Global Styles & Root Typography Layout`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `API Routes & Prisma Database Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.06199285946121389 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Next.js UI & Lucide Icons Core` to `Analytics Charts & Settings Views`, `Build Tooling & Dev Dependencies`, `Sponsor Discovery & Outreach Workspaces`, `Gmail API & Reply Intelligence Inbox`, `LangGraph Workflows & Activity Timeline`, `Google Gemini AI & Agent Integrations`, `Kanban Board & Sponsor Pipeline CRM`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `Analytics Charts & Settings Views` be split into smaller, more focused modules?**
  _Cohesion score 0.1013277428371768 - nodes in this community are weakly interconnected._