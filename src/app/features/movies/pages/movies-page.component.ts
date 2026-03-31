import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WatchListPlaceholderComponent } from '../../../shared/ui/watch-list-placeholder/watch-list-placeholder.component';

@Component({
  selector: 'app-movies-page',
  imports: [WatchListPlaceholderComponent],
  templateUrl: './movies-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesPageComponent {}
