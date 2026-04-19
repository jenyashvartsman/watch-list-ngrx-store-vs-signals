import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CreateTvShowDto, TvShowStatus } from '../data-access/dto/tv-show.dto';
import { TvShowsActions } from './tv-shows.actions';
import { TvShowsFilters } from './tv-shows.reducer';
import {
  selectEmptyStateVisible,
  selectError,
  selectFilteredShows,
  selectFilters,
  selectHasActiveFilters,
  selectIsLoading,
  selectIsSaving,
} from './tv-shows.selectors';

@Injectable()
export class TvShowsFacade {
  private readonly store = inject(Store);

  readonly shows = this.store.selectSignal(selectFilteredShows);
  readonly isLoading = this.store.selectSignal(selectIsLoading);
  readonly isSaving = this.store.selectSignal(selectIsSaving);
  readonly error = this.store.selectSignal(selectError);
  readonly filters = this.store.selectSignal(selectFilters);
  readonly hasActiveFilters = this.store.selectSignal(selectHasActiveFilters);
  readonly emptyStateVisible = this.store.selectSignal(selectEmptyStateVisible);

  initialize(): void {
    this.store.dispatch(TvShowsActions.loadShows());
  }

  updateFilters(filters: Partial<TvShowsFilters>): void {
    this.store.dispatch(TvShowsActions.updateFilters({ filters }));
  }

  addShow(payload: CreateTvShowDto): void {
    this.store.dispatch(TvShowsActions.addShow({ payload }));
  }

  deleteShow(id: string): void {
    this.store.dispatch(TvShowsActions.deleteShow({ id }));
  }

  rateShow(id: string, rating: number): void {
    this.store.dispatch(TvShowsActions.rateShow({ id, rating }));
  }

  updateStatus(id: string, status: TvShowStatus): void {
    this.store.dispatch(TvShowsActions.updateStatus({ id, status }));
  }
}
