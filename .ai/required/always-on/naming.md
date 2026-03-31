# Angular Naming Guide

## Purpose

This guide defines naming conventions for Angular applications.

The goal is to keep naming predictable across features so developers and AI agents can create files and symbols that fit the project without guesswork.

## Core Principle

Name by role and meaning, not by preference.

- Prefer clear names over clever names.
- Keep naming consistent across the same type of artifact.
- Use names that reflect feature ownership and responsibility.

## General Rules

- Use English for identifiers and file names.
- Prefer full words over abbreviations unless the abbreviation is standard and unambiguous.
- Keep names short, but not vague.
- Avoid generic names such as `data`, `info`, `manager`, `helper`, or `util` unless the role is truly generic.
- Keep one naming style per artifact type.

## File Names

Use kebab-case for Angular file names.

Examples:

- `orders-page.component.ts`
- `order-list.component.ts`
- `orders.facade.ts`
- `orders.store.ts`
- `orders-api.service.ts`
- `profile-form.service.ts`
- `auth.guard.ts`
- `app.routes.ts`
- `orders.routes.ts`

Prefer file names that include the artifact role.

Good:

- `order-card.component.ts`
- `orders.facade.ts`
- `order-form.service.ts`

Avoid:

- `component.ts`
- `service.ts`
- `state.ts`
- `utils.ts`

## Class Names

Use PascalCase for class names.

Examples:

- `OrdersPageComponent`
- `OrderListComponent`
- `OrdersFacade`
- `OrdersStore`
- `OrdersApi`
- `ProfileFormService`
- `AuthGuard`
- `PermissionService`

Keep the class name aligned with the file name.

## Components

Component names should describe the UI role clearly.

Use:

- `PageComponent` suffix for route-level container pages
- `Component` suffix for all other components

Examples:

- `OrdersPageComponent`
- `ProfileSettingsPageComponent`
- `OrderListComponent`
- `OrderFiltersComponent`
- `EmptyStateComponent`

### Container And Presentation Naming

Use names that describe UI purpose, not implementation style.

Prefer:

- `OrdersPageComponent`
- `OrderFiltersComponent`
- `OrderListComponent`

Avoid names like:

- `OrdersContainerComponent`
- `OrderListPresenterComponent`

The role should come from placement and behavior, not awkward class names.

Use:

- `pages/` for route-level containers
- `components/` for feature components
- `shared/ui/` for reusable presentation-only components

## Selectors

Use kebab-case selectors with a consistent prefix.

Examples:

- `app-orders-page`
- `app-order-list`
- `app-order-filters`
- `ui-button`

Rules:

- feature components should usually use the app prefix
- shared UI components may use a dedicated `ui-` prefix if the project chooses that pattern
- keep selectors aligned with component file names

Avoid vague selectors such as:

- `app-item`
- `app-card`

when the component has a more specific purpose.

## Services

Service names should reflect responsibility directly.

Examples:

- `OrdersApi`
- `OrdersFacade`
- `ProfileFormService`
- `PermissionService`
- `ConfigService`

Prefer role-based suffixes:

- `Api`
- `Facade`
- `Store`
- `Service`

Do not use `Service` for everything when a more specific role is clearer.

## API And Data Access Naming

Keep API naming explicit and feature-based.

Prefer:

- `orders.api.ts` -> `OrdersApi`
- `auth.api.ts` -> `AuthApi`
- `order.dto.ts` -> `OrderDto`
- `create-order-request.dto.ts` -> `CreateOrderRequestDto`

Avoid:

- `orders.service.ts` when the class is really an API client
- `data.service.ts`
- `base-api.service.ts` unless the project has a real shared abstraction

## Facades, Stores, And State Files

State files should make the chosen strategy obvious.

Examples:

- `orders.facade.ts` -> `OrdersFacade`
- `orders.store.ts` -> `OrdersStore`
- `orders.actions.ts`
- `orders.reducer.ts`
- `orders.effects.ts`
- `orders.selectors.ts`

Do not mix naming styles inside one feature.

If the feature uses a facade-only strategy, prefer `OrdersFacade` and do not invent store naming for the same layer.

## DTOs And Models

Use names that describe transport or domain intent clearly.

Examples:

- `OrderDto`
- `UpdateOrderRequestDto`
- `OrderSummaryDto`
- `ProfileFormDto`

Rules:

- use `Dto` for transport or structured data contracts
- use `RequestDto` and `ResponseDto` only when the distinction adds value
- use feature-specific form DTO names for typed forms

Avoid vague names like:

- `OrderData`
- `ProfileModel`

unless the project has a specific reason for those terms.

## Variables And Properties

Use camelCase for variables and properties.

Examples:

- `orders`
- `selectedOrderId`
- `isLoading`
- `hasDeletePermission`
- `ordersApiUrl`

### Booleans

Boolean names should read clearly as true or false.

Prefer:

- `isLoading`
- `isAuthenticated`
- `hasPermission`
- `canDeleteOrder`
- `shouldShowFilters`

Avoid:

- `loading`
- `auth`
- `permission`
- `deleteAllowed`

when a clearer boolean name is possible.

### Observables

If the project still uses observables directly in component-facing APIs, use the `$` suffix.

Examples:

- `orders$`
- `currentUser$`
- `routeParams$`

Do not use `$` for signals or plain values.

Prefer:

- `orders` for a signal
- `orders$` for an observable

## Methods

Method names should describe action or intent.

Prefer:

- `loadOrders()`
- `deleteOrder()`
- `selectOrder()`
- `initialize()`
- `signOut()`
- `hasPermission()`

Avoid:

- `doLoad()`
- `handleData()`
- `process()`
- `run()`

unless the method truly has that general meaning.

## Routes And URL Segments

Use lowercase kebab-case for route paths.

Examples:

- `orders`
- `orders/:orderId`
- `profile-settings`
- `sign-in`

Rules:

- use nouns for resource routes
- keep URL segments readable
- avoid technical implementation words in public URLs

Prefer:

- `/orders`
- `/profile-settings`

Avoid:

- `/orders-page`
- `/profile_component`
- `/load-orders`

## Inputs And Outputs

Name inputs after the data they represent and outputs after the event they emit.

Prefer:

- `order`
- `orders`
- `isLoading`
- `deleteOrder`
- `save`
- `cancel`

Avoid:

- `data`
- `item`
- `clicked`
- `onDelete`

For outputs, prefer event names rather than handler names.

Prefer:

- `delete`
- `save`
- `close`
- `selectOrder`

Avoid:

- `onDelete`
- `handleSave`

## CSS Class Names

Follow the chosen styling guide.

- Use BEM naming from [style-bem.md](../../optional/by-strategy/style-bem.md) when the feature uses BEM.
- Use utility-first class composition from [style-tailwind.md](../../optional/by-strategy/style-tailwind.md) when the feature uses Tailwind.

Do not mix unrelated naming styles inside the same component without a reason.

## Test Files

Keep test names aligned with the source file.

Examples:

- `orders.facade.spec.ts`
- `order-list.component.spec.ts`
- `profile-form.service.spec.ts`

## Anti-Patterns

Avoid:

- generic names with unclear ownership
- inconsistent suffixes across similar files
- abbreviations that are not obvious
- component names that expose architecture instead of UI purpose
- boolean names that do not read clearly
- using `$` suffix for non-observable values
- route names based on implementation rather than user-facing meaning

## AI Agent Rules

When creating or updating Angular code, AI agents must follow these rules:

1. Use kebab-case for file names and PascalCase for classes.
2. Include the artifact role in the file and class name.
3. Name components by UI purpose, not by internal architecture labels.
4. Use clear feature-based names for facades, stores, APIs, DTOs, and form services.
5. Use readable boolean names such as `is`, `has`, `can`, or `should`.
6. Use `$` suffix only for observables.
7. Keep route paths lowercase and user-facing.
8. Align test file names directly with the source file they verify.

## Default Standard

If you are unsure what to name something, use this default:

- feature name + artifact role
- clear UI purpose for components
- clear action verb for methods
- clear boolean prefixes for booleans
