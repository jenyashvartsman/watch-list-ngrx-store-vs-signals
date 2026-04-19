import { createFeature, createReducer, on } from '@ngrx/store';
import { TvShowDto, TvShowStatus } from '../data-access/dto/tv-show.dto';
import { TvShowsActions } from './tv-shows.actions';

export type TvShowsFilters = {
  title: string;
  status: TvShowStatus | '';
};

export type TvShowsState = {
  shows: TvShowDto[];
  filters: TvShowsFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: TvShowsState = {
  shows: [],
  filters: { title: '', status: '' },
  isLoading: false,
  isSaving: false,
  error: null,
};

export const tvShowsFeature = createFeature({
  name: 'tvShows',
  reducer: createReducer(
    initialState,
    on(TvShowsActions.loadShows, (state) => ({ ...state, isLoading: true, error: null })),
    on(TvShowsActions.loadShowsSuccess, (state, { shows }) => ({
      ...state,
      shows,
      isLoading: false,
    })),
    on(TvShowsActions.loadShowsFailure, (state, { error }) => ({
      ...state,
      error,
      isLoading: false,
    })),
    on(TvShowsActions.addShow, (state) => ({ ...state, isSaving: true, error: null })),
    on(TvShowsActions.addShowSuccess, (state, { show }) => ({
      ...state,
      shows: [...state.shows, show],
      isSaving: false,
    })),
    on(TvShowsActions.addShowFailure, (state, { error }) => ({
      ...state,
      error,
      isSaving: false,
    })),
    on(TvShowsActions.deleteShow, (state) => ({ ...state, isSaving: true, error: null })),
    on(TvShowsActions.deleteShowSuccess, (state, { id }) => ({
      ...state,
      shows: state.shows.filter((s) => s.id !== id),
      isSaving: false,
    })),
    on(TvShowsActions.deleteShowFailure, (state, { error }) => ({
      ...state,
      error,
      isSaving: false,
    })),
    on(TvShowsActions.rateShow, (state) => ({ ...state, isSaving: true, error: null })),
    on(TvShowsActions.rateShowSuccess, (state, { show }) => ({
      ...state,
      shows: state.shows.map((s) => (s.id === show.id ? show : s)),
      isSaving: false,
    })),
    on(TvShowsActions.rateShowFailure, (state, { error }) => ({
      ...state,
      error,
      isSaving: false,
    })),
    on(TvShowsActions.updateStatus, (state) => ({ ...state, isSaving: true, error: null })),
    on(TvShowsActions.updateStatusSuccess, (state, { show }) => ({
      ...state,
      shows: state.shows.map((s) => (s.id === show.id ? show : s)),
      isSaving: false,
    })),
    on(TvShowsActions.updateStatusFailure, (state, { error }) => ({
      ...state,
      error,
      isSaving: false,
    })),
    on(TvShowsActions.updateFilters, (state, { filters }) => ({
      ...state,
      filters: { ...state.filters, ...filters },
    }))
  ),
});
