# Sneha Branch Review & Assessment

**Source Branch:** `origin/sneha` (commit `a7cefad`)  
**Target Spec:** `docs/ORG_MODEL_SPEC.md` ("SponFy Organizational Multi-Tenant System")  
**Merge Base:** `d46daccb234b16325f1dea6d973bf320c25db640` with `origin/main` (at `004b534`)

---

## 1. Executive Summary

Sneha's branch provides substantial foundations for the multi-tenant organizational model, including database schema additions for organizations, memberships, and notifications, an onboarding wizard with role selection, an Organizer dashboard view, a team management interface, and initial campaign access guards.

However, Sneha's branch deviates from `docs/ORG_MODEL_SPEC.md` in several important architectural areas:
1. **Join Request Model:** Sneha routed join requests directly to individual campaigns (`AccessRequest.campaignId`), whereas the spec specifies that users request to join an **Organization** (as Organizer or Executive), with campaign assignment being a separate step performed by an Organizer *after* Executive approval.
2. **Executive Flow Completeness:** `src/app/onboarding/executive/page.tsx` was left as an unfinished stub ("Coming in Part 3").
3. **Organizer Scope:** In Sneha's access guards, an Organizer of an Organization was not automatically granted access to all campaigns owned by that organization; access was only checked via direct campaign ownership (`campaign.userId === userId`) or explicit `CampaignMember` records.
4. **Merge Conflict:** A merge conflict exists in `src/app/api/sponsors/route.ts` where main's filtering logic conflicted with Sneha's campaign access query.

---

## 2. Comprehensive File-by-File Review

| Change | Files | Matching Spec Section | Verdict | Reason |
| :--- | :--- | :--- | :--- | :--- |
| **Prisma Schema Entities** | `prisma/schema.prisma` | §4, §5, §8 | **ADAPT** | Adds `Organisation`, `OrganisationMember`, `CampaignMember`, `AccessRequest`, `Notification`, and User profile fields (`phone`, `designation`, `accountMode`, `onboardingStatus`). Must be adapted so `AccessRequest` / membership lifecycle matches organization-level applications, and ensure `CampaignAssignment` / `CampaignMember` has unique constraints and non-null organization references where needed. |
| **TypeScript Types** | `src/types/index.ts` | §4 | **ADAPT** | Define models for `AccountMode`, `OnboardingStatus`, `OrgRole`, `MemberStatus`, `RequestStatus`, `Organisation`, `OrganisationMember`, `CampaignMember`, `AccessRequest`, `Notification`. Keep enums aligned with Prisma schema. |
| **Auth Session & Token Sync** | `src/lib/auth.ts` | §3, §6, §9 | **ADAPT** | Syncs `role`, `accountMode`, `onboardingStatus`, and `organisationId` from DB to JWT; invalidates deleted user sessions. Adapt to ensure backwards compatibility with individual users and demo accounts. |
| **Role Helpers** | `src/lib/auth/roles.ts` | §3, §9 | **KEEP** | Provides `requireRole`, `isOrganiser`, `isExecutive`, `isAdmin`, and `getHomeRouteForUser`. Fits server-side authorization well. |
| **Auth Guard Extension** | `src/lib/security/auth-guard.ts` | §9 | **KEEP** | Extends session verification with organization context and ownership checks. |
| **Campaign Access Guard** | `src/lib/security/campaign-access.ts` | §9 | **ADAPT** | Core authorization helper `getCampaignAccess`. Must be adapted so active Organizers of an organization automatically have access to all campaigns owned by that organization, while Executives only access assigned campaigns. |
| **Onboarding Gate Middleware** | `src/middleware.ts` | §6 | **KEEP** | Protects `/app`, redirects incomplete users to `/onboarding`, pending users to `/onboarding/pending`, and complete users away from `/onboarding`. |
| **Registration Role Default** | `src/app/api/auth/register/route.ts` | §3.1, §3.4 | **KEEP** | Forces new registrations to default `USER`/`INDIVIDUAL` with `NOT_STARTED` onboarding status; blocks client-side role manipulation. |
| **Auth Pages Cleanup** | `src/app/(auth)/login/page.tsx`, `signup/page.tsx` | §3.1, §6 | **KEEP** | Removes role selector toggles from signup/login and directs role choices to onboarding wizard. |
| **Onboarding Wizard** | `src/app/onboarding/page.tsx` | §3, §6 | **KEEP** | Two-step wizard (profile details + 3 public role cards: User / Organiser / Executive). Admin is never selectable. |
| **Profile Details API** | `src/app/api/onboarding/profile/route.ts` | §6 | **KEEP** | Validates and persists user profile (name, phone, designation, college/company). |
| **Workspace Mode Selection API** | `src/app/api/onboarding/mode/route.ts` | §3, §6 | **KEEP** | Sets account mode; marks Individual as `COMPLETE`, while Organiser and Executive proceed to respective paths. |
| **Organiser Onboarding View** | `src/app/onboarding/organiser/page.tsx` | §3.2 | **ADAPT** | Clean UI for Create vs Join Organization. Adapt join flow to search organizations rather than individual campaigns. |
| **Executive Onboarding View** | `src/app/onboarding/executive/page.tsx` | §3.3 | **ADAPT** | Sneha left this as a "Coming in Part 3" stub. Must be built to allow searching registered organizations and submitting pending join requests. |
| **Pending Request Status View** | `src/app/onboarding/pending/page.tsx` | §3.2, §3.3, §8 | **ADAPT** | Live polling status page for pending membership requests. Adapt to support organization membership requests. |
| **Organization Creation & Search API** | `src/app/api/organisations/route.ts`, `mine/route.ts` | §3.2, §4 | **ADAPT** | Atomic organization creation transaction (creator becomes active Organizer). Add search capability for joining organizations. |
| **Campaign Search API** | `src/app/api/campaigns/search/route.ts` | §3.2.B, §3.3 | **ADAPT** | Rate-limited search. Adapt to search organizations (public non-sensitive fields) rather than just campaigns. |
| **Access Request APIs** | `src/app/api/access-requests/route.ts`, `[id]/route.ts`, `status/route.ts`, `cancel/route.ts` | §8 | **ADAPT** | Join request submission and approval/rejection. Prevent duplicate requests, prevent self-approval, ensure approval is idempotent and separate from campaign assignment. |
| **Team Management APIs** | `src/app/api/team/requests/route.ts`, `members/route.ts` | §7, §8 | **ADAPT** | Manage pending requests and member list. Enforce that the last active Organizer cannot be removed. |
| **Team Management View** | `src/app/(app)/app/team/page.tsx` | §7 | **KEEP** | Rich Organizer interface to view active members, pending requests, and manage access. Reuses existing design system. |
| **Organiser Dashboard Component** | `src/components/dashboard/OrganiserDashboardView.tsx` | §7 | **KEEP** | Aggregated KPIs, campaign selector, team members, pending request alerts, and recent activities. |
| **App Overview Router** | `src/app/(app)/app/page.tsx` | §6, §7 | **KEEP** | Dispatches to `OrganiserDashboardView` for Organizers, or `CampaignDashboardView` for Individual and Executive users. |
| **Notification System** | `src/components/layout/NotificationBell.tsx`, `src/lib/data/repositories/notifications.ts`, `src/app/api/notifications/route.ts`, `read/route.ts` | §3.3 | **KEEP** | Bell icon in top navbar, badge count, dual-mode notification repository (PostgreSQL + in-memory store). |
| **Navigation Updates** | `src/components/layout/Sidebar.tsx`, `TopBar.tsx` | §7 | **KEEP** | Adds Team link for Organizers and Notification Bell in top bar. |
| **Settings Link** | `src/components/settings/SettingsTabs.tsx` | §6 | **KEEP** | Displays account role/mode in settings tab. |
| **Data Repositories Scoping** | `src/lib/data/repositories/campaigns.ts`, `sponsors.ts`, `outreach.ts`, `replies.ts`, `meetings.ts`, `settings.ts` | §9, §10 | **ADAPT** | Scopes data queries to accessible campaigns. Adapt to include organization-level campaign ownership for Organizers and assigned campaigns for Executives. |
| **API Route Authorization** | `src/app/api/campaigns/route.ts`, `discover/route.ts`, `sponsors/route.ts`, `sponsors/import-csv/route.ts`, `replies/route.ts`, `meetings/route.ts` | §9, §10 | **ADAPT** | Resolve merge conflict in `sponsors/route.ts`. Ensure all endpoints enforce server-side authorization. |
| **Onboarding Backfill Script** | `scripts/backfill-onboarding.mjs` | §3.1, §6, §12 | **KEEP** | Safely marks existing users as `INDIVIDUAL` / `COMPLETE` to prevent breaking existing user data or forcing unwanted onboarding. |

---

## 3. Gap Analysis Against the Spec (Post-Merge)

| Spec Requirement | Status | File Evidence | Description & Remediation |
| :--- | :--- | :--- | :--- |
| **1. Roles & Onboarding** | **Partial** | `src/lib/auth/roles.ts`<br>`src/app/onboarding/page.tsx`<br>`src/app/onboarding/executive/page.tsx` | Role selection works for Individual and Organiser. Admin is protected. Existing users default safely to Individual. **Gap:** `src/app/onboarding/executive/page.tsx` was left as a "Coming in Part 3" stub. Must implement full Executive onboarding flow (search registered org, submit join request). |
| **2. Relational Model** | **Partial** | `prisma/schema.prisma`<br>`src/types/index.ts` | Relational tables exist (`Organisation`, `OrganisationMember`, `CampaignMember`). **Gap:** `AccessRequest` schema in Sneha's branch required `campaignId String`, whereas join requests in the spec are submitted to an `Organisation` directly, with campaign assignment occurring as a separate step after approval. |
| **3. Organization Creation** | **Working** | `src/app/api/organisations/route.ts`<br>`src/app/onboarding/organiser/page.tsx` | Atomic creation via Prisma `$transaction`. Creator immediately becomes an active, approved Organizer. Initial campaign created. |
| **4. Join Flows** | **Broken** | `src/app/api/campaigns/search/route.ts`<br>`src/app/onboarding/organiser/page.tsx` | Sneha implemented searching *campaigns* for join requests. The spec requires Organizers and Executives to search registered *organizations* (public, non-sensitive fields only, rate-limited) and submit pending membership requests to the organization. |
| **5. Request Lifecycle** | **Partial** | `src/app/api/access-requests/route.ts`<br>`src/app/api/access-requests/[id]/route.ts`<br>`src/app/api/team/requests/route.ts` | Request statuses exist; self-approval is blocked. **Gap:** Needs alignment to organization-level requests, idempotent approval under concurrent clicks, prevention of duplicate pending requests, and clean separation between organization approval and campaign assignment. |
| **6. Campaign Assignment** | **Missing** | `src/app/api/team/members/route.ts`<br>`src/app/(app)/app/team/page.tsx` | Sneha auto-assigned whichever campaign was targeted in the request. The spec requires that Executive approval and campaign assignment are separate steps. After approval, the Organizer chooses which campaigns to assign (or creates a new one). Approved Executives with no assignments must see a clear empty state. |
| **7. Campaign Ownership** | **Working** | `prisma/schema.prisma`<br>`src/lib/data/repositories/campaigns.ts` | Additive schema: `userId` is retained for individual campaigns; nullable `organisationId` designates organization campaigns. No data reassignment or conversion of existing campaigns. |
| **8. Authorization Helpers** | **Partial** | `src/lib/security/campaign-access.ts`<br>`src/lib/security/auth-guard.ts` | `getCampaignAccess` checks creator and direct member records. **Gap:** Must automatically grant active Organizers of the organization that owns the campaign full access, while restricting Executives strictly to assigned campaigns. |
| **9. Data Isolation Across Features** | **Partial** | `src/lib/data/repositories/*.ts`<br>`src/app/api/sponsors/route.ts`<br>`src/app/api/outreach/bulk-send/route.ts` | Repositories partially filter by accessible campaigns. **Gap:** Must ensure all routes, bulk sends, reply syncs, and follow-ups check campaign access individually for each item and prevent two Executives from emailing the same company in the same campaign. |
| **10. Attribution** | **Partial** | `prisma/schema.prisma`<br>`src/lib/data/repositories/notifications.ts` | Notification logging exists for requests. Must record actor attribution on campaign creation, member approval/revocation, and executive assignment. |
| **11. Analytics** | **Partial** | `src/app/api/analytics/route.ts`<br>`src/components/dashboard/OrganiserDashboardView.tsx` | Organizer dashboard aggregates campaigns. **Gap:** Ensure `api/analytics` filters to assigned campaigns for Executives, organization totals for Organizers, and prevents double-counting sponsors across multiple assigned Executives. |
| **12. Last Organizer Guard** | **Missing** | `src/app/api/team/members/route.ts` | Sneha blocked removing the campaign owner, but did not block removing the *last active Organizer* of the organization. Must be enforced. |
