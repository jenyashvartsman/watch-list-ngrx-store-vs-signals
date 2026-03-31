# Angular Environment And Configuration Guide

## Purpose

This guide defines a simple configuration strategy for Angular applications.

The goal is to keep environment values centralized, predictable, and safe for developers and AI agents to use.

This guide focuses on:

- where configuration should live
- how features should consume configuration
- how to separate build-time and runtime concerns

## Core Principle

Treat configuration as application infrastructure, not feature-local state.

- Define config centrally.
- Read config through a stable app-level API.
- Do not scatter environment access across components and services.

## What Counts As Configuration

Configuration includes values such as:

- API base URLs
- app name
- feature flags
- analytics identifiers
- external service endpoints
- environment labels such as `development` or `production`

Configuration does not include:

- per-user state
- feature state
- form values
- hardcoded business data

## Recommended Ownership

Configuration should live in the application or core layer.

Recommended structure:

```text
app/
  core/
    config/
      app-config.ts
      app-config.token.ts
      config.service.ts
environments/
  environment.ts
  environment.development.ts
  environment.production.ts
```

Use a single app-level config model instead of many unrelated environment objects.

## Build-Time Configuration

Build-time configuration is resolved when the app is built.

Use it for values such as:

- production vs development API base URL
- feature flags that are fixed per deployment
- environment labels

Example:

```ts
export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  isProduction: boolean;
}

export const environment: AppConfig = {
  apiBaseUrl: '/api',
  appName: 'Orders Admin',
  isProduction: false,
};
```

Keep these files small and focused on configuration values only.

## Runtime Configuration

Runtime configuration is loaded when the app starts.

Use it when values may differ without rebuilding the app, such as:

- deployment-specific API hosts
- customer-specific branding values
- feature flags managed outside the build

If runtime config is needed, load it once during app bootstrap and expose it through a stable service or token.

Do not let features fetch their own app configuration independently.

## Config Access

Features should consume configuration through a central abstraction.

Good options:

- a typed config object
- an injection token
- a root-level config service

Example token:

```ts
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  isProduction: boolean;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
```

Example usage:

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '../../core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private readonly ordersApiUrl = `${this.config.apiBaseUrl}/orders`;
}
```

This keeps environment access typed and centralized.

## Components And Features

Components should rarely read environment config directly.

Prefer:

- root-level services using config for infrastructure concerns
- feature services reading config when the value is part of an integration boundary
- containers receiving prepared values when config affects UI behavior

Avoid injecting environment config into many presentation components.

## Secrets

Do not store secrets in Angular client code.

Client-side applications cannot securely hide:

- API secrets
- private tokens
- service credentials

Only public or intentionally exposed client configuration should be placed in Angular config.

If a value must remain secret, it belongs on the server.

## Feature Flags

Feature flags should be centralized and typed.

Prefer:

- one config model containing feature flags
- clear flag names
- one decision point per feature when possible

Avoid:

- scattered hardcoded booleans
- string comparisons across templates
- ad hoc environment checks in many files

Example:

```ts
export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  isProduction: boolean;
  features: {
    orderExport: boolean;
    advancedFilters: boolean;
  };
}
```

## Environment Checks

Keep environment checks rare and centralized.

Prefer:

- `config.isProduction`
- a typed feature flag
- a config service helper

Avoid direct checks spread across the app such as:

```ts
if (environment.production) {
  ...
}
```

inside many unrelated features.

## API Base URLs

Base URLs should come from configuration, not be repeated across services.

Prefer:

- central base URL config
- per-service local endpoint variables derived from that base URL

Example:

```ts
private readonly ordersApiUrl = `${this.config.apiBaseUrl}/orders`;
```

This keeps API services easy to move between environments.

## Testing

Keep configuration testing simple.

Test:

- config-dependent services with a mock config object or token
- runtime config loading if the app uses it
- feature flags only where they change real behavior

Do not over-test static environment files.

## Anti-Patterns

Avoid:

- importing environment values directly into many feature files
- storing secrets in frontend config
- hardcoding API hosts across services
- mixing feature state with app config
- creating different config access patterns in different features
- letting presentation components depend on infrastructure config

## AI Agent Rules

When creating or updating Angular code, AI agents must follow these rules:

1. Keep environment and app config in a central application or core config layer.
2. Prefer typed config access through a token or config service.
3. Derive service endpoint URLs from config instead of hardcoding hosts repeatedly.
4. Do not store secrets in Angular client configuration.
5. Do not import environment files directly into many feature-level classes unless the project explicitly uses that pattern.
6. Keep feature flags typed and centralized.
7. Avoid scattering `production` checks across the codebase.

## Default Standard

If you are unsure what to do, use this default:

- one typed `AppConfig`
- central config access through a token or service
- API base URL defined once
- no secrets in frontend code
- feature code consumes config indirectly through infrastructure services
