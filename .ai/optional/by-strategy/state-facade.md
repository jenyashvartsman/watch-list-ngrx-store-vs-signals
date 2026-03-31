# Angular State Facade Guide

## Purpose

This document defines the required facade pattern for Angular feature state in this repository.

It is written for both humans and AI agents.

The goal is to make feature state:

- predictable
- testable
- easy to consume from components
- resilient to implementation changes
- scalable across large applications

This guide is a state-management contract, not a loose architectural preference.

## Architecture Rule

In this repository, the feature state flow is:

```text
component -> facade -> data-access/api
```

There is no separate store layer in this pattern.

If feature state is needed, it is owned inside the facade, with signals preferred as the default.

Components must not call APIs directly.
Assume `data-access` API methods return RxJS observables.

## What A Facade Is

A facade is the public state and orchestration API for a feature.

It sits between:

- Angular pages/components
- feature data-access services
- feature-local state held inside the facade when needed

A facade exposes a small, stable surface such as:

- read-only state signals
- derived view state
- imperative commands for user actions

The facade hides API orchestration and internal state details from UI consumers.

## Why Use A Facade

Without a facade, components often become coupled to:

- raw API services
- API calls in page components
- duplicated loading and error handling
- repeated mapping and orchestration logic

A facade solves this by:

- centralizing feature workflows
- simplifying component code
- making state easier to test
- allowing API orchestration to evolve without breaking the UI

## Scope

Use facades for feature-level state and orchestration.

Recommended location:

```text
features/
  orders/
    state/
      orders.facade.ts
```

Do not use facades for:

- trivial component-local toggles
- one-off presentational components
- purely stateless views with no orchestration

## Core Principles

1. Every non-trivial feature should expose one primary facade.
2. Components should consume the facade, not raw APIs.
3. Facades should expose business-oriented APIs, not implementation-oriented APIs.
4. Facades should be thin orchestration layers, not dumping grounds for unrelated logic.
5. Backend transport details belong in `data-access`, not in the facade.
6. The facade API should remain stable even if API orchestration or local state implementation changes.
7. Prefer signals over observables for facade-owned state unless RxJS is clearly required.
8. Treat route params and query params as first-class state inputs when the URL should represent the current feature view.

## Responsibilities

A feature facade may:

- expose read-only state
- expose derived UI-ready state
- trigger loading, refreshing, saving, deleting, and filtering actions
- coordinate API calls and feature-local state
- coordinate route params and query params with feature state
- translate UI intents into feature commands
- handle feature initialization workflows

A feature facade must not:

- perform low-level HTTP directly
- expose writable internal state to components
- become a cross-feature service locator
- own unrelated utility logic
- default to observables when signals would be simpler

## Public API Design

The facade API should read like the language of the feature.

Good API examples:

- `orders()`
- `selectedOrder()`
- `selectedOrderId()`
- `isLoading()`
- `error()`
- `filters()`
- `loadOrders()`
- `selectOrder(id: string)`
- `updateFilters(filters: OrdersFilter)`
- `archiveOrder(id: string)`

Bad API examples:

- `dispatchLoad()`
- `setState()`
- `patchFacadeState()`
- `subject$`
- `rawOrdersResponse()`

Rules:

- expose intent, not plumbing
- use domain language
- prefer explicit commands over generic mutation methods

## Signals First

Signals are the default state primitive for facades in this repository.

Preferred:

- writable signals stay private
- read-only signals are exposed publicly
- computed signals provide derived state

Use observables only when:

- the API is inherently streaming
- the feature must integrate with existing RxJS-heavy infrastructure
- a third-party dependency requires observable interop

Even when observables are used, keep the same facade boundary:

- writable Subjects stay private
- public state stays read-only
- business intent stays explicit

## Recommended Structure

```text
features/
  orders/
    data-access/
      api/
        orders-api.service.ts
      dto/
        order.dto.ts
    state/
      orders.facade.ts
      orders-state.model.ts
```

Use only the files the feature actually needs.

Small features may need only:

```text
state/
  profile.facade.ts
```

## Data-Access Scope

In this repository, `data-access` should stay minimal and transport-focused.

Preferred structure:

```text
data-access/
  api/
    orders-api.service.ts
  dto/
    order.dto.ts
```

Do not add:

- `repositories/`
- `mappers/`

Rules:

- keep API services thin and explicit
- keep DTOs close to the API layer
- if a small DTO-to-model transformation is needed, keep it near the API call or inside the facade as a private helper
- do not introduce repository or mapper layers by default

## Component Consumption Rule

Pages and smart feature components should depend on the facade.

Preferred:

```ts
import { inject } from '@angular/core';

export class OrdersListPageComponent {
  private readonly ordersFacade = inject(OrdersFacade);

  readonly orders = this.ordersFacade.orders;
  readonly isLoading = this.ordersFacade.isLoading;

  ngOnInit(): void {
    this.ordersFacade.initialize();
  }
}
```

Avoid this:

```ts
import { inject } from '@angular/core';

export class OrdersListPageComponent {
  private readonly ordersApi = inject(OrdersApiService);
}
```

Rule:

- a page should not have to understand API orchestration or internal state mutation

## Facade And Data Access

Keep the boundary explicit:

- `data-access` talks to APIs
- `facade` owns feature orchestration
- `facade` may also hold feature-local state
- `component` consumes only the facade's public API

Example flow:

```text
component -> facade -> data-access -> API
```

Rules:

- DTO definitions belong in `data-access`
- facade methods should operate on feature models, not raw transport shapes
- facade-owned state should be updated from feature-ready values, not raw DTOs

## Derived State

Expose derived state from the facade when it improves component simplicity.

Good derived state:

- `hasOrders`
- `emptyStateVisible`
- `canSubmit`
- `visibleOrders`
- `selectedOrderTitle`

Why:

- keeps view logic consistent
- avoids duplicate mapping in many components
- reduces template noise

Do not create meaningless derived flags only because the facade can.

## URL State Rule

Use route params and query params as part of feature state when the user should be able to:

- refresh and keep the same view
- share or bookmark the current state
- use browser back and forward for feature navigation
- land directly on a selected item, filter set, tab, sort, search term, or page

Typical URL-backed state:

- route params for entity identity and hierarchical selection such as `orders/:orderId`
- query params for filters, sort, search, pagination, tabs, and view mode

Rules:

- the facade should own route/query param reads when URL state is part of the feature contract
- the facade may also own router writes when that keeps feature behavior cohesive
- presentation components must not read `ActivatedRoute` directly
- do not duplicate URL-backed state in unrelated writable signals when the URL is the source of truth
- keep parsing and normalization in one place so invalid params do not leak through the UI

## Initialization

Use a facade method for feature initialization when the route/page needs coordinated startup behavior.

Example:

```ts
initialize(): void {
  this._selectedOrderId.set(this.route.snapshot.paramMap.get('orderId'));
  this._filters.set({
    status: this.route.snapshot.queryParamMap.get('status') ?? 'all',
  });
  this.loadOrders();
}
```

Rules:

- initialization should be explicit
- route-level pages may call `initialize()` on load
- initialization may read route params and query params inside the facade
- avoid hidden constructor side effects when possible
- keep initialization synchronous unless the caller truly needs to await it

## Command Design

Facade commands should map to real user or business intents.

Good commands:

- `refresh()`
- `applyFilters(filters)`
- `saveDraft()`
- `submitOrder()`
- `retryLoad()`

Bad commands:

- `updateState(payload)`
- `runAction(name)`
- `mutate(data)`

Rules:

- commands should be specific
- command names should describe outcomes or intent
- each command should have clear ownership

## Async Usage Rules

Do not mark facade methods as `async` unless the caller genuinely needs to await the outcome.

Prefer non-async facade methods for:

- initial page loads
- refresh actions
- background reloads
- local state updates that trigger API work internally

Use `async` facade methods when:

- the caller must wait for completion
- follow-up logic depends on success or failure
- a workflow needs sequencing after the operation

Examples:

- `loadOrders(): void` is usually correct
- `refresh(): void` is usually correct
- `deleteOrder(id: string): Promise<boolean>` may be correct if the caller needs to close a dialog, navigate, or show a success state after completion

Rule:

- async is for caller coordination, not just because a Promise exists internally
- if an API returns an observable and the facade method must be awaitable, convert it with `firstValueFrom`
- use RxJS `finalize` to reset loading flags for observable-based API flows

## Error And Loading State

The facade should expose the loading and error state needed by the UI.

Recommended:

- `isLoading`
- `isSaving`
- `error`
- `isEmpty`

Rules:

- keep state names consistent across features
- expose enough state for components to render correctly
- avoid forcing components to infer loading/error conditions from raw data gaps

## Feature Facade Example

```ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, firstValueFrom } from 'rxjs';
import { OrdersApiService } from '../data-access/api/orders-api.service';
import { OrdersFilter } from '../models/order-filter.model';
import { Order } from '../models/order.model';

@Injectable()
export class OrdersFacade {
  private readonly ordersApi = inject(OrdersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly _orders = signal<Order[]>([]);
  private readonly _selectedOrderId = signal<string | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<OrdersFilter>({ status: 'all' });

  readonly orders = this._orders.asReadonly();
  readonly selectedOrderId = this._selectedOrderId.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly selectedOrder = computed(() =>
    this._orders().find((order) => order.id === this._selectedOrderId()) ?? null
  );

  readonly hasOrders = computed(() => this.orders().length > 0);
  readonly emptyStateVisible = computed(
    () => !this.isLoading() && !this.hasOrders() && !this.error()
  );

  initialize(): void {
    this._selectedOrderId.set(this.route.snapshot.paramMap.get('orderId'));
    this._filters.set({
      status: this.route.snapshot.queryParamMap.get('status') ?? 'all',
    });
    this.loadOrders();
  }

  loadOrders(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.ordersApi
      .getOrders(this._filters())
      .pipe(
        finalize(() => {
          this._isLoading.set(false);
        })
      )
      .subscribe({
        next: (orders) => {
          this._orders.set(orders);
        },
        error: () => {
          this._error.set('Failed to load orders.');
        },
      });
  }

  selectOrder(id: string): void {
    this._selectedOrderId.set(id);
    void this.router.navigate(['/orders', id]);
  }

  updateFilters(filters: OrdersFilter): void {
    this._filters.set(filters);
    void this.router.navigate(['/orders'], {
      queryParams: filters,
    });
    this.loadOrders();
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.ordersApi.deleteOrder(id));
      this._orders.update((orders) => orders.filter((order) => order.id !== id));
      return true;
    } catch {
      this._error.set('Failed to delete order.');
      return false;
    }
  }
}
```

## Root Or Global Facade Example

Use a root/global facade only for truly application-wide state.

Good candidates:

- current user session
- active tenant or workspace
- app-wide permissions
- runtime configuration needed across many features

Recommended location:

```text
app/
  core/
    session/
      session.facade.ts
      session-state.model.ts
```

Example:

```ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { SessionApiService } from './session-api.service';
import { CurrentUser } from './current-user.model';

@Injectable({ providedIn: 'root' })
export class SessionFacade {
  private readonly sessionApi = inject(SessionApiService);

  private readonly _currentUser = signal<CurrentUser | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly displayName = computed(() => this.currentUser()?.name ?? '');

  loadSession(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.sessionApi
      .getCurrentUser()
      .pipe(
        finalize(() => {
          this._isLoading.set(false);
        })
      )
      .subscribe({
        next: (user) => {
          this._currentUser.set(user);
        },
        error: () => {
          this._error.set('Failed to load session.');
          this._currentUser.set(null);
        },
      });
  }

  clearSession(): void {
    this._currentUser.set(null);
  }
}
```

Rules:

- keep root facades inside `app/core`
- use root facades only for truly cross-feature state
- do not move normal feature state into `core` for convenience

## Observable Usage

Observables are allowed, but they are not the default strategy.

Use them when:

- the API is inherently streaming
- the feature is already deeply integrated with RxJS
- interop with existing observable-based infrastructure is required

If observables are used, keep the same facade rules:

- keep writable Subjects private
- expose only read-only observables
- keep the public API business-oriented
- prefer observable subscription with `finalize` for fire-and-forget facade commands
- prefer `firstValueFrom` only when the facade method must return an awaitable result

## Testing Strategy

Test the facade as the public state API of the feature.

Verify:

- derived state is correct
- commands call the correct API collaborators
- initialization behavior is correct
- loading and error transitions are exposed properly

Recommended test location:

```text
features/orders/state/orders.facade.spec.ts
```

Rules:

- mock `data-access` collaborators as needed
- test business behavior, not private implementation details

## Anti-Patterns

Avoid these patterns.

### Direct API Use In Components

```ts
private readonly ordersApi = inject(OrdersApiService);
```

Why it fails:

- leaks backend concerns into UI
- duplicates orchestration across components
- makes future refactors harder

### Facade As A Thin Re-Export Of Raw APIs

```ts
readonly orders = this.ordersApi.orders$;
readonly response = this.ordersApi.rawResponse$;
```

Why it fails:

- does not create a real boundary
- leaks implementation details
- preserves coupling instead of reducing it

### Generic Mutation APIs

```ts
updateState(partial: Partial<OrdersViewState>): void
```

Why it fails:

- weak domain language
- unsafe mutation surface
- encourages arbitrary callers

### HTTP Inside Facade

```ts
loadOrders(): void {
  this.http.get('/api/orders').subscribe(...);
}
```

Why it fails:

- mixes transport and orchestration
- makes testing harder
- breaks the `data-access` boundary

### Leaking Writable Signals

```ts
readonly orders = signal<Order[]>([]);
readonly isLoading = signal(false);
```

exported publicly from the facade is a violation.

Why it fails:

- callers can mutate state directly
- breaks facade ownership
- makes behavior unpredictable

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular feature state:

1. Create a facade for non-trivial feature state.
2. Place the facade in `features/<feature>/state/`.
3. Expose business-oriented read models and commands.
4. Keep writable state internals hidden from components.
5. Keep transport logic in `data-access`, not in the facade.
6. Make pages depend on the facade instead of raw APIs.
7. Prefer signals for facade-owned state and computed state.
8. Let the facade own feature-local signals when no store layer exists.
9. Use consistent state names such as `isLoading`, `error`, `selectedItem`, and `hasItems` when appropriate.
10. Add derived state only when it reduces repeated UI logic.
11. Do not introduce repository or mapper layers by default.
12. Avoid generic methods like `setState`, `patch`, or `dispatchAction`.
13. Model route params and query params explicitly when the URL is part of the feature contract.
14. If uncertain, design the facade API around user intent and feature language.

## Decision Matrix

| Need | Preferred location |
| --- | --- |
| API transport and DTO definitions | `data-access/` |
| Feature-local state container | `state/<feature>.facade.ts` |
| Public state API for components | `state/<feature>.facade.ts` |
| Route/page orchestration | page component via facade calls |
| URL-backed filters, selection, pagination | facade |
| Reusable derived feature state | facade |
| Global session or app-wide auth state | `app/core/<domain>/<domain>.facade.ts` |
| Local ephemeral UI toggle | component-local state |

## Recommended Example

```text
features/
  orders/
    data-access/
      api/
        orders-api.service.ts
      dto/
        order.dto.ts
    state/
      orders-state.model.ts
      orders.facade.ts
      orders.facade.spec.ts
    pages/
      orders-list-page.component.ts
```

Example interaction:

```text
orders-list-page.component -> orders.facade -> orders-api.service
```

## Final Standard

A feature state implementation is facade-compliant in this repository if:

- components consume a small public state API
- feature intent is expressed through facade commands and read models
- transport details stay in `data-access`
- facade-owned state stays hidden behind the public API
- the UI can evolve without coupling itself to API internals or mutation details
- signals are the default for facade-owned state

If a page component must know too much about API behavior, raw responses, or internal state mutation details, the facade boundary is not strong enough.
