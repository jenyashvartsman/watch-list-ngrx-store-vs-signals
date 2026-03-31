# Angular UI Components Guide

## Purpose

This document defines the required architecture and API conventions for Angular UI components in this repository.

It is written for both humans and AI agents.

The goal is to make UI components:

- reusable when appropriate
- local when appropriate
- easy to understand
- easy to test
- consistent across features

This guide is a UI-component contract, not a loose preference.

## Core Rule

UI components should be presentation-first.

They should:

- receive data through inputs
- emit user intent through outputs
- render markup, accessibility, and styles

They should not:

- own feature orchestration
- access APIs directly
- know about feature facades or stores

The main decision is not "can this be a component?" but:

- should this stay feature-local in `features/<feature>/components/`
- or should this become a reusable component in `shared/ui/`

## Component Categories

Use these categories consistently.

### Feature-Local UI Components

These belong to one feature.

Use when:

- the component is tied to one domain
- reuse outside the feature is unlikely
- the component's naming or content is feature-specific

Examples:

- `orders-table`
- `order-filters`
- `invoice-summary-card`

Location:

```text
features/<feature>/components/
```

### Shared UI Components

These are reusable building blocks.

Use when:

- the component is generic
- the API is stable
- the behavior is reusable across features
- the component does not depend on one feature's domain or state

Examples:

- `button`
- `dialog`
- `empty-state`
- `data-table`
- `badge`

Location:

```text
shared/ui/
```

## Shared vs Feature-Local Decision Rule

Default to feature-local first.

Promote to `shared/ui` only when:

- reuse is real, not speculative
- the API can be generalized cleanly
- the component remains presentation-only

Do not move a component to `shared/ui` just because:

- it looks nice
- you think it might be reused later
- two features use superficially similar markup with different behavior

Rule:

- prove reuse first, then extract

## Presentation-Only Rule

UI components must remain presentation-only by default.

They may:

- use `input()`
- use `output()`
- use content projection
- manage tiny local visual interaction state
- encapsulate layout, semantics, and styles

They must not:

- inject facades or stores
- inject feature APIs
- access route params
- dispatch feature actions
- hide business workflows inside the component

If a component needs feature state access, it is no longer just a UI component.

## API Design

A UI component API should be:

- small
- explicit
- typed
- semantic

Good inputs:

- `label`
- `variant`
- `size`
- `disabled`
- `items`
- `selectedId`

Good outputs:

- `clicked`
- `closed`
- `selected`
- `submitted`

Bad inputs:

- `config: any`
- `state`
- `store`
- `apiResponse`

Bad outputs:

- `dispatch`
- `patchState`
- `runAction`

## Inputs And Outputs

Prefer `input()` and `output()` for component contracts.

Example:

```ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly actionLabel = input<string>();
  readonly actionClicked = output<void>();
}
```

Rules:

- use explicit typed inputs
- use outputs for user intent
- avoid giant configuration objects unless the component is intentionally config-driven

## Content Projection

Use content projection when it creates a cleaner API than many small inputs.

Good candidates:

- dialog layout
- card layouts
- panel/header/footer composition
- empty-state actions

Example:

```html
<app-panel>
  <div panel-title>Orders</div>
  <div panel-actions>
    <button type="button">Refresh</button>
  </div>
  <app-orders-table [orders]="orders()" />
</app-panel>
```

Rules:

- use projection for layout composition, not to hide unclear ownership
- keep projected regions named and intentional

## Variants

Expose a small variant API instead of duplicating many near-identical components.

Good:

- `variant: 'primary' | 'secondary' | 'ghost'`
- `size: 'sm' | 'md' | 'lg'`

Bad:

- `primaryButtonComponent`
- `secondaryButtonComponent`
- many one-off components that differ only by color or spacing

Rules:

- keep variant options bounded
- do not turn one component into an uncontrolled styling engine

## Styling Strategy

UI components should follow the styling strategy chosen by the app.

If using BEM:

- keep a clear block per component
- keep styles local to the component

If using Tailwind:

- keep utility usage explicit
- extract shared UI primitives only after real reuse

Rules:

- component styling should not leak feature state concerns
- visual variants belong to the UI component API, not to feature orchestration

## Accessibility

Every reusable UI component must have accessible semantics.

Required considerations:

- proper interactive element choice
- focus handling
- keyboard behavior
- labels and ARIA attributes when necessary
- disabled state semantics

Examples:

- use `button`, not clickable `div`
- dialogs need focus management
- icon-only buttons need an accessible label

## Local UI State

Small component-local visual state is allowed inside presentation components.

Examples:

- dropdown open/closed
- accordion expanded/collapsed
- local hover/focus styling state

Not allowed:

- feature entity loading
- save/delete orchestration
- route-driven state

Rule:

- local UI state is fine when it stays visual and self-contained

## Shared UI Folder Structure

Recommended:

```text
shared/
  ui/
    button/
      button.component.ts
      button.component.html
      button.component.scss
      index.ts
    dialog/
      dialog.component.ts
      index.ts
    empty-state/
      empty-state.component.ts
      index.ts
```

Rules:

- one folder per reusable primitive
- keep public exports intentional
- avoid deep barrel nesting

## Feature-Local UI Structure

Recommended:

```text
features/
  orders/
    components/
      orders-table.component.ts
      order-filters.component.ts
      order-summary-card.component.ts
```

Rules:

- keep domain-specific names
- do not push feature-specific UI into `shared/ui`

## Container Integration

UI components are consumed by containers.

Example:

```html
<app-orders-table
  [orders]="orders()"
  [isLoading]="isLoading()"
  (deleteOrder)="onDeleteOrder($event)"
/>
```

Rules:

- containers provide data
- UI components render and emit
- orchestration stays outside the UI component

## Tables, Lists, And Cards

These are often good feature-local presentation components first.

Promote them to shared only if:

- columns/sections are generic enough
- APIs stay readable
- reuse is real across multiple features

Rule:

- generic abstraction should not erase domain clarity

## Dialogs And Overlays

Reusable dialog shells may live in `shared/ui`.

Feature-specific dialog content should stay inside the owning feature.

Good split:

- shared dialog shell: `shared/ui/dialog`
- feature dialog content: `features/orders/components/delete-order-dialog`

## Testing Strategy

Test UI components as presentation components.

Focus on:

- rendering inputs
- output emissions
- accessibility behavior
- visual state transitions

Rules:

- do not test feature orchestration in reusable UI components
- keep tests aligned with the component's public API

## Anti-Patterns

Avoid these patterns.

### Shared Component Injecting Feature State

```ts
private readonly ordersFacade = inject(OrdersFacade);
```

inside a shared UI component is a violation.

Why it fails:

- breaks reuse
- leaks feature coupling
- weakens architecture boundaries

### Premature Extraction

Moving a component to `shared/ui` after one local use is usually a bad tradeoff.

Why it fails:

- weakens ownership
- adds abstraction too early
- creates unstable APIs

### Config Blob APIs

```ts
readonly config = input<any>();
```

Why it fails:

- unclear contract
- weak typing
- difficult to reason about

### UI Components Performing Persistence

Why it fails:

- mixes presentation and orchestration
- reduces reuse
- complicates testing

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular UI components:

1. Default new UI components to feature-local placement.
2. Move a component to `shared/ui` only after real reuse is clear.
3. Keep UI components presentation-only.
4. Use `input()` and `output()` for component APIs.
5. Do not inject facades, stores, or APIs into reusable UI components.
6. Keep component APIs explicit, typed, and small.
7. Use content projection when it creates a cleaner layout API.
8. Keep variants bounded and intentional.
9. Preserve accessibility semantics.
10. If uncertain, keep the component local to the feature.

## Decision Matrix

| Need | Preferred location |
| --- | --- |
| Domain-specific table/card/filter | `features/<feature>/components/` |
| Reusable button/dialog/badge | `shared/ui/` |
| Reads feature state | container, not reusable UI |
| Emits user intent only | presentation/UI component |
| Layout shell for projected content | `shared/ui/` if generic |
| Feature-specific dialog content | feature-local component |

## Recommended Example

```text
shared/
  ui/
    button/
      button.component.ts
    dialog/
      dialog.component.ts
    empty-state/
      empty-state.component.ts

features/
  orders/
    components/
      orders-table.component.ts
      order-filters.component.ts
      delete-order-dialog.component.ts
```

Flow:

```text
container/page -> feature-local UI components
container/page -> shared UI primitives
UI components -> emit user intent upward
```

## Final Standard

An Angular UI component setup is compliant in this repository if:

- feature-local components stay local by default
- shared UI components are truly reusable
- component APIs are explicit and typed
- UI components remain presentation-only
- orchestration stays outside reusable UI primitives

If a shared UI component knows about one feature's state, routes, or API behavior, it is not actually shared.
