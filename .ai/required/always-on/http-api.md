# Angular HTTP API Guide

## Purpose

This document defines the required HTTP and API access conventions for Angular applications in this repository.

It is written for both humans and AI agents.

The goal is to make API access:

- predictable
- typed
- easy to test
- easy to refactor
- aligned with feature boundaries

This guide is an API-access contract, not a loose preference.

## Core Rule

HTTP access belongs in `data-access/api`.

Default flow:

```text
component -> facade/store -> data-access/api -> HttpClient -> backend
```

Pages, components, and presentation components must not call `HttpClient` directly.

## Data-Access Structure

Use:

```text
features/
  orders/
    data-access/
      api/
        orders-api.service.ts
      dto/
        order.dto.ts
```

Rules:

- keep `data-access` transport-focused
- put observable-returning API services in `api/`
- put backend request/response contracts in `dto/`
- do not introduce `repositories/` or `mappers/` by default

## Responsibilities

API services may:

- call backend endpoints
- define request/query param shapes
- return typed observables
- perform small transport-local transformations when necessary

API services must not:

- become feature facades
- own UI state
- inject feature facades or stores
- be called directly from pages/components

## HttpClient Usage

Inject `HttpClient` only inside API services or core HTTP infrastructure.

Good:

```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OrdersApiService {
  private readonly http = inject(HttpClient);
}
```

Bad:

```ts
export class OrdersListPageComponent {
  private readonly http = inject(HttpClient);
}
```

## API Service Design

API services should be thin and explicit.

Good method names:

- `getOrders()`
- `getOrderById(id)`
- `createOrder(payload)`
- `updateOrder(id, payload)`
- `deleteOrder(id)`

Bad method names:

- `fetchData()`
- `runRequest()`
- `postThing()`
- `callBackend()`

Rules:

- name methods by domain intent
- keep methods small
- align one method to one transport operation where practical

## Return Types

API services should return typed observables.

Preferred:

```ts
getOrders(filters: OrdersQueryDto): Observable<OrderDto[]>
```

Rules:

- keep return types explicit
- do not return `any`
- do not hide observables behind untyped wrappers

## DTOs

DTOs define backend-facing transport contracts.

Examples:

- `order.dto.ts`
- `create-order.dto.ts`
- `orders-query.dto.ts`

Rules:

- DTOs belong in `data-access/dto`
- DTOs are transport contracts, not UI models
- keep DTOs close to the API service that uses them

Example:

```ts
export type OrderDto = {
  id: string;
  status: string;
  total: number;
};
```

## Domain Models vs DTOs

Keep transport contracts separate from UI/domain models.

Rules:

- DTOs describe backend shapes
- feature models describe application-facing data shapes
- if shapes differ, convert near the API usage site or in the consuming facade/store

Do not treat backend DTOs as the automatic UI contract unless the shapes are intentionally identical.

## Request Payloads

Use typed payload DTOs for create/update/search requests.

Example:

```ts
export type CreateOrderDto = {
  customerId: string;
  items: { productId: string; quantity: number }[];
};
```

Rules:

- payload types should be explicit
- avoid passing loosely typed raw objects
- keep payloads backend-facing

## Query Parameters

Build query parameters explicitly.

Example:

```ts
getOrders(query: OrdersQueryDto): Observable<OrderDto[]> {
  const params = new HttpParams()
    .set('status', query.status)
    .set('page', query.page.toString());

  return this.http.get<OrderDto[]>('/api/orders', { params });
}
```

Rules:

- do not build query strings manually
- use `HttpParams`
- keep parameter construction readable and typed

## Example API Service

```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderDto } from '../dto/order.dto';
import { OrdersQueryDto } from '../dto/orders-query.dto';

@Injectable()
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly ordersApiUrl = '/api/orders';

  getOrders(query: OrdersQueryDto): Observable<OrderDto[]> {
    const params = new HttpParams()
      .set('status', query.status)
      .set('page', query.page.toString());

    return this.http.get<OrderDto[]>(this.ordersApiUrl, { params });
  }

  getOrderById(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.ordersApiUrl}/${id}`);
  }

  createOrder(payload: CreateOrderDto): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.ordersApiUrl, payload);
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ordersApiUrl}/${id}`);
  }
}
```

## State Integration

API services are consumed by facades or stores.

Facade flow:

```text
page -> facade -> api
```

Signal Store flow:

```text
page -> signal store -> api
```

Classic NgRx flow:

```text
page -> facade -> store/effects -> api
```

Rules:

- components do not call APIs directly
- state layers decide how and when to call APIs
- API services stay transport-focused regardless of state strategy

## Error Handling

Handle user-facing error state outside the API service unless the concern is truly transport-global.

Use API services to:

- surface typed transport errors through observables
- optionally normalize low-level transport details when necessary

Use facades/stores/effects to:

- map failures to feature error state
- decide user-facing messages
- trigger retry or recovery flows

Rules:

- do not bury all feature error semantics in the API layer
- keep user-facing messaging close to the consuming feature

## Interceptors

Use interceptors in `app/core/http` for cross-cutting HTTP behavior.

Good uses:

- auth headers
- correlation IDs
- global error logging
- common request enrichment

Bad uses:

- feature-specific business branching
- feature-local response mapping

Rules:

- interceptors belong in core
- keep interceptors generic
- do not use interceptors as hidden feature orchestration

## Authentication And Headers

Apply shared auth/header behavior through interceptors when possible.

Avoid repeating this inside every API service:

- token attachment
- common content headers
- shared tracing headers

Feature-specific headers should be rare and intentional.

## Retry Strategy

Do not apply blanket retries by default.

Use retries only when:

- the endpoint is idempotent
- the failure is likely transient
- the product behavior clearly benefits

Rules:

- retry decisions should be explicit
- avoid hidden retry storms in generic API helpers

## Pagination And Filtering

Keep pagination and filtering explicit in request DTOs.

Example:

```ts
export type OrdersQueryDto = {
  status: string;
  page: number;
  pageSize: number;
};
```

Rules:

- prefer explicit query DTOs over ad hoc parameter bags
- keep pagination behavior visible and typed

## File Uploads And Downloads

Handle uploads/downloads in API services with explicit method names and types.

Examples:

- `uploadAvatar(file: File): Observable<UploadResultDto>`
- `downloadInvoice(id: string): Observable<Blob>`

Rules:

- keep binary transport explicit
- keep feature orchestration outside the API service

## Environment And Base URLs

Base URLs and runtime config should come from app/core configuration, not scattered string literals.

Rules:

- avoid hardcoding many environment-specific host strings across feature services
- centralize base configuration
- keep endpoint paths readable

## Testing Strategy

Test API services as transport units.

Verify:

- correct HTTP method
- correct URL
- correct params/payload
- correct typed response behavior

Recommended test location:

```text
features/orders/data-access/api/orders-api.service.spec.ts
```

Rules:

- test transport behavior
- do not duplicate higher-level facade/store tests here

## Anti-Patterns

Avoid these patterns.

### HttpClient In Components

```ts
private readonly http = inject(HttpClient);
```

inside a page/component is a violation.

Why it fails:

- breaks architecture boundaries
- duplicates transport logic
- makes refactors harder

### API Service Acting Like A Facade

Why it fails:

- mixes transport and orchestration
- leaks UI concerns into data-access
- weakens state boundaries

### Untyped Responses

```ts
getOrders(): Observable<any>
```

Why it fails:

- weak safety
- unclear contracts
- easier to break silently

## AI Agent Operating Rules

AI agents must follow these rules when generating or editing Angular API access:

1. Put HTTP access in `data-access/api`.
2. Put backend request/response contracts in `data-access/dto`.
3. Return typed observables from API services.
4. Use `inject(HttpClient)` only inside API services or core HTTP infrastructure.
5. Do not call APIs directly from components.
6. Keep API services thin and transport-focused.
7. Do not introduce repositories or mappers by default.
8. Build query params explicitly with `HttpParams`.
9. Keep DTOs separate from feature/domain models.
10. If uncertain, keep orchestration in facade/store and keep transport in the API service.

## Decision Matrix

| Need | Preferred location |
| --- | --- |
| Backend GET/POST/PUT/DELETE call | `features/<feature>/data-access/api/` |
| Request/response contract | `features/<feature>/data-access/dto/` |
| Auth interceptor | `app/core/http/` |
| Feature orchestration after API success | facade/store/effects |
| User-facing error message | facade/store/page layer |
| Domain model for UI | `features/<feature>/models/` |

## Recommended Example

```text
features/
  orders/
    data-access/
      api/
        orders-api.service.ts
      dto/
        order.dto.ts
        create-order.dto.ts
        orders-query.dto.ts
    models/
      order.model.ts
    state/
      orders.facade.ts
```

Flow:

```text
orders-list-page -> orders.facade -> orders-api.service -> HttpClient -> backend
```

## Final Standard

An Angular HTTP/API layer is compliant in this repository if:

- transport code lives in `data-access/api`
- DTOs are explicit and typed
- API services return typed observables
- components do not call transport directly
- orchestration remains outside the API layer

If a page or presentational component knows how to call the backend directly, the boundary is not strong enough.
