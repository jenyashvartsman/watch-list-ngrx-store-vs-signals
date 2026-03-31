# Angular Feature Component Guide

## Purpose

This document defines the required component architecture for Angular features in this repository.

It is written for both humans and AI agents.

The most important rule is the split between:

- container components that access state and orchestrate feature behavior
- presentation components that are input/output only and do not know where data comes from

The goal is to make feature UI:

- predictable
- reusable
- easy to test
- easy to refactor
- scalable as features grow

This guide is a component-architecture contract, not a loose preference.

## Core Rule

Separate feature components into two roles:

1. container components
2. presentation components

Container components:

- access feature state
- call facades, stores, or route-level services
- map state to view inputs
- handle orchestration

Presentation components:

- receive data through inputs
- emit user intent through outputs
- do not access feature state directly
- do not call APIs directly
- do not know how data is loaded or persisted

## Why This Split Matters

Without this split, components often become:

- hard to reuse
- hard to test
- tightly coupled to one state strategy
- difficult to refactor safely

The split gives you:

- clearer responsibilities
- simpler templates
- easier migration between facade/store approaches
- better feature boundaries for AI-generated code

## Component Types

Use these terms consistently.

### Container Components

Container components are state-aware.

They may:

- inject facades
- inject stores
- read route params
- combine route data and state
- call feature commands
- decide which presentation components to render

They must not:

- become giant template-heavy UI components
- own too much low-level presentational markup
- pass state implementation details deep into the tree

Typical locations:

- `pages/`
- occasionally feature-local smart components in `components/` if the feature truly needs them

### Presentation Components

Presentation components are state-agnostic.

They may:

- use `input()`
- use `output()`
- render UI
- emit user events
- manage tiny local UI concerns such as temporary focus or open/closed visual state

They must not:

- inject facades or stores
- call APIs
- dispatch actions
- subscribe to route params
- perform feature-level orchestration

Typical locations:

- `components/`
- `shared/ui/` if reused across features

## Recommended Feature Structure

```text
features/
  orders/
    pages/
      orders-list-page.component.ts
      order-detail-page.component.ts
    components/
      orders-table.component.ts
      order-filters.component.ts
      order-summary-card.component.ts
    state/
      orders.facade.ts
```

Interpretation:

- `pages/` are usually containers
- `components/` are usually presentation components

This is the default unless there is a strong reason otherwise.

## Container Components

Container components own feature orchestration.

Recommended responsibilities:

- read state
- trigger loading
- pass data into presentational children
- respond to emitted events from presentational children
- connect routing, state, and feature behavior

Example:

```ts
import { Component, inject } from '@angular/core';
import { OrdersFacade } from '../state/orders.facade';

@Component({
  selector: 'app-orders-list-page',
  templateUrl: './orders-list-page.component.html',
})
export class OrdersListPageComponent {
  private readonly ordersFacade = inject(OrdersFacade);

  readonly orders = this.ordersFacade.orders;
  readonly isLoading = this.ordersFacade.isLoading;
  readonly error = this.ordersFacade.error;

  ngOnInit(): void {
    this.ordersFacade.loadOrders();
  }

  onFilterChange(filters: OrdersFilter): void {
    this.ordersFacade.updateFilters(filters);
  }

  onDeleteOrder(orderId: string): void {
    this.ordersFacade.deleteOrder(orderId);
  }
}
```

Template example:

```html
<app-order-filters
  [filters]="filters()"
  (filtersChange)="onFilterChange($event)"
/>

<app-orders-table
  [orders]="orders()"
  [isLoading]="isLoading()"
  (deleteOrder)="onDeleteOrder($event)"
/>
```

## Presentation Components

Presentation components should be pure from a feature-architecture perspective.

Recommended responsibilities:

- render inputs
- emit outputs
- handle UI markup and styling
- stay independent from how state is stored

Example:

```ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-orders-table',
  templateUrl: './orders-table.component.html',
})
export class OrdersTableComponent {
  readonly orders = input.required<Order[]>();
  readonly isLoading = input(false);
  readonly deleteOrder = output<string>();

  onDeleteClick(orderId: string): void {
    this.deleteOrder.emit(orderId);
  }
}
```

Rules:

- use `input()` and `output()` for the component contract
- keep the contract explicit
- emit user intent, not state mutations

## Inputs And Outputs Rule

Presentation components should communicate through inputs and outputs only.

Good:

- `input.required<Order[]>()`
- `input(false)`
- `output<string>()`
- `output<OrdersFilter>()`

Bad:

- inject facade/store in a presentational component
- call `loadOrders()` from a table component
- inject `ActivatedRoute` in a card component

Rule:

- if a component needs feature state access, it is probably a container

## User Intent vs State Mutation

Presentation components should emit user intent, not implementation details.

Good outputs:

- `deleteOrder`
- `filtersChange`
- `rowSelected`
- `submitted`

Bad outputs:

- `setState`
- `dispatchAction`
- `patchFilters`
- `loadMoreFromApi`

Rules:

- outputs should describe what the user did
- the container decides what state command to call

## State Access Rule

Only container components may directly access:

- facades
- stores
- `ActivatedRoute`
- route data/resolvers
- feature-scoped providers used for orchestration

Presentation components must stay unaware of:

- where state comes from
- what state library is used
- how navigation or persistence works

This rule is one of the most important architectural boundaries in the codebase.

## Page Components

Page components are route entry containers by default.

Page components should:

- read route params if needed
- call feature initialization
- connect feature state to the view
- compose presentation components

Page components should not:

- contain every line of UI markup themselves
- replace smaller presentation components unnecessarily

## Feature-Local Smart Components

Most components in `components/` should remain presentational.

However, a feature may occasionally need a non-page container component inside `components/`.

Use this only when:

- a subsection has meaningful feature orchestration of its own
- keeping logic in the page would make the page too large
- the component is still feature-local and clearly state-aware

Rules:

- this should be the exception, not the default
- if a component in `components/` injects a facade/store, document it through naming or placement clarity

## Shared Components

Shared components must remain presentation-only.

A component in `shared/` must not:

- inject feature facades
- know feature-specific models unless they are truly shared contracts
- import from `features/`

If a component is coupled to one feature's state or domain behavior, it belongs in that feature, not in `shared`.

## Data Mapping Rule

Containers are allowed to adapt state into presentation-friendly input shapes.

Good:

- container maps `orders()` into `tableRows`
- container combines `isLoading`, `error`, and `orders` into empty-state visibility

Avoid pushing raw store/facade details into presentation components.

Rule:

- presentation components should receive the data shape they need, not the entire feature state object by default

## Event Handling Rule

Presentation components emit events upward.

Containers receive the events and decide what to do.

Example:

```html
<app-order-filters
  [filters]="filters()"
  (filtersChange)="onFilterChange($event)"
/>
```

```ts
onFilterChange(filters: OrdersFilter): void {
  this.ordersFacade.updateFilters(filters);
}
```

This keeps the presentational component reusable and the orchestration centralized.

## Async And Side Effects

Presentation components must not own feature-level async workflows.

Do not do this inside presentation components:

- load data
- save data
- delete entities
- handle route-driven orchestration

If an async action starts from a button click in a presentation component:

- emit an output
- let the container call the facade/store method

## Forms

By default:

- form containers own submission and state integration
- form presentation components render fields and emit changes or submit events

For simple feature-local forms, the page container may host the full form and pass data into smaller presentational sections.

Rule:

- keep feature orchestration out of leaf form controls and presentational form sections

## Suggested Naming

Use names that reflect role clearly.

Container examples:

- `orders-list-page`
- `order-detail-page`
- `billing-settings-page`

Presentation examples:

- `orders-table`
- `order-filters`
- `order-summary-card`
- `empty-state-panel`

Avoid vague names:

- `manager`
- `handler`
- `container-component`

## Testing Strategy

Test containers and presentation components differently.

Container tests should focus on:

- state wiring
- command calls
- event handling
- route/state integration

Presentation tests should focus on:

- rendering inputs
- emitting outputs
- visual/interaction behavior

Rules:

- do not over-test implementation details
- test component role responsibilities

## Anti-Patterns

Avoid these patterns.

### Presentational Component Injecting State

```ts
private readonly ordersFacade = inject(OrdersFacade);
```

inside `orders-table.component.ts` is a violation.

Why it fails:

- destroys reuse
- couples UI to one state strategy
- makes testing harder

### Container Doing All UI Rendering

Why it fails:

- pages become huge
- markup becomes hard to maintain
- reuse opportunities disappear

### Output Naming Based On Implementation

```ts
readonly patchStore = output<OrdersFilter>();
```

Why it fails:

- leaks state implementation details
- weakens component boundaries
- makes migration harder

### Passing Entire Feature State To Leaf Components

```ts
[state]="ordersState()"
```

Why it fails:

- creates oversized component contracts
- leaks internals into presentation components
- reduces reuse and clarity

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular feature components:

1. Default route entry components in `pages/` to container components.
2. Default components in `components/` to presentation-only components.
3. Let only containers access facades, stores, or routing state.
4. Keep presentation components limited to `input()` and `output()` contracts.
5. Emit user intent from presentation components, not state mutations.
6. Map state into presentation-friendly shapes in the container when needed.
7. Do not inject APIs, facades, or stores into presentational components.
8. Promote a component to `shared/` only if it remains presentation-only and reusable.
9. If a component needs state access, treat it as a container and place it deliberately.
10. If uncertain, keep orchestration higher and keep leaf components dumb.

## Decision Matrix

| Need | Preferred component type |
| --- | --- |
| Route entry screen | container |
| Reads facade/store | container |
| Reads route params | container |
| Handles page initialization | container |
| Renders a table/card/form section from inputs | presentation |
| Emits button/filter/select events | presentation |
| Reusable shared UI | presentation |
| Feature orchestration for nested subsection | container, only if truly needed |

## Recommended Example

```text
features/
  orders/
    pages/
      orders-list-page.component.ts
    components/
      order-filters.component.ts
      orders-table.component.ts
      order-summary-card.component.ts
    state/
      orders.facade.ts
```

Flow:

```text
orders-list-page -> orders.facade -> state/api
orders-list-page -> presentation components via inputs/outputs
presentation components -> emit user intent back to orders-list-page
```

## Final Standard

A feature component structure is compliant in this repository if:

- container components own orchestration and state access
- presentation components remain input/output only
- feature state does not leak into leaf UI components
- route entry pages behave as containers
- presentation components stay reusable and easy to test

If a leaf UI component knows about facades, stores, route params, or API workflows, the feature boundary is not strong enough.
