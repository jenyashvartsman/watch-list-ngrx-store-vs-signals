import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TvShowsApiService } from '../data-access/api/tv-shows-api.service';
import { TvShowsActions } from './tv-shows.actions';

@Injectable()
export class TvShowsEffects {
  private readonly actions$ = inject(Actions);
  private readonly tvShowsApi = inject(TvShowsApiService);

  readonly loadShows$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TvShowsActions.loadShows),
      switchMap(() =>
        this.tvShowsApi.getAll().pipe(
          map((shows) => TvShowsActions.loadShowsSuccess({ shows })),
          catchError(() =>
            of(TvShowsActions.loadShowsFailure({ error: 'Failed to load TV shows.' }))
          )
        )
      )
    )
  );

  readonly addShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TvShowsActions.addShow),
      switchMap(({ payload }) =>
        this.tvShowsApi.create(payload).pipe(
          map((show) => TvShowsActions.addShowSuccess({ show })),
          catchError(() => of(TvShowsActions.addShowFailure({ error: 'Failed to add TV show.' })))
        )
      )
    )
  );

  readonly deleteShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TvShowsActions.deleteShow),
      switchMap(({ id }) =>
        this.tvShowsApi.delete(id).pipe(
          map(() => TvShowsActions.deleteShowSuccess({ id })),
          catchError(() =>
            of(TvShowsActions.deleteShowFailure({ error: 'Failed to delete TV show.' }))
          )
        )
      )
    )
  );

  readonly rateShow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TvShowsActions.rateShow),
      switchMap(({ id, rating }) =>
        this.tvShowsApi.rate(id, rating).pipe(
          map((show) => TvShowsActions.rateShowSuccess({ show })),
          catchError(() => of(TvShowsActions.rateShowFailure({ error: 'Failed to rate TV show.' })))
        )
      )
    )
  );

  readonly updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TvShowsActions.updateStatus),
      switchMap(({ id, status }) =>
        this.tvShowsApi.updateStatus(id, status).pipe(
          map((show) => TvShowsActions.updateStatusSuccess({ show })),
          catchError(() =>
            of(TvShowsActions.updateStatusFailure({ error: 'Failed to update status.' }))
          )
        )
      )
    )
  );
}
