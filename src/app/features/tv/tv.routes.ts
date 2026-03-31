import { Routes } from '@angular/router';

export const tvRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/tv-page.component').then((m) => m.TvPageComponent),
  },
];
