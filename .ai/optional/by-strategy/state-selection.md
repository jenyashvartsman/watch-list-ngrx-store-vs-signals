# Angular State Selection Guide

## Purpose

This guide explains when to use each state strategy in this documentation set.

Not every Angular application needs the same state architecture. The goal is to help the developer and AI agents choose the lightest approach that still fits the feature.

This guide applies to these state options:

- facade-only feature state
- NgRx Signal Store
- classic NgRx Store

Across all three options, route params and query params are valid feature state inputs when the URL should reflect the current view.

## Core Principle

Choose the simplest state strategy that matches the feature complexity.

Do not start with the most powerful option by default.

When state should be bookmarkable, shareable, recover on refresh, or work cleanly with browser navigation, keep that state in the URL and let the chosen state layer coordinate it.

Prefer:

1. facade-only state first
2. NgRx Signal Store when dedicated feature state becomes more structured
3. classic NgRx Store when the feature needs more complex event-driven state management

## Available Guides

Use these guides together:

- [state-facade.md](./state-facade.md)
- [state-ngrx-signal-store.md](./state-ngrx-signal-store.md)
- [state-ngrx-store.md](./state-ngrx-store.md)

## Option 1: Facade-Only State

Use the facade strategy when the feature can stay simple.

Typical architecture:

```text
component -> facade -> data-access/api
```

This is the default choice for most features.

Use facade-only state when:

- the feature has a straightforward load and mutate flow
- local feature state is modest
- signals inside the facade are enough
- the feature does not need a large event model
- the team wants the lightest implementation
- route/query param syncing is simple enough to keep in one facade

Good examples:

- profile settings
- orders list with filtering and delete
- orders list with URL-backed search, status, and page query params
- dashboard summary cards
- session or current-user state

Choose:

- [state-facade.md](./state-facade.md)

## Option 2: NgRx Signal Store

Use NgRx Signal Store when the feature needs a more explicit state model, but classic NgRx Store would be too heavy.

Typical architecture:

```text
component -> signal store -> data-access/api
```

or, if the project wants a facade layer on top:

```text
component -> facade -> signal store -> data-access/api
```

Use Signal Store when:

- the feature has richer local state than a simple facade
- computed state is becoming substantial
- the feature benefits from a dedicated state container
- the team wants signals-first state primitives
- the feature is still mostly local and does not need full action or reducer structure
- URL-backed filters, tabs, sort, or pagination need a richer local container

Good examples:

- complex search and filter screens
- editable wizard-like workflows
- feature modules with multiple coordinated UI states
- dashboards with several derived state slices
- search pages where query params and local state must stay in sync

Choose:

- [state-ngrx-signal-store.md](./state-ngrx-signal-store.md)

## Option 3: Classic NgRx Store

Use classic NgRx Store when the feature needs more formal, event-driven state management.

Typical architecture:

```text
component -> facade -> store -> effects -> data-access/api
```

Use classic NgRx Store when:

- the feature has many user and system events
- state transitions need to be explicit and traceable
- multiple parts of the feature react to the same events
- the feature needs reducers, actions, selectors, and effects as separate concerns
- long-term complexity is high enough to justify the extra structure
- router-driven state changes participate in broader action/effect workflows

Good examples:

- large workflow-heavy admin areas
- advanced multi-step business processes
- domains with many asynchronous side effects
- highly collaborative feature areas with many state transitions
- complex search or workspace screens where URL state drives multiple coordinated effects

Choose:

- [state-ngrx-store.md](./state-ngrx-store.md)

## Simple Decision Rules

Use this default sequence:

1. Start with a facade.
2. Move to Signal Store if facade-owned state becomes too rich or hard to organize.
3. Move to classic NgRx Store if the feature needs explicit event-driven architecture.

If you are unsure, choose facade-only state first.

## Decision Matrix

### Choose Facade When

- the feature is mostly API orchestration
- the state is easy to describe with a few signals
- the UI flow is straightforward
- there is no strong need for action and reducer structure
- the feature should stay lightweight
- route/query param syncing is small and feature-local

### Choose Signal Store When

- the feature needs a dedicated local state container
- state derivation is growing
- multiple related state slices need to live together
- signals are still the natural fit
- the team wants more structure without full NgRx Store ceremony
- URL state and in-memory state need richer coordination

### Choose Classic NgRx Store When

- state changes should be modeled as explicit events
- multiple effects and async flows interact
- the feature has many transitions and edge cases
- long-term maintainability benefits from reducer and action separation
- the complexity is high enough to justify the overhead
- router-driven state changes must participate in wider event-driven workflows

## What Not To Use By Default

Do not choose classic NgRx Store only because:

- the app might grow later
- the team is familiar with NgRx
- a small feature has one loading state and one list

Do not choose Signal Store only because:

- it feels newer
- the feature could theoretically become more complex later

Do not choose facade-only state when:

- the feature is already difficult to reason about
- one facade is turning into a large state container with too many responsibilities

## Mixing Strategies

An application may use more than one state strategy.

That is acceptable.

Examples:

- root auth state uses facade-only state
- one medium-complexity feature uses Signal Store
- one highly complex domain feature uses classic NgRx Store

The choice should be made per feature, not once for the whole app.

## Migration Guidance

State strategy can evolve over time.

Preferred progression:

```text
facade -> signal store -> ngrx store
```

Move up only when the current approach is no longer clear enough.

Common migration signals:

- too much derived state packed into one facade
- too many unrelated writable signals in one place
- hard-to-follow feature event flows
- repeated coordination logic across multiple components

Do not migrate state architecture without a concrete complexity reason.

## Relationship To Other Guides

State choice does not change these core rules:

- containers access state, presentation components do not
- APIs stay in `data-access/api`
- DTOs stay in `data-access/dto`
- components do not call `HttpClient` directly
- route-level pages remain the main container entry points
- URL params and query params are still part of the feature state design when the view depends on them

Use together with:

- [feature.md](../../required/always-on/feature.md)
- [directories.md](../../required/always-on/directories.md)
- [http-api.md](../../required/always-on/http-api.md)

## AI Agent Rules

When choosing or generating state architecture, AI agents must follow these rules:

1. Default to the facade strategy unless the feature clearly needs more structure.
2. Prefer Signal Store before classic NgRx Store when a dedicated state container is needed.
3. Use classic NgRx Store only when event-driven complexity justifies it.
4. Do not introduce a heavier state architecture without a concrete reason in the feature.
5. Keep the state choice local to the feature unless the concern is truly global.
6. Keep components aligned with the container and presentation split regardless of state strategy.
7. Treat route params and query params as first-class state inputs when the feature must support deep links, shareable views, or refresh restore.

## Default Standard

If you are unsure what to use, use this default:

- facade-only for most features
- Signal Store for medium-complexity state-heavy features
- classic NgRx Store only for the most complex domains
