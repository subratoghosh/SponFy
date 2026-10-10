# 🌾 SponFy — AI Sponsorship Operating System

> **The intelligent, cited, human-approved sponsorship OS for college fests, hackathons, and student tech communities.**

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Google Gemini 2.5 Flash, Tavily Search, and Gmail API integration. Designed following the warm **Butter & Forest Green** visual system (`#FAF4E6` canvas, `#0C382E` forest green, `#FFF0B3` butter accents, with Fraunces display typography).

---

## 🚀 Key Features

1. **Cited AI Web Research & Discovery (`/app/discover`):**
   - Discovers relevant corporate tech sponsors based on hackathon tracks (e.g. Fintech, DevTools, Web3, AI/ML, Cloud Infra).
   - Extracts live sources, developer programs, previous hackathons sponsored, India-specific grants, and verified developer contact points.
   - Every claim is cited with real URLs—zero hallucinated facts or fake contacts.

2. **Explainable 7-Factor Fit Scoring (`/app/sponsors/[id]`):**
   - Scores company fit from 0 to 100 with clear transparent breakdown (DevRel activity, budget signals, student hiring focus, open API relevance, etc.).
   - Displays positive catalysts and potential risk factors.

3. **Human Approval Outreach Queue (`/app/outreach`):**
   - **Non-bypassable Safety Gate:** SponFy AI drafts hyper-personalized emails citing real event statistics, but *never* sends without explicit human review and click-to-approve.
   - Real-time Email Quality Score (0–100) checking subject length, spam trigger avoidance, clear call-to-action, and tone.

4. **Real Gmail Thread Sync & AI Reply Classification (`/app/replies`):**
   - Integrates with real Gmail via Google OAuth 2.0.
   - Ingests replies and automatically classifies intent (`Interested`, `Call Requested`, `More Info Needed`, `Declined`) with extracted questions and recommended next actions.
   - 1-click approved response composer.

5. **Smart 4-Touch Follow-up Engine (`/app/followups`):**
   - Polite, value-added cadences (Day 0, Day 3 bump, Day 7 metric update, Day 12 break-up).
   - Automatically halts on any incoming reply or unsubscribes.

6. **Honest Sponsorship Intelligence (`/app/analytics`):**
   - Zero vanity open/click tracking. Tracks only committed sponsorship revenue, pipeline velocity, reply rates, and stage conversions.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript (Strict mode, zero `any` shortcuts)
- **Styling:** Tailwind CSS with custom Butter & Green design system & CSS micro-physics
- **AI & Reasoning:** Google Gemini 2.5 Flash (`@google/genai`)
- **Web Research:** Tavily Search API
- **Email Protocol:** Google APIs (`googleapis`) with Gmail OAuth 2.0
- **Database / Auth Layer:** Supabase SSR (with zero-credentials Demo fallback memory store)
- **Charts:** Recharts

---

## 🏁 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/SponFy.git
cd SponFy
npm install
```

### 2. Configure Environment Variables (Optional)
SponFy runs **out of the box with zero configuration** in full Demo Mode (`SponFy Hackathon 2026` with 24 pre-seeded sponsors, research reports, drafts, and threads).

To enable live Google Gemini, Tavily Web Search, or Gmail sending, create `.env.local`:
```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Tavily Live Search
TAVILY_API_KEY=your_tavily_api_key_here

# Gmail OAuth 2.0 (Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Encryption Key (AES-256 for OAuth tokens)
ENCRYPTION_SECRET=32_character_random_hex_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Application Routes

- `/` — High-converting marketing landing page
- `/login` — Demo authentication & guest access
- `/app` — Overview dashboard with KPI summary, today's action queue, and AI insights
- `/app/campaigns` — Manage college fests and target sponsorship budgets
- `/app/discover` — AI candidate discovery with live web extraction
- `/app/sponsors` — 12-stage Kanban pipeline & filterable tabular view
- `/app/sponsors/[id]` — 360° Sponsor Detail Hub (Research, Fit Score, Contacts, Outreach, Timeline)
- `/app/outreach` — Human Approval Queue & Email Quality scoring
- `/app/replies` — AI-classified 3-pane Inbound Replies inbox
- `/app/followups` — 4-touch follow-up engine with pending approval queues
- `/app/analytics` — Pipeline value by stage, conversion rates, and revenue intelligence
- `/app/settings` — Sender profiles, Gmail connection, daily sending limits, and Do-Not-Contact suppression list

---

## 🧪 3-Minute Demo Walkthrough Script

1. **Visit Landing Page (`/`):** Explore the problem story, live interactive review preview, and value proposition.
2. **Click "Open Demo Workspace" (`/app`):** See real KPI stats (₹11.5L pipeline, 64% reply rate) and immediate actionable cards.
3. **Discover Candidates (`/app/discover`):** Enter a search (e.g., `"Cloud providers offering ₹50K+ credits and cash bounties"`) to see live progress and cited research.
4. **Inspect Sponsor Hub (`/app/sponsors/sp-1`):** Review Postman's 92/100 fit score breakdown, cited sources, and contact targets.
5. **Approve Outreach (`/app/outreach`):** Inspect an AI-crafted email, test quality score validation, and click **Approve & Send via Gmail**.
6. **Review AI Classified Reply (`/app/replies`):** Open Devfolio's reply thread to see sentiment detection, extracted meeting questions, and 1-click approved response.

---

## 🔒 Security & Privacy

- Tokens are encrypted at rest with AES-256-GCM.
- Strict Supabase Row Level Security (RLS) policies.
- Non-bypassable Human Approval Gate on every outbound message.
- Full respect of suppression lists and instant unsubscribe handling.

---

## 📄 License
MIT License © 2026 SponFy. Built for student organizers worldwide.
