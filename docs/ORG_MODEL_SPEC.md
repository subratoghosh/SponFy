# SponFy — Organizational Multi-Tenant System: Complete Product Requirements and Workflow Specification

## 1. Overview and Purpose

SponFy is currently implemented primarily as an individual-based sponsorship management platform. Users can register, log in, create their own campaigns, discover potential sponsors, manage sponsor records, generate outreach emails, send approved emails, track replies, manage follow-ups, and view analytics.

However, the intended product model is an **organization-based sponsorship management platform**.

The application must evolve so that multiple people can collaborate within an organization, manage multiple campaigns, and work together on sponsorship acquisition while maintaining appropriate access control.

The system must support four account roles:

1. Individual User
2. Organizer
3. Executive
4. Admin

The primary distinction is that an Organizer manages an organization and its campaigns, while Executives work on campaigns assigned to them by that organization. Individual Users continue to use the existing individual workflow independently.

Multiple organizers must be able to manage the same organization. An organization can have multiple campaigns, and each campaign can have multiple assigned executives.

The existing sponsorship functionality should remain intact. The main change is the ownership, membership, authorization, and collaboration model surrounding that functionality.

---

## 2. Existing Application Context

The current SponFy application uses:

- Next.js 15 App Router
- React 19 and TypeScript
- PostgreSQL through Neon Serverless
- Prisma ORM 6
- NextAuth v5 / Auth.js
- Google OAuth, GitHub OAuth, and credentials authentication
- Google Gemini through `@google/genai`
- Tailwind CSS and the existing SponFy design system
- Upstash Redis for distributed rate limiting
- Gmail OAuth integration for email sending
- Existing DNS, MX, SPF, DMARC, and email suppression safeguards
- Vitest for automated tests

Existing functional modules include:

- Campaign creation and management
- AI-powered sponsor discovery
- Contact discovery and sponsor fit scoring
- Sponsor pipeline and CRM
- Email draft generation and approval
- Individual and bulk email sending
- Inbound reply tracking and intent classification
- Follow-up management
- Campaign analytics and dashboards

Important existing source files include:

- `src/lib/auth.ts`
- `src/middleware.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/campaigns/route.ts`
- `src/app/api/discover/route.ts`
- `src/lib/data/repositories/campaigns.ts`
- `src/lib/data/repositories/sponsors.ts`
- `src/app/api/outreach/send/route.ts`
- `src/app/api/outreach/bulk-send/route.ts`
- `src/lib/outreach/followup-service.ts`
- `src/lib/data/repositories/replies.ts`
- `src/lib/data/repositories/analytics.ts`

These are reference points. The actual repository must be inspected before making implementation decisions.

The objective is to extend the current system, not rebuild SponFy from scratch.

---

# 3. The Four Roles

## 3.1 Individual User

An Individual User operates independently and does not need to belong to an organization.

### Registration and first login

When a user registers or logs in for the first time, they should be asked to choose their account type.

The available choices are:

- Individual User
- Organizer
- Executive

Admin is not a public registration option.

If the person selects Individual User, the application should continue with the existing individual workflow.

### Individual User capabilities

Individual Users can:

- Access the existing dashboard.
- Create their own campaigns.
- Discover potential sponsors.
- View, add, and manage sponsor records.
- Discover and manage contacts.
- Generate personalized email drafts.
- Review and approve email drafts.
- Send emails using the existing safeguards.
- Track inbound replies.
- Manage follow-ups.
- View campaign analytics.
- Use the existing features available to an individual account.

Their campaigns, sponsors, outreach, replies, and analytics must remain private to their own account unless the current product explicitly supports sharing.

Individual Users must not automatically receive access to organization campaigns or organization-owned sponsor data.

### Important compatibility requirement

The migration must preserve existing individual accounts, campaigns, sponsor records, drafts, email history, replies, and other related records.

Existing users must not lose data or unexpectedly become members of an organization.

Existing users should be asked to select or confirm their account type through a safe onboarding process if their role cannot be determined reliably from existing records.

---

## 3.2 Organizer

An Organizer is a member of an organization who can manage that organization's details, campaigns, membership requests, and executive assignments.

An organization can have multiple Organizers.

The organization is the central collaboration boundary for Organizer and Executive accounts.

### Organizer entry flow

After selecting Organizer during onboarding, the user should see two options:

1. Create a New Organization
2. Join an Existing Organization

The user must be able to choose either option.

### A. Create a New Organization

When the user chooses to create an organization, display an organization registration form.

Collect suitable organization details, including:

- Organization or company name
- Organization type
- Description
- Official website, if available
- Contact email
- Contact phone, if appropriate
- Country and location
- Other details that are genuinely useful for identifying the organization

Keep the form professional and straightforward. Avoid asking for unnecessary personal or business information.

On submission:

1. Validate the form on the server.
2. Check for obvious duplicate organizations using a sensible normalization strategy.
3. Create the organization record.
4. Associate the current authenticated user with that organization as an Organizer.
5. Mark that membership as approved and active because the user created the organization.
6. Redirect the user to the Organizer Dashboard.

Organization creation and the creator's initial Organizer membership must be handled atomically so the organization cannot be created without its initial authorized Organizer.

The creator should not need to submit a membership request to their own organization.

### B. Join an Existing Organization

When the user chooses to join an existing organization:

1. Display a search interface.
2. Allow searching by organization name and other safe, useful identifiers.
3. Display matching organizations using non-sensitive public information.
4. Let the user select an organization.
5. Submit a request to join as an Organizer.

The request must initially have a pending status.

The user must not receive access to the organization's campaigns, sponsor records, contacts, email drafts, replies, analytics, or other private resources simply by submitting the request.

The existing authorized Organizers of that organization should be able to see the request in their dashboard.

### Organizer membership approval

An authorized Organizer can:

- Approve the request.
- Reject the request.

On approval:

1. The membership becomes active.
2. The requesting user receives Organizer access to that organization.
3. The new Organizer appears in the organization's member list.
4. The user can access the organization's dashboard and its authorized campaigns.
5. The user can manage organization-level resources and campaigns according to the Organizer permission policy.

On rejection:

- The request is marked rejected.
- No organization access is granted.
- The user should receive a clear status update.
- The user must not be able to access the organization's private resources.

The system should prevent duplicate pending membership requests.

Membership status changes must be persisted in the database and enforced server-side.

### Organizer capabilities

An authorized Organizer should be able to:

- View and edit permitted organization details.
- View the organization's members.
- View pending Organizer membership requests.
- Approve or reject Organizer requests.
- View pending Executive membership requests.
- Approve or reject Executive requests.
- Create multiple campaigns within the organization.
- Edit and manage organization campaigns.
- Assign approved Executives to campaigns.
- Assign one Executive to multiple campaigns.
- Assign multiple Executives to the same campaign.
- Remove an Executive from a campaign.
- View campaign-level sponsor pipelines and analytics.
- Manage sponsor discovery and outreach within the organization's authorized campaigns.
- View relevant organizational analytics.
- Remove a member from the organization when permitted.
- Manage the active status of memberships according to the authorization policy.

All these operations must be scoped to organizations where the current user has an active, authorized Organizer membership.

An Organizer must not be able to manage an unrelated organization by changing an organization ID in a request.

### Multiple Organizers

An organization can have multiple Organizers at the same time.

All active Organizers should be able to collaborate on the organization's campaigns and review membership requests.

A request submitted by one Organizer to join an existing organization should be visible to the other authorized Organizers.

Removing one Organizer must not automatically delete the organization or remove its campaigns.

The system must prevent accidental removal of the last active Organizer unless a deliberate ownership-transfer or organization-closure process is implemented.

If different Organizer permissions are introduced later, they should be explicit. For the initial implementation, use a consistent Organizer permission policy rather than silently treating the organization creator as the only person who can manage the organization.

---

## 3.3 Executive

An Executive is a member of an organization who works on campaigns assigned to them by an Organizer.

An Executive cannot independently create organization campaigns.

Executives must be approved by an Organizer before receiving access to organization resources.

### Executive entry flow

When the user selects Executive during onboarding, display a one-time profile setup and organization application process.

Collect the appropriate basic details, such as:

- Full name
- Professional or college role, if useful
- Contact details already available from the account where possible
- Optional profile information required by the product

Do not unnecessarily duplicate information already collected during registration.

After the basic details are completed, show an organization search interface.

The user must be able to search organizations that have already been registered on SponFy.

Only registered organizations should appear in the results.

The Executive selects an organization and submits an application to join it.

The application should be stored with a pending status.

### Executive membership request

After submission:

1. Create a pending Executive membership request.
2. Notify the authorized Organizers of the selected organization through the existing notification system, if one exists, or through a minimal appropriate notification mechanism.
3. Display the request in the Organizer Dashboard.
4. Show the Executive a pending status.
5. Do not grant access to organization campaigns or private organizational data yet.

Prevent duplicate pending requests from the same user for the same organization.

### Executive approval

When an Organizer approves an Executive request:

1. Mark the membership as approved and active.
2. Record which Organizer performed the approval.
3. Open a campaign-assignment interface for the approving Organizer.
4. Display the organization's existing active campaigns.
5. Allow the Organizer to select one or more campaigns for the Executive.
6. Provide an option to create a new campaign and assign the Executive to it.
7. Save the assignments.
8. Make the Executive Dashboard available with the approved campaign assignments.

**Approval and campaign assignment are related but separate operations.** The Executive should become an approved organization member before receiving campaign access.

The assignment interface must appear only after approval, as requested.

If the Organizer approves the Executive but does not assign any campaign immediately, the membership should remain approved while the Executive sees an appropriate state explaining that no campaigns have been assigned yet.

Do not silently assign every campaign to a new Executive.

### Creating a new campaign during assignment

The Organizer may choose to create a new campaign while assigning the approved Executive.

In that case:

1. Display the normal campaign creation form.
2. Create the campaign under the selected organization.
3. Assign the approved Executive to that campaign.
4. Persist the campaign and assignment safely.
5. Show the new campaign in the Organizer Dashboard and the Executive Dashboard.

Where practical, creation and initial assignment should be handled in a transaction so the application does not leave a partially configured campaign.

If campaign creation succeeds but assignment fails, handle the error clearly and allow a safe retry without creating duplicate campaigns.

### Executive capabilities

Executives can:

- View their Executive Dashboard.
- View the campaigns assigned to them.
- Work collaboratively with other Executives assigned to the same campaign.
- Discover potential sponsors for their assigned campaigns.
- View and manage authorized sponsor records.
- Discover and manage contacts within the permitted campaign scope.
- Generate personalized outreach drafts.
- Review draft status.
- Perform permitted outreach actions under the existing approval rules.
- Track replies and follow-ups for authorized campaigns.
- View analytics for campaigns to which they have access.

The existing discovery, sponsor management, outreach, replies, follow-ups, and analytics features should remain available, but their data scope must be restricted to authorized assignments.

### Executive restrictions

Executives must not be able to:

- Create their own organization campaigns.
- Access unassigned organization campaigns.
- Assign themselves to campaigns.
- Assign other Executives to campaigns.
- Approve membership requests.
- Approve new Organizers.
- Change organization settings reserved for Organizers.
- Remove other members from the organization.
- Access another organization's data.
- Bypass email approval, verification, suppression, or send limits.

Executives can work on multiple assigned campaigns and collaborate with other assigned Executives.

---

## 3.4 Admin

Admin is the platform-level administrative role.

Admin must not be selectable through ordinary public registration.

The existing Admin role and authorization mechanisms should be preserved where possible, with any required changes carefully reviewed.

Platform Admin capabilities may include:

- View and manage registered organizations.
- View users and their account statuses.
- Review organization-level operational information.
- Investigate abuse or access-control issues.
- Manage accounts according to existing administrative policies.
- View system-level analytics and health information.

Admin access must be enforced server-side.

An Admin role must not automatically make ordinary users, organizers, or executives members of every organization. Platform administration and organizational membership are different concepts.

Do not expose private organization data to ordinary users through admin-related APIs or UI components.

Do not allow users to promote themselves to Admin through registration payloads, profile updates, or client-side role selection.

---

# 4. The Core Organizational Model

The database must support the following relationships:

- One user can belong to multiple organizations if the product permits it.
- One organization can have multiple Organizers.
- One organization can have multiple Executives.
- One organization can own multiple campaigns.
- One campaign can have multiple assigned Executives.
- One Executive can be assigned to multiple campaigns.
- Membership requests can be pending, approved, rejected, or revoked.
- Campaign assignments can be active or revoked independently of organization membership.

The initial implementation should use a clear relational model instead of storing membership or assignment lists as unstructured JSON.

### Recommended conceptual entities

These are conceptual requirements, not instructions to duplicate existing models blindly.

**User**
- Existing identity and authentication information.
- Platform-level Admin authorization, if applicable.
- Profile details.
- Onboarding completion state.

**Organization**
- ID.
- Name.
- Type.
- Description.
- Website.
- Contact information.
- Location.
- Created and updated timestamps.
- Status.

**OrganizationMembership**
- ID.
- User ID.
- Organization ID.
- Organization role: ORGANIZER or EXECUTIVE.
- Membership status.
- Requested timestamp.
- Decision timestamp.
- Approved or rejected by user ID, where applicable.
- Revocation metadata, where appropriate.

**Campaign**
- Existing campaign fields.
- A nullable organization ownership reference or an equivalent explicit ownership model.
- Existing individual ownership support must remain intact during migration.

**CampaignAssignment**
- ID.
- Campaign ID.
- Executive membership or user ID, according to the selected relational design.
- Assignment status.
- Assigned by user ID.
- Assignment timestamp.
- Revocation timestamp, where applicable.

The actual schema should follow existing Prisma conventions and reuse existing models where appropriate.

Add unique constraints and indexes for important relationships, such as organization membership uniqueness, pending request prevention, and campaign assignment uniqueness.

Use appropriate transactions for organization creation, membership decisions, and campaign assignment operations.

---

# 5. Campaign Ownership and Individual Compatibility

This is one of the most important aspects of the migration.

SponFy currently supports individually owned campaigns. The new system must support both:

1. Individual campaigns.
2. Organization-owned campaigns.

Do not simply change every campaign to require an organization ID.

A campaign should have a clear ownership model. If the current schema has a `userId` ownership field, preserve its meaning for individual campaigns and introduce organization ownership in a compatible way.

Define and enforce the rule that a campaign cannot accidentally be treated as both independently owned and organization-owned unless the data model explicitly supports that situation.

All campaign queries and writes must follow the ownership model.

### Individual campaign behavior

Individual Users continue to create and manage their own campaigns.

Their existing workflow must remain unchanged.

### Organization campaign behavior

Organizers create and manage organization-owned campaigns.

Executives can access only campaigns assigned to them.

An approved Organizer can access the organization's campaigns according to the organization permission policy.

A pending member must not access organization campaigns.

### Existing records

Existing campaigns must remain accessible to their original owners.

Do not automatically convert individual campaigns into organization campaigns.

Do not delete or reassign existing sponsors, drafts, email history, replies, or analytics records.

Before modifying ownership-related database constraints, inspect the current relationships and plan a backward-compatible migration.

---

# 6. Onboarding and First-Login Behavior

The application should offer a role-selection onboarding flow to eligible users who have not yet completed it.

The initial choices are:

- Individual User
- Organizer
- Executive

Admin must not be available as a normal user choice.

### One-time onboarding

The onboarding flow should appear only when the user has not completed the required setup.

Persist onboarding status server-side.

Do not rely solely on localStorage or a browser flag to determine whether onboarding has been completed.

After the user finishes onboarding, subsequent logins should lead directly to the correct dashboard or pending-membership state.

Examples:

- Individual User → Existing Individual Dashboard.
- Organizer who created an organization → Organizer Dashboard.
- Organizer with a pending join request → Pending Organization Request screen.
- Approved Executive with assignments → Executive Dashboard.
- Approved Executive without assignments → Executive Dashboard with a clear no-assigned-campaigns state.
- Executive with a pending request → Pending Application screen.
- Executive whose request was rejected → Clear status screen with an appropriate option to apply again if policy permits.

### Existing users

Do not force all existing users through a disruptive onboarding flow without considering their current data and role.

Inspect the existing role field, user records, and campaign ownership.

Define a safe migration or progressive onboarding process for existing users.

If a user has existing individual campaigns, preserve their ability to use them even if the new organizational model is introduced.

---

# 7. Organization and Executive Management Dashboard

Extend the existing dashboard design system. Do not introduce an unrelated visual design.

The Organizer Dashboard should include sections such as:

## Overview
- Organization summary.
- Total campaigns.
- Active campaigns.
- Total assigned Executives.
- Pending membership requests.
- Sponsor pipeline metrics.
- Outreach and reply metrics.
- Recent organizational activity.

## Campaigns
- List organization-owned campaigns.
- Create new campaigns.
- Edit campaigns.
- Archive campaigns using the existing safe campaign lifecycle.
- View assigned Executives for each campaign.
- Add and remove campaign assignments.
- Open the existing campaign-specific sponsor workflow.

## Members
- List active Organizers.
- List active Executives.
- Show pending Organizer applications.
- Show pending Executive applications.
- Approve or reject requests.
- Remove or revoke membership where authorized.
- Display useful membership statuses.

## Executive Assignment
- Select an approved Executive.
- View active campaigns in the organization.
- Assign the Executive to one or more campaigns.
- Create a new campaign and assign the Executive.
- Remove the Executive from a campaign.
- Prevent duplicate active assignments.

The Executive Dashboard should use the existing SponFy interface and include:

- Assigned campaigns.
- Campaign-specific sponsor discovery.
- Sponsor CRM.
- Outreach drafts and sending workflow.
- Replies and follow-ups.
- Campaign analytics.
- A clear state when no campaigns have been assigned.

An Executive should never see another organization's campaigns merely because they share the same user interface.

---

# 8. Membership Request Lifecycle

Implement an explicit and consistent request lifecycle.

Suggested statuses:

- PENDING
- APPROVED
- REJECTED
- REVOKED

The exact enum naming should follow existing project conventions.

### Organizer joining an organization

`User selects Organizer → Searches organization → Submits request → Organizer reviews request → Approved or rejected`

Approval grants active Organizer membership to the selected organization.

### Executive joining an organization

`User selects Executive → Completes profile → Searches organization → Submits request → Organizer reviews request → Approved or rejected`

If approved:

`Approved membership → Campaign assignment → Executive gains campaign access`

Approval must not automatically grant access to all organization campaigns.

### Request management requirements

- Prevent duplicate pending requests.
- Validate all organization IDs on the server.
- Ensure only authorized Organizers can approve or reject requests.
- Record the decision-maker and decision timestamp.
- Ensure a request cannot be approved twice in a way that creates duplicate memberships.
- Make retries safe.
- Handle concurrent approvals safely.
- Keep the user informed about the request status.
- Define what happens if a request is rejected, revoked, or resubmitted.
- Ensure revoked members immediately lose the corresponding access.

A user must not be able to approve their own request to join an organization.

---

# 9. Authorization and Data Isolation

The organizational model is not complete unless all data access is scoped correctly.

Authentication establishes who the user is. Authorization determines which organization, campaign, sponsor, draft, and email records they can access.

Implement reusable server-side authorization helpers based on the existing architecture.

Examples of the intended rules:

- Individual campaign owner → access to their own individual campaign.
- Active Organizer → access to resources of their organization within the Organizer permission policy.
- Active Executive → access only to campaigns assigned to them within an active organization membership.
- Pending Organizer or Executive → no access to private organization resources.
- Revoked membership → no access to organization resources.
- Platform Admin → platform-level capabilities according to the Admin policy, without silently changing organization membership.

Apply these checks to API routes, server actions, database repositories, and background or scheduled operations wherever applicable.

Do not rely solely on hiding buttons or restricting navigation in the frontend.

### Critical data-scope changes

Inspect and update the ownership and authorization logic for:

- Campaigns.
- Sponsors.
- Contacts.
- Email drafts.
- Sent email records.
- Inbound replies.
- Follow-ups.
- Analytics.
- Campaign activity.
- Member lists.
- Organization settings.
- Bulk operations.

For example, an Executive assigned to Campaign A must not be able to request the data of Campaign B by changing a request parameter.

An Organizer of Organization A must not be able to manage Organization B by supplying its ID.

Bulk requests must authorize every submitted resource, not merely the first one.

Maintain existing rate limiting, input validation, email safety checks, and encryption.

---

# 10. Existing Features Must Continue Working

The organizational model should change resource ownership and access rules, not remove existing capabilities.

Preserve:

- Gemini sponsor discovery.
- Sponsor deduplication.
- Contact discovery.
- Fit scoring.
- Sponsor pipeline management.
- Email draft generation.
- Individual and bulk email sending.
- Recipient selection and custom contact handling.
- MX, SPF, and DMARC verification.
- Suppression lists and sending quotas.
- Gmail thread synchronization.
- Reply intent classification.
- Follow-up cadence.
- Dashboard analytics and KPI calculations.
- Existing campaign synchronization behavior.
- Existing authentication providers.

Where these features currently operate on individual campaigns, update their data scoping so they can also operate on organization-owned campaigns when the user is authorized.

Do not rewrite the underlying AI discovery, scoring, email-generation, or deliverability logic simply to introduce organizational membership.

All sending operations must continue to require the existing approval and safety checks.

---

# 11. Analytics and Activity Attribution

Organization-level collaboration requires clear attribution.

Where appropriate, record:

- Which user created a campaign.
- Which Organizer approved a membership request.
- Which Organizer assigned an Executive.
- Which user discovered or added a sponsor.
- Which user generated or edited a draft.
- Which user approved or initiated an email send.
- Which user changed a campaign assignment.
- Which user revoked a membership.

Reuse existing audit or activity models where appropriate. Do not create a redundant logging system unnecessarily.

Organizational analytics should aggregate only the data belonging to the organization.

Executive analytics should be restricted to the campaigns the Executive is authorized to access.

Individual analytics must continue to reflect only the user's own campaigns.

Avoid double-counting sponsors, sends, or revenue when multiple Executives work on the same campaign.

Define aggregation rules based on the existing data model before modifying KPI queries.

---

# 12. Database Migration and Rollout Safety

The migration must be backward-compatible and must not destroy existing data.

Before editing the Prisma schema:

1. Inspect all existing models and relationships.
2. Identify the current campaign ownership rules.
3. Identify foreign-key dependencies for sponsors, drafts, sends, replies, follow-ups, and analytics.
4. Design the minimum schema changes needed.
5. Determine how existing records will behave after migration.
6. Write migration tests or validation scripts where appropriate.

Do not reset the database.

Do not run `prisma migrate reset`, drop existing tables, delete user data, or overwrite production records.

Do not make production schema changes without explicit approval.

Prefer an additive migration strategy that introduces organizations, memberships, and campaign assignments while preserving existing ownership fields and data.

If a migration is required, generate it, review it, and document the exact command and rollout order.

Avoid a migration that makes every existing campaign require an organization immediately.

Ensure existing individual campaigns continue to work throughout the rollout.

---

# 13. Testing Requirements

Add tests for the new organization and membership workflows.

At minimum, test:

### Role selection
- Individual User onboarding.
- Organizer onboarding.
- Executive onboarding.
- Admin cannot be self-selected.
- Onboarding does not repeat after successful completion.

### Organization creation
- Valid organization creation.
- Creator becomes an active Organizer.
- Duplicate creation handling.
- Failed creation does not leave an orphaned organization.

### Organizer membership
- Search for existing organizations.
- Submit a join request.
- Approve and reject requests.
- Multiple Organizers can manage the same organization.
- Pending requests do not grant access.
- Duplicate requests are prevented.
- Unauthorized users cannot approve requests.

### Executive membership
- Apply to an existing organization.
- Pending status is persisted.
- Organizer approves or rejects the request.
- Campaign assignment is available after approval.
- An Executive without assignments receives an appropriate empty state.
- Multiple Executives can work on the same campaign.
- An Executive can be assigned to multiple campaigns.
- Revoked assignments remove access.

### Campaign ownership
- Individual campaigns remain accessible to their original owners.
- Organizers manage their organization's campaigns.
- Executives cannot create organization campaigns.
- Executives cannot access unassigned campaigns.
- Organization IDs cannot be manipulated to bypass authorization.

### Existing functionality
- Sponsor discovery remains functional.
- Sponsor and contact persistence remain functional.
- Draft generation remains functional.
- Sending approval and deliverability checks remain functional.
- Replies and follow-ups remain correctly scoped.
- Analytics do not leak or double-count unrelated data.

### Regression checks
- Run the existing Vitest suite.
- Run TypeScript compilation checks.
- Run lint checks if configured.
- Run the production build.
- Test migration behavior using a safe test database or isolated environment.

The previously reported baseline was 18 passing Vitest suites and 159 passing tests. Verify the current repository rather than assuming those results are still valid.

Do not skip tests or weaken assertions to make the migration appear successful.

---

# 14. Recommended Implementation Sequence

Implement this in separate, reviewable phases.

### Phase 1: Schema and authorization design
- Inspect the current repository.
- Document the current data model.
- Design organization, membership, and campaign assignment relationships.
- Define individual versus organization campaign ownership.
- Define authorization rules.

### Phase 2: Database and membership foundations
- Add the minimum required schema changes.
- Add organization creation and search.
- Add membership request persistence.
- Add approval and rejection operations.
- Add campaign assignment persistence.
- Add authorization helpers.

### Phase 3: Onboarding
- Add one-time role selection.
- Add Organizer create/join organization flow.
- Add Executive profile and organization application flow.
- Preserve existing individual onboarding.
- Handle existing users safely.

### Phase 4: Organizer Dashboard
- Add organization overview.
- Add campaign management.
- Add member management.
- Add request approvals.
- Add Executive assignment and removal.

### Phase 5: Executive Dashboard
- Show assigned campaigns.
- Reuse existing sponsor, outreach, reply, follow-up, and analytics features.
- Enforce campaign-scoped access.
- Add an empty state for approved Executives without assignments.

### Phase 6: Data isolation across existing APIs
- Update repository queries and API authorization.
- Ensure every resource is scoped to its actual owner or authorized organization/campaign.
- Verify bulk operations and sending operations.
- Preserve existing business logic.

### Phase 7: Migration, regression tests, and rollout
- Validate migration safety.
- Run the full test suite and production build.
- Fix regressions before enabling the organizational model.
- Document deployment and migration steps.
- Provide a rollback strategy that does not delete new or existing user data.

Do not attempt to implement all phases through one uncontrolled schema rewrite. Keep changes incremental and reviewable.

---

# 15. Final Expected Outcome

After implementation, SponFy must support three public onboarding choices and one protected administrative role.

**Individual User**
- Continues using the existing independent campaign workflow.

**Organizer**
- Creates an organization or requests to join an existing organization.
- Manages organization campaigns and members after authorization.
- Approves or rejects Organizer and Executive membership requests.
- Assigns approved Executives to campaigns.
- Can collaborate with other Organizers.

**Executive**
- Applies to join an existing organization.
- Waits for Organizer approval.
- Gains access to assigned campaigns after approval and assignment.
- Uses the existing sponsorship workflow on those campaigns.
- Cannot independently create organization campaigns or access unassigned campaigns.

**Admin**
- Retains platform-level administrative authority.
- Is not selectable through public registration.
- Cannot be self-assigned through client requests.

The resulting application must support multiple organizations, multiple Organizers per organization, multiple Executives per organization, multiple Executives per campaign, and multiple campaign assignments per Executive.

Existing individual data and functionality must remain intact.

## Final instruction to Claude

First analyze the actual SponFy repository and produce a precise migration and implementation plan based on the existing schema. Identify the files, models, APIs, and authorization rules that need to change.

Then implement the work incrementally, validating each phase before proceeding.

Do not assume the existing architecture report is a substitute for source-code inspection. Do not claim the system is complete until the implementation, tests, and migration behavior have been verified.

Prioritize secure multi-tenant data isolation, backward compatibility, safe database migration, and preservation of all existing SponFy functionality.