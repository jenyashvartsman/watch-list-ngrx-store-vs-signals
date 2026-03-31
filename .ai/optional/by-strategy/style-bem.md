# Angular BEM Styling Guide

## Purpose

This document defines the required BEM styling conventions for Angular applications in this repository.

It is written for both humans and AI agents.

The goal is to make component styles:

- predictable
- easy to extend
- safe to refactor
- locally scoped
- readable at scale

This guide is a styling contract, not a loose preference.

## What BEM Means

BEM stands for:

- Block
- Element
- Modifier

Use this shape:

```text
.block
.block__element
.block--modifier
.block__element--modifier
```

## Core Rules

1. Every Angular component should have one primary block.
2. The block name should match the component's UI responsibility, not framework details.
3. Elements belong to a block and must use `__`.
4. Modifiers describe visual or behavioral variants and must use `--`.
5. Do not style using raw tag names when a block or element class can be used instead.
6. Do not create selectors that depend on DOM depth or fragile nesting.
7. Keep styles local to the component whenever possible.

## Why This Matters In Angular

Angular already gives component-level style encapsulation, but encapsulation alone does not create a good class system.

BEM adds:

- a stable naming model
- clear ownership inside templates
- safer refactoring when markup changes
- a shared convention AI agents can follow consistently

Use Angular component scoping and BEM together, not as substitutes for each other.

## Block Naming

Each component should expose one top-level block class on its root visual container.

Example:

```html
<section class="user-card">
  ...
</section>
```

Good block names:

- `user-card`
- `order-summary`
- `app-header`
- `settings-panel`

Bad block names:

- `container`
- `wrapper`
- `box`
- `component`
- `blue-card`

Rules:

- Use kebab-case.
- Name the block after the UI object or business concept.
- Prefer stable semantic names over appearance-based names.
- Reuse the same block name across the component template and stylesheet.

## Element Naming

Elements are parts of a block that have no standalone meaning outside it.

Example:

```html
<article class="user-card">
  <header class="user-card__header">
    <h2 class="user-card__title">Profile</h2>
    <p class="user-card__subtitle">Admin user</p>
  </header>

  <div class="user-card__body">
    ...
  </div>
</article>
```

Rules:

- Elements must always be tied to their block.
- Do not use element names without the full block prefix.
- Element names should describe structure or role, not styling.

Good:

- `user-card__title`
- `user-card__actions`
- `user-card__avatar`

Bad:

- `title`
- `card-title`
- `user-card__big-title`

## Modifier Naming

Modifiers represent alternate states, variants, or sizes.

Example:

```html
<button class="button button--primary button--loading">
  Save
</button>
```

Rules:

- Modifiers never replace the base block or element class.
- A modifier must be meaningful only in the context of its base class.
- Use modifiers for variants such as size, theme, emphasis, or stateful presentation.

Good:

- `button--primary`
- `button--secondary`
- `button--small`
- `user-card__avatar--compact`

Bad:

- `primary`
- `is-primary` as a visual variant replacement for BEM
- `large-title`

## State Classes

Use BEM modifiers for component-owned visual state.

Examples:

- `accordion--expanded`
- `tab-list__tab--active`
- `form-field--invalid`

Use framework state hooks only when they are required by Angular or third-party libraries.

If a state is transient but visually meaningful, it should still map to a modifier class in the template.

Example:

```html
<section class="accordion" [class.accordion--expanded]="isOpen()">
  ...
</section>
```

## Angular Template Examples

### Basic Component

```html
<article class="product-card" [class.product-card--featured]="featured()">
  <div class="product-card__media">
    <img class="product-card__image" [src]="imageUrl()" [alt]="name()" />
  </div>

  <div class="product-card__content">
    <h3 class="product-card__title">{{ name() }}</h3>
    <p class="product-card__price">{{ price() | currency }}</p>
  </div>

  <div class="product-card__actions">
    <button class="product-card__button product-card__button--primary">
      Add to cart
    </button>
  </div>
</article>
```

### Repeated Items

```html
<ul class="order-list">
  @for (order of orders(); track order.id) {
    <li class="order-list__item">
      <app-order-row class="order-list__row" [order]="order" />
    </li>
  }
</ul>
```

Rules:

- The list is the block.
- Repeated children inside the list should use block elements.
- Child Angular components may render their own separate blocks internally.

## SCSS Structure

Keep selectors block-oriented and use SCSS nesting only through explicit BEM inheritance with `&`.

Preferred:

```scss
.user-card {
  display: grid;
  gap: 1rem;
  padding: var(--space-4);
  border: 1px solid var(--color-border-muted);
  border-radius: var(--radius-lg);
  background: var(--color-surface-default);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font: var(--font-heading-sm);
    color: var(--color-text-strong);
  }

  &--compact {
    gap: 0.5rem;
  }
}
```

Avoid deeply nested SCSS like this:

```scss
.user-card {
  .header {
    .title {
      color: red;
    }
  }
}
```

Rules:

- Use `&__element` and `&--modifier` for BEM inheritance.
- Keep nesting shallow when SCSS is used.
- Do not nest generic descendant selectors inside a block.
- Do not rely on implicit parent context when a BEM class can be named directly.

## Recommended SCSS File Pattern

Inside a component stylesheet, keep rules in this order:

1. block
2. block elements
3. block modifiers
4. element modifiers
5. responsive overrides

Example:

```scss
.checkout-summary {
  display: grid;
  
  &__header {
    display: flex;
  }

  &__total {
    font-weight: 700;
  }

  &--loading {
    opacity: 0.6;
    pointer-events: none;
  }

  &__button--primary {
    inline-size: 100%;
  }
}

@media (width >= 48rem) {
  .checkout-summary {
    grid-template-columns: 1fr auto;
  }
}
```

## Theme Initialization

Initialize theme tokens before component-level BEM rules.

Use CSS custom properties for:

- colors
- typography
- spacing
- radius
- shadows

Recommended global initialization:

```scss
:root {
  --color-surface-default: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-border-muted: #dbe3ec;
  --color-text-strong: #0f172a;
  --color-text-muted: #475569;
  --color-accent: #0f766e;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-lg: 1rem;
  --font-heading-sm: 600 1.125rem/1.4 var(--font-family-base);
  --font-label-sm: 500 0.875rem/1.4 var(--font-family-base);
}
```

Theme override example:

```scss
[data-theme='dark'] {
  --color-surface-default: #0f172a;
  --color-surface-muted: #162033;
  --color-border-muted: #334155;
  --color-text-strong: #f8fafc;
  --color-text-muted: #cbd5e1;
  --color-accent: #2dd4bf;
}
```

Rules:

- Initialize tokens at application or theme-root level, not inside random feature components.
- BEM blocks should consume tokens, not define the design system.
- Use semantic token names such as `--color-text-strong`, not raw purpose-limited names such as `--blue-500`.
- Theme switching should update tokens first, then let BEM blocks inherit the new values.

## Content Projection

When using Angular content projection, keep the host component block name stable and define projected regions as elements when the structure is owned by the component.

Example:

```html
<section class="panel">
  <header class="panel__header">
    <ng-content select="[panel-title]" />
  </header>

  <div class="panel__body">
    <ng-content />
  </div>
</section>
```

Rule:

- Do not force projected content to adopt internal BEM class names unless the component explicitly owns that markup.

## Host Element Guidance

If the host element is the visual root, put the block class on the host.

Example:

```ts
@Component({
  selector: 'app-alert-banner',
  host: {
    class: 'alert-banner',
    '[class.alert-banner--dismissible]': 'dismissible()',
  },
})
```

This is preferred when the host itself is the semantic and visual wrapper.

If the template needs an internal wrapper for layout, the block may live inside the template instead.

## When To Create A New Block

Create a new block when:

- a child part can be understood as a standalone UI object
- the child is reusable independently
- the child has its own variants and internal structure

Example:

Instead of:

```text
dashboard__chart
dashboard__chart-title
dashboard__chart-legend
```

Prefer a dedicated child block when it is a real reusable unit:

```text
dashboard-card
chart-panel
```

Rule:

- Do not stretch one block too far just to preserve a single naming tree.

## When Not To Use BEM

Do not invent BEM names for:

- framework utility classes that are already standardized
- third-party library classes you do not control
- global typography or layout utility classes that are explicitly part of a documented design system

If utilities exist, they must be intentional and limited.

BEM should remain the default for component-owned styling.

## Interaction With Angular Features

### `ngClass` and class bindings

Use class bindings to toggle modifiers, not to assemble ad hoc styling systems.

Good:

```html
<div
  class="toast"
  [class.toast--success]="type() === 'success'"
  [class.toast--error]="type() === 'error'"
>
  ...
</div>
```

Avoid:

```html
<div [ngClass]="['toast', type(), size(), customClass()]">
  ...
</div>
```

Why:

- explicit modifiers are easier to audit
- generated markup stays predictable
- AI agents can reason about valid variants

### `:host` and `:host-context`

Use `:host` sparingly for host-only layout or display concerns.

Example:

```scss
:host {
  display: block;
}
```

Prefer BEM classes for internal styling rather than placing all styling on `:host`.

Avoid `:host-context` unless there is a documented theming or integration reason.

## Accessibility And Semantics

BEM names should not replace semantic HTML.

Use semantic elements first:

- `button`
- `nav`
- `header`
- `section`
- `ul`
- `form`

Then apply BEM classes to describe the component structure.

Correct:

```html
<nav class="side-nav">
  <ul class="side-nav__list">
    <li class="side-nav__item">
      <a class="side-nav__link">Dashboard</a>
    </li>
  </ul>
</nav>
```

## Anti-Patterns

Avoid these patterns.

### Generic Class Names

```html
<div class="wrapper">
  <div class="title">
    ...
  </div>
</div>
```

Why it fails:

- no ownership
- high collision risk
- impossible to reason about at scale

### Appearance-Based Names

```html
<div class="blue-box">
  <span class="big-text"></span>
</div>
```

Why it fails:

- tied to current styling, not purpose
- blocks redesigns
- encourages one-off CSS

### Deep Selector Coupling

```scss
.order-card > div > div > h3 {
  margin: 0;
}
```

Why it fails:

- fragile to markup changes
- difficult for AI agents to preserve safely
- obscures intent

### Modifier Without Base Class

```html
<button class="button--primary"></button>
```

Why it fails:

- breaks BEM meaning
- makes shared baseline styles unreliable

Correct:

```html
<button class="button button--primary"></button>
```

## AI Agent Operating Rules

AI agents must follow these rules when creating or editing Angular templates and styles:

1. Assign exactly one primary block per component root visual object.
2. Use block names that match the component purpose.
3. Add element classes for internal structure rather than relying on descendant selectors.
4. Add modifier classes for variants and UI state.
5. Do not generate generic classes like `wrapper`, `inner`, `box`, `red`, or `large`.
6. Do not create selectors that depend on tag structure when a BEM class can be added.
7. Keep the class contract between template and stylesheet explicit.
8. When toggling appearance from component state, use class bindings for BEM modifiers.
9. Do not move a feature-specific block into shared styles unless it is truly reusable.
10. Prefer readability and predictability over clever SCSS nesting.

## Decision Matrix

| Need | Use |
| --- | --- |
| Main component container | block |
| Internal component part | element |
| Variant such as `primary`, `compact`, `inline` | modifier |
| Visual state such as `active`, `expanded`, `invalid` | modifier |
| Reusable nested UI object | new block |
| Quick one-off styling based on DOM depth | do not use |

## Recommended Example

### Template

```html
<section class="filter-panel" [class.filter-panel--collapsed]="collapsed()">
  <header class="filter-panel__header">
    <h2 class="filter-panel__title">Filters</h2>

    <button
      type="button"
      class="filter-panel__toggle filter-panel__toggle--ghost"
      [attr.aria-expanded]="!collapsed()"
      (click)="toggle()"
    >
      Toggle
    </button>
  </header>

  <form class="filter-panel__form">
    <div class="filter-panel__group">
      <label class="filter-panel__label" for="status">Status</label>
      <select class="filter-panel__control" id="status">
        <option>Open</option>
      </select>
    </div>
  </form>
</section>
```

### SCSS

```scss
.filter-panel {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border-muted);
  border-radius: var(--radius-lg);
  background: var(--color-surface-default);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin: 0;
    font: var(--font-heading-sm);
    color: var(--color-text-strong);
  }

  &__form {
    display: grid;
    gap: 0.75rem;
  }

  &__group {
    display: grid;
    gap: 0.375rem;
  }

  &__label {
    font: var(--font-label-sm);
    color: var(--color-text-muted);
  }

  &__control {
    min-inline-size: 0;
  }

  &__toggle--ghost {
    background: transparent;
  }

  &--collapsed &__form {
    display: none;
  }
}
```

## Final Standard

A component is BEM-compliant in this repository if:

- its root UI object has a clear block
- its internal parts are modeled as elements
- its variants and visual states are modeled as modifiers
- its template and stylesheet use the same naming contract
- its selectors stay resilient when markup evolves

If a class name does not clearly express block, element, or modifier responsibility, it should be renamed.
