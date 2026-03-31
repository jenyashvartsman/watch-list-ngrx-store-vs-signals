# Angular Docs

## Structure

This documentation set is split into three groups:

- `required/always-on`
- `optional/by-strategy`
- `optional/by-app-type`

Use the required docs as the default baseline for every Angular app in this repo. Add optional docs only when the app or feature actually uses that strategy.

## Required / Always-On

These are the baseline conventions that should shape almost every Angular app:

- [directories.md](./required/always-on/directories.md)
- [naming.md](./required/always-on/naming.md)
- [routing.md](./required/always-on/routing.md)
- [feature.md](./required/always-on/feature.md)
- [http-api.md](./required/always-on/http-api.md)
- [forms.md](./required/always-on/forms.md)
- [ui-components.md](./required/always-on/ui-components.md)
- [change-detection.md](./required/always-on/change-detection.md)
- [testing.md](./required/always-on/testing.md)
- [accessibility.md](./required/always-on/accessibility.md)
- [error-handling.md](./required/always-on/error-handling.md)
- [environment-config.md](./required/always-on/environment-config.md)

## Optional / By Strategy

These are selected when the app chooses a specific implementation strategy:

- [style-bem.md](./optional/by-strategy/style-bem.md)
- [style-tailwind.md](./optional/by-strategy/style-tailwind.md)
- [state-facade.md](./optional/by-strategy/state-facade.md)
- [state-ngrx-signal-store.md](./optional/by-strategy/state-ngrx-signal-store.md)
- [state-ngrx-store.md](./optional/by-strategy/state-ngrx-store.md)
- [state-selection.md](./optional/by-strategy/state-selection.md)

State strategy guidance in this repo treats route params and query params as valid state sources when the URL should represent the current feature view.

## Optional / By App Type

These are selected only when the app needs that concern:

- [auth-authorization.md](./optional/by-app-type/auth-authorization.md)
