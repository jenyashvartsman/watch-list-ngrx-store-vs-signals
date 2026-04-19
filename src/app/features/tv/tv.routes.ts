import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { TvShowsEffects } from './state/tv-shows.effects';
import { TvShowsFacade } from './state/tv-shows.facade';
import { tvShowsFeature } from './state/tv-shows.reducer';

export const tvRoutes: Routes = [
  {
    path: '',
    providers: [provideState(tvShowsFeature), provideEffects(TvShowsEffects), TvShowsFacade],
    loadComponent: () =>
      import('./pages/tv-shows-page/tv-shows-page.component').then(
        (m) => m.TvShowsPageComponent
      ),
  },
];
