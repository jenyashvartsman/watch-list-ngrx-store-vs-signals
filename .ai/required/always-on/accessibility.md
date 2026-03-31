# Angular Accessibility Guide

## Purpose

This guide defines a simple accessibility baseline for Angular applications.

The goal is to make accessibility a default part of component and feature design, not a late cleanup step.

This guide focuses on practical decisions that developers and AI agents should apply while building the app.

## Core Principle

Use semantic HTML first.

- Prefer native elements before custom ARIA solutions.
- Make keyboard interaction work by default.
- Ensure visible labels, names, and states are exposed clearly.
- Treat accessibility as part of component API design.

## Semantic HTML

Choose the correct HTML element before adding classes or ARIA.

Prefer:

- `button` for actions
- `a` for navigation
- `form` for grouped form submission
- `label` for form field labels
- `table` for real tabular data
- `ul` and `ol` for lists
- `header`, `main`, `section`, `nav`, and `footer` for page structure

Avoid using generic `div` or `span` elements when a semantic element already fits the behavior.

Bad:

```html
<div class="order-card__action" (click)="save()">Save</div>
```

Good:

```html
<button type="button" class="order-card__action" (click)="save()">
  Save
</button>
```

## Buttons And Links

Do not blur the difference between actions and navigation.

- Use `button` for actions inside the current page.
- Use `a` or router links for navigation.
- Always define button `type`.
- Do not attach click handlers to non-interactive elements unless there is a very strong reason.

Prefer:

```html
<button type="submit">Save profile</button>
<a [routerLink]="['/orders', order.id]">Open order</a>
```

Avoid:

```html
<div (click)="submit()">Save profile</div>
<button type="button" (click)="goToOrder(order.id)">Open order</button>
```

unless a real constraint justifies it.

## Keyboard Accessibility

Every interactive feature must be usable with a keyboard.

At minimum:

- interactive elements must be reachable with `Tab`
- actions must work with keyboard activation
- focus order must follow the visual and logical order
- focus must remain visible

Do not remove focus outlines unless you replace them with an accessible visible alternative.

Avoid custom keyboard behavior when native element behavior already solves the problem.

## Forms

Forms must expose clear labels, help text, and error states.

Rules:

- every form control must have a visible label or an explicitly associated accessible name
- placeholder text is not a replacement for a label
- validation errors should be tied to the relevant field
- required fields should be clear in both text and programmatic state

Prefer:

```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  formControlName="email"
  aria-describedby="email-error"
  [attr.aria-invalid]="emailControl.invalid && emailControl.touched"
/>

@if (emailControl.invalid && emailControl.touched) {
  <p id="email-error">Enter a valid email address.</p>
}
```

## Error Messaging

Users should understand what went wrong and where.

- Put field-level validation near the relevant control.
- Use clear text, not internal error codes.
- For page-level errors, place the message near the top of the feature area.
- Do not rely only on color to communicate success, warning, or error state.

## Icons And Visual-Only Elements

Icons should not be the only source of meaning.

- Decorative icons should be hidden from assistive technology.
- Meaningful icons should have an accessible label nearby or inside the control.
- Status should be communicated with text, not only shape or color.

Prefer:

```html
<button type="button" aria-label="Close dialog">
  <app-icon name="close" aria-hidden="true" />
</button>
```

## Images

Use meaningful alternative text only when the image adds meaning.

- Decorative images should use empty `alt=""`.
- Content images should have short, useful alternative text.
- Do not repeat surrounding text word for word.

## Headings And Page Structure

Pages and major sections should have a clear heading structure.

Rules:

- each page should have a single primary heading
- headings should follow a logical order
- do not choose heading levels based only on visual size

Prefer:

```html
<main>
  <h1>Orders</h1>
  <section>
    <h2>Open orders</h2>
  </section>
</main>
```

## Dialogs And Overlays

Dialogs need extra care.

At minimum:

- move focus into the dialog when it opens
- trap focus while the dialog is open
- return focus to the triggering element when it closes
- provide a visible title
- provide a keyboard way to close it when appropriate

Do not build custom dialog behavior from scratch unless necessary. Prefer Angular CDK or a well-supported accessible dialog solution.

## Tables

Use tables only for real tabular data.

Rules:

- use proper table markup
- include column headers
- keep relationships between headers and cells clear

Do not use tables for page layout.

## Live Regions And Async State

When content updates asynchronously, make important state changes understandable.

Examples:

- loading state
- save success
- destructive action failure

Use visible UI first, and add ARIA live regions only when needed for important status updates.

Do not announce every small state change.

## Presentation Components

Presentation components must preserve accessibility, not hide it.

- expose accessible labels through inputs when needed
- forward native semantics where possible
- do not wrap native controls in a way that breaks labels, focus, or keyboard behavior
- keep reusable UI components compatible with standard HTML semantics

If a shared component replaces native behavior, its API must define how accessible naming, state, and focus are handled.

## Container Components

Containers should support accessibility through proper state and flow.

They should:

- provide meaningful loading, empty, and error states
- move focus when a major view change requires it
- pass accessible labels and status text to presentation components

Containers should not push accessibility concerns entirely into styling or shared UI components.

## Testing Accessibility

Keep this simple in this docs set.

At minimum, test:

- key user actions with keyboard navigation
- label and error behavior in forms
- dialog open and close focus behavior
- important conditional UI states

Accessibility should be checked in unit or integration tests where the behavior is owned.

## Anti-Patterns

Avoid:

- clickable `div` or `span` elements
- placeholders used as labels
- removing focus styles without replacement
- icon-only controls without an accessible name
- custom widgets that ignore keyboard behavior
- color-only status communication
- generic shared components that break native semantics

## AI Agent Rules

When creating or updating Angular code, AI agents must follow these rules:

1. Prefer semantic HTML before adding ARIA.
2. Use native interactive elements for actions and navigation.
3. Ensure interactive UI is keyboard accessible.
4. Do not use placeholder text as the only label.
5. Keep visible focus states intact.
6. Use accessible names for icon-only controls.
7. Preserve heading structure and page landmarks.
8. Prefer accessible platform or CDK primitives for dialogs and overlays.
9. Do not introduce shared UI abstractions that weaken accessibility.

## Default Standard

If you are unsure what to do, use this default:

- semantic HTML first
- buttons for actions, links for navigation
- visible labels for form controls
- keyboard-accessible interactions
- clear headings, states, and error messages
