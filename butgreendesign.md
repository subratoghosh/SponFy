# Butter & Green (`butgreendesign.md`)
## Complete UI/UX Design System & Specification

> **Version**: 2.0.0  
> **Status**: Canonical Living Document  
> **Design Philosophy**: Warm Butter Cream (`#FAF4E6` / `#FFF0B3`) & Deep Forest Green (`#0C382E` / `#0E3B2E`)  
> **Scope**: Serves as the authoritative single source of truth for the Safar Mitra web platform and a universal, framework-agnostic design system reference for future projects.

---

## 📑 Table of Contents

1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Project Architecture & Component Audit](#2-project-architecture--component-audit)
3. [Design Philosophy & Core Tenets](#3-design-philosophy--core-tenets)
4. [Visual Identity & Design Language](#4-visual-identity--design-language)
5. [Design Tokens & Variables](#5-design-tokens--variables)
6. [Typography Hierarchy](#6-typography-hierarchy)
7. [Spacing & Sizing Scale](#7-spacing--sizing-scale)
8. [Layout Architecture & Grid Systems](#8-layout-architecture--grid-systems)
9. [Responsive Breakpoints & Adaptations](#9-responsive-breakpoints--adaptations)
10. [Component Design System](#10-component-design-system)
11. [Component State Matrix](#11-component-state-matrix)
12. [Interaction Design & Hover Mechanics](#12-interaction-design--hover-mechanics)
13. [Motion, Transitions & Animation Tokens](#13-motion-transitions--animation-tokens)
14. [Accessibility Specification (WCAG 2.1 AA)](#14-accessibility-specification-wcag-21-aa)
15. [UX Writing & Content Design Guidelines](#15-ux-writing--content-design-guidelines)
16. [Forms & Input Validation Engine](#16-forms--input-validation-engine)
17. [Tables & Data-Dense Dashboard UI](#17-tables--data-dense-dashboard-ui)
18. [Navigation & Information Architecture](#18-navigation--information-architecture)
19. [Feedback, Toasts & System Status](#19-feedback-toasts--system-status)
20. [Empty States & Zero-Data Patterns](#20-empty-states--zero-data-patterns)
21. [Error Handling UX & Recovery Flows](#21-error-handling-ux--recovery-flows)
22. [Loading States & Perceived Performance](#22-loading-states--perceived-performance)
23. [Theme Architecture (Butter Light & Forest Dark)](#23-theme-architecture-butter-light--forest-dark)
24. [Iconography System](#24-iconography-system)
25. [Imagery & Cultural Vector Motifs](#25-imagery--cultural-vector-motifs)
26. [Design Anti-Patterns ("What Not To Do")](#26-design-anti-patterns-what-not-to-do)
27. [Page Composition Templates](#27-page-composition-templates)
28. [Design Decision Log](#28-design-decision-log)
29. [Project-Specific Implementation Rules](#29-project-specific-implementation-rules)
30. [Reusable Design System Principles (Framework-Agnostic)](#30-reusable-design-system-principles-framework-agnostic)
31. [Developer Implementation Workflow](#31-developer-implementation-workflow)
32. [Design Review Checklist](#32-design-review-checklist)
33. [Future-Proofing & Design System Evolution](#33-future-proofing--design-system-evolution)
34. [Quick Reference Cheat Sheet](#34-quick-reference-cheat-sheet)

---

## 1. Executive Summary & Purpose

The **Butter & Green** design system was engineered to deliver an honest, deeply trustworthy, culturally grounded, and premium digital experience. It rejects sterile corporate minimalism in favor of organic warmth, high-contrast legibility, tactile micro-interactions, and visual harmony.

### Dual-Purpose Mandate:
1. **Internal Single Source of Truth**: When any engineer, designer, or product manager contributes to this codebase, this document guarantees that every new page, modal, button, and table adheres to the exact same visual language and interaction model without guesswork.
2. **Universal Design Reference**: The underlying design principles, tokens, and UX patterns are articulated in a framework-agnostic manner, allowing them to be extracted and reapplied to future applications requiring high trust, editorial refinement, and organic aesthetics.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUTTER & GREEN ECOSYSTEM                        │
├───────────────────────────────────┬────────────────────────────────────┤
│     Project-Specific Layer        │     Reusable Design System         │
│  (Safar Mitra Outstation Taxi)    │        (Generic System)            │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Distance Matrix Fare Engine     │ • High-Contrast Warm Surfaces      │
│ • Bihar Geographic & Cultural Hubs│ • 4-Tier Button Hierarchy          │
│ • Google Maps Places Autocomplete │ • 8px Mathematical Spacing Grid    │
│ • OTP Authentication Workflow     │ • Accessible Color Token Palette   │
│ • Realtime Driver Tracking UI     │ • Tactile Hover-Lift Micro-Physics │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Project Architecture & Component Audit

Every element in the codebase has been audited and classified under one of five lifecycle categories:

| Status | Definition | Codebase Examples |
| :--- | :--- | :--- |
| **Canonical** | The official, approved standard for all new work. | `.btn-butter`, `.btn-green`, `.feature-card-interactive`, `.hero-motif-interactive`, `.input-glass`, `Header.tsx`, `Footer.tsx` |
| **Recommended** | Approved design pattern for future expansion. | Step wizard navigation, expandable FAQ accordions, toast notifications |
| **Legacy** | Functional code written under previous iterations, currently operating via semantic mappings. | Old variable aliases (`--cyan-ice`, `--gold-glow`, `--blue-vibrant` mapped to `--green-dark` / `--butter-cream`) |
| **Inconsistent** | Hardcoded styles that deviate from design tokens; must be refactored during maintenance. | Raw inline RGB hex strings (`#0b182b`, `#38bdf8`) used instead of CSS design tokens |
| **Deprecated** | Banned patterns that should never be used in new features. | Dark mode toggles in public navbar, notification bell in header, opacity-0 GSAP ScrollTrigger lockouts |

---

## 3. Design Philosophy & Core Tenets

The Butter & Green design philosophy is guided by **8 Fundamental Tenets**:

### Principle 1: Warmth Over Sterile Coldness
* **Meaning**: Surfaces utilize rich, organic butter cream (`#FAF4E6`) and clean white panels (`#FFFFFF`) rather than blinding `#F8F9FA` grays or harsh pure blacks.
* **Why It Exists**: Warm cream palettes create psychological reassurance, reduce eye fatigue, and evoke dependable hospitality.
* **Do**: Use `#FAF4E6` for page canvas backgrounds and `#FFFFFF` for interactive cards.
* **Avoid**: Cold blue-tinted gray backgrounds (`#E2E8F0`, `#F1F5F9`).

### Principle 2: Deep Contrast & Instant Legibility
* **Meaning**: Text and interactive symbols must maintain a minimum 4.5:1 contrast ratio against their immediate background.
* **Why It Exists**: Users frequently access mobility services on mobile devices outdoors under harsh sunlight or low-end displays.
* **Do**: Pair deep forest green (`#0C382E`, `#244D3F`) with butter cream surfaces; pair bright butter gold (`#FFF0B3`) with dark green surfaces.
* **Avoid**: Low-contrast teal-gray text (`#7D9B90`) on butter backgrounds.

### Principle 3: Tactile Feedback & Micro-Physics
* **Meaning**: Interactive elements must physically respond to user intent through vertical elevation (`translateY(-2px)` to `-8px`), scale, and subtle warm luminescence.
* **Why It Exists**: Responsive micro-interactions provide confidence that the interface is alive, responsive, and ready.
* **Do**: Attach `.feature-card-interactive` or `.btn-butter` transitions to clickable surfaces.
* **Avoid**: Static flat surfaces with zero hover feedback or jarring, instant color flips without easing.

### Principle 4: Transparent Upfront Information
* **Meaning**: Essential data (pricing, cancellation terms, driver verification, distance) must be visible immediately without hidden disclaimers or forced accordion clicks.
* **Why It Exists**: High customer anxiety occurs around hidden surge pricing, night charges, and unverified chauffeurs.
* **Do**: Present all inclusions, taxes, and distance breakdowns in clear summary tables.
* **Avoid**: "Starting from" teaser prices that balloon during checkout.

### Principle 5: Progressive Disclosure
* **Meaning**: Show primary details first (pickup, drop, vehicle, base fare), and reveal advanced parameters (special instructions, GST numbers, coupon inputs) gracefully upon demand.
* **Why It Exists**: Prevents visual cognitive overload during high-intent booking flows.
* **Do**: Group secondary options into collapsible sections or clear multi-step workflows.
* **Avoid**: Monolithic forms with 15+ simultaneous input fields on a single screen.

### Principle 6: Cultural Rootedness & Visual Authenticity
* **Meaning**: Integrate local cultural motifs (Madhubani art, Ashoka Lion Capital, Bodh Gaya Buddha, Highway Milestones) into the interface as subtle line-art vectors.
* **Why It Exists**: Regional identity fosters genuine local trust and pride that generic corporate ride-hailing clones cannot match.
* **Do**: Use delicate outline SVG motifs (`stroke: #FFF0B3; opacity: 0.22;`) in hero sections.
* **Avoid**: Heavy, photorealistic raster collages that clutter UI legibility.

### Principle 7: Mobile-First Thumb-Zone Ergonomics
* **Meaning**: All critical actions (Book Ride, Call Helpline, Select Vehicle, Apply Coupon) must sit within comfortable thumb reach with a minimum tap target of 44×44px.
* **Why It Exists**: Over 85% of outstation bookings occur on mobile devices while traveling.
* **Do**: Use full-width pill buttons on mobile screens with sticky bottom action bars where appropriate.
* **Avoid**: Tiny link text buttons clustered closely together.

### Principle 8: Zero-Latency Perceived Performance
* **Meaning**: Always render layout containers immediately; never gate initial paint behind heavy client-side JavaScript or animation libraries.
* **Why It Exists**: Ensures the website renders instantaneously even over intermittent 3G/4G highway network connections.
* **Do**: Use CSS-based transitions and Next.js static layout skeletons.
* **Avoid**: Setting `opacity: 0` via JavaScript animation engines that leave pages blank if scripts fail.

---

## 4. Visual Identity & Design Language

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VISUAL LANGUAGE MATRIX                          │
├───────────────────┬────────────────────────────────────────────────────┤
│ Aesthetic Form    │ Warm Editorial × Modern High-Contrast Utility       │
│ Visual Density    │ Relaxed breathing room (16–32px component padding) │
│ Corner Radii      │ Soft Geometric: 10px (Small), 14px (Mid),          │
│                   │ 20–24px (Large Cards), 30–32px (Pill Buttons)      │
│ Border Philosophy │ Hairline forest green strokes: 1px solid           │
│                   │ rgba(12, 56, 46, 0.12)                             │
│ Surface Depth     │ Multi-layered 3D elevation with soft green shadows │
│ Motion Personality│ Smooth deceleration: cubic-bezier(0.2, 0.8, 0.2, 1)│
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 5. Design Tokens & Variables

All tokens are defined in `src/styles/globals.css`. Developers must reference CSS variables or exact token constants.

### 5.1 Primary Color Tokens

| Token Name | CSS Variable | Hex / Value | Purpose & Usage | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- |
| **Green Dark** | `--green-dark` | `#0C382E` | Canonical brand deep forest green. Primary typography, card hover borders, major headers. | 11.8:1 on Butter |
| **Green Deep** | `--green-deep` | `#08261E` | Deepest foundation green. Hero gradient anchors, active button presses. | 14.5:1 on Butter |
| **Green Hero** | `--green-hero` | `#0E3B2E` | Hero section wrapper, dark green CTA banner background, sticky header. | 10.9:1 on Butter |
| **Green Mid** | `--green-mid` | `#164E3E` | Hover state for green buttons, secondary badges. | 8.6:1 on Butter |
| **Green Light** | `--green-light` | `#2A6F5A` | Sub-headings, active indicators, live radar widget dots. | 5.2:1 on Butter |
| **Green Accent** | `--green-accent` | `#428E75` | Highlighted text in dark containers, hero gradient secondary radial. | 4.8:1 on Dark Green |
| **Green Sage** | `--green-sage` | `#8EBDAA` | Subtle decorative elements, muted icons on dark surfaces. | Decorative |

### 5.2 Butter Cream & Neutral Tokens

| Token Name | CSS Variable | Hex / Value | Purpose & Usage | Do Not Use For |
| :--- | :--- | :--- | :--- | :--- |
| **Butter BG** | `--butter-bg` | `#FAF4E6` | Main page canvas background for all content pages. | Card surfaces (use White) |
| **Butter Card** | `--butter-card` | `#FFFFFF` | Standard card background on butter canvas for maximum contrast. | Dark hero sections |
| **Butter Panel** | `--butter-panel` | `#FFFDF6` | Hero booking form container, dropdown elevated panels. | Low-contrast text |
| **Butter Cream** | `--butter-cream` | `#FFF0B3` | Primary action button (`.btn-butter`), badge backgrounds, hero vector stroke. | Body paragraph text |
| **Butter Gold** | `--butter-gold` | `#FEE790` | Active/hover state for butter buttons, headline gradient accents. | Subtle borders |
| **Butter Warm** | `--butter-warm` | `#F6EED8` | Table alternate row striping, subtle divider lines. | Primary text |

### 5.3 Typography Color Tokens

| Token Name | CSS Variable | Hex / Value | Usage & Application |
| :--- | :--- | :--- | :--- |
| **Text Main** | `--text-main` | `#0C382E` | Primary titles, card headers, table data, active nav links. |
| **Text Dim** | `--text-dim` | `#244D3F` | Secondary body paragraphs, terms text, feature explanations. |
| **Text Muted** | `--text-muted` | `#4A6F62` | Captions, timestamps, distance subtitles, helper text. |
| **Text On Dark** | `--text-hero-main` | `#FFF5D1` | Primary headings inside dark green hero and CTA banners. |
| **Text On Dark Sub**| `--text-hero-sub` | `#D8EAE1` | Descriptive paragraphs inside dark green hero and CTA banners. |

### 5.4 Semantic & Status Tokens

| Semantic Role | Token Constant | Background Tint | Border Tint | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#22C55E` / `#16A34A` | `rgba(34, 197, 94, 0.12)` | `rgba(34, 197, 94, 0.35)` | Completed ride badge, verified driver badge, coupon applied. |
| **Warning / Alert** | `#D97706` / `#F59E0B` | `rgba(217, 119, 6, 0.12)` | `rgba(217, 119, 6, 0.35)` | Pending status badge, 1-hour booking notice, caution banner. |
| **Error / Danger** | `#EF4444` / `#DC2626` | `rgba(239, 68, 68, 0.10)` | `rgba(239, 68, 68, 0.30)` | Cancelled status badge, form validation error, delete action. |
| **Info / Active** | `#0284C7` / `#0EA5E9` | `rgba(14, 165, 233, 0.12)` | `rgba(14, 165, 233, 0.30)` | Ongoing trip badge, flight tracking update, info callout. |

### 5.5 Elevation & Radius Tokens

```css
/* Corner Radii */
--radius-sm:     10px;  /* Icon badges, small tags, tooltips */
--radius-md:     14px;  /* Standard buttons, input fields, dropdown menus */
--radius-lg:     20px;  /* Standard content cards, comparison panels */
--radius-xl:     24px;  /* Large CTA banners, hero booking engine card */
--radius-hero:   36px;  /* Bottom boundary curve of landing page hero */
--radius-pill:   30px;  /* Floating nav capsule, CTA pill buttons, status badges */

/* Shadows */
--shadow-sm:     0 2px 8px rgba(12, 56, 46, 0.05);
--shadow-md:     0 6px 20px rgba(12, 56, 46, 0.06);
--shadow-lg:     0 12px 35px -8px rgba(12, 56, 46, 0.08);
--shadow-card-hover: 0 18px 40px -8px rgba(12, 56, 46, 0.16);
--shadow-hero-card:  0 25px 60px -10px rgba(0, 0, 0, 0.45);
--shadow-dropdown:   0 16px 40px rgba(12, 56, 46, 0.15);

/* Transitions */
--transition-fast:   0.15s ease;
--transition-normal: 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
--transition-smooth: 0.40s cubic-bezier(0.2, 0.8, 0.2, 1);
```

---

## 6. Typography Hierarchy

The typography system pairs high-impact editorial serifs and bold display sans-serifs with hyper-legible geometric body fonts.

### Font Families:
* **Display / Brand Headline**: `'Fraunces', 'Playfair Display', Georgia, serif` (Hero headlines)
* **Primary UI / Sub-Headlines**: `'Outfit', 'Plus Jakarta Sans', sans-serif` (Section titles, cards, buttons)
* **Body / System Text**: `'Plus Jakarta Sans', -apple-system, sans-serif` (All body paragraphs, forms, tables)
* **Numeric / Data / Stats**: `'Space Grotesk', sans-serif` (Distance numbers, fares, stat counters, milestone markers)
* **Brand Signature Script**: `'Satisfy', cursive` (Hero logo accent wordmark "Safar")

### Typography Scale Table:

| Role | Font Family | Size (Desktop / Mobile) | Weight | Line Height | Letter Spacing | CSS Class / Token |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Fraunces / Outfit | `clamp(38px, 5.2vw, 70px)` | 900 | 1.06 | `-0.015em` | `h1` (Hero Headline) |
| **Section Title (H1)** | Outfit | `clamp(32px, 4.5vw, 52px)` | 800 | 1.15 | `-0.02em` | `h1`, `.display-font` |
| **Major Header (H2)** | Outfit | `clamp(26px, 3.8vw, 38px)` | 800 | 1.20 | `-0.02em` | `h2`, `.display-font` |
| **Card Header (H3)** | Outfit | `17.5px – 20px` | 700 | 1.30 | `-0.01em` | `h3` |
| **Section Tag (H4)** | Outfit | `15px – 16px` | 700 / 800 | 1.40 | `0.02em` | `h4`, `.display-font` |
| **Body Large** | Plus Jakarta Sans | `16px – 17px` | 500 / 600 | 1.65 | `0` | Standard lead copy |
| **Body Standard** | Plus Jakarta Sans | `14px – 15px` | 500 / 600 | 1.60 | `0` | Standard paragraph |
| **Body Small** | Plus Jakarta Sans | `13px – 13.5px` | 500 / 600 | 1.55 | `0` | Card explanations |
| **Caption / Helper**| Plus Jakarta Sans | `11px – 12.5px` | 600 / 700 | 1.40 | `0.02em` | Form labels, timestamps |
| **Badge / Pill Tag**| Plus Jakarta Sans | `11.5px – 13px` | 700 / 800 | 1.00 | `0.04em` | Status pills, category tags |
| **Stat Number** | Space Grotesk | `36px – 44px` | 800 / 900 | 1.00 | `-0.01em` | `.stat-font`, `.stat-counter` |

---

## 7. Spacing & Sizing Scale

All layout padding, margins, and gaps follow a predictable **8px base grid** (with 4px half-steps for micro-alignments).

```
   4px   8px   12px   16px   20px   24px   32px   40px   48px   64px   80px
  [0.5x] [1x]  [1.5x] [2x]  [2.5x]  [3x]   [4x]   [5x]   [6x]   [8x]  [10x]
```

### Spacing Usage Rules:
* **`4px – 8px`**: Inline gap between icons and labels, badge internal vertical padding.
* **`12px – 16px`**: Form field vertical spacing, compact card padding on mobile, button vertical padding.
* **`20px – 24px`**: Standard card internal padding, grid gaps between feature cards.
* **`32px – 40px`**: Modal dialog padding, large banner container padding, space between header and content.
* **`60px – 80px`**: Section-to-section vertical rhythm on butter background.

---

## 8. Layout Architecture & Grid Systems

### Container Width Constraints:
* **`1320px`**: Global maximum width for wide landing sections, sticky header, and footer (`margin: 0 auto; padding: 0 24px;`).
* **`1200px`**: Content pages (`AboutClient.tsx`, `WhyUsPage.tsx`).
* **`960px`**: Focused interaction pages (`ContactPage.tsx`, `SignInPage.tsx`).
* **`880px`**: Policy & legal reading pages (`TermsPage.tsx`, `PrivacyPage.tsx`, `InsurancePage.tsx`).
* **`600px`**: Post-transaction confirmation (`SuccessPage.tsx`).
* **`480px`**: Floating hero booking engine card.

### Structural Page Blueprint:

```
┌────────────────────────────────────────────────────────────────────────┐
│ STICKY HEADER: #0E3B2E (Deep Forest Green) | Border: 1.5px #FFF0B3     │
├────────────────────────────────────────────────────────────────────────┤
│ HERO SECTION (Landing Only):                                           │
│ • Background: #0E3B2E with radial butter glows                         │
│ • Cultural SVG Motifs (Patna Airport, Station, Buddha, Madhubani)      │
│ • Left: Fraunces Headline + Zero Penalty Trust Points + CTA Buttons    │
│ • Right: Floating Butter Booking Form Card (480px max-width)           │
│ • Bottom: 36px concave corner radius + deep green drop shadow          │
├────────────────────────────────────────────────────────────────────────┤
│ BUTTER SECTION CANVAS: #FAF4E6                                         │
│ • Features 4-Grid: Clean White Cards (#FFFFFF) with hover lift         │
│ • Google Play Store Section: Dark Green Card (#0E3B2E) + QR Card       │
│ • CTA Banner: Dark Green (#0E3B2E) with #FFF0B3 Button                 │
├────────────────────────────────────────────────────────────────────────┤
│ GLOBAL FOOTER: #FAF4E6 | Border Top: 1px rgba(12, 56, 46, 0.12)        │
│ • 3-Column Balanced Layout (Brand & Socials, Quick Links, Dispatch)    │
│ • Bottom Copyright & Regional Guarantee Line                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Responsive Breakpoints & Adaptations

```css
/* Breakpoint Tokens */
--bp-mobile-sm: 480px;
--bp-mobile:    768px;
--bp-tablet:    860px;
--bp-laptop:    992px;
--bp-desktop:   1200px;
--bp-wide:      1320px;
```

### Responsive Transformation Matrix:

| Screen Width | Header Behavior | Hero Layout | Feature Grid | Admin / Tables |
| :--- | :--- | :--- | :--- | :--- |
| **&ge; 1200px** | Desktop nav pill visible; full menu links. | 2-column split (Left 55% Copy, Right 45% Form). | 4 columns (`minmax(240px, 1fr)`). | Full desktop data table with fixed columns. |
| **860px – 1199px**| Desktop nav visible; compact margins. | Side-by-side flex wrap with auto-stretch. | 2 columns (`minmax(240px, 1fr)`). | Full table with horizontal swipe container. |
| **768px – 859px** | Nav collapses to mobile hamburger button; slide drawer. | Stacked: Headline copy above, booking card centered below. | 2 columns (`minmax(220px, 1fr)`). | Card-row transformation on tables. |
| **&le; 767px** | Mobile drawer; full-width call button. | Stacked vertically; headline font scales via `clamp()`. | 1 column full-width stacked. | Responsive card-list view; swipeable actions. |
| **&le; 480px** | Minimum padding (16px); compact crest logo. | Booking form full-width; date/time inputs stack if needed. | 1 column full-width; padding 20px 16px. | Compact data badges; bottom action bar. |

---

## 10. Component Design System

### 10.1 Button Hierarchy

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   BTN-BUTTER    │   │    BTN-GREEN    │   │    BTN-GLASS    │   │ BTN-HERO-GHOST  │
│  (Primary CTA)  │   │(Action on Cream)│   │  (Secondary)    │   │  (Hero Ghost)   │
│ BG: #FFF0B3     │   │ BG: #0C382E     │   │ BG: #FFFFFF     │   │ BG: rgba(...)   │
│ Text: #0C382E   │   │ Text: #FFF0B3   │   │ Text: #0C382E   │   │ Text: #FFF5D1   │
└─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘
```

#### 1. Butter Primary Button (`.btn-butter` / `.btn-gold`)
* **When to Use**: The #1 conversion action on the screen (e.g., "Book Ride Now", "Confirm Ride", "Book Now").
* **Specs**: `background: #FFF0B3; color: #0C382E; font-weight: 700; border-radius: 30px; padding: 12px 28px; box-shadow: 0 4px 14px rgba(12, 56, 46, 0.08);`
* **Hover State**: `background: #FEE790; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(12, 56, 46, 0.15);`

#### 2. Forest Green Primary Button (`.btn-green`)
* **When to Use**: Primary action inside light butter sections or white dialogs (e.g., "Search Outstation Cabs", "Call Dispatch", "Save Profile").
* **Specs**: `background: #0C382E; color: #FFF0B3; font-weight: 700; border-radius: 14px; padding: 12px 24px; border: 1px solid rgba(255, 240, 179, 0.2);`
* **Hover State**: `background: #164E3E; color: #FFFFFF; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(12, 56, 46, 0.3);`

#### 3. Glass / Outline Button (`.btn-glass`)
* **When to Use**: Secondary actions, back navigation, social links, filter tabs (e.g., "Back to Home", "Apply Coupon", "Cancel").
* **Specs**: `background: #FFFFFF; border: 1px solid rgba(12, 56, 46, 0.16); color: #0C382E; border-radius: 12px; padding: 10px 18px; font-weight: 600;`
* **Hover State**: `background: #FFF0B3; border-color: #0C382E; transform: translateY(-2px);`

#### 4. Hero Ghost Button (`.btn-hero-ghost`)
* **When to Use**: Secondary exploratory action within the dark green hero section (e.g., "Why Choose Us", "Contact Support").
* **Specs**: `background: rgba(255, 240, 179, 0.10); border: 1px solid rgba(255, 240, 179, 0.35); color: #FFF5D1; border-radius: 30px; padding: 12px 24px;`
* **Hover State**: `background: rgba(255, 240, 179, 0.22); border-color: #FFF0B3; color: #FFFFFF; transform: translateY(-2px);`

---

### 10.2 Cards & Surface Panels

#### 1. Interactive Feature Card (`.feature-card-interactive`)
* **Specs**: `background: #FFFFFF; border: 1px solid rgba(12, 56, 46, 0.12); border-radius: 18px; padding: 26px 22px; box-shadow: 0 4px 16px rgba(12, 56, 46, 0.04); transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease;`
* **Hover Physics**: Lifts by `translateY(-8px)`, border sharpens to `#0C382E`, shadow expands to `0 18px 40px -8px rgba(12, 56, 46, 0.16)`.
* **Icon Badge Reaction**: Badge scales `1.1x`, tilts `rotate(4deg)`, inverts background to `#0C382E`, and icon stroke turns `#FFF0B3`.

#### 2. Hero Booking Engine Card (`.hero-booking-card`)
* **Specs**: `background: #FFFDF6; border: 1px solid rgba(255, 240, 179, 0.6); border-radius: 24px; padding: 30px; box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.45); color: #0C382E;`

#### 3. QR Download Scanner Card (`.qr-scanner-card-hover`)
* **Specs**: `background: #FFFFFF; border-radius: 20px; padding: 22px 20px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4); text-align: center;`
* **Hover State**: `transform: translateY(-6px) scale(1.02); box-shadow: 0 24px 50px rgba(0, 0, 0, 0.55);`

---

### 10.3 Form Controls & Places Autocomplete

#### Input Field (`.input-glass`)
* **Specs**: `background: #FFFFFF; border: 1px solid rgba(12, 56, 46, 0.18); border-radius: 12px; padding: 13px 16px; color: #0C382E; font-size: 14.5px; outline: none; transition: all 0.2s ease;`
* **Focus State**: `border-color: #0C382E; box-shadow: 0 0 0 3px rgba(12, 56, 46, 0.12);`
* **Placeholder**: `color: #4A6F62; opacity: 0.8;`

#### Google Places Autocomplete (`.pac-container` & `.pac-item`)
* **Dropdown Menu**: `background: #FFFFFF; border: 1px solid rgba(12, 56, 46, 0.20); border-radius: 14px; box-shadow: 0 16px 40px rgba(12, 56, 46, 0.15); margin-top: 6px; z-index: 999999; overflow: hidden;`
* **Dropdown Item**: `padding: 11px 16px; font-size: 13.5px; color: #2D5244; border-top: 1px solid rgba(12, 56, 46, 0.08);`
* **Hover / Selected Item**: `background-color: #FFF0B3; color: #0C382E; font-weight: 600;`
* **Matched Query Text**: `color: #0C382E; font-weight: 700;`

---

## 11. Component State Matrix

| Component | Default | Hover | Focus | Active / Selected | Disabled | Error |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Butter Button** | BG: `#FFF0B3`<br>Text: `#0C382E` | BG: `#FEE790`<br>`translateY(-2px)` | Ring: `0 0 0 3px rgba(255,240,179,0.5)` | `translateY(1px)`<br>Shadow: inset | Opacity: `0.45`<br>Cursor: `not-allowed` | Shake animation on submit block |
| **Green Button** | BG: `#0C382E`<br>Text: `#FFF0B3` | BG: `#164E3E`<br>Text: `#FFFFFF` | Ring: `0 0 0 3px rgba(12,56,46,0.2)` | BG: `#08261E`<br>`translateY(1px)` | Opacity: `0.45`<br>Cursor: `not-allowed` | Highlight border: `#EF4444` |
| **Input Field** | Border: `rgba(12,56,46,0.18)`<br>BG: `#FFFFFF` | Border: `rgba(12,56,46,0.35)` | Border: `#0C382E`<br>Ring: `3px rgba(12,56,46,0.12)` | Text: `#0C382E` bold | BG: `rgba(12,56,46,0.04)`<br>Color: `#7D9B90` | Border: `#EF4444`<br>Ring: `3px rgba(239,68,68,0.15)` |
| **Feature Card** | Border: `rgba(12,56,46,0.12)`<br>Shadow: `0 4px 16px` | `translateY(-8px)`<br>Border: `#0C382E`<br>Shadow: `0 18px 40px` | Outline: `2px solid #0C382E` | BG: `#FFFDF6`<br>Border: `#0C382E` | Opacity: `0.5` | Red accent border |
| **Vehicle Card** | Border: `1px solid rgba(12,56,46,0.12)` | Border: `#0C382E`<br>`translateY(-3px)` | Ring: `2px solid #0C382E` | BG: `rgba(255,240,179,0.35)`<br>Border: `2px solid #0C382E` | Grayscale + Opacity: `0.5` | N/A |

---

## 12. Interaction Design & Hover Mechanics

### Micro-Physics Rules:
1. **Interactive Lift**: Any card or panel that leads to a new view or selection must elevate on hover via `transform: translateY(-4px)` to `translateY(-8px)`.
2. **Icon Flip & Tilt**: Card icons inside circular/rounded badges tilt by `4deg` and scale `1.1x` to signify live readiness.
3. **Heritage Motif Glow**: When users hover over background heritage line-art SVGs in the hero section, the motif illuminates with `opacity: 0.65`, `scale: 1.06`, and `filter: drop-shadow(0 0 14px rgba(255, 240, 179, 0.7))`.
4. **Keyboard Focus Ring**: Always enforce a 3px visible high-contrast focus ring (`0 0 0 3px rgba(12, 56, 46, 0.20)` on light surfaces; `0 0 0 3px rgba(255, 240, 179, 0.50)` on dark surfaces).

---

## 13. Motion, Transitions & Animation Tokens

```css
/* Easing Tokens */
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-linear:   linear;

/* Duration Tokens */
--duration-fast:   150ms; /* Button press, toggle switch */
--duration-normal: 280ms; /* Card hover, dropdown reveal, tab switch */
--duration-slow:   400ms; /* Modal open, drawer slide, route transition */
```

### Accessibility Reduced-Motion Fallback:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 14. Accessibility Specification (WCAG 2.1 AA)

1. **Color Contrast**: 
   - Normal text (&lt;18px): Minimum contrast ratio of **4.5:1** (Forest green `#0C382E` on butter `#FAF4E6` delivers **11.8:1**).
   - Large text (&ge;18px or bold &ge;14px): Minimum contrast ratio of **3.0:1** (Butter gold `#FFF0B3` on hero green `#0E3B2E` delivers **10.9:1**).
2. **Touch Targets**: All interactive elements (buttons, inputs, menu triggers, tabs) must have a minimum clickable area of **44 × 44 CSS pixels**.
3. **Semantic HTML**: All sections must be contained in appropriate landmarks (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`, `<aside>`).
4. **Form Labels**: Every input must have an explicitly associated `<label>` or `aria-label`. Placeholder text is never accepted as a label replacement.
5. **Modal Focus Trap**: Modals must trap focus, close on `Escape` keypress, and return focus to the trigger element upon dismissal.

---

## 15. UX Writing & Content Design Guidelines

### Brand Voice & Tone:
* **Honest & Direct**: Clear distances, explicit rate slabs, zero asterisks.
* **Warm & Hospitable**: Respectful tone honoring regional travelers and commercial chauffeurs.
* **Reassuring & Safe**: Emphasize verification, GPS route tracking, and instant human phone helpline availability.

### Good vs. Bad Copy Matrix:

| Context | ❌ Avoid (Bad Copy) | ✅ Use (Canonical Copy) | Rationale |
| :--- | :--- | :--- | :--- |
| **Hero Headline** | *The Best Taxi App In The World* | **EMBRACE THE SMOOTH JOURNEY.** | Dignified, authentic, and aspirational. |
| **Fare Explanation**| *Cheapest cab rates guaranteed* | **Zero Return Fare Penalty** — Pay strictly for one-way distance traveled. | States the exact consumer financial advantage without hype. |
| **Booking Advance** | *Hurry! Cabs sell out fast!* | We recommend booking at least 1 hour before pickup for prompt dispatch across Bihar. | Reassuring operational transparency. |
| **Form Error** | *Invalid input.* | Please specify a pickup address in Bihar to calculate your route. | Clear, actionable, and non-blaming. |
| **Cancellation** | *Cancellation charges apply* | Zero cancellation fee prior to driver dispatch. Direct 1-tap refund. | Eliminates passenger anxiety. |

---

## 16. Forms & Input Validation Engine

1. **Inline Instant Feedback**: Validate addresses, dates, and phone numbers on blur with immediate visual confirmation (green checkmark for valid phone format; clear error helper message for incomplete addresses).
2. **Auto-Formatting Phone Input**: Automatically strip non-digit characters and enforce standard 10-digit Indian mobile numbers (`+91 90437 65666`).
3. **Date/Time Protection**: Automatically set `minDate` to current local date (`YYYY-MM-DD`) and dynamically restrict `minTime` to 30 minutes in advance to prevent accidental past-time bookings.
4. **Submit State Feedback**: Disable submit button upon initial click and display a spinning loader icon (`<Loader2 className="animate-spin" />`) with text "Calculating Exact Route & Fare..." to prevent duplicate reservations.

---

## 17. Tables & Data-Dense Dashboard UI

1. **Column Alignment Rules**:
   - Text & Descriptions: **Left-aligned**.
   - Status Badges & Vehicle Icons: **Center-aligned**.
   - Currency, Distances & Numerical Fares: **Right-aligned** using tabular numbers (`font-family: 'Space Grotesk'`).
2. **Row Striping & Hover**: Alternate rows utilize `rgba(12, 56, 46, 0.02)` background; hovering over any table row highlights it with `#FFF0B3` tint and border accent.
3. **Responsive Table Container**: Wrap all data-dense tables in `<div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>` with delicate fade masks on table boundaries to indicate horizontal scrollability on mobile devices.

---

## 18. Navigation & Information Architecture

Every screen must immediately resolve three fundamental user questions:
1. **"Where am I?"**: Explicit active navigation pill highlight (`background: #FFF0B3; color: #0C382E; font-weight: 700;`) + clear display page title.
2. **"Where can I go?"**: Persistent top navigation links (Home, Our Story, Why Us, Support, My Profile).
3. **"What can I do here?"**: Prominent primary button anchor ("Book Ride Now" / "Call 24/7 Helpline").

---

## 19. Feedback, Toasts & System Status

| Situation | Canonical Feedback Mechanism | Specs & Positioning |
| :--- | :--- | :--- |
| **Driver Status Update** | Audio Ringtone + Live Radar Pulsing Badge | Top-right status pill with green animated pulse dot. |
| **Coupon Applied** | Inline Green Toast Notification | Green badge with discount value and strikethrough original fare. |
| **Booking Failure** | Inline Alert Box with Phone Helpline CTA | Red alert panel with direct click-to-call support link. |
| **Page Loading** | Animated Skeleton Shimmer | Gray/butter pulse blocks matching exact component dimensions. |
| **Action Confirmation** | Centered Modal Dialog with Backdrop Blur | `#FFFFFF` dialog with `#0C382E` confirm button and `backdrop-filter: blur(8px)`. |

---

## 20. Empty States & Zero-Data Patterns

Every zero-data screen (No Active Rides, No Past Bookings, No Matching Search Results) must implement the **4-Part Anatomy**:
1. **Visual Crest / Icon**: Themed SVG illustration or icon enclosed in a warm butter circle badge (`width: 68px; height: 68px; background: #FFF0B3;`).
2. **Headline**: Clear explanation of state (e.g., *"No Active Bookings Found"*).
3. **Context Body**: Helpful narrative (e.g., *"You do not have any upcoming taxi reservations across Bihar. Ready to plan your next journey?"*).
4. **Primary Recovery CTA**: High-prominence butter or green button linking directly back to the booking engine (`"Book a Ride Now"`).

---

## 21. Error Handling UX & Recovery Flows

* **404 Not Found Screen** (`src/app/not-found.tsx`): Displays a compass icon, regional reassurance ("The destination you are looking for is not on our route map"), and interactive Quick Route chips (Patna to Muzaffarpur, Patna to Darbhanga, Patna Airport Express).
* **Network & API Timeout**: Provide automatic retry buttons (`<RefreshCw size={16} /> Try Again`) without requiring a full browser reload.

---

## 22. Loading States & Perceived Performance

* **Skeleton Shimmer Engine** (`src/app/loading.tsx`): Uses CSS gradient animations (`linear-gradient(90deg, rgba(12,56,46,0.04) 0%, rgba(255,240,179,0.35) 50%, rgba(12,56,46,0.04) 100%)`) mimicking exact button, headline, and card geometries.
* **Instant Client Hydration**: Form values cache locally in `localStorage` (`safar_user_name`, `safar_user_phone`) so returning users experience instantaneous field pre-population.

---

## 23. Theme Architecture (Butter Light & Forest Dark)

The platform operates on a **Single Unified Butter & Green Canonical Theme** with full token mapping support:

```
[data-theme="light"] (Canonical Standard)
  --bg-color:         #FAF4E6 (Warm Butter Cream)
  --text-main:        #0C382E (Deep Forest Green)
  --card-bg:          #FFFFFF (Crisp White Card)
  --card-border:      rgba(12, 56, 46, 0.12)
  --btn-glass-hover:  #FFF0B3

[data-theme="dark"] (Hero & Night Mode Inversion)
  --bg-color:         #0A2E25 (Midnight Forest Green)
  --text-main:        #FFF5D1 (Warm Butter Cream)
  --card-bg:          rgba(12, 56, 46, 0.75)
  --card-border:      rgba(255, 240, 179, 0.18)
  --btn-glass-hover:  rgba(255, 240, 179, 0.20)
```

---

## 24. Iconography System

* **Library**: `lucide-react` (Official and exclusive icon suite).
* **Stroke Width**: Standardized to `1.5px` (large display icons) and `2.0px` (standard UI buttons & form inputs).
* **Size Hierarchy**:
  - `14px – 15px`: Inline badge icons, subtitle bullet points.
  - `16px – 18px`: Standard button icons, back arrows, navigation links.
  - `20px – 24px`: Feature card badges, vehicle class identifiers.
  - `30px – 36px`: Contact channel emblems, success modal icons.
  - `48px – 64px`: Empty state hero illustrations.

---

## 25. Imagery & Cultural Vector Motifs

All background heritage illustrations are defined as standalone, scalable SVG vector paths with consistent stroke styling (`stroke: #FFF0B3; stroke-width: 1.2px; fill: none; opacity: 0.22;`):
1. **Patna Airport Terminal & Ascending Flight (PAT)** (Top center hero)
2. **Patna Junction Railway Station & Monumental Tiranga Flagpole (PNBE)** (Bottom center-left hero)
3. **Bodh Gaya Meditating Buddha on Lotus Throne** (Top right hero)
4. **Ashoka Pillar Lion Capital of Sarnath / Vaishali** (Center right hero)
5. **Indian Highway Milestone Marker (`NH 22 / 25 KM`)** (Bottom right hero)
6. **State Map of Bihar Outline** (Top left hero)
7. **Madhubani Heritage Tree & Singing Bird Art** (Mid left hero)

---

## 26. Design Anti-Patterns ("What Not To Do")

```
❌ ANTI-PATTERNS (STRICTLY BANNED)
──────────────────────────────────────────────────────────────────────────
1. DO NOT introduce random grayscale colors (#333333, #777777, #F3F4F6).
   Always use semantic tokens: #0C382E (Main), #244D3F (Dim), #4A6F62 (Muted).
2. DO NOT use generic AI neon gradients (purple, magenta, neon cyan).
   Stick strictly to Forest Green (#0C382E) and Butter Cream (#FFF0B3).
3. DO NOT set initial opacity to 0 via JavaScript animation libraries.
   Elements must be 100% visible immediately upon CSS load.
4. DO NOT create icon-only action buttons without aria-label attributes.
5. DO NOT use square, sharp-cornered buttons (border-radius: 0px).
   All buttons must use canonical radii (12px, 14px, or 30px pill).
6. DO NOT introduce light/dark toggle switches in public customer headers.
   The Butter & Green aesthetic is the intentional, permanent brand identity.
```

---

## 27. Page Composition Templates

### Standard Content Page Blueprint (`About`, `Why Us`, `Policies`):
```text
Page Container (max-width: 1200px / 920px, margin: 0 auto, padding: 24px)
 ├── Top Back Navigation Button (.btn-glass, "Back to Home")
 ├── Section Header
 │    ├── Pill Badge (Compass/Shield icon + uppercase category text)
 │    ├── Headline (clamp(32px, 5vw, 54px), bold, forest green)
 │    └── Lead Paragraph (16.5px, max-width: 720px, high-contrast dim green)
 ├── Main Content Grid
 │    ├── Feature / Stat / Policy Cards (.feature-card-interactive, white on butter)
 │    └── Comparison Table / Timeline Container
 └── Bottom CTA Banner (.bottom-cta-banner-hover, dark green with butter button)
```

---

## 28. Design Decision Log

| Date | Design Decision | Rationale & Context | Tradeoffs Considered |
| :--- | :--- | :--- | :--- |
| **Oct 2026** | Transitioned entire website to **Butter & Green** (`#FAF4E6` & `#0C382E`). | Eliminates generic ride-hailing corporate feel and establishes warmth, trust, and regional prestige. | Replaced standard white/gray mode; required full re-tokenization of CSS variables. |
| **Oct 2026** | Embedded 7 Cultural SVG Heritage Line-Art Motifs in Hero. | Celebrates Bihar's pride (Patna Airport, Patna Jn, Buddha, Ashoka Pillar, Madhubani) directly in the UI. | SVGs required custom path optimization to maintain 60fps rendering. |
| **Oct 2026** | Removed public light/dark theme switch and notification bell. | Streamlined header navigation to focus strictly on zero-friction ride bookings and direct phone support. | Users cannot manually force pure dark mode on public pages. |
| **Oct 2026** | Standardized 3-Column Footer Layout. | Removed redundant "Our Services" column to create a clean, uncluttered footer across mobile and desktop. | Consolidates service mentions into header links and dedicated story pages. |

---

## 29. Project-Specific Implementation Rules

1. **Header Standardization**: The sticky header in `src/components/Header.tsx` is universal across all pages with background `#0E3B2E` and bottom border `1.5px solid #FFF0B3`.
2. **Hero Exclusivity**: The dark green landing wrapper (`.landing-hero-wrapper`) is exclusive to `src/app/page.tsx`. All other sub-pages render on the warm butter canvas (`#FAF4E6`).
3. **Booking Flow Persistence**: Fare queries pass parameters strictly through URL Search Params (`pickup`, `drop`, `date`, `time`, `tripType`, `vehicleType`, `distanceKm`) to guarantee deep-linkable, shareable booking reviews.

---

## 30. Reusable Design System Principles (Framework-Agnostic)

When applying the Butter & Green design philosophy to other applications:
1. **Surface Inversion Rule**: Place primary actionable white cards over the warm cream canvas, and dark green summary banners over the white canvas to create natural visual depth.
2. **High-Contrast Hierarchy**: Reserve brightest gold (`#FFF0B3`) exclusively for primary call-to-action buttons and interactive highlights.
3. **Tactile Elevation**: Ensure every interactive surface lifts by at least `-2px` on hover with an expanding shadow matching the primary brand hue.
4. **Mathematical Spacing Scale**: Base all padding, gaps, and margins on multiples of `8px`.

---

## 31. Developer Implementation Workflow

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    DEVELOPER IMPLEMENTATION WORKFLOW                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Identify Page Archetype (Landing, Form Flow, Content, Dashboard)    │
│ 2. Set Container Width (1320px Wide, 1200px Content, 920px Policy)    │
│ 3. Apply Canvas Background (#FAF4E6 for body, #FFFFFF for cards)       │
│ 4. Bind Typography to Outfit (Headings) & Plus Jakarta Sans (Body)     │
│ 5. Use Canonical Button Classes (.btn-butter, .btn-green, .btn-glass)  │
│ 6. Attach .feature-card-interactive to Clickable Cards                 │
│ 7. Verify Color Contrast (Min 4.5:1 text, 3:1 display)                 │
│ 8. Test Breakpoints (Desktop 1200px, Tablet 768px, Mobile 375px)       │
│ 9. Verify Keyboard Focus (Tab navigation & Escape key on dialogs)      │
│ 10. Run Production Build & Lint Pass                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 32. Design Review Checklist

### Visual & Typography:
- [ ] Headings utilize `'Outfit'` or `'Fraunces'` with negative letter-spacing (`-0.02em`).
- [ ] Body copy utilizes `'Plus Jakarta Sans'` in `#0C382E` or `#244D3F`.
- [ ] No hardcoded unauthorized hex colors used (strictly follow Token Palette).

### Interactive & UX:
- [ ] Primary button uses `.btn-butter` with hover float effect.
- [ ] Secondary buttons use `.btn-glass` or `.btn-green`.
- [ ] All clickable cards lift by `-4px` to `-8px` on hover.
- [ ] Minimum tap target area &ge; 44×44px on mobile screens.

### Accessibility:
- [ ] Text contrast &ge; 4.5:1 against background.
- [ ] All inputs have associated labels or `aria-label`.
- [ ] Modals trap focus and dismiss cleanly on `Escape`.

---

## 33. Future-Proofing & Design System Evolution

* **Adding New Tokens**: Add the new token to `:root` in `src/styles/globals.css` under the appropriate category and document it in Section 5 of this file.
* **Component Deprecation**: Flag deprecated components in Section 2, provide a clear migration path to the canonical replacement, and maintain backward compatibility for at least one release cycle.

---

## 34. Quick Reference Cheat Sheet

```
┌────────────────────────────────────────────────────────────────────────┐
│                     BUTTER & GREEN QUICK REFERENCE                     │
├───────────────────┬────────────────────────────────────────────────────┤
│ Main Canvas BG    │ #FAF4E6 (Warm Butter Cream)                        │
│ Card Surface      │ #FFFFFF (Crisp White Card)                         │
│ Primary Brand     │ #0C382E (Deep Forest Green)                        │
│ Hero Section BG   │ #0E3B2E (Midnight Forest Green)                    │
│ Primary Action BTN│ #FFF0B3 (Butter Gold) → Hover: #FEE790             │
│ Secondary BTN     │ #FFFFFF (Glass Border: rgba(12, 56, 46, 0.16))     │
│ Dark Banner BTN   │ #0C382E (Text: #FFF0B3)                            │
│ Corner Radii      │ Sm: 10px | Md: 14px | Lg: 20px | Pill: 30px        │
│ Spacing Scale     │ 8px | 16px | 24px | 32px | 48px | 64px | 80px      │
│ Font Scale        │ Display: 38–70px | H1: 32–52px | H2: 26–38px       │
│                   │ Body: 14–16px | Helper: 12–13px                    │
│ Primary Transition│ 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)              │
└───────────────────┴────────────────────────────────────────────────────┘
```
