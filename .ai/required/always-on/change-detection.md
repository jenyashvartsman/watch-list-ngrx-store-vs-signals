# Angular Change Detection Guide

## Purpose

This guide defines a simple, production-oriented change detection strategy for Angular applications.

The goal is to keep component rendering predictable, efficient, and easy for developers and AI agents to follow.

This guide assumes a modern Angular application that prefers:

- standalone components
- signals for local and feature state
- container and presentation component separation

## Core Principle

Prefer explicit reactive state over implicit mutable state.

- Use signals for local UI state and derived state.
- Keep data flow one way: state down, events up.
- Make component updates intentional and easy to trace.

## Default Strategy

Use `ChangeDetectionStrategy.OnPush` by default for application components.

`OnPush` should be the standard for:

- pages
- container components
- presentation components
- shared UI components

Use the default strategy only when a legacy integration or third-party constraint makes `OnPush` impractical.

## Signals First

Prefer signals over manual change detection patterns.

Use signals for:

- local loading state
- selected item state
- open or closed UI state
- derived view state
- facade-exposed feature state

Example:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { OrdersFacade } from '../state/orders.facade';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  templateUrl: './orders-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent {
  private readonly ordersFacade = inject(OrdersFacade);

  protected readonly selectedOrderId = signal<string | null>(null);

  protected readonly orders = this.ordersFacade.orders;
  protected readonly isLoading = this.ordersFacade.isLoading;
  protected readonly selectedOrder = computed(() =>
    this.orders().find((order) => order.id === this.selectedOrderId()) ?? null
  );

  protected selectOrder(orderId: string): void {
    this.selectedOrderId.set(orderId);
  }
}
```

## Computed State

Use `computed()` for state derived from other signals.

Good examples:

- filtered lists
- selected record lookup
- button disabled state
- empty-state visibility
- display-ready view models

Do not store derived values in separate writable signals unless you truly need independent state.

Prefer:

```ts
protected readonly isSubmitDisabled = computed(
  () => this.isSaving() || this.form.invalid
);
```

Avoid:

```ts
protected readonly isSubmitDisabled = signal(false);
```

when the value can be derived directly.

## Inputs And Presentation Components

Presentation components should stay simple and reactive.

- Use `input()` for incoming state.
- Use `output()` for outgoing events.
- Do not inject facades, stores, or API services into presentation components.
- Prefer passing already prepared view data from the container.

Presentation components should not need manual change detection calls.

## Containers

Container components coordinate state sources and UI events.

They may:

- read from facades or stores
- combine signals into view-ready state
- trigger loading and mutation methods
- pass data to presentation components

They should not manually force rendering unless there is a real integration constraint.

## Observables And Async Pipe

Signals are preferred for component-facing state.

If a dependency still exposes observables:

- convert to signals when the component owns the state boundary
- or use the observable directly in the template with `async` when conversion adds no value

Prefer one clear reactive style per component instead of mixing patterns without reason.

Good:

- facade exposes signals
- component reads signals directly

Acceptable:

- route params remain observable
- template uses `async` for a small, local binding

Avoid large components that mix:

- manual subscriptions
- `async` pipe
- writable signals
- imperative local mirrors of the same data

## Effects

Use `effect()` sparingly.

Use it when the component needs to react to signal changes with a side effect such as:

- syncing a form with loaded data
- triggering a load based on selected state
- writing to browser storage
- integrating with APIs outside Angular template rendering

Do not use `effect()` for state that can be represented with `computed()`.

Prefer:

```ts
protected readonly fullName = computed(
  () => `${this.user().firstName} ${this.user().lastName}`
);
```

Instead of:

```ts
protected readonly fullName = signal('');

private readonly syncFullName = effect(() => {
  this.fullName.set(`${this.user().firstName} ${this.user().lastName}`);
});
```

## Immutability

Treat component-facing state as immutable.

- Replace arrays and objects instead of mutating them in place.
- Prefer `signal.set()` and `signal.update()` with new references.
- Keep facade and store updates predictable.

Prefer:

```ts
this.orders.update((orders) => orders.filter((order) => order.id !== orderId));
```

Avoid:

```ts
this.orders().splice(index, 1);
```

Mutating existing references makes updates harder to reason about and easier to break.

## Lists And Rendering

For repeated UI, keep list rendering stable.

- Use Angular control flow with explicit tracking.
- Track by stable identifiers.
- Avoid rebuilding large view models in the template.

Prefer:

```html
@for (order of orders(); track order.id) {
  <app-order-list-item [order]="order" />
}
```

Avoid tracking by index unless the list is static.

## Forms

Forms should follow the same reactive rules.

- The container or form service owns form creation.
- Use signals for surrounding UI state such as loading, submit state, and selected mode.
- Do not mirror every form control value into separate component signals unless needed.

Use the form itself as the state source when Angular forms already provide the behavior.

## Manual Change Detection

Avoid reaching for:

- `ChangeDetectorRef.detectChanges()`
- `ChangeDetectorRef.markForCheck()`
- `setTimeout()` used only to force UI refresh

These should be rare escape hatches, not standard architecture.

If manual change detection appears necessary, first check whether the real issue is:

- mutable state
- an unnecessary local copy of reactive data
- mixing observables and signals poorly
- doing work in the wrong component layer

## When Default Change Detection Is Acceptable

Using the default strategy can be acceptable for:

- legacy components not yet migrated
- small wrapper components around third-party libraries
- temporary compatibility layers during refactoring

Do not use the default strategy as the project-wide fallback.

## Anti-Patterns

Avoid:

- mutable objects passed through multiple layers
- manual subscriptions for component state when signals or template binding are enough
- storing derived state in writable fields
- presentation components with service injection
- calling manual change detection to patch architecture problems
- large templates that recompute too much inline

## AI Agent Rules

When creating or updating Angular code, AI agents must follow these rules:

1. Use `ChangeDetectionStrategy.OnPush` by default.
2. Prefer signals for component-facing and facade-owned state.
3. Use `computed()` for derived state before considering `effect()`.
4. Keep presentation components input/output only.
5. Do not introduce manual subscriptions when the template or a signal-based flow is enough.
6. Do not add manual change detection unless a concrete integration problem requires it.
7. Update state immutably.
8. Track repeated items by stable identifiers.

## Default Standard

If you are unsure what to do, use this default:

- `OnPush` for all components
- signals for local and facade state
- `computed()` for derived UI state
- immutable updates
- no manual change detection
