# Angular Routing Guide

## Purpose

This document defines the required routing conventions for Angular applications in this repository.

It is written for both humans and AI agents.

The goal is to make routing:

- predictable
- scalable
- easy to reason about
- safe to refactor
- aligned with feature ownership

This guide is a routing contract, not a loose preference.

## Core Rule

Routes belong to the feature that owns the screen and business behavior.

Default routing flow:

```text
app.routes.ts -> shell/layout route -> feature.routes.ts -> page component
```

Do not centralize all routes into one giant file as the application grows.

## Routing Principles

1. Keep app-level routing thin.
2. Let each major feature own its own route definitions.
3. Lazy load major features by default.
4. Keep route-level components in `pages/`.
5. Keep guards, resolvers, and route providers close to the routes they support.
6. Prefer explicit, shallow, readable URL structures.
7. Keep route configuration declarative and free of business logic.

## Recommended Files

Use this structure:

```text
src/
  app/
    app.routes.ts
    shell/
    features/
      orders/
        pages/
        routes/
        orders.routes.ts
```

Recommended responsibilities:

- `app.routes.ts`: top-level composition only
- `feature-name.routes.ts`: feature-owned route definitions
- `routes/`: optional route helpers for complex features

## App-Level Routing

`app.routes.ts` should define:

- root redirects
- shell selection
- public vs authenticated route trees
- top-level lazy feature entry points
- global fallback routes

`app.routes.ts` must not become:

- a dumping ground for every child route in the app
- the place where feature internals are defined
- the place for domain-specific guards/resolvers that belong to one feature

Example:

```ts
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/layouts/app-layout/app-layout.component').then(
        (m) => m.AppLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then((m) => m.ordersRoutes),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./shell/layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.authRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
```

## Feature Routing

Every major feature should own its route tree.

Preferred:

```text
features/
  orders/
    pages/
      orders-list-page.component.ts
      order-detail-page.component.ts
    orders.routes.ts
```

Example:

```ts
import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-list-page.component').then(
        (m) => m.OrdersListPageComponent
      ),
  },
  {
    path: ':orderId',
    loadComponent: () =>
      import('./pages/order-detail-page.component').then(
        (m) => m.OrderDetailPageComponent
      ),
  },
];
```

Rules:

- feature routes should live with the feature
- route entry components should be page components
- child components used inside pages should stay in `components/`
- do not place feature pages directly in `app.routes.ts`

## Simple vs Complex Feature Routes

Small feature:

```text
features/
  profile/
    profile.routes.ts
    profile-page.component.ts
```

Large feature:

```text
features/
  billing/
    pages/
    routes/
      billing-permissions.guard.ts
      invoice.resolver.ts
    billing.routes.ts
```

Rule:

- start simple
- add a `routes/` folder only when route concerns become complex enough to justify it

## Standalone Angular Routing

Prefer standalone route configuration patterns.

Recommended:

- use `loadComponent` for page-level components
- use `loadChildren` for feature route trees
- keep app-wide providers in `app.config.ts`
- keep route-local providers close to the route definition

Do not overuse eagerly imported route components in large applications.

## Lazy Loading

Major features should be lazy loaded by default.

Lazy load when:

- the route represents a major product area
- the feature has multiple screens
- the feature is not required for first paint

Avoid lazy loading only when:

- the route is tiny and always needed immediately
- the app is intentionally small and the extra split adds little value

Preferred:

```ts
{
  path: 'orders',
  loadChildren: () =>
    import('./features/orders/orders.routes').then((m) => m.ordersRoutes),
}
```

Rules:

- lazy load by feature, not by random internal component
- keep route boundaries aligned with feature ownership

## URL Design

URLs should be stable, readable, and domain-oriented.

Good:

- `/dashboard`
- `/orders`
- `/orders/:orderId`
- `/settings/profile`

Bad:

- `/app-page-1`
- `/module-x/view-y`
- `/orders-page`
- `/go-to-user-settings`

Rules:

- use kebab-case for static URL segments
- use domain language
- keep nesting shallow unless hierarchy is real
- avoid exposing implementation details in URLs

## Nested Routes

Use nested routes only when the UI genuinely has nested route composition.

Good use cases:

- settings areas with child sections
- authenticated shell with many child features
- detail screens with tab-like route sections

Avoid deep nesting just to mirror folder depth.

Example:

```ts
export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings-page.component').then(
        (m) => m.SettingsPageComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile-settings-page.component').then(
            (m) => m.ProfileSettingsPageComponent
          ),
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./pages/security-settings-page.component').then(
            (m) => m.SecuritySettingsPageComponent
          ),
      },
    ],
  },
];
```

## Shell And Layout Routes

Use shell/layout routes to separate high-level application frames.

Typical shells:

- authenticated app shell
- public/auth shell
- admin shell if truly distinct

Rules:

- layout concerns belong in shell routes
- business screens belong in features
- do not embed large layout decisions inside feature route files

## Guards

Place guards close to the scope they protect.

Use app/core guards for:

- authentication
- global access rules
- app-wide bootstrap checks

Use feature-local guards for:

- feature permissions
- feature-specific route access
- domain rules tied to one feature

Example:

```text
app/
  core/
    auth/
      auth.guard.ts

features/
  billing/
    routes/
      billing-access.guard.ts
```

Rules:

- use guards for access control, not for data loading
- keep guard logic focused
- do not put complex business workflows inside guards

## Resolvers

Resolvers are optional and should be used deliberately.

Use resolvers when:

- the route should not activate before required data exists
- a route-level dependency must be prepared before render

Avoid resolvers when:

- normal page-level loading UX is acceptable
- the data can load naturally after activation
- resolver usage would hide too much app behavior

Rules:

- keep resolvers close to the route that uses them
- use resolvers for true pre-activation needs, not routine page fetches

## Route Providers

Provide route-scoped services only when that route tree should own them.

Good use cases:

- feature-local facades
- feature-specific stores
- temporary route-scoped orchestration services

Example:

```ts
{
  path: '',
  providers: [OrdersFacade],
  loadComponent: () =>
    import('./pages/orders-list-page.component').then(
      (m) => m.OrdersListPageComponent
    ),
}
```

Rules:

- prefer route-scoped providers for feature-local state when appropriate
- keep global singletons in `core`
- do not over-promote feature providers to app-wide scope

## Redirects And Fallbacks

Use redirects intentionally.

Recommended:

- one default redirect per route subtree when needed
- one global wildcard fallback at app level

Example:

```ts
{
  path: '',
  pathMatch: 'full',
  redirectTo: 'dashboard',
}
```

Rules:

- always include `pathMatch: 'full'` for empty-path redirects
- avoid redirect chains
- keep not-found behavior simple and explicit

## Route Data

Use route `data` only for simple declarative metadata.

Good uses:

- page title keys
- breadcrumb labels
- permission flags
- layout hints

Avoid putting executable logic or large configuration objects in route data.

Example:

```ts
{
  path: ':orderId',
  data: {
    title: 'Order Detail',
    breadcrumb: 'Order Detail',
  },
  loadComponent: () =>
    import('./pages/order-detail-page.component').then(
      (m) => m.OrderDetailPageComponent
    ),
}
```

## Naming Conventions

- use `app.routes.ts` for root routes
- use `feature-name.routes.ts` for feature routes
- use `*.guard.ts` for guards
- use `*.resolver.ts` for resolvers
- use kebab-case for folder names

Examples:

- `orders.routes.ts`
- `auth.guard.ts`
- `invoice.resolver.ts`

## Testing Routing

Test routing at the right level.

Recommended:

- unit test guards and resolvers
- integration test route activation where behavior matters
- avoid over-testing simple route declarations unless they carry critical logic

Rules:

- test access control behavior
- test redirect behavior when important
- test route-dependent initialization when the route contract is meaningful

## Anti-Patterns

Avoid these patterns.

### Giant Central Route File

```text
app.routes.ts
```

containing every route in the app is a scaling problem.

Why it fails:

- breaks feature ownership
- makes route changes risky
- grows unreadable quickly

### Feature Routes Defined In App Root

Why it fails:

- weakens boundaries
- couples app composition to feature internals
- makes lazy loading less clean

### Guards Doing Data Fetching

Why it fails:

- mixes access control with data orchestration
- obscures startup behavior
- makes navigation logic harder to reason about

### Deep URL Nesting Without Real Hierarchy

```text
/app/settings/user/profile/edit/details
```

Why it fails:

- weak usability
- fragile route trees
- unnecessary complexity

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular routing:

1. Keep `app.routes.ts` thin and composition-focused.
2. Put feature routes inside the owning feature.
3. Use `feature-name.routes.ts` at the feature root by default.
4. Lazy load major features with `loadChildren`.
5. Use `loadComponent` for standalone page components.
6. Put route entry components in `pages/`.
7. Keep guards and resolvers close to the route scope they belong to.
8. Use route-scoped providers for feature-local state only when appropriate.
9. Keep URL segments domain-oriented and readable.
10. If uncertain, let the feature own the route instead of centralizing it.

## Decision Matrix

| Need | Preferred location |
| --- | --- |
| App root route composition | `app/app.routes.ts` |
| Feature route tree | `features/<feature>/<feature>.routes.ts` |
| Complex feature guard/resolver | `features/<feature>/routes/` |
| Global auth guard | `app/core/auth/` |
| Route entry screen | `features/<feature>/pages/` |
| Layout shell route | `app/shell/` or `app.routes.ts` composition |

## Recommended Example

```text
src/
  app/
    shell/
      layouts/
        app-layout/
          app-layout.component.ts
        auth-layout/
          auth-layout.component.ts
    features/
      orders/
        pages/
          orders-list-page.component.ts
          order-detail-page.component.ts
        routes/
          order-detail.resolver.ts
        orders.routes.ts
      auth/
        pages/
          login-page.component.ts
        auth.routes.ts
    app.routes.ts
```

## Final Standard

An Angular routing setup is compliant in this repository if:

- app-level routing stays thin
- feature routes are owned by the feature
- route entry screens live in `pages/`
- lazy loading aligns with feature boundaries
- guards, resolvers, and route providers stay close to the routes they support
- URLs remain readable and domain-oriented

If changing a route requires understanding unrelated feature internals, the routing structure is not yet strong enough.
