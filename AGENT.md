# AGENT.md

This repository is a Laravel + Inertia + React monolith intended to evolve into a multi-tenant SaaS product.

Any agent or engineer working in this codebase must follow the rules below.

## Product Direction

- This is a monolithic SaaS application.
- Multiple tenants will exist.
- Each tenant is expected to have isolated data boundaries.
- Security, auditability, and maintainability are higher priority than fast hacks.

## Core Engineering Principles

### `SOLID`

- `S` Single Responsibility Principle:
  - A file, class, hook, component, or service should do one job well.
  - Do not create giant files that mix routing, UI, persistence, permissions, and business rules.
- `O` Open/Closed Principle:
  - Extend behavior via composition, module boundaries, config objects, policies, services, and reusable UI primitives.
  - Avoid rewriting stable shared code for one-off cases.
- `L` Liskov Substitution Principle:
  - Shared contracts must remain predictable.
  - Reusable components and services must not silently change expected behavior for existing callers.
- `I` Interface Segregation Principle:
  - Prefer narrow props, small DTOs, focused hooks, and minimal service contracts.
  - Do not pass huge generic objects when only 2-3 fields are needed.
- `D` Dependency Inversion Principle:
  - Business logic should depend on abstractions and services, not raw browser storage or UI events.
  - Persistence logic belongs in backend services/repositories or explicit frontend data-access layers, not inside presentational components.

### `DRY`

- Do not duplicate business logic across pages, forms, widgets, or controllers.
- Extract shared validation, formatting, and tenant-scoping rules into reusable modules.
- Do not copy filtered data into multiple stores when it can be derived from one canonical source.
- Reuse shared UI primitives and domain services before creating new variants.

### `KISS`

- Prefer the simplest solution that is correct, secure, and maintainable.
- Avoid fake abstractions, premature microservices, and unnecessary client-only state machines.
- Prefer explicit Laravel routes, controllers, Form Requests, policies, actions, and small React modules over clever indirection.

### `Performance and Collections`

- Prefer official Laravel collections, query builder, eager loading, cursor iteration, `chunkById`, `lazy`, and `cursorPaginate` where they fit the access pattern.
- Prefer core PHP arrays / loops / strict comparisons in hot paths when they are measurably simpler or faster than collection chaining.
- Avoid N+1 queries by default.
- Push filtering, aggregation, sorting, and pagination to the database when the dataset is not trivially small.
- Prefer immutable DTO/value-object style transformations for complex response shaping.
- Use the latest stable Laravel 12/13 syntax and framework APIs available in the installed version.
- Never invent framework helpers or methods; prefer official documented Laravel methods and PHP standard library behavior.
- Use packages only when they reduce complexity materially and fit Laravel conventions; prefer first-party Laravel packages first.
- Treat DSA and asymptotic cost as real concerns for listing queries, schedule generation, ledger posting, and batch jobs.

## Architecture Rules

### Backend

- Laravel is the source of truth for:
  - authentication
  - authorization
  - tenant resolution
  - validation
  - persistence
  - audit logging
- Do not store business-critical records only in browser `localStorage`.
- Do not enforce permissions only on the frontend.
- All tenant-sensitive reads and writes must be scoped server-side.
- Controllers must stay thin.
- Models must stay lean; do not move orchestration-heavy business flows into Eloquent models.
- Complex business logic must live in dedicated application services, actions, strategies, domain helpers, or jobs.
- Validation must live in `FormRequest` classes, not inline controllers.
- Create and update flows should prefer a shared request + service path when the fields and rules are mostly the same.
- Inertia responses should be shaped intentionally through DTOs, transformers, or dedicated response builders instead of dumping raw model graphs.
- Do not let controller methods become orchestration hubs for storage, notifications, queue dispatch, logging, and external APIs.

### Frontend

- React pages should stay thin.
- The frontend is one shared codebase for two app surfaces:
  - `tenant`
  - `super-admin`
- Large screens must be split into:
  - page container
  - feature components
  - reusable UI primitives
  - hooks
  - typed domain helpers
- Do not add more monolithic config files like the current `entities.tsx`.
- New work should prefer domain-based folders, for example:
  - `resources/js/modules/customers/...`
  - `resources/js/modules/contracts/...`
  - `resources/js/modules/hr/...`
- Shared code should live in explicit shared locations such as:
  - `resources/js/shared/ui`
  - `resources/js/shared/lib`
  - `resources/js/shared/hooks`

### Frontend App Boundary Standard

- Treat `tenant` and `super-admin` as two application shells inside the same frontend codebase.
- They must share primitives, contracts, and reusable business components where appropriate.
- They must not duplicate shared UI or utility logic only because the navigation or module list differs.
- The default structure should be:
  - `resources/js/credit-wise/apps/tenant`
    - tenant-only navigation
    - tenant-only route registry
    - tenant-only app wiring
  - `resources/js/credit-wise/apps/super-admin`
    - super-admin-only navigation
    - super-admin-only route registry
    - super-admin-only app wiring
  - `resources/js/credit-wise/pages/tenant/...`
    - route pages for the tenant app
  - `resources/js/credit-wise/pages/super-admin/...`
    - route pages for the super-admin app
  - `resources/js/credit-wise/components/...`
    - reusable business components grouped by domain
  - `resources/js/credit-wise/shared/...`
    - reusable shared primitives, types, hooks, helpers, app-agnostic UI
- Use `apps/*` only for app-shell concerns:
  - navigation
  - route maps
  - app-specific visibility rules
  - app-specific composition
- Do not place general business components inside `apps/*`.
- Use `pages/tenant/*` and `pages/super-admin/*` for route-owned screens only.
- If a screen is conceptually the same between tenant and super-admin, prefer:
  - one shared component in `components/*`
  - thin route pages in each app that compose the shared component
- If a module exists only for one app surface, keep its page and navigation inside that app boundary, but still reuse shared primitives and domain widgets.
- Current direction:
  - tenant app owns the operational CreditWise modules already visible in the current sidebar
  - super-admin app owns landlord/control-plane modules such as pricing, tenants, subscriptions, support access, rollout control, and cross-tenant oversight
- Do not create separate duplicate folder trees like `shared/components`, `components/shared`, `pages/shared`, `common/components`, etc.
- Prefer one obvious home:
  - app shell logic -> `apps/*`
  - route pages -> `pages/*`
  - domain/business components -> `components/*`
  - cross-app shared code -> `shared/*`
- Frontend architecture rules for this shared-codebase model:
  - route pages stay thin
  - navigation metadata stays centralized
  - vendor wrappers stay centralized
  - app boundaries stay explicit
  - shared contracts stay framework-safe and app-agnostic where possible
  - no frontend README files should be used as architecture source of truth; `AGENT.md` is the canonical instruction file

### Frontend Stack Standard

- The frontend stack must follow these standards consistently across all new work and refactors:
  - icons -> `lucide-react`
  - UI primitives -> `shadcn/ui`
  - styling -> `Tailwind CSS`
  - global styling -> shared global CSS tokens/utilities only through `resources/css/app.css` and the shared CreditWise stylesheet imports it owns
  - tables -> `TanStack Table` with `shadcn` table primitives
  - forms -> Inertia `useForm`
  - validation -> Laravel backend validation through `FormRequest` classes
  - toasts -> `sonner`
  - charts -> `recharts`
  - date handling -> `date-fns`
  - date picker -> `shadcn` `Calendar`
- Do not introduce parallel UI kits, icon packs, table libraries, chart libraries, form libraries, or date libraries without a strong documented reason.
- Prefer one frontend implementation path:
  - icons come from `lucide-react`
  - buttons, dialogs, dropdowns, inputs, switches, selects, tables, calendars, and related primitives come from `shadcn/ui` wrappers in shared UI
  - global colors, spacing tokens, typography ramps, and utility overrides belong in the shared global stylesheet layer, not scattered ad-hoc page CSS
  - table behavior comes from `@tanstack/react-table`
  - page-level form submission uses Inertia `useForm`
  - server validation errors come from Laravel and should be rendered directly in the UI contract
  - toast notifications use `sonner`
  - analytical charts use `recharts`
  - date parsing, formatting, and manipulation use `date-fns`
- Avoid:
  - `Formik`
  - `React Hook Form`
  - `MUI`
  - `Ant Design`
  - `Chart.js`
  - `Moment.js`
  - ad-hoc handcrafted table state when `TanStack Table` is the correct fit
  - random per-page CSS files or inline visual systems that bypass the shared Tailwind/global-style contract
- If an existing screen still uses older local patterns, new changes should move it toward this standard instead of expanding the inconsistency.
- Shared wrappers should be preferred where they exist, so feature code depends on local shared primitives instead of vendor imports spread everywhere.

### Routing

- Use one routing strategy consistently.
- Do not mix fake SPA shims and full-page navigation unless there is a documented migration plan.
- New routes should be explicit and testable.
- Laravel routes and Inertia are the only application routing contract.
- Do not add TanStack Router, React Router, router shims, or file-route declarations.
- Use `resources/js/credit-wise/shared/navigation` for Inertia links and programmatic visits.
- React root state must survive Vite HMR; never create a second root for the same Inertia mount element.

### Frontend Migration Boundaries

- `EntityPage` is a compatibility renderer for existing config-driven screens, not the default for new route pages.
- `LegacyEntityRoute` and `createLegacyEntityRoutePage` exist only to migrate current config-driven screens safely.
- Do not use legacy entity route factories for new screens.
- New production routes must use dedicated, thin page components with feature-owned components and types.
- Do not add new configs to `lib/entities/_legacy-core.tsx`; move touched configs toward their owning feature.
- Shared table, toolbar, pagination, and form primitives belong under `shared/ui`.
- Remove mixed-era router, page, and config code once no active route imports it.

## Backend Modular Monolith Standard

- This codebase should follow a `modular monolith` backend architecture.
- Use one codebase, one deployable Laravel app, and clear business modules.
- Backend module ownership should be split conceptually into two top-level application spaces:
  - `app/Modules/Tenant`
  - `app/Modules/SuperAdmin`
- Each domain should have a dedicated module boundary, for example:
  - `app/Modules/Tenant/Customers`
  - `app/Modules/Tenant/Contracts`
  - `app/Modules/Tenant/Payments`
  - `app/Modules/Tenant/Inventory`
  - `app/Modules/Tenant/HR`
  - `app/Modules/Tenant/Accounts`
  - `app/Modules/Tenant/Reports`
  - `app/Modules/Tenant/Support`
  - `app/Modules/SuperAdmin/Pricing`
  - `app/Modules/SuperAdmin/Tenants`
  - `app/Modules/SuperAdmin/Subscriptions`
  - `app/Modules/SuperAdmin/SupportAccess`
- Shared cross-cutting concerns should live under explicit shared namespaces, for example:
  - `app/Shared/Tenancy`
  - `app/Shared/Media`
  - `app/Shared/Logging`
  - `app/Shared/Notifications`
  - `app/Shared/Queueing`
  - `app/Shared/Support`

### Backend App Boundary Standard

- `Tenant` modules are for operational business domains that run inside tenant context.
- `SuperAdmin` modules are for landlord / control-plane concerns only.
- Do not mix landlord orchestration with tenant operational modules in the same domain folder.
- Future backend modules should follow:
  - tenant-facing business domain -> `app/Modules/Tenant/<Domain>`
  - super-admin / landlord control-plane domain -> `app/Modules/SuperAdmin/<Domain>`
- `app/Modules/Tenant/*` is the canonical home for tenant business modules.
- New code must not introduce flat top-level tenant business modules directly under `app/Modules`.
- `app/Modules/SuperAdmin` may start sparse and grow only when landlord features are actually implemented.

### Suggested Module Shape

- A typical module may contain:
  - `Actions/`
  - `Data/` or `DTOs/`
  - `Enums/`
  - `Events/`
  - `Exceptions/`
  - `Http/Controllers/`
  - `Http/Requests/`
  - `Jobs/`
  - `Listeners/`
  - `Models/`
  - `Notifications/`
  - `Observers/`
  - `Policies/`
  - `Queries/`
  - `Services/`
  - `Strategies/`
  - `Traits/`
  - `ValueObjects/`

## Inertia Data Contract Rules

- Inertia props are part of the application contract and must be treated deliberately.
- Send only the fields needed by the page.
- Prefer dedicated prop builders, DTOs, API resources, or view models when payloads become non-trivial.
- Do not pass entire model trees when a summary shape is enough.
- Every Inertia page should receive:
  - explicit page data
  - explicit filters/sorts where relevant
  - explicit permission flags derived on the server
  - tenant-safe identifiers only
- For reusable pages, prefer a stable prop contract such as:
  - `mode` = `create` or `edit`
  - `entity`
  - `meta`
  - `options`
  - `permissions`
- Route parameters and page props must stay consistent and testable.

## Form Request and Create/Update Standard

- Prefer one shared form for create and update when the business shape is the same.
- Prefer one `FormRequest` class when the validation rules are materially the same.
- Differentiate create vs update through:
  - route model binding
  - optional entity id
  - conditional unique rules
  - service-layer branching
- Recommended pattern:
  - controller receives request
  - request validates and authorizes
  - service/action handles create or update
  - controller returns resource or inertia response
- Example rule:
  - if id exists, update the existing record
  - if id does not exist, create a new record
- Unique validation rules must ignore the current model on update.
- Do not duplicate create and update validation logic unless the workflows are genuinely different.

## Approved Design Patterns

Use patterns deliberately. Do not add them as ceremony without a concrete need.

### `Service Pattern`

- Default pattern for application/business orchestration.
- Use services for:
  - transactional workflows
  - external integrations
  - reusable business operations
  - multi-step create/update flows

### `Factory Pattern`

- Use factories for:
  - creating strategy/integration clients
  - building DTOs/value objects with non-trivial setup
  - selecting gateway implementations
- Do not use factories for simple `new` statements that add no value.

### `Singleton Pattern`

- Use sparingly.
- Only for framework-managed shared infrastructure where a singleton lifetime is intentional.
- Prefer Laravel container bindings over ad-hoc static singletons.

### `Dependency Injection (DI)`

- Default approach for controllers, services, listeners, jobs, and console commands.
- Depend on interfaces or small concrete services with clear responsibilities.
- Avoid manual service location and hidden globals.

### `Strategy Pattern`

- Use for runtime-swappable business behavior, for example:
  - payment gateways
  - WhatsApp/SMS providers
  - storage backends
  - tenant provisioning methods
  - pricing/commission algorithms

### `Adapter Pattern`

- Use around external APIs so the app depends on internal contracts, not vendor-specific payload shapes.
- Required for:
  - payment gateways
  - WhatsApp APIs
  - SMS providers
  - cloud storage providers

### `Observer Pattern`

- Use for model lifecycle hooks only when the side effect is tightly coupled to model changes.
- Avoid hiding critical business orchestration inside observers when explicit actions or events would be clearer.

### `Event Driven Pattern`

- Use domain events for decoupled side effects such as:
  - notifications
  - audit trails
  - projections
  - sync integrations
  - analytics
- Important business actions should emit explicit events.

### `Command Pattern`

- Use actions/jobs/commands for discrete business operations.
- Prefer command-style classes for write operations that must be testable and reusable.

### `Facade Pattern`

- Laravel facades are acceptable for framework infrastructure.
- Do not hide core business logic behind custom facades when DI and services would be clearer.

## Multi-Tenant Database Standard

- PostgreSQL is the default database target for this product.
- The intended model is:
  - one codebase
  - one application domain
  - multiple tenants
  - per-tenant database isolation
- Tenant login must resolve the active tenant and switch to the correct tenant database centrally.
- Tenant database switching must never be handled in controllers or frontend logic.
- Maintain a landlord database for:
  - tenants
  - domains
  - subscriptions/plans
  - provisioning metadata
  - super-admin users
  - global users if needed
  - integration registry if needed
- Tenant databases should store tenant-owned operational data.
- Every queue job, event, notification, export, and cache key that depends on tenant data must carry tenant context.

## Super Admin / Landlord Control Plane

- The system should include a `super-admin` control plane separated conceptually from tenant application space.
- Super-admin capabilities should be managed from the landlord side, not from individual tenant databases.
- The super-admin area is responsible for:
  - tenant onboarding and provisioning
  - subscription and plan management
  - billing/subscription status visibility
  - tenant metadata management
  - domain mapping and activation state
  - support tooling
  - high-level operational visibility
  - controlled tenant assistance workflows
- Super-admin users must not rely on ad-hoc direct tenant access.
- Any support access into tenant context must be:
  - explicit
  - auditable
  - permission-controlled
  - time-bounded where appropriate
- Landlord data and tenant operational data must remain clearly separated.
- Super-admin flows should never weaken tenant isolation guarantees silently.

## Multi-Tenancy Rules

- Assume tenant isolation is a hard requirement.
- Prefer a design where every request resolves the active tenant before any business query runs.
- If using separate databases per tenant:
  - tenant connection switching must happen centrally
  - migrations must be tenant-safe
  - jobs, queues, cache keys, and exports must carry tenant context
- Never rely on the frontend to choose which tenant data is allowed.

## Cache, Queue, and Job Standard

- Redis should be used for:
  - cache
  - queues
  - short-lived locks
  - concurrency coordination where needed
- Database-backed records should still exist for operational visibility where required.
- Use a hybrid approach:
  - Redis for fast execution/runtime concerns
  - database for durable job history, auditability, retries, and reporting
- Failed jobs must always be recorded durably.
- Successful jobs should also be recorded when the workflow is business-critical, externally integrated, auditable, or support-sensitive.
- Retry history must remain inspectable.
- Recommended persistence concerns:
  - job name
  - tenant id / tenant key
  - payload reference, not unnecessary raw sensitive payloads
  - status
  - attempts
  - started at
  - finished at
  - failure reason
  - correlation / trace id
- Long-running or externally integrated jobs must be idempotent.
- Use distributed locks for workflows that must not execute concurrently for the same aggregate or tenant.
- Concurrency context must always be considered for:
  - payment posting
  - ledger updates
  - stock mutations
  - schedule generation
  - tenant provisioning
  - media processing

## Logging and Audit Standard

- The system must have structured logging.
- Important application flows should include correlation identifiers.
- Tenant context must be included in logs where applicable.
- External integration calls should be loggable without leaking secrets.
- Keep separate concern boundaries between:
  - application logs
  - audit logs
  - job execution logs
  - integration logs
- Financial, HR, auth, and tenant-switching actions should be audit-friendly by default.

## Security Rules

- No sensitive authorization decision may rely only on client state.
- Validate and authorize every mutation on the server.
- Escape or sanitize any user-generated content before rendering into raw HTML, print windows, exports, or email templates.
- Avoid `document.write`, unchecked HTML injection, and ad-hoc browser persistence for sensitive data.
- Financial and HR data must be treated as confidential by default.
- External credentials, tokens, secrets, and API keys must be stored securely and never hardcoded.
- File access, uploads, webhooks, and third-party callbacks must be validated and logged.

## Roles and Permissions Standard

- The access-control model should support:
  - one user having one primary role
  - one role having multiple permissions
- Role assignment and permission checks must be enforced on the backend.
- Frontend permission flags are for UX only, not for trust.
- Prefer a permission-based model over hardcoding role names inside UI/business logic.
- Recommended structure:
  - `users`
  - `roles`
  - `permissions`
  - `role_permission`
  - user linked to one role directly, or via a tenant-aware membership table if needed later
- Permission naming should be explicit and action-based, for example:
  - `customers.view`
  - `customers.create`
  - `customers.update`
  - `customers.delete`
  - `contracts.approve`
  - `reports.export`
  - `settings.manage`
- Backend rules:
  - every protected route/action must check permission or policy
  - controllers should call policies/authorizations, not inline role strings
  - Inertia pages may receive a compact `permissions` object for rendering actions safely
- If the product later needs multiple roles per user, the design should be extensible, but current default is:
  - single role
  - multiple permissions

## Module Lifecycle and Navigation Badges

- New modules or recently released modules may show a sidebar badge such as `New`.
- Partially released or limited-stability modules may show a badge such as `Beta`.
- These badges must be driven by configuration/metadata, not hardcoded ad-hoc inside the sidebar markup.
- Recommended navigation shape per item:
  - `label`
  - `href`
  - `icon`
  - `permission`
  - `featureFlag` if needed
  - `statusBadge` with values such as `new`, `beta`, or `none`
- Example use cases:
  - newly released module -> `new`
  - soft-launched module -> `beta`
  - stable module -> no badge
- Badge visibility rules should be controlled from one central navigation/module registry.
- If feature flags exist, badge state may depend on:
  - tenant plan
  - release stage
  - branch rollout
  - explicit feature enablement
- Frontend should only render the badge state passed from trusted config/server-aware module definitions.
- Do not scatter release-label logic across many components.

## Data Rules

- Every important entity should have:
  - stable primary key
  - timestamps
  - tenant identifier or tenant-bound connection
  - audit-friendly lifecycle fields where needed
- Derived views must be derived from canonical records, not duplicated into parallel stores unless there is a strong operational reason.
- Prefer transactions for write flows that touch multiple tables or side effects.
- Money, ledger, inventory, and installment workflows must be modeled with correctness first, not convenience first.

## Integrations Standard

- All external providers must be wrapped behind internal interfaces.
- Payment gateways, WhatsApp APIs, SMS APIs, storage drivers, and other vendors must use adapter/strategy-based integrations.
- Provider-specific request/response mapping must not leak through the app.
- Webhook processing must be:
  - verified
  - idempotent
  - logged
  - tenant-aware where applicable

## Feature Flag Standard

- Use `Laravel Pennant` as the default feature flag system for this application.
- Pennant should be used for:
  - controlled module rollout
  - `New` and `Beta` feature release management
  - tenant-specific feature enablement
  - plan-based feature access where feature gating is needed in addition to authorization
  - gradual rollout and controlled exposure
- Roles/permissions and feature flags are separate concerns:
  - permissions decide what a user is allowed to do
  - feature flags decide whether a feature/module is enabled
- Do not use feature flags as a replacement for authorization.
- Prefer central feature definitions and tenant-aware scope resolution.
- If a sidebar item or module badge depends on release stage, it should read from canonical module metadata and, where needed, Pennant-backed feature state.

## Storage and Media Standard

- Object storage may be backed by:
  - Cloudflare-compatible storage
  - S3-compatible storage
  - Laravel filesystem drivers
- Storage selection must be abstracted behind Laravel disks and internal services.
- File/media upload logic must not be duplicated across controllers.
- Shared upload behavior should be extracted into:
  - a reusable service
  - an action
  - or a carefully scoped trait when the behavior is truly cross-cutting
- Traits are allowed for small reusable behavior, but not as a dumping ground for business logic.
- Prefer services/actions over traits when state, dependencies, or orchestration are involved.

## Change Rules

- Before adding new code, check whether the behavior belongs in an existing domain module.
- Before creating a new component or helper, check whether a shared primitive already exists.
- If a file is already too large, split it before expanding it further.
- Prefer adding tests when changing:
  - permissions
  - calculations
  - tenant scoping
  - routing
  - financial flows
  - HR flows

## Naming and Structure

- Use clear, domain-based names.
- Avoid generic names like `utils2`, `finalData`, `tempHook`, `newPage`.
- Keep file casing and folder conventions consistent.
- Prefer one obvious home for each feature.
- Shared helpers such as upload handling, media naming, audit stamping, and reusable query filters should be centralized instead of copied.
- Navigation metadata, module labels, permissions, and release badges should have one canonical source.

## Review Standard

Every meaningful change should be evaluated against:

1. Is it tenant-safe?
2. Is it enforced on the server?
3. Does it reduce or increase coupling?
4. Does it keep responsibilities small and clear?
5. Does it duplicate logic?
6. Is there a simpler correct approach?
7. Is concurrency or idempotency relevant here?
8. Is the integration/provider coupling contained?
9. Is the logging/audit trail sufficient?

## Default Bias

- Bias toward maintainable monolith patterns.
- Bias toward PostgreSQL-ready relational modeling.
- Bias toward explicitness over magic.
- Bias toward server truth over browser truth.
- Bias toward modular refactoring over adding more code into existing large files.
- Bias toward thin controllers and thin models.
- Bias toward services, requests, events, jobs, and explicit contracts for non-trivial flows.

## Laravel Official Features (Mandatory Evaluation)

- Before introducing custom solutions, evaluate whether the requirement can be solved using official Laravel features first.
- Preferred evaluation order:
  - authentication -> `Sanctum`, `Fortify`, `Passport`
  - authorization -> `Policies`, `Gates`
  - realtime -> `Reverb`
  - search -> `Scout`
  - billing -> `Cashier`
  - queues -> `Horizon`
  - monitoring -> `Pulse`
  - feature flags -> `Pennant`
  - debugging -> `Telescope`
  - testing -> `Pest`, `PHPUnit`, `Dusk`
  - validation -> `Form Requests`, `Precognition`
  - notifications -> `Laravel Notifications`
  - mail -> `Mailables`
  - scheduling -> `Laravel Scheduler`
  - storage -> `Filesystem`
  - concurrency -> `Laravel Concurrency`
  - context -> `Laravel Context`
- Always prefer official Laravel solutions first unless there is a clear technical reason not to.

## Database Standards

- Default database is `PostgreSQL`.
- Always evaluate:
  - proper indexes
  - composite indexes
  - foreign key constraints
  - unique constraints
  - partial indexes when useful
  - soft deletes only when they have real business value
- For large datasets prefer:
  - `cursorPaginate`
  - `chunkById`
  - lazy collections
- Avoid:
  - loading entire tables into memory
  - offset pagination on huge datasets

## Transaction Rules

- Critical business workflows must use `DB::transaction()` when multiple writes must succeed or fail together.
- Examples include:
  - payments
  - subscriptions
  - wallet updates
  - invoices
  - payroll
  - inventory adjustments
  - tenant provisioning

## Event Driven Architecture

- Important business actions should emit explicit domain events.
- Examples:
  - `UserRegistered`
  - `SubscriptionActivated`
  - `InvoicePaid`
  - `PaymentFailed`
  - `TenantCreated`
  - `FileUploaded`
  - `TeamMemberInvited`
- Use listeners for:
  - notifications
  - integrations
  - analytics
  - projections
  - audit logging

## Notification Standards

- Default notification channels:
  - database
  - mail
- Additional channels may include:
  - Slack
  - SMS
  - broadcast
- Notifications should be queued by default.

## Mail Standards

- Use:
  - Markdown mailables
  - queued mail
  - attachments
  - tags and metadata where supported
- Never send heavy email synchronously.

## Search Standards

- Search selection order:
  1. database search
  2. full-text search
  3. `Scout`
  4. vector search
- Vector search should only be used when semantic understanding is actually required.
- Do not use AI search for simple filtering.

## API Standards

- Every API should include:
  - validation
  - authorization
  - API resources
  - pagination
  - rate limiting
  - error handling
  - request logging
- Response shape should remain consistent across the application.

## Queue Standards

- Queue by default:
  - emails
  - notifications
  - reports
  - exports
  - imports
  - AI requests
  - external APIs
  - file processing
  - webhooks
- Jobs must define and consider:
  - retries
  - backoff
  - timeout
  - failed-job handling
  - Horizon monitoring
- Jobs must be idempotent.

## Logging Standards

- Use structured logs.
- Every meaningful log should include when available:
  - tenant_id
  - user_id
  - request_id
  - correlation_id
- Never log:
  - passwords
  - tokens
  - secrets
  - payment credentials

## SaaS Recommended Stack

- Default stack:
  - latest stable Laravel
  - PostgreSQL
  - Redis
  - Sanctum
  - Horizon
  - Scout
  - Pennant
  - Pulse
  - Reverb
  - Telescope
  - Cashier
  - Spatie Permission when it fits the authorization model
  - Filament where an internal admin surface is justified
  - Scramble for API documentation where useful
- Do not replace these tools without clear justification.

## AI Agent Output Rules

- When generating production-ready code or implementation plans, include evaluation for:
  1. architecture decision
  2. database design
  3. migration
  4. models
  5. relationships
  6. validation
  7. policies
  8. services/actions
  9. events
  10. jobs
  11. notifications
  12. API resources
  13. routes
  14. tests
  15. performance considerations
  16. security considerations
- Do not stop at a partial implementation when a production-ready solution is explicitly expected.

## Final Decision Rule

- When multiple solutions exist, choose the one that is:
  1. official Laravel
  2. secure
  3. multi-tenant safe
  4. testable
  5. queue-friendly
  6. observable
  7. scalable
  8. maintainable
- Never choose a clever solution over a maintainable one.
