import { Routes } from '@angular/router';

export const moviesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/movies-page.component').then((m) => m.MoviesPageComponent),
  },
];
