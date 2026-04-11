import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MoviesErrorComponent } from '../components/movies-error/movies-error.component';
import { MoviesFilterComponent } from '../components/movies-filter/movies-filter.component';
import { MoviesGridComponent } from '../components/movies-grid/movies-grid.component';
import { MoviesFilters, MoviesStore } from '../state/movies.store';

@Component({
  selector: 'app-movies-page',
  imports: [MoviesFilterComponent, MoviesGridComponent, MoviesErrorComponent],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesPageComponent implements OnInit {
  readonly moviesStore = inject(MoviesStore);

  ngOnInit(): void {
    this.moviesStore.initialize();
  }

  onFiltersChange(change: Partial<MoviesFilters>): void {
    this.moviesStore.updateFilters(change);
  }
}
