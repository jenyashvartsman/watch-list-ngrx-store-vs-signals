# Angular Error Handling Guide

## Purpose

This guide defines a simple error handling strategy for Angular applications.

The goal is to make errors predictable for developers, AI agents, and users.

This guide focuses on:

- where errors should be handled
- what kind of UI should show them
- how to avoid leaking low-level transport details into components

## Core Principle

Handle errors at the correct layer.

- API services deal with transport concerns.
- Facades or stores coordinate feature state and user-facing error state.
- Components render the error state they receive.
- Forms display validation and submit errors near the relevant UI.

Do not let every component invent its own error strategy.

## Error Categories

Keep error handling simple by separating errors into a few practical categories.

### Field Validation Errors

These belong near the relevant form field.

Examples:

- required value missing
- invalid email
- password too short

These should be shown inline with the field.

### Form Submit Errors

These happen when the form is valid locally but the submit operation fails.

Examples:

- save request failed
- server rejected the payload
- permission denied

These should be shown in the form area, usually above the submit actions or near the top of the form.

### Feature Data Load Errors

These happen when a page or feature cannot load the data it needs.

Examples:

- orders failed to load
- session refresh failed
- order details request failed

These should be shown in the page or feature state, not hidden in the console.

### Global Errors

These are cross-cutting failures that are not owned by one specific component.

Examples:

- authentication expired
- application bootstrap failure
- unexpected server outage

These may be handled through global notifications, redirects, or a root-level error state.

## Layer Responsibilities

### API Services

API services should stay thin.

They should:

- perform HTTP requests
- return typed observables
- keep endpoint and payload logic local to the service

They should not:

- decide final user-facing error messages for the feature
- open toasts or dialogs
- mutate component state

API services may normalize transport details when needed, but they should not become a UI error layer.

### Facades And Stores

Facades or stores are the main error handling layer for feature state.

They should:

- expose `error` state when the feature needs it
- reset errors when starting a new operation when appropriate
- set loading and error state consistently
- decide whether an error belongs to page state, form state, or action feedback

Example:

```ts
import { finalize } from 'rxjs';

loadOrders(): void {
  this._isLoading.set(true);
  this._error.set(null);

  this.ordersApi.getOrders()
    .pipe(finalize(() => this._isLoading.set(false)))
    .subscribe({
      next: (orders) => this._orders.set(orders),
      error: () => this._error.set('Unable to load orders.'),
    });
}
```

### Components

Components should render error state, not own transport logic.

They should:

- display inline, section-level, or page-level errors
- trigger retry or dismiss actions through the facade or store
- keep error rendering close to the affected UI

They should not:

- call `HttpClient` directly
- build transport-level error handling inside the template
- duplicate message generation already owned by the facade or store

## User-Facing Messages

Error messages should be short, clear, and actionable when possible.

Prefer:

- "Unable to load orders."
- "Unable to save profile."
- "You do not have permission to delete this order."

Avoid:

- raw backend error payloads
- stack traces
- framework or network jargon
- vague text like "Something went wrong" when a clearer message is possible

If retry is available, make that clear in the UI.

## Loading And Error State

Loading and error state should work together cleanly.

Rules:

- clear stale errors when starting a new attempt when that improves UX
- use `finalize(...)` to reset loading state
- do not leave the feature stuck in loading after an error
- keep empty state separate from error state

Do not treat "no data" and "request failed" as the same UI state.

## Forms

Forms need both validation and submit error handling.

Rules:

- field validation stays next to the field
- form submit errors stay near the form actions or form header
- disable submit only when there is a clear reason
- do not hide submit errors behind console logs or toasts only

If the backend returns field-specific validation data, map it into the form when the app needs that behavior.

## Retry Behavior

Retry should be intentional.

Use retry when:

- the action is safe to repeat
- the user understands what will happen
- retry improves the normal workflow

Common examples:

- retry loading a list
- retry loading page data

Do not automatically retry destructive actions unless the feature explicitly requires it.

## Global Handling

Use global handling for truly cross-cutting problems.

Examples:

- auth expiration redirects to sign-in
- a root-level session facade exposes auth failure
- a global notification service shows rare cross-app failures

Do not move ordinary feature errors into global infrastructure just to avoid handling them locally.

## Logging

Logging is useful, but it is not user-facing error handling.

- log technical details where the application needs observability
- show clear user-facing messages separately
- do not rely on console output as the only error response

## Error UI Placement

Keep the error close to the failed interaction.

Preferred placement:

- field errors near the field
- form submit errors inside the form area
- page load errors inside the page content area
- global session or auth errors at the application shell level

The closer the error is to the affected UI, the easier it is to understand and recover from.

## Anti-Patterns

Avoid:

- handling the same error in multiple layers without a reason
- showing raw server messages directly to users by default
- swallowing errors silently
- mixing empty state and error state
- leaving stale error messages visible after successful retry
- putting all errors into global toast notifications
- letting presentation components invent transport error behavior

## AI Agent Rules

When creating or updating Angular code, AI agents must follow these rules:

1. Handle transport concerns in API services and feature error state in facades or stores.
2. Expose user-facing error state from the feature layer when the UI needs it.
3. Use `finalize(...)` to reset loading state for async operations.
4. Keep field, form, feature, and global errors separate.
5. Prefer clear feature-specific error messages over raw backend messages.
6. Do not call `HttpClient` directly from components.
7. Do not rely only on console logs or toasts for important errors.

## Default Standard

If you are unsure what to do, use this default:

- API service returns the observable
- facade or store owns `isLoading` and `error`
- component renders the error near the affected UI
- retry is explicit and user-driven
