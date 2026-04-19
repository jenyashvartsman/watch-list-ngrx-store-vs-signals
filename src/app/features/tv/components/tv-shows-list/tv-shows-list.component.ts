import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LightboxImage } from '../../../../shared/ui/image-lightbox/image-lightbox.component';
import { TvShowDto, TvShowStatus } from '../../data-access/dto/tv-show.dto';
import { TvShowRowComponent } from '../tv-show-row/tv-show-row.component';
import { TvShowsEmptyComponent } from '../tv-shows-empty/tv-shows-empty.component';

@Component({
  selector: 'app-tv-shows-list',
  imports: [TvShowRowComponent, TvShowsEmptyComponent],
  templateUrl: './tv-shows-list.component.html',
  styleUrl: './tv-shows-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsListComponent {
  readonly shows = input.required<TvShowDto[]>();
  readonly filtersApplied = input(false);

  readonly imageClick = output<LightboxImage>();
  readonly statusChange = output<{ id: string; status: TvShowStatus }>();
  readonly rateClick = output<TvShowDto>();
  readonly deleteClick = output<TvShowDto>();
}
