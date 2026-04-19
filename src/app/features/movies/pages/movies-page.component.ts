import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MoviesAddDrawerComponent } from '../components/movies-add-drawer/movies-add-drawer.component';
import { MoviesDeleteConfirmDialogComponent } from '../components/movies-delete-confirm-dialog/movies-delete-confirm-dialog.component';
import { MoviesErrorComponent } from '../components/movies-error/movies-error.component';
import { MoviesFilterComponent } from '../components/movies-filter/movies-filter.component';
import { MoviesGridComponent } from '../components/movies-grid/movies-grid.component';
import { MoviesRateDialogComponent } from '../components/movies-rate-dialog/movies-rate-dialog.component';
import { CreateMovieDto, MovieDto } from '../data-access/dto/movie.dto';
import { MoviesFilters, MoviesStore } from '../state/movies.store';

@Component({
  selector: 'app-movies-page',
  imports: [
    MoviesFilterComponent,
    MoviesGridComponent,
    MoviesErrorComponent,
    MoviesAddDrawerComponent,
    MoviesRateDialogComponent,
    MoviesDeleteConfirmDialogComponent,
  ],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesPageComponent implements OnInit {
  readonly moviesStore = inject(MoviesStore);
  readonly isDrawerOpen = signal(false);
  readonly ratingMovie = signal<MovieDto | null>(null);
  readonly deletingMovie = signal<MovieDto | null>(null);

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

  openRateDialog(movie: MovieDto): void {
    this.ratingMovie.set(movie);
  }

  closeRateDialog(): void {
    this.ratingMovie.set(null);
  }

  async onMovieRated(rating: number): Promise<void> {
    const movie = this.ratingMovie();
    if (!movie) return;
    await this.moviesStore.rateMovie(movie.id, rating);
    if (!this.moviesStore.error()) {
      this.ratingMovie.set(null);
    }
  }

  openDeleteDialog(movie: MovieDto): void {
    this.deletingMovie.set(movie);
  }

  closeDeleteDialog(): void {
    this.deletingMovie.set(null);
  }

  async onMovieDelete(): Promise<void> {
    const movie = this.deletingMovie();
    if (!movie) return;
    await this.moviesStore.deleteMovie(movie.id);
    if (!this.moviesStore.error()) {
      this.deletingMovie.set(null);
    }
  }
}
