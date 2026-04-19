import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MovieAddDrawerComponent } from '../components/movie-add-drawer/movie-add-drawer.component';
import { MoviesErrorComponent } from '../components/movies-error/movies-error.component';
import { MoviesFilterComponent } from '../components/movies-filter/movies-filter.component';
import { MoviesGridComponent } from '../components/movies-grid/movies-grid.component';
import { CreateMovieDto } from '../data-access/dto/movie.dto';
import { MoviesFilters, MoviesStore } from '../state/movies.store';

@Component({
  selector: 'app-movies-page',
  imports: [MoviesFilterComponent, MoviesGridComponent, MoviesErrorComponent, MovieAddDrawerComponent],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesPageComponent implements OnInit {
  readonly moviesStore = inject(MoviesStore);
  readonly isDrawerOpen = signal(false);

  ngOnInit(): void {
    this.moviesStore.initialize();
  }

  onFiltersChange(change: Partial<MoviesFilters>): void {
    this.moviesStore.updateFilters(change);
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  async onMovieSubmit(payload: CreateMovieDto): Promise<void> {
    await this.moviesStore.addMovie(payload);
    if (!this.moviesStore.error()) {
      this.isDrawerOpen.set(false);
    }
  }
}
