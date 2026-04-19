import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tv-shows-error',
  template: `
    <div class="tv-shows-error" role="alert">
      <p class="tv-shows-error__icon" aria-hidden="true">⚠️</p>
      <h3 class="tv-shows-error__title">Something went wrong</h3>
      <p class="tv-shows-error__description">{{ message() }}</p>
    </div>
  `,
  styleUrl: './tv-shows-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsErrorComponent {
  readonly message = input.required<string>();
}
