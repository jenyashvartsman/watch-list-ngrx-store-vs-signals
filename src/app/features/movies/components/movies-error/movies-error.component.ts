import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-movies-error',
  templateUrl: './movies-error.component.html',
  styleUrl: './movies-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesErrorComponent {
  readonly message = input.required<string>();
}
