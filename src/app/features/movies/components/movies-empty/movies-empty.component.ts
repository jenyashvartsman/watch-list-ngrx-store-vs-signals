import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-movies-empty',
  templateUrl: './movies-empty.component.html',
  styleUrl: './movies-empty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesEmptyComponent {
  readonly filtersApplied = input(false);
}
