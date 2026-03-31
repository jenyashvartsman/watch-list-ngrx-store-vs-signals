import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TvPlaceholderComponent } from '../tv-placeholder.component';

@Component({
  selector: 'app-tv-page',
  imports: [TvPlaceholderComponent],
  templateUrl: './tv-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvPageComponent {}
