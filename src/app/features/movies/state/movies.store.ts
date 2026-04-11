import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { finalize, firstValueFrom } from 'rxjs';
import { MoviesApiService } from '../data-access/api/movies-api.service';
import { CreateMovieDto, MovieDto, MovieGenre } from '../data-access/dto/movie.dto';

export type MoviesFilters = {
  title: string;
  genre: MovieGenre | '';
};

type MoviesState = {
  movies: MovieDto[];
  filters: MoviesFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: MoviesState = {
  movies: [],
  filters: { title: '', genre: '' },
  isLoading: false,
  isSaving: false,
  error: null,
};

export const MoviesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredMovies = computed(() => {
      const { title, genre } = store.filters();
      return store.movies().filter((m) => {
        const matchesTitle = !title || m.title.toLowerCase().includes(title.toLowerCase());
        const matchesGenre = !genre || m.genre === genre;
        return matchesTitle && matchesGenre;
      });
    });

    return {
      filteredMovies,
      hasMovies: computed(() => store.movies().length > 0),
      hasActiveFilters: computed(() => !!store.filters().title || !!store.filters().genre),
      emptyStateVisible: computed(
        () => !store.isLoading() && filteredMovies().length === 0 && !store.error()
      ),
    };
  }),
  withMethods((store, moviesApi = inject(MoviesApiService)) => ({
    loadMovies(): void {
      patchState(store, { isLoading: true, error: null });

      moviesApi
        .getAll()
        .pipe(finalize(() => patchState(store, { isLoading: false })))
        .subscribe({
          next: (movies) => patchState(store, { movies }),
          error: () => patchState(store, { error: 'Failed to load movies.' }),
        });
    },

    updateFilters(filters: Partial<MoviesFilters>): void {
      patchState(store, { filters: { ...store.filters(), ...filters } });
    },

    async addMovie(payload: CreateMovieDto): Promise<void> {
      patchState(store, { isSaving: true, error: null });
      try {
        const movie = await firstValueFrom(moviesApi.create(payload));
        patchState(store, { movies: [...store.movies(), movie] });
      } catch {
        patchState(store, { error: 'Failed to add movie.' });
      } finally {
        patchState(store, { isSaving: false });
      }
    },

    async deleteMovie(id: string): Promise<void> {
      patchState(store, { isSaving: true, error: null });
      try {
        await firstValueFrom(moviesApi.delete(id));
        patchState(store, { movies: store.movies().filter((m) => m.id !== id) });
      } catch {
        patchState(store, { error: 'Failed to delete movie.' });
      } finally {
        patchState(store, { isSaving: false });
      }
    },

    async rateMovie(id: string, rating: number): Promise<void> {
      patchState(store, { isSaving: true, error: null });
      try {
        const updated = await firstValueFrom(moviesApi.rate(id, rating));
        patchState(store, {
          movies: store.movies().map((m) => (m.id === id ? updated : m)),
        });
      } catch {
        patchState(store, { error: 'Failed to rate movie.' });
      } finally {
        patchState(store, { isSaving: false });
      }
    },

    initialize(): void {
      this.loadMovies();
    },
  }))
);
