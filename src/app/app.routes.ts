import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/layouts/app-layout/app-layout.component').then(
        (m) => m.AppLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'movies',
      },
      {
        path: 'movies',
        loadChildren: () =>
          import('./features/movies/movies.routes').then((m) => m.moviesRoutes),
      },
      {
        path: 'tv',
        loadChildren: () => import('./features/tv/tv.routes').then((m) => m.tvRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
