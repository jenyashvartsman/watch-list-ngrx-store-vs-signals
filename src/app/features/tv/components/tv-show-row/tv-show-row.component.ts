import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LightboxImage } from '../../../../shared/ui/image-lightbox/image-lightbox.component';
import { TV_SHOW_STATUS_LABELS, TvShowDto, TvShowStatus } from '../../data-access/dto/tv-show.dto';

@Component({
  selector: 'app-tv-show-row',
  templateUrl: './tv-show-row.component.html',
  styleUrl: './tv-show-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowRowComponent {
  readonly show = input.required<TvShowDto>();

  readonly imageClick = output<LightboxImage>();
  readonly statusChange = output<{ id: string; status: TvShowStatus }>();
  readonly rateClick = output<TvShowDto>();
  readonly deleteClick = output<TvShowDto>();

  readonly statusLabels = TV_SHOW_STATUS_LABELS;
  readonly statusOptions: TvShowStatus[] = ['plan-to-watch', 'watching', 'completed', 'dropped'];

  onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as TvShowStatus;
    this.statusChange.emit({ id: this.show().id, status });
  }
}
