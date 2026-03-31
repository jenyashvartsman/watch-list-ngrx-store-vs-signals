# Angular NgRx Store Guide

## Purpose

This document defines the preferred pattern for maintaining Angular feature state with classic NgRx Store in this repository.

It is written for both humans and AI agents.

Use this guide when you, as the developer, choose classic NgRx Store because the feature requires more structured and complex state management than the simpler alternatives.

The goal is to make NgRx Store based state:

- explicit
- scalable
- traceable
- testable
- maintainable in large features

This guide is a state-management contract, not a loose preference.

## When To Use This Guide

Use this guide when the feature has enough complexity that classic NgRx Store is the right tradeoff.

Typical reasons:

- many related state transitions
- complex async workflows
- multiple effects and side effects
- action-driven orchestration across several UI flows
- a need for reducers, selectors, and effects as separate concerns
- a feature that benefits from stricter event-driven state management

Prefer the lighter guides when possible:

- use [state-facade.md](c:/Users/jenya.shvartsman/Projects/ai-project-docs/angular/state-facade.md) for simple feature orchestration with facade-owned local signals
- use [state-ngrx-signal-store.md](c:/Users/jenya.shvartsman/Projects/ai-project-docs/angular/state-ngrx-signal-store.md) when you want a dedicated state container but not the full NgRx Store stack

## Architecture Rule

In this guide, the feature state flow is usually:

```text
component -> facade -> store -> effects -> data-access/api
```

or, if no facade is added:

```text
component -> store -> effects -> data-access/api
```

Recommended default in this repository:

- when using classic NgRx Store, prefer a facade as the public API for components

Why:

- reducers, selectors, actions, and effects create a larger internal surface
- the facade keeps UI code decoupled from NgRx implementation details

## Core Principles

1. Use classic NgRx Store only when the extra structure is justified.
2. Keep reducers pure.
3. Keep side effects in effects.
4. Keep transport logic in `data-access`.
5. Keep components away from raw action dispatch details when a facade is present.
6. Keep selectors focused and reusable.
7. Prefer `inject()` over constructor injection in examples and implementation.
8. Treat route params and query params as first-class state inputs when the feature view must be represented in the URL.

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
      orders.actions.ts
      orders.reducer.ts
      orders.effects.ts
      orders.selectors.ts
      orders.facade.ts
      orders-state.model.ts
      orders.effects.spec.ts
      orders.reducer.spec.ts
      orders.facade.spec.ts
```

Use only the files the feature actually needs, but for classic NgRx Store this fuller structure is usually expected.

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
- keep transformations near the effect or API usage if they are small

## State Model

Define a focused feature state model.

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

- keep state explicit
- keep state serializable when practical
- avoid storing obviously derivable values unless there is a strong reason
- include URL-derived state when route params or query params are part of the feature contract

## Actions

Actions are feature events, not generic commands.

Good action names:

- `loadOrders`
- `loadOrdersSuccess`
- `loadOrdersFailure`
- `updateFilters`
- `selectOrder`
- `deleteOrder`
- `deleteOrderSuccess`
- `deleteOrderFailure`

Bad action names:

- `setState`
- `mutateOrders`
- `runAction`
- `dispatchThing`

Rules:

- keep action names domain-specific
- keep action payloads explicit
- separate request, success, and failure events for async workflows

## Reducers

Reducers own synchronous state transitions.

Rules:

- reducers must be pure
- reducers must not call APIs
- reducers must not perform side effects
- reducers should handle state transitions clearly and predictably

Use reducers for:

- loading flags
- success/failure state updates
- selection changes
- filter updates
- entity replacement/removal after success actions

## Effects

Effects own async workflows and side effects.

Use effects for:

- calling APIs
- sequencing follow-up actions
- handling success/failure action dispatch
- cross-cutting orchestration tied to actions

Rules:

- effects call `data-access`, not raw `HttpClient`
- effects should dispatch explicit success/failure actions
- keep effect logic focused and readable
- prefer one effect per workflow rather than giant multi-purpose effects

## Selectors

Selectors expose reusable read models.

Use selectors for:

- raw state access
- derived state
- view-ready projections reused across the feature

Good selectors:

- `selectOrders`
- `selectSelectedOrder`
- `selectIsLoading`
- `selectError`
- `selectHasOrders`
- `selectEmptyStateVisible`

Rules:

- selectors should be reusable and composable
- keep selector names explicit
- avoid putting view math directly into many components

## URL State Rule

Use route params and query params as part of the feature state when the URL must capture the current workflow or view.

Good fits:

- route params for selected entity, workspace, or route-driven context
- query params for filters, sort, search, tabs, and pagination

Rules:

- the facade or another state-layer entry point should translate router state into dispatched actions
- reducers should store normalized URL-backed state when the feature needs it
- effects may react to router-driven actions when URL changes must trigger loads or other workflows
- presentation components must not read `ActivatedRoute` or dispatch router-sync actions directly
- avoid maintaining a conflicting non-URL source of truth for state that belongs in the URL
- keep `ActivatedRoute` reads in the state layer when route state is part of feature state

## Facade Rule

When using classic NgRx Store in this repository, prefer a facade as the public API for components.

The facade should:

- expose signals or observables for component consumption
- hide dispatch details
- expose business-oriented commands

Components should not need to know:

- which action to dispatch
- which selector to import
- how effects are structured

## Async Usage Rules

Do not make facade methods `async` unless callers truly need to await completion.

For classic NgRx Store:

- normal loads usually remain `void` methods that dispatch actions
- awaitable workflows should be exceptional and deliberate

Examples:

- `loadOrders(): void` is usually correct
- `refresh(): void` is usually correct
- `deleteOrder(id: string): void` is often correct if completion is handled through state
- `deleteOrderAndWait(id: string): Promise<boolean>` may be justified only when the caller must coordinate follow-up behavior

Rule:

- event-driven store flows are the default
- awaitable flows should be rare and intentional

## Loading And Error State

Track loading and error state explicitly in the store.

Recommended fields:

- `isLoading`
- `isSaving`
- `error`

Rules:

- request actions should set loading state
- success/failure actions should clear loading state
- failure actions should set explicit error values

## Feature Example

### Actions

```ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Order } from '../models/order.model';
import { OrdersFilter } from '../models/order-filter.model';

export const OrdersActions = createActionGroup({
  source: 'Orders',
  events: {
    'Load Orders': emptyProps(),
    'Initialize From Route': props<{
      selectedOrderId: string | null;
      filters: OrdersFilter;
    }>(),
    'Load Orders Success': props<{ orders: Order[] }>(),
    'Load Orders Failure': props<{ error: string }>(),
    'Update Filters': props<{ filters: OrdersFilter }>(),
    'Select Order': props<{ id: string }>(),
    'Delete Order': props<{ id: string }>(),
    'Delete Order Success': props<{ id: string }>(),
    'Delete Order Failure': props<{ error: string }>(),
  },
});
```

### Reducer

```ts
import { createFeature, createReducer, on } from '@ngrx/store';
import { OrdersActions } from './orders.actions';

export type OrdersState = {
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

export const ordersFeature = createFeature({
  name: 'orders',
  reducer: createReducer(
    initialState,
    on(OrdersActions.loadOrders, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(OrdersActions.initializeFromRoute, (state, { selectedOrderId, filters }) => ({
      ...state,
      selectedOrderId,
      filters,
    })),
    on(OrdersActions.loadOrdersSuccess, (state, { orders }) => ({
      ...state,
      orders,
      isLoading: false,
    })),
    on(OrdersActions.loadOrdersFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),
    on(OrdersActions.updateFilters, (state, { filters }) => ({
      ...state,
      filters,
    })),
    on(OrdersActions.selectOrder, (state, { id }) => ({
      ...state,
      selectedOrderId: id,
    })),
    on(OrdersActions.deleteOrderSuccess, (state, { id }) => ({
      ...state,
      orders: state.orders.filter((order) => order.id !== id),
    })),
    on(OrdersActions.deleteOrderFailure, (state, { error }) => ({
      ...state,
      error,
    }))
  ),
});
```

### Selectors

```ts
import { createSelector } from '@ngrx/store';
import { ordersFeature } from './orders.reducer';

export const {
  selectOrdersState,
  selectOrders,
  selectSelectedOrderId,
  selectIsLoading,
  selectError,
  selectFilters,
} = ordersFeature;

export const selectSelectedOrder = createSelector(
  selectOrders,
  selectSelectedOrderId,
  (orders, selectedOrderId) =>
    orders.find((order) => order.id === selectedOrderId) ?? null
);

export const selectHasOrders = createSelector(
  selectOrders,
  (orders) => orders.length > 0
);

export const selectEmptyStateVisible = createSelector(
  selectIsLoading,
  selectHasOrders,
  selectError,
  (isLoading, hasOrders, error) => !isLoading && !hasOrders && !error
);
```

### Effects

```ts
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { OrdersApiService } from '../data-access/api/orders-api.service';
import { OrdersActions } from './orders.actions';
import { selectFilters } from './orders.selectors';

@Injectable()
export class OrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly router = inject(Router);

  readonly initializeFromRoute$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.initializeFromRoute),
      map(() => OrdersActions.loadOrders())
    )
  );

  readonly loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.loadOrders),
      withLatestFrom(this.store.select(selectFilters)),
      switchMap(([, filters]) =>
        this.ordersApi.getOrders(filters).pipe(
          map((orders) => OrdersActions.loadOrdersSuccess({ orders })),
          catchError(() =>
            of(OrdersActions.loadOrdersFailure({ error: 'Failed to load orders.' }))
          )
        )
      )
    )
  );

  readonly deleteOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.deleteOrder),
      switchMap(({ id }) =>
        this.ordersApi.deleteOrder(id).pipe(
          map(() => OrdersActions.deleteOrderSuccess({ id })),
          catchError(() =>
            of(OrdersActions.deleteOrderFailure({ error: 'Failed to delete order.' }))
          )
        )
      )
    )
  );

  readonly syncFiltersToUrl$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(OrdersActions.updateFilters),
        map(({ filters }) => {
          void this.router.navigate(['/orders'], { queryParams: filters });
        })
      ),
    { dispatch: false }
  );
}
```

### Facade

```ts
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { OrdersFilter } from '../models/order-filter.model';
import { OrdersActions } from './orders.actions';
import {
  selectEmptyStateVisible,
  selectError,
  selectIsLoading,
  selectOrders,
  selectSelectedOrder,
} from './orders.selectors';

@Injectable()
export class OrdersFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  readonly orders = this.store.selectSignal(selectOrders);
  readonly selectedOrder = this.store.selectSignal(selectSelectedOrder);
  readonly isLoading = this.store.selectSignal(selectIsLoading);
  readonly error = this.store.selectSignal(selectError);
  readonly emptyStateVisible = this.store.selectSignal(selectEmptyStateVisible);

  initialize(): void {
    this.store.dispatch(
      OrdersActions.initializeFromRoute({
        selectedOrderId: this.route.snapshot.paramMap.get('orderId'),
        filters: {
          status: this.route.snapshot.queryParamMap.get('status') ?? 'all',
        },
      })
    );
  }

  loadOrders(): void {
    this.store.dispatch(OrdersActions.loadOrders());
  }

  selectOrder(id: string): void {
    this.store.dispatch(OrdersActions.selectOrder({ id }));
  }

  updateFilters(filters: OrdersFilter): void {
    this.store.dispatch(OrdersActions.updateFilters({ filters }));
    this.store.dispatch(OrdersActions.loadOrders());
  }

  deleteOrder(id: string): void {
    this.store.dispatch(OrdersActions.deleteOrder({ id }));
  }
}
```

## Component Consumption Example

```ts
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-orders-list-page',
  templateUrl: './orders-list-page.component.html',
})
export class OrdersListPageComponent {
  private readonly ordersFacade = inject(OrdersFacade);

  readonly orders = this.ordersFacade.orders;
  readonly isLoading = this.ordersFacade.isLoading;
  readonly emptyStateVisible = this.ordersFacade.emptyStateVisible;

  ngOnInit(): void {
    this.ordersFacade.initialize();
  }
}
```

## Root Or Global NgRx Store

Use root/global classic NgRx Store only when the application truly needs app-wide event-driven state.

Good candidates:

- authentication/session
- app-wide router-driven workflows
- large shared domain state spanning many features

Rules:

- keep global store structure in `app/core`
- keep global state narrowly scoped
- do not move ordinary feature state to root just for convenience

## Testing Strategy

Test each NgRx concern at the right level.

Recommended:

- reducer tests for state transitions
- selector tests for derived state
- effect tests for async workflows
- facade tests for public API behavior

Suggested locations:

```text
features/orders/state/orders.reducer.spec.ts
features/orders/state/orders.effects.spec.ts
features/orders/state/orders.facade.spec.ts
```

Rules:

- test business behavior
- keep reducer tests pure and direct
- mock API calls in effects tests

## Anti-Patterns

Avoid these patterns.

### Classic NgRx For Simple Features

Using reducers, effects, selectors, and actions for a tiny feature is usually a bad tradeoff.

Why it fails:

- too much ceremony
- slower feature delivery
- more files than value

### Generic Action APIs

```ts
dispatchAction(type: string, payload: unknown): void
```

Why it fails:

- weak domain language
- destroys type safety
- obscures feature intent

### Components Dispatching Many Raw Actions

```ts
this.store.dispatch(OrdersActions.loadOrders());
this.store.dispatch(OrdersActions.selectOrder({ id }));
this.store.dispatch(OrdersActions.updateFilters({ filters }));
```

directly across many components is a smell when a facade should own the public contract.

Why it fails:

- leaks NgRx details into UI
- spreads orchestration logic
- increases coupling

### Effects Owning Business State That Belongs In Reducers

Why it fails:

- reduces predictability
- mixes responsibilities
- makes state transitions harder to trace

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing classic NgRx Store based state:

1. Use classic NgRx Store only when the feature genuinely needs the extra structure.
2. Keep API transport in `data-access`.
3. Keep reducers pure.
4. Keep side effects in effects.
5. Prefer a facade as the component-facing public API.
6. Use domain-specific actions, selectors, and methods.
7. Prefer `inject()` over constructor injection.
8. Do not introduce repository or mapper layers by default.
9. Keep awaitable facade/store methods rare and intentional.
10. Model route params and query params explicitly when the feature must support deep links, shareable views, or router-driven workflows.
11. If the feature does not need this much structure, prefer Signal Store or facade-only state instead.

## Decision Matrix

| Need | Preferred choice |
| --- | --- |
| Simple feature orchestration with local signals | [state-facade.md](c:/Users/jenya.shvartsman/Projects/ai-project-docs/angular/state-facade.md) |
| Dedicated feature state container with simpler signals-first store | [state-ngrx-signal-store.md](c:/Users/jenya.shvartsman/Projects/ai-project-docs/angular/state-ngrx-signal-store.md) |
| Complex event-driven state with reducers/effects/selectors | `state-ngrx-store.md` |
| Small feature with minimal workflows | facade |
| Large feature with many async workflows and richer transitions | classic NgRx Store |
| Router-driven filters or selection participating in broader workflows | classic NgRx Store can be appropriate |

## Final Standard

A classic NgRx Store implementation is compliant in this repository if:

- the feature complexity justifies the extra structure
- reducers, selectors, effects, and facade each have clear responsibilities
- API transport stays in `data-access`
- components stay decoupled from internal NgRx details
- actions and methods express real feature intent

If the solution feels overly ceremonial for the feature size, use a simpler state guide instead.
