# SponFy — Code Style (code_style.md)

## 1. TypeScript
- `strict: true`, `noUncheckedIndexedAccess: true`. No `any` (use `unknown` + Zod parse). No `@ts-ignore` without a comment explaining why and a TODO in BUILD_NOTES.md.
- Types derive from Zod schemas (`z.infer`) or Prisma types; don't duplicate shapes by hand.
- Prefer `type` for unions and data shapes, `interface` for adapter contracts.
- Named exports; default exports only for Next.js pages/layouts/route files.

## 2. Structure and size
- Components < 200 lines, one responsibility. Extract hooks (`use*`) and subcomponents early.
- Server components by default. Add `"use client"` only for interactivity (drag-drop, charts, forms with live state, animations) and keep client islands small.
- Business logic lives in `lib/services`, not in components or route handlers. Route handlers/actions: authenticate → validate → call service → shape response.
- Config over repetition: stages, intents, nav, scoring weights, limits live in `lib/config/*` and are imported everywhere.
- No duplicated logic: if it appears twice, extract it.

## 3. Naming and files
- Files: `kebab-case.ts`; React components: `PascalCase.tsx`; hooks: `use-thing.ts`.
- Server Actions: `verbNoun` (`createCampaign`, `approveDraft`). Repositories: `campaignRepo`, `companyRepo`.
- Enums/constants: `SCREAMING_SNAKE` for Prisma enums, mirrored string-literal unions in config.
- Colocate a component's small subcomponents; shared UI in `components/ui`.

## 4. Data and errors
- Prisma imported **only** in `lib/data/prisma/*` and `lib/db.ts`.
- Services return typed results; throw typed errors (`AppError` with `code` and user-safe `message`). Actions/handlers map errors to responses; UI shows friendly messages with Retry. Never leak stack traces or raw provider errors.
- Every async UI path has loading, empty and error states (design_system.md §11).
- Dates stored UTC, displayed in the user's locale/timezone; INR via `Intl.NumberFormat("en-IN")`.

## 5. Styling
- Tailwind utilities with design tokens exposed in the Tailwind theme (colors `bg`, `card`, `green-*`, `butter*`, text tokens). No raw hex in components. Use `cn()` helper for conditional classes.
- Component variants via a small `variants` map or `class-variance-authority` only if already justified; otherwise plain maps.
- No inline styles except dynamic values (e.g. progress width).

## 6. Dependencies
Allowed: the stack in architecture.md, plus `zod`, `clsx`/`tailwind-merge`, `server-only`, `date-fns` (if needed), a test runner (testing.md). Adding anything else requires a one-line reason in BUILD_NOTES.md. No UI kits that fight the design system; building on Radix primitives for dialog/dropdown/tooltip is acceptable for accessibility.

## 7. Comments and docs
Comment the *why*, not the what. Each integration and graph file starts with a 3–5 line header: purpose, inputs/outputs, failure behaviour. Public service functions have a one-line doc.

## 8. Git
Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). One commit per milestone minimum, tag `m1`…`m8`. Never commit `.env`.

## 9. Tooling
ESLint (next/core-web-vitals + typescript-eslint), Prettier, `npm run typecheck`, `npm run lint`, `npm run build` must pass at the end of every milestone. Husky/lint-staged optional.

## 10. Performance
Dynamic-import Recharts and Framer Motion-heavy sections. `next/image` for images, `next/font` for fonts. Paginate lists (20/page). Select only needed Prisma fields on list queries. Avoid N+1: use `include`/`select` or batched queries.
