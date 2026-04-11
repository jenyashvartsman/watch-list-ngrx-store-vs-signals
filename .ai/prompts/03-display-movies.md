# Task

Create a signal store to handles movies display.

# Guides

- `.ai\required\always-on\**`
- `.ai\optional\by-strategy\state-ngrx-signal-store.md`
- `.ai\optional\by-strategy\style-bem.md`

# Requirements

- inside movies feature create the following components.
  - movies-filter
    - can filter movies by title (text) or genre (select)
  - movies-grid
    - display filtered movies or movies-empty
  - movies-card
    - slick and modern design for a movie card. display all values from movie.dto.ts
  - movies-empty
    - user friendly display for no movies found
  - movies-error
    - user friendly display if movies failed to load
- ignore add/delete/rate (will be added later)
