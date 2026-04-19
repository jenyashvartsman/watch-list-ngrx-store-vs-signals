import { createSelector } from '@ngrx/store';
import { tvShowsFeature } from './tv-shows.reducer';

export const {
  selectTvShowsState,
  selectShows,
  selectFilters,
  selectIsLoading,
  selectIsSaving,
  selectError,
} = tvShowsFeature;

export const selectFilteredShows = createSelector(selectShows, selectFilters, (shows, filters) => {
  const { title, status } = filters;
  return shows.filter((show) => {
    const matchesTitle = !title || show.title.toLowerCase().includes(title.toLowerCase());
    const matchesStatus = !status || show.status === status;
    return matchesTitle && matchesStatus;
  });
});

export const selectHasActiveFilters = createSelector(
  selectFilters,
  (filters) => !!filters.title || !!filters.status
);

export const selectEmptyStateVisible = createSelector(
  selectIsLoading,
  selectFilteredShows,
  selectError,
  (isLoading, shows, error) => !isLoading && shows.length === 0 && !error
);
