import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MovieDto } from '../../data-access/dto/movie.dto';

@Component({
  selector: 'app-movies-card',
  templateUrl: './movies-card.component.html',
  styleUrl: './movies-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesCardComponent {
  readonly movie = input.required<MovieDto>();
  readonly rateClick = output<MovieDto>();
  readonly deleteClick = output<MovieDto>();
}
