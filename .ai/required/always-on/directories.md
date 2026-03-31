# Angular Directory Structure Guide

## Purpose

This guide defines a scalable, production-grade Angular directory structure that both humans and AI agents must follow.

The goal is to make large Angular codebases:

- easy to navigate
- safe to change
- simple to test
- predictable for code generation
- resilient as teams and features grow

This is not a style suggestion. It is a structural contract.

## Core Principles

- Organize by business feature first, not by technical type.
- Keep dependencies flowing inward: feature code may use shared code, but shared code must not depend on features.
- Co-locate files that change together.
- Keep public APIs explicit with barrel files only where they improve boundaries.
- Prefer many small focused folders over large mixed-purpose folders.
- Make directory intent obvious enough that an AI agent can place a new file correctly without asking.

## High-Level Layout

```text
src/
  app/
    core/
    shared/
    features/
    shell/
    app.config.ts
    app.routes.ts
    main.ts
  assets/
  environments/
```

## Top-Level Rules

### `app/core`

Put singleton, application-wide infrastructure here.

Use `core` for:

- application bootstrap wiring
- auth/session management
- HTTP interceptors
- global error handling
- logging
- analytics
- app-level guards
- global configuration services
- API clients that are used across many domains

Rules:

- `core` must not contain feature UI.
- Services in `core` are typically singleton and provided once.
- `core` may depend on framework utilities and low-level shared primitives.
- `core` must not import from `features`.

Example:

```text
core/
  auth/
    auth.service.ts
    auth.store.ts
    auth.guard.ts
  http/
    api-client.service.ts
    auth.interceptor.ts
    error.interceptor.ts
  config/
    app-config.token.ts
    runtime-config.service.ts
  errors/
    global-error-handler.ts
```

### `app/shared`

Put reusable, stateless, cross-feature building blocks here.

Use `shared` for:

- reusable UI components
- directives
- pipes
- form helpers
- utility functions
- design-system pieces
- shared types and view models
- test helpers reused across multiple features

Rules:

- `shared` must be generic and reusable.
- `shared` must not contain domain-specific business logic.
- `shared` must not import from `features`.
- If a shared item becomes coupled to one domain, move it into that feature.

Example:

```text
shared/
  ui/
    button/
    dialog/
    page-header/
  forms/
    controls/
    validators/
  pipes/
  directives/
  utils/
  types/
  testing/
```

### `app/features`

Put product/domain functionality here.

Use `features` for:

- user-facing business capabilities
- feature routes
- feature-specific state
- domain services
- feature-specific components
- feature-specific models and adapters

Rules:

- Every major product capability gets its own feature folder.
- A feature owns its UI, domain logic, routes, tests, and state.
- Cross-feature reuse should be extracted only when reuse is real, stable, and generic.
- Features may depend on `shared` and `core` abstractions, but not on other features' internals.

Example:

```text
features/
  billing/
  dashboard/
  invoices/
  settings/
  users/
```

### `app/shell`

Put application frame and composition components here.

Use `shell` for:

- app layout
- top navigation
- side navigation
- route outlet wrappers
- authenticated vs public shells

Rules:

- `shell` coordinates feature rendering.
- `shell` should avoid owning business logic.
- Layout concerns belong here, not inside individual features.

Example:

```text
shell/
  layouts/
    app-layout/
    auth-layout/
  navigation/
    top-nav/
    side-nav/
```

## Recommended Feature Structure

Each feature should use the same internal layout when it is large enough to justify it.

```text
features/
  orders/
    components/
    pages/
    data-access/
    state/
    models/
    utils/
    routes/
    testing/
    orders.routes.ts
    index.ts
```

### Feature Folder Responsibilities

#### `pages`

Route-level containers for the feature.

Use for:

- route entry components
- orchestration of page state
- page composition

Rules:

- Pages may call facades or data-access services.
- Pages should contain minimal presentational markup beyond composition needs.

#### `components`

Feature-local presentational or narrowly scoped smart components.

Use for:

- lists
- cards
- filters
- tables
- dialogs used only by the feature

Rules:

- If a component is used only by one feature, keep it inside that feature.
- Promote to `shared` only after proven reuse.

#### `data-access`

Feature-specific API and transport logic.

Use for:

- HTTP calls
- backend DTO types
- request/response contracts

Rules:

- Keep backend-facing shapes separate from UI-facing models.
- UI components must not perform raw HTTP calls.
- Keep `data-access` transport-focused and minimal.
- Do not introduce `repositories/` or `mappers/` by default.

Suggested structure:

```text
data-access/
  api/
  dto/
```

#### `state`

Feature state management.

Use for:

- signals-based feature state
- facades

Rules:

- Keep state close to the feature that owns it.
- Do not create global state for strictly local page concerns.
- Expose a small API from state, not internal implementation details.

#### `models`

Feature-owned business models and types.

Use for:

- domain entities
- feature view models
- filter/sort contracts
- command/query types

Rules:

- Distinguish domain models from DTOs.
- Keep UI-only models separate if needed.

#### `routes`

Optional folder for route helpers when the feature has complex routing.

Use for:

- route constants
- resolvers
- route providers

If routing is simple, keep only `feature-name.routes.ts` at the feature root.

#### `utils`

Use only for small, feature-local helpers that do not fit better elsewhere.

Rules:

- Avoid dumping unrelated logic here.
- If code has a stronger identity, create a named folder instead.

#### `testing`

Feature-local test builders and mocks.

Use for:

- fixtures
- factories
- mocks
- testing utilities

Rules:

- Keep test support close to the feature it serves.
- Promote only broadly reused testing utilities to `shared/testing`.

## Small vs Large Features

Do not force deep nesting for small features.

Small feature:

```text
features/
  profile/
    profile-page.component.ts
    profile-form.component.ts
    profile.service.ts
    profile.routes.ts
```

Large feature:

```text
features/
  profile/
    pages/
    components/
    data-access/
    state/
    models/
    testing/
    profile.routes.ts
    index.ts
```

Rule:

- Start simple.
- Split into subfolders when file count, cognitive load, or ownership boundaries justify it.

## Recommended Naming Conventions

- Use kebab-case for directories.
- Use singular or plural consistently within a domain. Prefer domain nouns such as `orders`, `users`, `billing`.
- Name folders by role when the role is structural: `pages`, `components`, `models`, `state`.
- Name folders by domain when the role is business-specific: `auth`, `invoices`, `permissions`.

Examples:

- good: `features/order-history/pages`
- good: `shared/ui/data-table`
- bad: `features/misc`
- bad: `shared/common-stuff`
- bad: `components/shared-components`

## Dependency Rules

Allowed direction:

```text
app -> shell -> features -> shared
app -> core -> shared
features -> core
features -> shared
shell -> core
shell -> shared
```

Forbidden direction:

- `shared` importing from `features`
- `core` importing from `features`
- one feature importing another feature's internal files
- pages making direct backend calls that bypass `data-access`

If one feature needs another feature's functionality:

- prefer extracting a shared abstraction
- or expose a narrow public API from the owning feature
- never import deep internal files across feature boundaries

## Public API Boundaries

Use `index.ts` only for intentional public exports.

Rules:

- Barrel files are boundary tools, not convenience dumps.
- Export only what external consumers should use.
- Do not re-export private implementation details.
- Prefer one barrel per feature root or shared primitive package, not barrels everywhere.

Good:

```text
features/orders/index.ts
shared/ui/button/index.ts
```

Avoid:

```text
features/orders/components/index.ts
features/orders/components/table/index.ts
features/orders/components/table/cells/index.ts
```

## Standalone Angular Guidance

For modern Angular applications using standalone components:

- keep route definitions at the feature root with `feature-name.routes.ts`
- prefer feature-local providers where possible
- keep bootstrap and global providers in `app.config.ts`
- keep route composition in `app.routes.ts`

Suggested root files:

```text
app/
  app.config.ts
  app.routes.ts
  main.ts
```

## Lazy Loading and Route Ownership

Each major feature should own its routing and be lazy loaded when appropriate.

Example:

```text
features/
  reports/
    reports.routes.ts
    pages/
    components/
    data-access/
```

Rules:

- Route definitions belong to the feature they load.
- A feature route file should not become a dumping ground for business logic.
- Route guards, resolvers, and providers should stay close to the feature.

## State Placement Rules

Choose state location by scope.

- App-wide state goes in `core` only when it is truly global.
- Feature state goes in `features/<feature>/state`.
- Component-local state stays inside the component unless reuse or complexity justifies extraction.

Examples:

- current user session: `core/auth`
- orders filter state shared across order pages: `features/orders/state`
- one dialog open/close flag: local component state

## Assets and Environment Files

Use:

```text
src/
  assets/
  environments/
```

Rules:

- Keep static images, icons, mock JSON, and fonts in `assets`.
- Keep environment configuration isolated and minimal.
- Do not scatter runtime configuration files across feature folders unless the feature owns static assets specific to itself.

Feature-specific assets may live under:

```text
assets/features/orders/
```

Only do this when the assets are real static resources, not generated UI logic.

## Testing Layout

Place tests close to the code they validate unless the repo standard requires otherwise.

Recommended:

- `component.spec.ts` next to component
- `service.spec.ts` next to service
- feature fixtures in `features/<feature>/testing`
- shared test utilities in `shared/testing`

Rules:

- Integration helpers belong near the feature.
- Test data should follow the same domain boundaries as production code.

## Anti-Patterns

Avoid these structures:

### Type-Based Global Folders

```text
app/
  components/
  services/
  models/
  pages/
```

Why it fails:

- scales poorly
- hides domain ownership
- causes unrelated files to grow together
- makes AI placement ambiguous

### Fake Shared Buckets

```text
shared/
  helpers/
  common/
  misc/
```

Why it fails:

- unclear ownership
- encourages dumping unrelated code
- impossible to maintain clean boundaries

### Cross-Feature Internal Imports

```text
features/orders/components/order-table/order-table.component
```

imported directly by another feature is a violation.

Why it fails:

- breaks encapsulation
- creates fragile coupling
- blocks refactoring

## AI Agent Operating Rules

AI agents working in this repository must follow these rules:

1. Before creating a file, identify whether the code is `core`, `shared`, `shell`, or a specific `feature`.
2. Default to placing new business logic inside the owning feature.
3. Move code to `shared` only if it is reusable, generic, and not domain-coupled.
4. Do not create top-level folders such as `components`, `services`, or `utils` directly under `app` unless the repository already has a documented exception.
5. Prefer co-location over centralization.
6. Create or update a public `index.ts` only when defining an intentional boundary.
7. Do not import internal files across features.
8. Keep DTOs, API clients, and backend mapping out of UI component folders.
9. Keep route-level components in `pages`.
10. If uncertain, place code in the feature first and extract later.

## Decision Matrix For New Files

When adding code, use this placement logic:

| Code kind | Preferred location |
| --- | --- |
| App bootstrap config | `app/` or `core/config/` |
| Auth/session singleton | `core/auth/` |
| HTTP interceptor | `core/http/` |
| Generic button or dialog | `shared/ui/` |
| Feature page component | `features/<feature>/pages/` |
| Feature-only table/card/form | `features/<feature>/components/` |
| Feature API service | `features/<feature>/data-access/` |
| Feature facade/state | `features/<feature>/state/` |
| Domain entity or view model | `features/<feature>/models/` |
| Layout/navigation component | `shell/` |
| Cross-feature testing helper | `shared/testing/` |

## Recommended Example

```text
src/
  app/
    core/
      auth/
        auth.guard.ts
        auth.service.ts
        auth.store.ts
      http/
        api-client.service.ts
        auth.interceptor.ts
        error.interceptor.ts
      config/
        app-config.token.ts
        runtime-config.service.ts
    shared/
      ui/
        button/
          button.component.ts
          index.ts
        dialog/
          dialog.component.ts
          index.ts
      directives/
      pipes/
      forms/
      types/
      utils/
      testing/
    shell/
      layouts/
        app-layout/
          app-layout.component.ts
        auth-layout/
          auth-layout.component.ts
      navigation/
        top-nav/
          top-nav.component.ts
        side-nav/
          side-nav.component.ts
    features/
      orders/
        pages/
          orders-list-page.component.ts
          order-detail-page.component.ts
        components/
          orders-table.component.ts
          order-filters.component.ts
        data-access/
          api/
            orders-api.service.ts
          dto/
            order.dto.ts
        state/
          orders.facade.ts
        models/
          order.model.ts
          order-filter.model.ts
        testing/
          order.fixture.ts
        orders.routes.ts
        index.ts
      settings/
        pages/
        components/
        data-access/
        state/
        settings.routes.ts
    app.config.ts
    app.routes.ts
    main.ts
  assets/
  environments/
```

## Adoption Rules For Existing Repositories

When applying this guide to an existing codebase:

- do not reorganize everything at once
- migrate one feature at a time
- preserve public APIs during moves
- add path aliases only when they reinforce boundaries, not hide poor structure
- document exceptions explicitly

## Final Standard

If a directory does not clearly answer one of these questions, it is probably wrong:

- Is this global infrastructure?
- Is this generic shared code?
- Is this shell/layout composition?
- Is this owned by a specific business feature?

If ownership is unclear, the structure is not yet production-ready.
