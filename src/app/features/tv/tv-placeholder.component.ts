import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WatchListPlaceholderComponent } from '../../shared/ui/watch-list-placeholder/watch-list-placeholder.component';

@Component({
  selector: 'app-tv-placeholder',
  imports: [WatchListPlaceholderComponent],
  template: `
    <app-watch-list-placeholder
      title="TV watch list"
      description="Reserve space for episodic tracking, discovery flows, and a second implementation path that can diverge from movies later."
      accent="tv"
      [stats]="stats"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvPlaceholderComponent {
  protected readonly stats = [
    { label: 'Default route', value: 'No' },
    { label: 'Focus', value: 'Series backlog' },
    { label: 'Status', value: 'Placeholder ready' },
  ];
}
