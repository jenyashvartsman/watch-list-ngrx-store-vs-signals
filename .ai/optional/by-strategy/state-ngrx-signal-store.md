# Angular NgRx Signal Store Guide

## Purpose

This document defines the preferred pattern for maintaining Angular feature state with NgRx Signal Store in this repository.

It is written for both humans and AI agents.

Use this guide when you, as the developer, choose NgRx Signal Store as the state maintenance strategy for a feature.

The goal is to make Signal Store based state:

- predictable
- explicit
- testable
- scalable
- aligned with Angular signals-first patterns

This guide is a state-management contract, not a loose preference.

## When To Use This Guide

Use this guide when a feature needs a dedicated state container and Signal Store is the chosen strategy.

Typical reasons:

- the feature has multiple related state slices
- the feature has repeated async workflows
- the feature needs reusable computed state
- the feature has enough complexity that facade-only local signals would become crowded

Use [state-facade.md](c:/Users/jenya.shvartsman/Projects/ai-project-docs/angular/state-facade.md) instead when the simpler `component -> facade -> data-access/api` approach is sufficient.

## Architecture Rule

In this guide, the feature state flow is:

```text
component -> signal store -> data-access/api
```

If you also add a facade on top, the flow becomes:

```text
component -> facade -> signal store -> data-access/api
```

Choose one public consumption pattern per feature and keep it consistent.

Default rule:

- components may consume the Signal Store directly if it is the chosen public state API
- add a facade only if the feature needs an extra public orchestration boundary

## Core Principles

1. Use Signal Store for feature state, not as a generic app-wide dumping ground.
2. Keep transport logic in `data-access`.
3. Keep writable state changes inside the store.
4. Expose state through signals and computed values.
5. Keep methods business-oriented, not patch-oriented.
6. Prefer one primary store per non-trivial feature.
7. Prefer `inject()` over constructor injection in examples and implementation.
8. Treat route params and query params as first-class state inputs when the URL should represent the current feature view.

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
      orders.store.ts
      orders-state.model.ts
      orders.store.spec.ts
```

Optional facade layer:

```text
state/
  orders.store.ts
  orders.facade.ts
```

Use the facade only when it adds real value.

## Data-Access Scope

Keep `data-access` minimal and transport-focused.

Preferred:

```text
data-access/
  api/
    orders-api.service.ts
  dto/
    order.dto.ts
```

Do not add by default:

- `repositories/`
- `mappers/`

Rules:

- API methods should return observables
- DTO definitions stay in `data-access`
- small transformations may happen close to the API usage site

## Store Responsibilities

A Signal Store may:

- hold feature-local writable state
- expose computed state
- handle feature load/save/delete/filter workflows
- coordinate URL-backed filter, selection, and pagination state
- coordinate API calls
- centralize state transitions

A Signal Store must not:

- perform raw HTTP directly
- expose unrestricted patch methods as the public API
- become a cross-feature service locator
- absorb unrelated utility logic

## State Model

Define a focused state shape for the feature.

Example:

```ts
export type OrdersState = {
  orders: Order[];
  selectedOrderId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: OrdersFilter;
};
```

Rules:

- keep state serializable when practical
- store view-relevant state, not every temporary variable
- derive computed state instead of persisting every boolean flag
- include route/query param derived values when they are part of the feature contract

## Public API Design

The store API should read like feature language.

Good:

- `loadOrders()`
- `selectOrder(id)`
- `updateFilters(filters)`
- `deleteOrder(id)`
- `refresh()`

Bad:

- `patchState(partial)`
- `setValue(key, value)`
- `runEffect(name)`
- `dispatch(type)`

Rules:

- expose intent, not internals
- keep method names domain-specific
- avoid generic mutation surfaces

## Signals First

Signal Store already aligns with the signals-first direction of this repository.

Preferred:

- base state in the store
- computed selectors in the store
- components read signals directly

Use RxJS only for:

- API observables
- interop with existing stream-based dependencies
- conversions needed for async workflows

## Async Usage Rules

Do not mark store methods as `async` unless the caller genuinely needs to await completion.

Prefer non-async store methods for:

- initial page loads
- background refreshes
- filter changes that trigger reloads

Use `async` store methods when:

- the caller must wait for completion
- a dialog, navigation, or follow-up action depends on the result

Rules:

- use observable subscription with `finalize` for fire-and-forget store commands
- use `firstValueFrom` only for truly awaitable workflows

## Loading And Error Handling

Signal Store methods should own loading and error transitions for the state they manage.

Recommended fields:

- `isLoading`
- `isSaving`
- `error`

Rules:

- reset loading with `finalize`
- set error explicitly on failure
- do not force components to infer loading/error from missing data

## URL State Rule

Use route params and query params as state inputs when the URL should preserve the current feature view.

Good fits:

- route params for selected entity or nested context
- query params for filters, sorting, search, pagination, tabs, and view mode

Rules:

- the store should own route/query param reads when URL state is part of the feature contract
- if a facade exists, it may sit on top, but route-backed state should still be owned in the state layer
- presentation components must not read router state directly
- do not keep a conflicting second source of truth when the URL already defines the state
- normalize missing or invalid params before patching store state

## Feature Store Example

```ts
import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { finalize, firstValueFrom } from 'rxjs';
import { OrdersApiService } from '../data-access/api/orders-api.service';
import { Order } from '../models/order.model';
import { OrdersFilter } from '../models/order-filter.model';

type OrdersState = {
  orders: Order[];
  selectedOrderId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: OrdersFilter;
};

const initialState: OrdersState = {
  orders: [],
  selectedOrderId: null,
  isLoading: false,
  error: null,
  filters: { status: 'all' },
};

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    selectedOrder: computed(
      () => store.orders().find((order) => order.id === store.selectedOrderId()) ?? null
    ),
    hasOrders: computed(() => store.orders().length > 0),
    emptyStateVisible: computed(
      () => !store.isLoading() && !store.hasOrders() && !store.error()
    ),
  })),
  withMethods((
    store,
    ordersApi = inject(OrdersApiService),
    route = inject(ActivatedRoute),
    router = inject(Router)
  ) => ({
    initialize(): void {
      patchState(store, {
        selectedOrderId: route.snapshot.paramMap.get('orderId'),
        filters: {
          status: route.snapshot.queryParamMap.get('status') ?? 'all',
        },
      });
      store.loadOrders();
    },

    loadOrders(): void {
      patchState(store, { isLoading: true, error: null });

      ordersApi
        .getOrders(store.filters())
        .pipe(
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        )
        .subscribe({
          next: (orders) => {
            patchState(store, { orders });
          },
          error: () => {
            patchState(store, { error: 'Failed to load orders.' });
          },
        });
    },

    selectOrder(id: string): void {
      patchState(store, { selectedOrderId: id });
      void router.navigate(['/orders', id]);
    },

    updateFilters(filters: OrdersFilter): void {
      patchState(store, { filters });
      void router.navigate(['/orders'], { queryParams: filters });
      store.loadOrders();
    },

    async deleteOrder(id: string): Promise<boolean> {
      try {
        await firstValueFrom(ordersApi.deleteOrder(id));
        patchState(store, {
          orders: store.orders().filter((order) => order.id !== id),
        });
        return true;
      } catch {
        patchState(store, { error: 'Failed to delete order.' });
        return false;
      }
    },
  }))
);
```

## Component Consumption Example

When the store is the public state API, components read from it directly.

```ts
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-orders-list-page',
  templateUrl: './orders-list-page.component.html',
})
export class OrdersListPageComponent {
  readonly ordersStore = inject(OrdersStore);

  readonly orders = this.ordersStore.orders;
  readonly isLoading = this.ordersStore.isLoading;
  readonly emptyStateVisible = this.ordersStore.emptyStateVisible;

  ngOnInit(): void {
    this.ordersStore.initialize();
  }
}
```

## Optional Facade On Top Of Signal Store

Add a facade only if it creates a better public boundary.

Useful when:

- the feature needs a simpler API for pages
- multiple stores or services must be coordinated
- you want to shield components from store details

Example:

```ts
import { Injectable, inject } from '@angular/core';

@Injectable()
export class OrdersFacade {
  private readonly ordersStore = inject(OrdersStore);

  readonly orders = this.ordersStore.orders;
  readonly isLoading = this.ordersStore.isLoading;
  readonly emptyStateVisible = this.ordersStore.emptyStateVisible;

  loadOrders(): void {
    this.ordersStore.loadOrders();
  }

  selectOrder(id: string): void {
    this.ordersStore.selectOrder(id);
  }
}
```

Rules:

- do not add a facade automatically
- if the store itself is already a clean public API, consume it directly

## Root Or Global Signal Store Example

Use a root/global Signal Store only for truly application-wide state.

Good candidates:

- current user session
- app-wide auth state
- tenant/workspace context
- runtime configuration shared broadly

Recommended location:

```text
app/
  core/
    session/
      session.store.ts
      session-state.model.ts
```

Example:

```ts
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { finalize } from 'rxjs';
import { SessionApiService } from './session-api.service';
import { CurrentUser } from './current-user.model';

type SessionState = {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: SessionState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.currentUser()),
    displayName: computed(() => store.currentUser()?.name ?? ''),
  })),
  withMethods((store, sessionApi = inject(SessionApiService)) => ({
    loadSession(): void {
      patchState(store, { isLoading: true, error: null });

      sessionApi
        .getCurrentUser()
        .pipe(
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        )
        .subscribe({
          next: (currentUser) => {
            patchState(store, { currentUser });
          },
          error: () => {
            patchState(store, {
              currentUser: null,
              error: 'Failed to load session.',
            });
          },
        });
    },

    clearSession(): void {
      patchState(store, { currentUser: null });
    },
  }))
);
```

Rules:

- keep global stores inside `app/core`
- do not move normal feature state into `core` for convenience
- keep global state narrowly scoped

## Testing Strategy

Test Signal Store as the public state API for the feature.

Verify:

- initial state is correct
- computed state is correct
- commands update state correctly
- loading and error transitions behave correctly
- async workflows handle success and failure properly

Recommended test location:

```text
features/orders/state/orders.store.spec.ts
```

Rules:

- mock API collaborators
- test business behavior, not implementation trivia

## Anti-Patterns

Avoid these patterns.

### Direct API Use In Components

```ts
private readonly ordersApi = inject(OrdersApiService);
```

Why it fails:

- leaks backend concerns into UI
- duplicates orchestration
- weakens the state boundary

### Generic Patch APIs As Public Contract

```ts
updateState(partial: Partial<OrdersState>): void
```

Why it fails:

- weak domain language
- callers can mutate state too freely
- makes the store harder to reason about

### Store As A Cross-Feature Bucket

```text
app/core/state/everything.store.ts
```

Why it fails:

- destroys ownership boundaries
- scales poorly
- encourages unrelated coupling

### Async Everywhere

```ts
async loadOrders(): Promise<void> {
  ...
}
```

for a normal page load command is usually a bad tradeoff.

Why it fails:

- creates unnecessary awaitable APIs
- makes caller intent less clear
- blurs the difference between fire-and-forget and coordinated workflows

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing NgRx Signal Store based state:

1. Use Signal Store only when it is the chosen state maintenance strategy for the feature.
2. Keep API transport in `data-access`.
3. Prefer one primary store per feature.
4. Prefer signals and computed state over observable-based local state.
5. Use business-oriented methods, not generic mutation APIs.
6. Use `finalize` for loading cleanup in observable-based API commands.
7. Use `firstValueFrom` only when a method truly needs to be awaitable.
8. Prefer `inject()` over constructor injection.
9. Add a facade on top of the store only when it improves the public API.
10. Keep components from calling APIs directly.
11. Model route params and query params explicitly when the feature must support deep links, shareable filters, or refresh restore.

## Decision Matrix

| Need | Preferred choice |
| --- | --- |
| Simple feature orchestration with local signals | [state-facade.md](c:/Users/jenya.shvartsman/Projects/ai-project-docs/angular/state-facade.md) |
| Dedicated feature state container with richer state transitions | `state-ngrx-signal-store.md` |
| Fire-and-forget API load | store method with observable `subscribe` and `finalize` |
| Awaitable workflow after delete/save | `async` method with `firstValueFrom` |
| URL-backed filter/search/page state | store or facade-owned state layer |
| Global auth/session state | root store in `app/core` |

## Final Standard

A Signal Store implementation is compliant in this repository if:

- the chosen feature state strategy is explicit
- state is owned inside the store
- API transport remains in `data-access`
- components do not call APIs directly
- methods express feature intent
- signals are the primary state model

If the store API feels generic, patch-heavy, or tightly coupled to transport details, the design should be simplified.
