import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type WatchListPlaceholderAccent = 'movies' | 'tv';
type WatchListPlaceholderStat = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-watch-list-placeholder',
  templateUrl: './watch-list-placeholder.component.html',
  styleUrl: './watch-list-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchListPlaceholderComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly accent = input<WatchListPlaceholderAccent>('movies');
  readonly stats = input<WatchListPlaceholderStat[]>([]);
}
