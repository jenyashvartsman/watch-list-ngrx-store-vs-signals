# Angular Tailwind Styling Guide

## Purpose

This document defines the required Tailwind CSS conventions for Angular applications in this repository.

It is written for both humans and AI agents.

The goal is to make Tailwind-based UI code:

- consistent
- readable
- scalable
- safe to refactor
- predictable for code generation

This guide is a styling contract, not a loose recommendation.

## Tailwind In This Repository

Tailwind is used as a utility-first styling system for component templates.

The default expectation is:

- use utilities directly in Angular templates
- keep classes composable and explicit
- avoid ad hoc custom CSS unless there is a clear reason
- extract patterns only when repetition is real

Tailwind should improve speed and consistency, not create unreadable templates.

## Core Principles

1. Prefer Tailwind utilities over component-specific CSS for standard layout and visual styling.
2. Keep styling close to the template that owns it.
3. Use semantic HTML first, then Tailwind utilities.
4. Avoid long, inconsistent class strings with duplicated intent.
5. Extract repeated patterns intentionally, not prematurely.
6. Use Angular bindings for stateful variants instead of building uncontrolled dynamic class systems.
7. Make class strings structured enough that AI agents can extend them safely.

## Default Styling Strategy

Use Tailwind for:

- spacing
- layout
- flex and grid
- typography
- borders
- colors
- shadows
- responsive behavior
- common interaction states

Use component CSS or a shared abstraction only when:

- the styling is too repetitive to keep inline
- a complex selector is required
- third-party integration requires targeted overrides
- the UI pattern is a documented reusable primitive

## Template-First Rule

Default to styling Angular components in the template instead of in `.scss` files.

Preferred:

```html
<section class="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
  <h2 class="text-lg font-semibold text-slate-900">Orders</h2>
</section>
```

Avoid moving ordinary utility combinations into custom classes without a strong reason.

Bad:

```scss
.orders-panel {
  @apply grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm;
}
```

Use custom CSS only when it improves clarity or solves a real limitation.

## Class Ordering

Keep utility classes in a stable order so templates remain readable.

Recommended order:

1. layout and display
2. positioning
3. sizing
4. spacing
5. borders
6. backgrounds
7. typography
8. effects
9. transitions and animation
10. interaction and state variants
11. responsive variants

Example:

```html
<button
  class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 border border-transparent bg-sky-600 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  Save
</button>
```

Rule:

- keep similar utilities grouped together
- avoid random ordering
- when editing, preserve the existing order convention

## Line Length And Wrapping

If a class string becomes hard to scan on one line, wrap it across lines in the template.

Preferred:

```html
<div
  class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
         sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto]"
>
  ...
</div>
```

Rules:

- wrap long class strings at logical group boundaries
- do not split individual utility tokens
- keep the wrapped value visually aligned and easy to diff

## Repetition Threshold

Do not extract a reusable abstraction after one use.

Extract a shared primitive, directive, component, or documented template pattern when:

- the same class combination appears in multiple features
- the combination represents a stable design-system concept
- the pattern has a clear API and ownership

Keep styles inline when:

- the markup is local to one component
- repetition is minor
- extraction would hide intent more than it helps

## Shared Primitive Rule

If a UI pattern is reused broadly, prefer a real reusable component over copy-pasted utility strings.

Good candidates:

- buttons
- inputs
- cards
- badges
- dialogs
- empty states

Example:

```text
shared/ui/button/
shared/ui/card/
shared/ui/badge/
```

Rule:

- Tailwind reuse should happen through component architecture, not random copy-paste macros.

## Angular Bindings

Use Angular class bindings for conditional variants.

Preferred:

```html
<button
  class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition"
  [class.bg-sky-600]="variant() === 'primary'"
  [class.text-white]="variant() === 'primary'"
  [class.hover:bg-sky-700]="variant() === 'primary'"
  [class.bg-white]="variant() === 'secondary'"
  [class.text-slate-900]="variant() === 'secondary'"
>
  Save
</button>
```

Avoid opaque dynamic assembly:

```html
<button [ngClass]="buttonClasses()">
  Save
</button>
```

Use computed class helpers only when:

- the variant logic is genuinely complex
- the output is still constrained to a documented set
- the helper improves readability more than inline bindings would

## `ngClass` Guidance

Prefer explicit class bindings over large `ngClass` objects or arrays when possible.

Good:

```html
<div
  class="rounded-lg border p-4"
  [class.border-emerald-200]="status() === 'success'"
  [class.bg-emerald-50]="status() === 'success'"
  [class.border-rose-200]="status() === 'error'"
  [class.bg-rose-50]="status() === 'error'"
>
  ...
</div>
```

Acceptable when well-bounded:

```html
<div [ngClass]="statusClassMap()[status()]">
  ...
</div>
```

Rules:

- `ngClass` must not become a hidden styling language
- valid variants should be enumerable and documented
- avoid passing arbitrary class strings from parent to child unless the component explicitly supports it

## Responsive Design

Use Tailwind responsive prefixes directly in templates.

Preferred:

```html
<section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
  ...
</section>
```

Rules:

- start mobile-first
- add breakpoint variants only when needed
- keep responsive behavior close to the element it affects

Avoid scattering responsive logic between template classes and unrelated custom CSS.

## Interaction States

Use Tailwind state variants for common interactions:

- `hover:`
- `focus:`
- `focus-visible:`
- `active:`
- `disabled:`
- `aria-*`
- `data-*` when the library supports it

Example:

```html
<a
  class="text-sm font-medium text-slate-700 transition hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
>
  View details
</a>
```

Rules:

- interactive elements must have visible focus treatment
- disabled styles should communicate state clearly
- do not rely on hover alone for critical affordance

## Dark Mode And Themes

Only use theme variants such as `dark:` if the repository has a documented theming system.

If theming exists:

- follow the approved token palette
- keep theme variants consistent
- do not invent one-off theme exceptions in feature templates

If theming does not exist yet:

- do not introduce `dark:` utilities opportunistically

## Design Tokens

Prefer Tailwind classes that map to the repository's agreed design tokens and color scale.

Rules:

- use approved spacing, radius, and color values
- prefer semantic consistency over visually similar but random utility choices
- do not mix many adjacent shades without a reason

Good:

- `bg-slate-900 text-white`
- `border-slate-200`
- `text-slate-600`

Avoid:

- `text-gray-617`
- arbitrary colors for routine UI without a documented need

## Theme Definition

Define theme values centrally and map them into Tailwind instead of inventing colors and spacing ad hoc inside feature templates.

Recommended approach:

1. initialize semantic design tokens in global CSS
2. map those tokens into the Tailwind theme
3. consume the resulting utilities in Angular templates

### Global Theme Tokens

Example:

```scss
:root {
  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-border: #dbe3ec;
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-accent: #0f766e;
  --radius-card: 1rem;
}

[data-theme='dark'] {
  --color-surface: #0f172a;
  --color-surface-muted: #162033;
  --color-border: #334155;
  --color-text: #f8fafc;
  --color-text-muted: #cbd5e1;
  --color-accent: #2dd4bf;
}
```

### Tailwind Theme Mapping

Example:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
    },
  },
} satisfies Config;
```

### Template Usage

```html
<section class="rounded-card border border-border bg-surface p-5 text-text shadow-sm">
  <p class="text-sm text-text-muted">Active users</p>
  <a class="text-accent hover:opacity-80">View users</a>
</section>
```

Rules:

- Define theme tokens once at the application level.
- Use semantic names such as `surface`, `text`, and `accent`.
- Feature templates should consume approved utilities, not hardcode raw hex values.
- If a token repeats across the app, add it to Tailwind instead of scattering arbitrary values.
- Theme switching should change token values first, allowing existing utilities to adapt automatically.

## Arbitrary Values

Use arbitrary values sparingly.

Allowed only when:

- the design requires a value not covered by the scale
- the value is intentional and justified
- adding the utility does not create repeated magic numbers everywhere

Example:

```html
<div class="max-w-[72rem]">
  ...
</div>
```

Rules:

- prefer scale values first
- if an arbitrary value repeats, consider extending Tailwind tokens instead
- do not fill templates with one-off pixel math

## `@apply` Guidance

Avoid using `@apply` as a default abstraction mechanism.

Do not use `@apply` to recreate component CSS for routine utility bundles.

Use `@apply` only when:

- integrating with third-party markup you cannot control
- defining a small number of documented global primitives
- custom CSS selectors are required and utilities alone are insufficient

Why:

- excessive `@apply` hides the actual utility contract
- it reintroduces naming and indirection problems Tailwind is meant to reduce

## Component Stylesheets

A component stylesheet should usually be small or empty in a Tailwind-first Angular codebase.

Good uses for component CSS:

- keyframes or uncommon animations
- complex pseudo-elements
- browser-specific fixes
- third-party overrides
- structural rules not expressible cleanly with utilities

If a stylesheet grows large, reevaluate whether:

- the component should use more template utilities
- the pattern should become a shared UI primitive

## Content Projection And Wrapper Components

For wrapper or layout components, keep the Tailwind contract visible in the template.

Example:

```html
<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <header class="mb-4 flex items-center justify-between gap-4">
    <ng-content select="[panel-title]" />
    <ng-content select="[panel-actions]" />
  </header>

  <div class="grid gap-4">
    <ng-content />
  </div>
</section>
```

Rule:

- projected content may bring its own classes, but the container's layout contract should remain explicit in the owning component

## Accessibility And Semantics

Tailwind classes do not replace semantic markup.

Always start with the correct HTML element:

- `button` for actions
- `a` for navigation
- `label` for form labels
- `nav` for navigation regions
- `table` for tabular data

Then add utilities.

Example:

```html
<button
  type="button"
  class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
>
  Edit
</button>
```

## Anti-Patterns

Avoid these patterns.

### Class Soup

```html
<div class="flex p-2 pt-3 px-4 w-full text-sm bg-white bg-slate-50 border rounded rounded-lg shadow border-slate-200 items-center justify-between">
  ...
</div>
```

Why it fails:

- duplicated intent
- inconsistent utility selection
- hard to review safely

### Opaque Helper Strings

```html
<div [class]="getPanelClasses(item)">
  ...
</div>
```

Why it fails:

- impossible to audit in template context
- weakens static reasoning for AI agents
- encourages arbitrary output

### Premature Extraction

```scss
.dashboard-card {
  @apply rounded-xl border bg-white p-4 shadow-sm;
}
```

created after one local use is a bad tradeoff.

Why it fails:

- hides simple markup intent
- creates indirection too early
- produces CSS APIs with weak ownership

### Random Arbitrary Values

```html
<div class="mt-[13px] w-[287px] rounded-[11px]">
  ...
</div>
```

Why it fails:

- breaks token consistency
- spreads magic numbers
- makes design hard to evolve

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular templates with Tailwind:

1. Default to Tailwind utilities in the template for normal component styling.
2. Use semantic HTML before adding utilities.
3. Keep utility order stable and grouped.
4. Prefer explicit `[class.foo]` bindings over opaque dynamic class generation.
5. Do not introduce custom CSS or `@apply` unless repetition or technical constraints justify it.
6. Reuse shared UI primitives for stable repeated patterns instead of duplicating long class strings everywhere.
7. Use responsive and state variants directly where the behavior is owned.
8. Avoid arbitrary values unless the scale truly cannot express the requirement.
9. Preserve visible focus styles on interactive elements.
10. If a class list becomes hard to scan, wrap it cleanly instead of hiding it behind indirection.

## Decision Matrix

| Need | Preferred solution |
| --- | --- |
| Normal spacing/layout/color/typography | Tailwind utilities in template |
| Conditional visual state | Angular class bindings with Tailwind classes |
| Responsive behavior | Tailwind breakpoint variants |
| Shared product primitive | reusable Angular component in `shared/ui` |
| Complex selector or pseudo-element | component stylesheet |
| Third-party override | targeted stylesheet rule |
| Repeated magic arbitrary value | extend tokens or redesign |

## Recommended Example

### Template

```html
<section
  class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
         sm:grid-cols-[minmax(0,1fr)_auto]"
>
  <div class="grid gap-1">
    <p class="text-sm font-medium text-slate-500">Active users</p>
    <p class="text-3xl font-semibold tracking-tight text-slate-950">12,480</p>
  </div>

  <div class="flex items-start justify-start sm:justify-end">
    <a
      class="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      href="/users"
    >
      View users
    </a>
  </div>
</section>
```

### Conditional Variant

```html
<span
  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
  [class.bg-emerald-100]="status() === 'active'"
  [class.text-emerald-800]="status() === 'active'"
  [class.bg-amber-100]="status() === 'pending'"
  [class.text-amber-800]="status() === 'pending'"
  [class.bg-slate-100]="status() === 'archived'"
  [class.text-slate-700]="status() === 'archived'"
>
  {{ status() }}
</span>
```

## Final Standard

A Tailwind implementation is compliant in this repository if:

- utilities are used directly and intentionally
- class strings remain readable and logically ordered
- dynamic variants are explicit and bounded
- repeated patterns are extracted only when they become real shared abstractions
- custom CSS exists only where utilities are not the best tool

If a template becomes difficult to scan or a styling rule cannot be explained quickly, the implementation should be simplified.
