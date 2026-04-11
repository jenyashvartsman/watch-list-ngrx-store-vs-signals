# Task

Create a signal store to handles movies display.

# Guides

- `../required/always-on/**`
- `../optional/state-ngrx-signal-store.md`

# Requirements

- create movie.dto.ts.
  - need to have the attributes id (random uuid), title, genre (comedy, action, ...), thumbnailUrl, rating (1-10 or undefined).
- create movies-api.service.ts.
  - service should have getAll, create, delete and rate methods.
  - data will be stored in local storage.
  - in case storage key doesn't exist initiate it with 10 real movies
