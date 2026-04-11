import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SelectOption } from '../../../../shared/ui/select/select.component';
import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { MovieGenre } from '../../data-access/dto/movie.dto';
import { MoviesFilters } from '../../state/movies.store';

const GENRES: SelectOption[] = [
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'documentary', label: 'Documentary' },
];

@Component({
  selector: 'app-movies-filter',
  imports: [TextInputComponent, SelectComponent],
  templateUrl: './movies-filter.component.html',
  styleUrl: './movies-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesFilterComponent {
  readonly filters = input.required<MoviesFilters>();
  readonly filtersChange = output<Partial<MoviesFilters>>();

  readonly genres = GENRES;

  onTitleChange(title: string): void {
    this.filtersChange.emit({ title });
  }

  onGenreChange(genre: string): void {
    this.filtersChange.emit({ genre: genre as MovieGenre | '' });
  }
}
