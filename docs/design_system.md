# SponFy — Design System (design_system.md)

> Visual source of truth for SponFy. Based on the **Butter & Green** language shown in the three reference screenshots (`docs/references/`). Reference files originate from another project (a taxi app); take only the tokens, type, radii, spacing, motion, accessibility and state patterns. **Ignore** anything about taxis, Bihar, fares, maps or Google Places, and do NOT use its cultural SVG motifs. SponFy's motif is abstract network/data line-art.

## 1. Look and feel
Warm, editorial, trustworthy, premium SaaS. Dark forest-green hero with organic blob shapes, butter-cream display type, pill navigation, white rounded cards on a butter canvas, a showcase carousel, a green CTA panel. Marketing site = expressive. Application = calmer and denser (butter canvas, white cards, deep-green sidebar).
It must NOT look like: a generic AI dashboard, purple/neon gradients, glassmorphism soup, a dashboard of identical cards.

## 2. Tokens (define as CSS variables + Tailwind theme; no hardcoded hex in components)
```css
:root {
  /* canvas & surfaces */
  --bg: #FAF4E6;            /* page canvas */
  --card: #FFFFFF;
  --panel: #FFFDF6;
  --warm: #F6EED8;          /* table stripes, dividers */
  /* greens */
  --green-900: #08261E;     /* presses, deepest */
  --green-800: #0C382E;     /* brand, primary text */
  --green-700: #0E3B2E;     /* hero, sidebar, sticky header */
  --green-600: #164E3E;     /* hover on green */
  --green-500: #2A6F5A;     /* active indicators */
  --green-400: #428E75;     /* accent text on dark */
  --green-300: #8EBDAA;     /* muted icons on dark */
  /* butter */
  --butter: #FFF0B3;        /* primary CTA fill, highlights */
  --butter-hover: #FEE790;
  --butter-soft: #FFF5D1;   /* headline text on dark */
  /* text */
  --text: #0C382E;
  --text-dim: #244D3F;
  --text-muted: #4A6F62;
  --text-on-dark: #FFF5D1;
  --text-on-dark-sub: #D8EAE1;
  /* semantic (use tinted bg 12% + border 35%) */
  --success: #16A34A; --warning: #D97706; --error: #DC2626; --info: #0284C7;
  /* borders & radii */
  --border: rgba(12,56,46,0.12);
  --radius-sm: 10px; --radius-md: 14px; --radius-lg: 20px; --radius-xl: 24px; --radius-pill: 30px;
  /* shadows (green-tinted, never neutral black except hero) */
  --shadow-sm: 0 2px 8px rgba(12,56,46,0.05);
  --shadow-md: 0 6px 20px rgba(12,56,46,0.06);
  --shadow-lg: 0 12px 35px -8px rgba(12,56,46,0.08);
  --shadow-hover: 0 18px 40px -8px rgba(12,56,46,0.16);
  /* motion */
  --ease: cubic-bezier(0.2,0.8,0.2,1);
  --dur-fast: 150ms; --dur: 280ms; --dur-slow: 400ms;
}
```
Rules: butter (#FFF0B3) fill is reserved for the **single primary action per view** and key highlights; always carries navy/green text (never white on butter, never butter text on cream). No arbitrary grays, no purple/magenta/neon.

## 3. Typography (via `next/font`)
- Display (hero only): **Fraunces**, weight 800–900, `clamp(38px, 5.2vw, 70px)`, line-height 1.06, tracking −0.015em.
- Headings/UI: **Outfit** 700–800. H1 `clamp(32px,4.5vw,52px)`, H2 `clamp(26px,3.8vw,38px)`, H3 18–20px, tracking −0.02em.
- Body: **Plus Jakarta Sans** 14–16px, line-height 1.6, colours `--text` / `--text-dim`.
- Numbers/KPIs/tables: **Space Grotesk**, tabular numerals, KPI 36–44px weight 800.
- Caption/labels 11–12.5px weight 600–700.
- Currency formatting: Indian grouping (₹5,00,000) via `Intl.NumberFormat("en-IN")`.

## 4. Spacing and layout
8px base grid (4px half-steps). Card padding 20–24px; section rhythm 64–80px (marketing), 24–32px (app). Max widths: marketing 1320px, app content 1280px, forms/settings 960px. Tap targets ≥ 44×44px.

## 5. Components
**Buttons** (all pill or 12–14px radius, never square):
- `primary` (butter): bg `--butter`, text `--green-800`, hover `--butter-hover` + translateY(−2px) + shadow. One per view.
- `action` (green): bg `--green-800`, text `--butter`, hover `--green-600`.
- `secondary` (glass): white bg, 1px `--border`, hover bg `--butter`.
- `ghost-on-dark`: butter 10% bg, butter 35% border, text `--butter-soft`.
- States: hover, focus (3px ring: `rgba(12,56,46,.2)` on light, `rgba(255,240,179,.5)` on dark), active (translateY 1px), disabled (opacity .45 + tooltip explaining why), loading (spinner + label change).
**Cards:** white, 1px `--border`, radius 18–20px, `--shadow-sm`; interactive cards lift −4 to −8px with `--shadow-hover` and darker border; icon badge scales 1.1 and tilts 4° on hover.
**Badges:** pill, 11.5–13px, weight 700, tinted semantic colours. Stage badges, intent chips and contact-status badges come from `lib/config/*` (one mapping, reused everywhere).
**Inputs:** white, 1px border, radius 12px, focus border `--green-800` + 3px ring; explicit `<label>` always; inline validation on blur.
**Tables:** left-align text, right-align numbers (Space Grotesk), centre badges; zebra `rgba(12,56,46,.02)`, row hover butter tint; mobile → card list.
**Dialogs:** white, radius 20px, backdrop blur 8px, focus trap, Escape closes, returns focus to trigger.
**Toasts:** top-right desktop / bottom mobile, semantic tint.
**Fit score meter:** horizontal bar, animated fill once; below it "Why this scored N" list with + (success) and − (warning) rows.
**Pipeline card (kanban):** company name, industry badge, fit score pill, ₹ value, next-action chip.
**AI step list:** vertical steps (Searching → Collecting sources → Analysing → Scoring → Complete) with done ✓, current spinner, pending dot; counts tick up.
**Approval stepper:** Draft → Review → Approved → Sent.

## 6. Marketing site structure
Sticky pill navbar (wordmark, Product, Workflow, Analytics, FAQ, Log in, primary "Start a campaign"; hamburger drawer on mobile).
1. Hero (green `--green-700`, blob shapes in butter/deep green, Fraunces headline, product UI preview overlapping the bottom). Headline states the value plainly, e.g. "Find, research and win event sponsors — with AI that asks before it sends." Subline names who it is for.
2. Trust strip: "Human approves every email · Every claim has a source · Replies, not vanity opens".
3. Workflow storytelling (scroll-driven 5 steps with mini UIs): Discover, Research, Personalise, Approve & send, Understand replies.
4. Showcase carousel: discovery, research, explainable fit score.
5. Outreach approval + reply intelligence views.
6. Analytics preview (funnel + reply trend, animates on view).
7. Why SponFy (3–4 honest differentiators).
8. FAQ (does it auto-send? No. Gmail safety, data privacy).
9. Green CTA panel with butter button; footer (dark green, 3–4 columns).
Hero previews use the seeded demo data components, not screenshots.

## 7. App shell
Deep-green sidebar (Overview, Campaigns, Sponsors, Outreach, Replies, Follow-ups, Analytics, Settings; Discover reachable from Sponsors/Campaign). Top bar: campaign switcher, search, Gmail status pill, user menu. Mobile: bottom tab bar (Overview, Sponsors, Outreach, Replies, More) + drawer. Content on butter canvas; cards white.

## 8. Background system
Butter canvas with very subtle grain (SVG noise, ≤4% opacity). Hero: blob shapes + abstract network line-art (stroke `--butter`, opacity ~0.2, 1.2px). Nothing decorative inside the data-dense app beyond the canvas. Background never competes with content.

## 9. Motion
Purposeful only: hero entrance, scroll storytelling, route transitions ≤250ms, chart draw-in once, kanban moves, AI step progress, hover lift, KPI count-up on first load only. No constant floating, bouncing or decorative loops.
**Hard rules:** content is visible without JS (never set initial `opacity:0` via JS libraries; use CSS/IntersectionObserver enhancement with a visible default); honour `prefers-reduced-motion` (disable all non-essential motion).

## 10. Charts (Recharts)
Palette from tokens only: `--green-800`, `--green-500`, `--green-300`, `--butter` (with a darker outline for contrast), `--warning`. Each chart: title phrased as the question it answers, tooltip, legend where >1 series, text summary for screen readers, empty state, loading skeleton, draw-in animation once. On mobile simplify (fewer ticks, horizontal scroll never required).

## 11. States (required for every data view)
- **Loading:** skeletons matching real geometry, butter shimmer `linear-gradient(90deg, rgba(12,56,46,.04), rgba(255,240,179,.35), rgba(12,56,46,.04))`.
- **Empty:** 4-part anatomy: icon in 68px butter circle, headline, helpful body, primary CTA.
- **Error:** inline panel with Retry; never a blank screen.
- **Success:** toast.
- **Disabled:** reason via tooltip.
- **Demo data:** small "Demo data" badge where mock data is shown.

## 12. Accessibility
WCAG 2.1 AA: text contrast ≥ 4.5:1 (large ≥ 3:1), visible 3px focus rings, labelled inputs, `aria-label` on icon-only buttons, landmarks (`header/nav/main/aside/footer`), keyboard-operable kanban alternative (stage select), dialogs trap focus. Don't convey meaning by colour alone (stage/intent chips include text/icon).

## 13. Responsive
Desktop ≥1200, tablet 768–1199, mobile ≤767 as distinct layouts (not shrunk): sidebar → bottom nav; tables → card lists; kanban → stage-grouped list; charts simplified; modals → full-screen sheets on mobile. Test at 375, 768, 1280.

## 14. Anti-patterns
Random hex values; icon-only buttons without labels; square buttons; light/dark toggle; more than one butter primary per view; charts that don't answer a question; animation without purpose; screenshots instead of live components in previews; copying the reference screens' filler text ("Lorem ipsum", garbled headings).
