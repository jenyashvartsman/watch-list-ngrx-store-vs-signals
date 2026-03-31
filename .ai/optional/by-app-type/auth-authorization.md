# Angular Auth And Authorization Guide

## Purpose

This guide defines a simple authentication and authorization strategy for Angular applications.

The goal is to keep auth concerns centralized, predictable, and easy for developers and AI agents to apply consistently.

This guide focuses on:

- authentication state ownership
- route protection
- permission checks
- feature consumption of current-user and auth state

## Core Principle

Keep authentication global and authorization explicit.

- Authentication belongs at the application or core layer.
- Authorization rules should be easy to see and easy to test.
- Components should consume auth state, not invent auth logic.

## Authentication Vs Authorization

Keep these concerns separate.

### Authentication

Authentication answers:

- is the user signed in
- who is the current user
- is the session still valid

### Authorization

Authorization answers:

- can the user access this route
- can the user perform this action
- does the user have the required role or permission

Do not combine these concepts into one vague boolean when the feature needs both.

## Ownership

Authentication should be owned at the root or core level.

Recommended location:

```text
app/
  core/
    auth/
      auth.api.ts
      auth.facade.ts
      auth.guard.ts
      permission.service.ts
      models/
        current-user.dto.ts
```

Use a root-level facade or store to expose:

- current user
- auth status
- session loading state
- sign-in and sign-out methods

Features should consume this central source instead of creating local auth state.

## Recommended Flow

Default flow:

```text
component -> auth facade -> auth api
route guard -> auth facade -> auth api
feature facade -> auth facade
```

This keeps session ownership centralized while still allowing features to react to auth state.

## Auth Facade

The auth facade should expose a small, stable API.

Typical responsibilities:

- initialize session state
- expose current user
- expose signed-in status
- expose session loading state
- sign in
- sign out
- refresh or validate session when required by the app

Example:

```ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from './auth.api';
import { CurrentUserDto } from './models/current-user.dto';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authApi = inject(AuthApi);

  private readonly _currentUser = signal<CurrentUserDto | null>(null);
  private readonly _isLoading = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  initialize(): void {
    this._isLoading.set(true);

    this.authApi.getSession()
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (user) => this._currentUser.set(user),
        error: () => this._currentUser.set(null),
      });
  }

  async signIn(email: string, password: string): Promise<void> {
    this._isLoading.set(true);

    const user = await firstValueFrom(
      this.authApi.signIn({ email, password }).pipe(
        finalize(() => this._isLoading.set(false))
      )
    );

    this._currentUser.set(user);
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.authApi.signOut());
    this._currentUser.set(null);
  }
}
```

## Route Protection

Protect routes at the router level, not only inside component logic.

Use guards for:

- signed-in-only routes
- guest-only routes such as sign-in
- permission-gated areas

Prefer thin guards that delegate to the auth facade or a permission service.

Example:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from './auth.facade';

export const authGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.isAuthenticated() || router.createUrlTree(['/sign-in']);
};
```

Do not rely only on hiding links or buttons to protect restricted areas.

## Permission Checks

Permission checks should be explicit and reusable.

Common strategies:

- role-based access
- permission-based access
- policy-based access

Choose one primary model for the project and keep it consistent.

Example permission service:

```ts
import { Injectable, inject } from '@angular/core';
import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authFacade = inject(AuthFacade);

  hasPermission(permission: string): boolean {
    const user = this.authFacade.currentUser();

    return !!user?.permissions.includes(permission);
  }
}
```

Use permission checks in:

- guards
- container components
- feature facades when action availability depends on user permissions

Avoid scattering raw role or permission string checks across many templates.

## Components

Components should consume auth state, not own it.

Containers may:

- read current user state
- show or hide actions based on permissions
- delegate sign-out actions

Presentation components should:

- receive already prepared auth-related inputs
- emit user interactions such as `signOut`

Do not inject auth API services directly into presentation components.

## Feature Usage

Features often need auth state without becoming auth owners.

Examples:

- show the current user name
- disable delete actions without permission
- choose which actions to render
- attach the current user context to a feature request flow

Prefer one of these patterns:

- feature container reads from `AuthFacade`
- feature facade reads from `AuthFacade` and exposes feature-specific derived state

Do not duplicate session state inside each feature.

## API Layer

Auth-related API services should stay thin.

Typical responsibilities:

- sign in
- sign out
- get current session
- refresh token or session when required

Transport concerns such as headers or token attachment should usually be handled by interceptors or shared HTTP infrastructure, not repeated in every feature service.

## Unauthorized And Expired Session Handling

Handle expired sessions consistently.

Common behavior:

- clear auth state
- redirect to sign-in
- optionally preserve a return URL
- show a clear session-expired message when appropriate

Do not let each feature decide its own session-expiration behavior.

## UI Rules

Auth and permission-driven UI should remain understandable.

- Hide actions the user should never see when that improves clarity.
- Disable actions only when the user benefits from understanding that the action exists but is unavailable.
- Keep route guards and UI visibility rules aligned.

Do not treat hidden buttons as the only authorization mechanism.

## Testing

Keep testing straightforward.

At minimum, test:

- auth facade session state behavior
- sign-in and sign-out flows
- guards for protected and guest routes
- permission checks for important feature actions

Use unit or integration tests depending on where the behavior lives.

## Anti-Patterns

Avoid:

- duplicating auth state in multiple features
- injecting auth API services directly into many components
- checking raw permission strings all over templates
- relying only on hidden UI for authorization
- mixing session ownership into unrelated feature facades
- letting each feature implement its own expired-session flow

## AI Agent Rules

When creating or updating Angular code, AI agents must follow these rules:

1. Keep authentication state in a root or core auth facade or store.
2. Protect restricted routes with guards.
3. Keep permission checks explicit and reusable.
4. Do not duplicate session state inside features.
5. Do not inject auth API services directly into presentation components.
6. Prefer feature containers or facades consuming `AuthFacade`.
7. Keep expired-session handling consistent across the app.

## Default Standard

If you are unsure what to do, use this default:

- root-level `AuthFacade`
- thin `AuthApi`
- route guards for access control
- reusable permission service or auth-derived permission helpers
- feature components consume auth state, but do not own it
