import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MovieDto } from '../../data-access/dto/movie.dto';
import { MoviesCardComponent } from '../movies-card/movies-card.component';
import { MoviesEmptyComponent } from '../movies-empty/movies-empty.component';

@Component({
  selector: 'app-movies-grid',
  imports: [MoviesCardComponent, MoviesEmptyComponent],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesGridComponent {
  readonly movies = input.required<MovieDto[]>();
  readonly filtersApplied = input(false);
  readonly rateClick = output<MovieDto>();
}
