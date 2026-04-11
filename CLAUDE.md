# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm test           # Run all tests (Vitest)
```

Run a single test file:
```bash
ng test -- src/app/app.spec.ts
```

## Architecture

This is an Angular 21 lab project comparing **NgRx Store vs Angular Signals** for state management in a watch-list app.

**Standalone API throughout** — no NgModules. All components use `ChangeDetectionStrategy.OnPush`.

### Structure

```
src/app/
├── shell/layouts/app-layout/   # Root layout (header nav + router-outlet)
├── features/
│   ├── movies/                 # Movies feature (lazy-loaded at /movies)
│   │   ├── pages/
│   │   ├── components/
│   │   ├── data-access/api/    # API layer (placeholder)
│   │   ├── models/             # Data models (placeholder)
│   │   ├── state/              # State management (placeholder — the lab target)
│   │   └── movies.routes.ts
│   └── tv/                     # TV feature (lazy-loaded at /tv)
│       ├── pages/
│       └── tv.routes.ts
└── shared/ui/                  # Shared UI components
```

### Routing

Lazy-loaded feature routes defined in `app.routes.ts`:
- `/movies` — default route
- `/tv`
- Wildcard redirects to root

### State Management

The `features/*/state/` directories are the primary lab area — this is where NgRx Store and Angular Signals implementations will be built and compared. Currently empty placeholders.

## AI Docs

The [.ai/](.ai/) directory contains Angular conventions for this repo. See [.ai/README.md](.ai/README.md) for the full index.

- **Required (always apply):** [.ai/required/always-on/](.ai/required/always-on/) — directories, naming, routing, feature structure, http-api, forms, UI components, change detection, testing, accessibility, error handling, environment config
- **Optional by strategy (apply when relevant):** [.ai/optional/by-strategy/](.ai/optional/by-strategy/) — state-facade, state-ngrx-store, state-ngrx-signal-store, state-selection, style-bem, style-tailwind
- **Optional by app type:** [.ai/optional/by-app-type/](.ai/optional/by-app-type/) — auth-authorization

### Tooling

- **Build:** Angular (esbuild)
- **Tests:** Vitest 4 + Angular TestBed + JSDOM
- **Styles:** SCSS, per-component and global
- **Formatting:** Prettier (100 char line width, single quotes)
- **TypeScript:** Strict mode + `strictTemplates`
