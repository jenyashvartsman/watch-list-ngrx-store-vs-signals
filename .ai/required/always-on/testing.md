# Angular Testing Guide

## Purpose

This guide defines a simple testing strategy for Angular applications.

The goal is not to create a full testing handbook. The goal is to give developers and AI agents a small, predictable standard for writing the tests that matter most in this codebase.

This guide covers:

- unit tests
- integration tests

This guide does not define:

- end-to-end testing
- visual regression testing
- performance testing

## Core Principle

Write tests where behavior lives.

- Test isolated logic with unit tests.
- Test collaboration between Angular pieces with integration tests.
- Do not add large test suites for simple presentational markup.

## Test Types

### Unit Tests

Unit tests verify one class, function, or component in isolation.

Use unit tests for:

- pure utility functions
- validators
- facade methods and derived state
- NgRx selectors, reducers, and effects when using NgRx
- Signal Store methods and computed state when using Signal Store
- API services that transform request params or call the correct endpoint
- presentation components with meaningful UI logic

Unit tests should mock dependencies and focus on a small, explicit behavior.

### Integration Tests

Integration tests verify that multiple pieces work together inside Angular.

Use integration tests for:

- page or container components with child presentation components
- component and facade integration
- component and Signal Store integration
- component and NgRx facade integration
- reactive forms with validation, patching, and submit flows
- route-level components that depend on route params, guards, or resolvers

Integration tests should cover the main feature flow, not every internal branch.

## What To Test

### Presentation Components

Usually keep tests minimal.

Test presentation components when they:

- render important conditional UI
- emit important outputs
- apply accessibility-critical attributes or states
- contain non-trivial template behavior

Do not over-test:

- simple static markup
- one-line input rendering with no meaningful logic

### Container And Page Components

Prefer integration tests over deep isolated tests.

Test that the container or page:

- reads state correctly
- passes the right inputs to child components
- responds to child outputs correctly
- triggers facade or store methods correctly
- handles loading, error, and empty states when relevant

### Facades

Facade tests are high value in this architecture.

Test that the facade:

- exposes the expected state
- updates signals correctly
- calls API services correctly
- handles loading and error state consistently
- applies mapping or orchestration logic correctly

If a facade method is simple delegation only, one focused test is enough.

### Forms

Test forms at the level where behavior lives.

- Unit test custom validators and form services.
- Integration test the container or page that owns the submit flow.

Test:

- initial form state
- patching existing data
- validation messages
- submit enable or disable behavior
- submit payload creation

### API Services

Keep API service tests small.

Test:

- correct HTTP method
- correct URL
- correct params or payload
- typed response handling when logic exists

Do not test framework internals.

## File Placement

Keep tests close to the code they verify.

Examples:

- `orders.facade.ts` -> `orders.facade.spec.ts`
- `order-list.component.ts` -> `order-list.component.spec.ts`
- `profile-form.service.ts` -> `profile-form.service.spec.ts`
- `orders-page.component.ts` -> `orders-page.component.spec.ts`

Preferred structure:

```text
features/
  orders/
    pages/
      orders-page.component.ts
      orders-page.component.spec.ts
    components/
      order-list.component.ts
      order-list.component.spec.ts
    state/
      orders.facade.ts
      orders.facade.spec.ts
    forms/
      order-form.service.ts
      order-form.service.spec.ts
```

Only create a dedicated `testing/` folder when a feature needs shared test helpers or fixtures.

## Test Doubles

Use the simplest test double that keeps the test readable.

- Mock services at unit-test boundaries.
- Stub child presentation components in container integration tests when their internal rendering is not relevant.
- Use real Angular forms in form integration tests.
- Use `HttpTestingController` for API service tests.

Avoid building complex mock systems unless the feature truly needs them.

## Good Coverage

Good coverage means the important behavior is protected.

A feature is usually covered well enough when it has:

- unit tests for important local logic
- integration tests for the main user-facing flow

Do not chase coverage numbers if the tests stop being useful.

## Anti-Patterns

Avoid:

- testing every private implementation detail
- asserting framework behavior that Angular already guarantees
- writing large shallow test suites with weak assertions
- duplicating the same behavior across unit and integration tests
- testing presentational components as if they own business logic

## AI Agent Rules

When creating or updating tests, AI agents must follow these rules:

1. Default to unit tests for isolated logic and integration tests for feature behavior.
2. Do not add end-to-end tests unless explicitly requested.
3. Keep presentation component tests lightweight unless the component has meaningful behavior.
4. Prefer testing containers with their real form, state, and template wiring.
5. Add or update tests when changing facade logic, form behavior, validation, or route-level feature behavior.
6. Keep mocks small and explicit.
7. Place test files next to the source file by default.

## Default Standard

If you are unsure what to add, use this default:

- add unit tests for facades, validators, form services, and meaningful presentation logic
- add integration tests for pages, containers, and feature form flows
- skip broader testing layers unless the project explicitly needs them
