import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tv-shows-empty',
  template: `
    <div class="tv-shows-empty">
      <p class="tv-shows-empty__icon" aria-hidden="true">📺</p>
      @if (filtersApplied()) {
        <h3 class="tv-shows-empty__title">No shows match your filters</h3>
        <p class="tv-shows-empty__description">Try adjusting or clearing your filters.</p>
      } @else {
        <h3 class="tv-shows-empty__title">Your watch list is empty</h3>
        <p class="tv-shows-empty__description">Add a TV show to get started.</p>
      }
    </div>
  `,
  styleUrl: './tv-shows-empty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsEmptyComponent {
  readonly filtersApplied = input(false);
}
